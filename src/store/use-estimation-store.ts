import { create } from 'zustand'
import type { EstimationData, EstimationSection, EstimationInput, EstimationFormula } from '@/types'
import { estimationPresets } from '@/data/estimation-presets'
import { safeDiv, formatNumber, formatBytes, formatBandwidth } from '@/components/estimation/estimation-utils'

function input(id: string, label: string, unit: string, hint?: string): EstimationInput {
  return { id, label, value: null, unit, hint, isOverridden: false }
}

function formula(id: string, label: string, formulaStr: string, inputs: string[], unit: string): EstimationFormula {
  return { id, label, formula: formulaStr, inputs, unit, result: null, isOverridden: false }
}

function buildSections(): EstimationSection[] {
  return [
    {
      id: 'traffic',
      title: 'Traffic Estimation',
      inputs: [
        input('dau', 'Daily Active Users', 'users', 'Twitter ~300M, Instagram ~500M'),
        input('requestsPerUser', 'Requests per user per day', '/day', 'Typical: 5-50'),
        input('peakMultiplier', 'Peak multiplier', 'x', 'Typical: 2-5x average'),
        input('readWriteRatio', 'Read:Write ratio', ':1', 'Social ~10:1, Chat ~1:1'),
      ],
      formulas: [
        formula('avgQps', 'Average QPS', 'DAU × requests/user / 86400', ['dau', 'requestsPerUser'], 'req/s'),
        formula('readQps', 'Read QPS', 'avgQPS × ratio / (ratio + 1)', ['avgQps', 'readWriteRatio'], 'req/s'),
        formula('writeQps', 'Write QPS', 'avgQPS / (ratio + 1)', ['avgQps', 'readWriteRatio'], 'req/s'),
        formula('peakReadQps', 'Peak Read QPS', 'readQPS × peakMultiplier', ['readQps', 'peakMultiplier'], 'req/s'),
        formula('peakWriteQps', 'Peak Write QPS', 'writeQPS × peakMultiplier', ['writeQps', 'peakMultiplier'], 'req/s'),
      ],
    },
    {
      id: 'storage',
      title: 'Storage Estimation',
      inputs: [
        input('recordSizeBytes', 'Record size', 'bytes', 'Tweet ~500B, Image ~500KB'),
        input('retentionDays', 'Retention period', 'days', '365 = 1 year, 1825 = 5 years'),
      ],
      formulas: [
        formula('recordsPerDay', 'Records per day', 'writeQPS × 86400', ['writeQps'], 'records'),
        formula('dailyStorage', 'Daily new storage', 'records/day × record size', ['recordsPerDay', 'recordSizeBytes'], 'bytes'),
        formula('totalStorage', 'Total storage', 'daily storage × retention days', ['dailyStorage', 'retentionDays'], 'bytes'),
      ],
    },
    {
      id: 'bandwidth',
      title: 'Bandwidth Estimation',
      inputs: [
        input('avgRequestSizeKb', 'Avg request size', 'KB', 'Typical: 1-5 KB'),
        input('avgResponseSizeKb', 'Avg response size', 'KB', 'API ~5KB, Media ~500KB'),
      ],
      formulas: [
        formula('incomingBw', 'Incoming bandwidth', 'avgQPS × request size', ['avgQps', 'avgRequestSizeKb'], 'bytes/s'),
        formula('outgoingBw', 'Outgoing bandwidth', 'avgQPS × response size', ['avgQps', 'avgResponseSizeKb'], 'bytes/s'),
        formula('peakInBw', 'Peak incoming BW', 'incoming × peakMultiplier', ['incomingBw', 'peakMultiplier'], 'bytes/s'),
        formula('peakOutBw', 'Peak outgoing BW', 'outgoing × peakMultiplier', ['outgoingBw', 'peakMultiplier'], 'bytes/s'),
      ],
    },
    {
      id: 'cache',
      title: 'Cache / Memory Estimation',
      inputs: [
        input('cacheRatio', 'Cache ratio (hot data)', 'fraction', '0.2 = 20% rule of thumb'),
      ],
      formulas: [
        formula('dailyCacheSize', 'Daily cache need', 'daily storage × cache ratio', ['dailyStorage', 'cacheRatio'], 'bytes'),
      ],
    },
  ]
}

