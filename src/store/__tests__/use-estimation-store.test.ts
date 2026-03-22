import { describe, it, expect, beforeEach } from 'vitest'
import { useEstimationStore } from '../use-estimation-store'

describe('useEstimationStore', () => {
  beforeEach(() => {
    useEstimationStore.getState().resetAll()
  })

  describe('initial state', () => {
    it('has 4 sections', () => {
      const { data } = useEstimationStore.getState()
      expect(data.sections).toHaveLength(4)
      expect(data.sections.map((s) => s.id)).toEqual(['traffic', 'storage', 'bandwidth', 'cache'])
    })

    it('has null preset', () => {
      expect(useEstimationStore.getState().data.presetId).toBeNull()
    })
  })

  describe('loadPreset', () => {
    it('loads social media preset with default values', () => {
      useEstimationStore.getState().loadPreset('social-media')
      const { data } = useEstimationStore.getState()
      expect(data.presetId).toBe('social-media')

      const traffic = data.sections.find((s) => s.id === 'traffic')!
      const dau = traffic.inputs.find((i) => i.id === 'dau')!
      expect(dau.value).toBe(100_000_000)

      const readWriteRatio = traffic.inputs.find((i) => i.id === 'readWriteRatio')!
      expect(readWriteRatio.value).toBe(10)
    })

    it('calculates QPS after loading preset', () => {
      useEstimationStore.getState().loadPreset('social-media')
      const { data } = useEstimationStore.getState()
      const traffic = data.sections.find((s) => s.id === 'traffic')!
      const avgQps = traffic.formulas.find((f) => f.id === 'avgQps')!

      // 100M * 20 / 86400 ≈ 23148.148
      expect(avgQps.result).toBeCloseTo(23148.148, 0)
    })

    it('calculates storage after loading preset', () => {
      useEstimationStore.getState().loadPreset('social-media')
      const { data } = useEstimationStore.getState()
      const storage = data.sections.find((s) => s.id === 'storage')!
      const totalStorage = storage.formulas.find((f) => f.id === 'totalStorage')!
      expect(totalStorage.result).not.toBeNull()
      expect(totalStorage.result!).toBeGreaterThan(0)
    })

    it('loads general preset with null values', () => {
      useEstimationStore.getState().loadPreset('general')
      const { data } = useEstimationStore.getState()
      const traffic = data.sections.find((s) => s.id === 'traffic')!
      expect(traffic.inputs.every((i) => i.value === null)).toBe(true)
    })
  })

  describe('updateInput', () => {
    it('updates an input value and recalculates', () => {
      useEstimationStore.getState().updateInput('traffic', 'dau', 1_000_000)
      useEstimationStore.getState().updateInput('traffic', 'requestsPerUser', 10)

      const traffic = useEstimationStore.getState().data.sections.find((s) => s.id === 'traffic')!
      const avgQps = traffic.formulas.find((f) => f.id === 'avgQps')!
      // 1M * 10 / 86400 ≈ 115.74
      expect(avgQps.result).toBeCloseTo(115.74, 0)
    })

    it('returns null formula results when inputs are missing', () => {
      useEstimationStore.getState().updateInput('traffic', 'dau', 1_000_000)
      const traffic = useEstimationStore.getState().data.sections.find((s) => s.id === 'traffic')!
      const avgQps = traffic.formulas.find((f) => f.id === 'avgQps')!
      expect(avgQps.result).toBeNull()
    })
  })

  describe('overrideFormula', () => {
    it('overrides a formula result', () => {
      useEstimationStore.getState().loadPreset('social-media')
      useEstimationStore.getState().overrideFormula('traffic', 'avgQps', 50000)

      const traffic = useEstimationStore.getState().data.sections.find((s) => s.id === 'traffic')!
      const avgQps = traffic.formulas.find((f) => f.id === 'avgQps')!
      expect(avgQps.result).toBe(50000)
      expect(avgQps.isOverridden).toBe(true)
    })

    it('clearOverride restores calculated value', () => {
      useEstimationStore.getState().loadPreset('social-media')
      useEstimationStore.getState().overrideFormula('traffic', 'avgQps', 50000)
      useEstimationStore.getState().clearOverride('traffic', 'avgQps')

      const traffic = useEstimationStore.getState().data.sections.find((s) => s.id === 'traffic')!
      const avgQps = traffic.formulas.find((f) => f.id === 'avgQps')!
      expect(avgQps.isOverridden).toBe(false)
      expect(avgQps.result).toBeCloseTo(23148.148, 0)
    })
  })

  describe('resetSection', () => {
    it('resets a single section to defaults', () => {
      useEstimationStore.getState().loadPreset('social-media')
      useEstimationStore.getState().resetSection('traffic')

      const { data } = useEstimationStore.getState()
      const traffic = data.sections.find((s) => s.id === 'traffic')!
      expect(traffic.inputs.every((i) => i.value === null)).toBe(true)

      const storage = data.sections.find((s) => s.id === 'storage')!
      expect(storage.inputs.find((i) => i.id === 'recordSizeBytes')!.value).toBe(500)
    })
  })

  describe('resetAll', () => {
    it('resets all sections and preset', () => {
      useEstimationStore.getState().loadPreset('social-media')
      useEstimationStore.getState().setCustomNotes('Some notes')
      useEstimationStore.getState().resetAll()

      const { data } = useEstimationStore.getState()
      expect(data.presetId).toBeNull()
      expect(data.customNotes).toBe('')
      for (const section of data.sections) {
        expect(section.inputs.every((i) => i.value === null)).toBe(true)
      }
    })
  })

  describe('customNotes', () => {
    it('sets custom notes', () => {
      useEstimationStore.getState().setCustomNotes('Test notes')
      expect(useEstimationStore.getState().data.customNotes).toBe('Test notes')
    })
  })

  describe('getSummary', () => {
    it('returns summary items', () => {
      useEstimationStore.getState().loadPreset('social-media')
      const summary = useEstimationStore.getState().getSummary()
      expect(summary.length).toBeGreaterThan(0)
      expect(summary.some((s) => s.formulaId === 'readQps')).toBe(true)
      expect(summary.some((s) => s.formulaId === 'totalStorage')).toBe(true)
    })
  })

  describe('copyAsText', () => {
    it('returns formatted text', () => {
      useEstimationStore.getState().loadPreset('social-media')
      const text = useEstimationStore.getState().copyAsText()
      expect(text).toContain('Back-of-Envelope Estimation')
      expect(text).toContain('Read QPS')
      expect(text).toContain('Total storage')
    })
  })

  describe('loadEstimation', () => {
    it('loads saved estimation data', () => {
      useEstimationStore.getState().loadPreset('social-media')
      const saved = useEstimationStore.getState().data
      useEstimationStore.getState().resetAll()
      useEstimationStore.getState().loadEstimation(saved)

      const { data } = useEstimationStore.getState()
      expect(data.presetId).toBe('social-media')
      const traffic = data.sections.find((s) => s.id === 'traffic')!
      const dau = traffic.inputs.find((i) => i.id === 'dau')!
      expect(dau.value).toBe(100_000_000)
    })

    it('handles empty/invalid data gracefully', () => {
      useEstimationStore.getState().loadEstimation({ presetId: null, sections: [], customNotes: '' })
      expect(useEstimationStore.getState().data.sections).toHaveLength(4)
    })
  })

  describe('cross-section calculation chain', () => {
    it('traffic QPS flows into storage and bandwidth', () => {
      useEstimationStore.getState().loadPreset('social-media')
      const { data } = useEstimationStore.getState()

      const traffic = data.sections.find((s) => s.id === 'traffic')!
      const writeQps = traffic.formulas.find((f) => f.id === 'writeQps')!
      expect(writeQps.result).not.toBeNull()

      const storage = data.sections.find((s) => s.id === 'storage')!
      const recordsPerDay = storage.formulas.find((f) => f.id === 'recordsPerDay')!
      expect(recordsPerDay.result).toBeCloseTo(writeQps.result! * 86400, -2)

      const bandwidth = data.sections.find((s) => s.id === 'bandwidth')!
      const inBw = bandwidth.formulas.find((f) => f.id === 'incomingBw')!
      expect(inBw.result).not.toBeNull()
      expect(inBw.result!).toBeGreaterThan(0)
    })
  })
})
