// Sharing and QR code utilities

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("[v0] Copy to clipboard failed:", error)
    return false
  }
}

export async function shareText(text: string, title = "Share Bio-ID"): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
      })
      return true
    } catch (error) {
      console.error("[v0] Share failed:", error)
      return false
    }
  }

  // Fallback to clipboard
  return copyToClipboard(text)
}

export function renderQrToCanvas(canvas: HTMLCanvasElement, data: string): void {
  // Simplified QR code rendering (in production, use a QR library like qrcode)
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const size = canvas.width
  const gridSize = 8
  const cellSize = size / gridSize

  // Generate pseudo-random pattern from data
  const hash = Array.from(data).reduce((acc, char) => acc + char.charCodeAt(0), 0)

  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = "#FFFFFF"
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const shouldFill = (hash + x * y) % 3 !== 0
      if (shouldFill) {
        ctx.fillRect(x * cellSize, y * cellSize, cellSize - 2, cellSize - 2)
      }
    }
  }
}

export function makeContactPayload(bioId: string, walletAddress: string) {
  return {
    bioId,
    walletAddress,
    timestamp: Date.now(),
  }
}
