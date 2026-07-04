// Biometric and Bio-ID utilities

export function isLikelyWalletAddress(addr: string | null): boolean {
  if (!addr) return false
  // Pi wallet addresses are typically 56 characters starting with G
  return addr.length === 56 && addr.startsWith("G")
}

export async function generateBioID(walletAddress: string): Promise<string> {
  // Simulate biometric processing with Pi wallet as seed
  // In production, this would involve actual biometric capture and processing

  // Create a hash-like Bio-ID from wallet address
  const hash = await hashString(walletAddress)

  // Format as BDI-XXXX-XXXX
  const part1 = hash.slice(0, 4).toUpperCase()
  const part2 = hash.slice(4, 8).toUpperCase()

  return `BDI-${part1}-${part2}`
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function generateQRData(bioId: string, walletAddress: string): string {
  return JSON.stringify({
    type: "bio-id",
    id: bioId,
    wallet: walletAddress,
    timestamp: Date.now(),
  })
}
