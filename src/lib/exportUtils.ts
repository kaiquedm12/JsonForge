export function downloadAsFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportAsPNG(element: HTMLElement, filename = 'jsonforge-export.png') {
  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
  })
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }
  })
}

export function exportAsSVG(svgElement: SVGElement, filename = 'jsonforge-export.svg') {
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)
  downloadAsFile(svgString, filename, 'image/svg+xml')
}

export async function exportAsPDF(element: HTMLElement, filename = 'jsonforge-export.pdf') {
  const html2pdf = (await import('html2pdf.js')).default
  html2pdf().set({
    margin: 10,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
  }).from(element).save()
}

export function sanitizeJsonInput(input: string): string {
  try {
    JSON.parse(input)
    return input
  } catch {
    return input
  }
}

export function formatJson(jsonString: string): string {
  try {
    return JSON.stringify(JSON.parse(jsonString), null, 2)
  } catch {
    return jsonString
  }
}

export function minifyJson(jsonString: string): string {
  try {
    return JSON.stringify(JSON.parse(jsonString))
  } catch {
    return jsonString
  }
}

export function compareJson(a: string, b: string): { added: string[]; removed: string[]; changed: string[] } {
  try {
    const objA = JSON.parse(a)
    const objB = JSON.parse(b)

    const keysA = new Set(getAllKeys(objA))
    const keysB = new Set(getAllKeys(objB))

    const added = [...keysB].filter((k) => !keysA.has(k))
    const removed = [...keysA].filter((k) => !keysB.has(k))
    const changed = [...keysA].filter(
      (k) => keysB.has(k) && JSON.stringify(getValue(objA, k)) !== JSON.stringify(getValue(objB, k))
    )

    return { added, removed, changed }
  } catch {
    return { added: [], removed: [], changed: [] }
  }
}

function getAllKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return prefix ? [prefix] : []
  if (Array.isArray(obj)) {
    return obj.flatMap((v, i) => getAllKeys(v, `${prefix}[${i}]`))
  }
  const keys: string[] = prefix ? [prefix] : []
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k
    keys.push(...getAllKeys(v, path))
  }
  return keys
}

function getValue(obj: unknown, path: string): unknown {
  const parts = path.split(/[.[\]]/).filter(Boolean)
  let current = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}