function getInputValue(sections: EstimationSection[], inputId: string): number | null {
  for (const section of sections) {
    const found = section.inputs.find((i) => i.id === inputId)
    if (found) return found.value
  }
  return null
}

function getFormulaResult(sections: EstimationSection[], formulaId: string): number | null {
  for (const section of sections) {
    const found = section.formulas.find((f) => f.id === formulaId)
    if (found) return found.result
  }
  return null
}

function resolveValue(sections: EstimationSection[], id: string): number | null {
  return getFormulaResult(sections, id) ?? getInputValue(sections, id)
}

function calculateFormula(fId: string, sections: EstimationSection[]): number | null {
  const v = (id: string) => resolveValue(sections, id)

  switch (fId) {
    case 'avgQps': {
      const dau = v('dau')
      const rpd = v('requestsPerUser')
      if (dau == null || rpd == null) return null
      return safeDiv(dau * rpd, 86400)
    }
    case 'readQps': {
      const qps = v('avgQps')
      const ratio = v('readWriteRatio')
      if (qps == null || ratio == null) return null
      return safeDiv(qps * ratio, ratio + 1)
    }
    case 'writeQps': {
      const qps = v('avgQps')
      const ratio = v('readWriteRatio')
      if (qps == null || ratio == null) return null
      return safeDiv(qps, ratio + 1)
    }
    case 'peakReadQps': {
      const rq = v('readQps')
      const pm = v('peakMultiplier')
      if (rq == null || pm == null) return null
      return rq * pm
    }
    case 'peakWriteQps': {
      const wq = v('writeQps')
      const pm = v('peakMultiplier')
      if (wq == null || pm == null) return null
      return wq * pm
    }
    case 'recordsPerDay': {
      const wq = v('writeQps')
      if (wq == null) return null
      return wq * 86400
    }
    case 'dailyStorage': {
      const rpd = v('recordsPerDay')
      const rs = v('recordSizeBytes')
      if (rpd == null || rs == null) return null
      return rpd * rs
    }
    case 'totalStorage': {
      const ds = v('dailyStorage')
      const rd = v('retentionDays')
      if (ds == null || rd == null) return null
      return ds * rd
    }
    case 'incomingBw': {
      const qps = v('avgQps')
      const reqSize = v('avgRequestSizeKb')
      if (qps == null || reqSize == null) return null
      return qps * reqSize * 1024
    }
    case 'outgoingBw': {
      const qps = v('avgQps')
      const resSize = v('avgResponseSizeKb')
      if (qps == null || resSize == null) return null
      return qps * resSize * 1024
    }
    case 'peakInBw': {
      const bw = v('incomingBw')
      const pm = v('peakMultiplier')
      if (bw == null || pm == null) return null
      return bw * pm
    }
    case 'peakOutBw': {
      const bw = v('outgoingBw')
      const pm = v('peakMultiplier')
      if (bw == null || pm == null) return null
      return bw * pm
    }
    case 'dailyCacheSize': {
      const ds = v('dailyStorage')
      const cr = v('cacheRatio')
      if (ds == null || cr == null) return null
      return ds * cr
    }
    default:
      return null
  }
}

function recalculate(sections: EstimationSection[]): EstimationSection[] {
  const updated = sections.map((s) => ({
    ...s,
    inputs: s.inputs.map((i) => ({ ...i })),
    formulas: s.formulas.map((f) => ({ ...f })),
  }))

  for (const section of updated) {
    for (const f of section.formulas) {
      if (!f.isOverridden) {
        f.result = calculateFormula(f.id, updated)
      }
    }
  }
  return updated
}

interface EstimationState {
  data: EstimationData
  loadPreset: (presetId: string) => void
  updateInput: (sectionId: string, inputId: string, value: number | null) => void
  overrideFormula: (sectionId: string, formulaId: string, value: number) => void
  clearOverride: (sectionId: string, formulaId: string) => void
  setCustomNotes: (notes: string) => void
  resetSection: (sectionId: string) => void
  resetAll: () => void
  loadEstimation: (data: EstimationData) => void
  getSummary: () => { label: string; value: number | null; unit: string; formulaId: string }[]
  copyAsText: () => string
}

