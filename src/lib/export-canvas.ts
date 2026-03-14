import { toPng, toSvg } from 'html-to-image'

/** Get the React Flow viewport element for export */
function getFlowViewport(): HTMLElement | null {
  return document.querySelector('.react-flow__viewport') as HTMLElement | null
}

/** Common export options */
function getExportOptions() {
  return {
    backgroundColor: '#0f1117',
    quality: 1,
    pixelRatio: 2,
    filter: (node: HTMLElement) => {
      // Exclude minimap, controls, and simulation UI from export
      const excludeClasses = ['react-flow__minimap', 'react-flow__controls', 'react-flow__panel']
      return !excludeClasses.some((cls) => node.classList?.contains(cls))
    },
  }
}

/** Download a blob as a file */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Export canvas as PNG */
export async function exportAsPng(filename: string): Promise<void> {
  const viewport = getFlowViewport()
  if (!viewport) throw new Error('Canvas not found')

  const dataUrl = await toPng(viewport, getExportOptions())
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  downloadBlob(blob, `${filename}.png`)
}

/** Export canvas as SVG */
export async function exportAsSvg(filename: string): Promise<void> {
  const viewport = getFlowViewport()
  if (!viewport) throw new Error('Canvas not found')

  const dataUrl = await toSvg(viewport, getExportOptions())
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  downloadBlob(blob, `${filename}.svg`)
}

/** Export canvas as PDF (uses PNG under the hood with print dialog) */
export async function exportAsPdf(filename: string): Promise<void> {
  const viewport = getFlowViewport()
  if (!viewport) throw new Error('Canvas not found')

  const dataUrl = await toPng(viewport, { ...getExportOptions(), pixelRatio: 3 })

  // Open in new window with print dialog
  const printWindow = window.open('', '_blank')
  if (!printWindow) throw new Error('Popup blocked')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head><title>${filename}</title>
    <style>@media print { body { margin: 0; } img { max-width: 100%; height: auto; } }</style>
    </head>
    <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff;">
      <img src="${dataUrl}" style="max-width:100%;height:auto;" />
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.onload = () => printWindow.print()
}