export const useEstimationStore = create<EstimationState>((set, get) => ({
  data: { presetId: null, sections: buildSections(), customNotes: '' },

  loadPreset: (presetId) => {
    const preset = estimationPresets.find((p) => p.id === presetId)
    if (!preset) return

    let sections = buildSections()
    for (const section of sections) {
      for (const inp of section.inputs) {
        if (presetId === 'general') {
          inp.value = null
        } else if (preset.defaults[inp.id] !== undefined) {
          inp.value = preset.defaults[inp.id]
        }
      }
    }
    sections = recalculate(sections)
    set({ data: { presetId, sections, customNotes: get().data.customNotes } })
  },

  updateInput: (sectionId, inputId, value) => {
    const { data } = get()
    const sections = data.sections.map((s) => {
      if (s.id !== sectionId) return s
      return {
        ...s,
        inputs: s.inputs.map((i) =>
          i.id === inputId ? { ...i, value, isOverridden: true } : i
        ),
      }
    })
    set({ data: { ...data, sections: recalculate(sections) } })
  },

  overrideFormula: (sectionId, formulaId, value) => {
    const { data } = get()
    const sections = data.sections.map((s) => {
      if (s.id !== sectionId) return s
      return {
        ...s,
        formulas: s.formulas.map((f) =>
          f.id === formulaId ? { ...f, result: value, isOverridden: true } : f
        ),
      }
    })
    set({ data: { ...data, sections: recalculate(sections) } })
  },

  clearOverride: (sectionId, formulaId) => {
    const { data } = get()
    const sections = data.sections.map((s) => {
      if (s.id !== sectionId) return s
      return {
        ...s,
        formulas: s.formulas.map((f) =>
          f.id === formulaId ? { ...f, isOverridden: false } : f
        ),
      }
    })
    set({ data: { ...data, sections: recalculate(sections) } })
  },

  setCustomNotes: (notes) => {
    set({ data: { ...get().data, customNotes: notes } })
  },

  resetSection: (sectionId) => {
    const { data } = get()
    const fresh = buildSections()
    const sections = data.sections.map((s) => {
      if (s.id !== sectionId) return s
      return fresh.find((f) => f.id === sectionId) ?? s
    })
    set({ data: { ...data, sections: recalculate(sections) } })
  },

  resetAll: () => {
    set({ data: { presetId: null, sections: buildSections(), customNotes: '' } })
  },

  loadEstimation: (data) => {
    if (!data || !data.sections || data.sections.length === 0) {
      set({ data: { presetId: null, sections: buildSections(), customNotes: '' } })
      return
    }
    set({ data: { ...data, sections: recalculate(data.sections) } })
  },

  getSummary: () => {
    const { data } = get()
    const SUMMARY_FORMULAS = [
      'readQps', 'writeQps', 'peakReadQps', 'peakWriteQps',
      'totalStorage', 'incomingBw', 'outgoingBw',
      'peakInBw', 'peakOutBw', 'dailyCacheSize',
    ]
    const results: { label: string; value: number | null; unit: string; formulaId: string }[] = []
    for (const section of data.sections) {
      for (const f of section.formulas) {
        if (SUMMARY_FORMULAS.includes(f.id)) {
          results.push({ label: f.label, value: f.result, unit: f.unit, formulaId: f.id })
        }
      }
    }
    return results
  },

  copyAsText: () => {
    const summary = get().getSummary()
    const lines = ['Back-of-Envelope Estimation', '===========================', '']
    for (const item of summary) {
      let display: string
      if (item.value === null) {
        display = 'N/A'
      } else if (item.unit === 'bytes') {
        display = formatBytes(item.value)
      } else if (item.unit === 'bytes/s') {
        display = formatBandwidth(item.value)
      } else {
        display = `${formatNumber(item.value)} ${item.unit}`
      }
      lines.push(`${item.label}: ${display}`)
    }
    const { data } = get()
    if (data.customNotes.trim()) {
      lines.push('', 'Notes:', data.customNotes)
    }
    return lines.join('\n')
  },
}))
