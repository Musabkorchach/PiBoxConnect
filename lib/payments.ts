export const PREMIUM_PRODUCT_ID = "premium_monthly"
export const PREMIUM_DURATION_DAYS = 30

export function getPremiumPrice() {
  return Number(process.env.NEXT_PUBLIC_PREMIUM_PRICE || "0.0001")
}

export function getPremiumMetadata(userId?: string) {
  return {
    product: PREMIUM_PRODUCT_ID,
    duration: "30_days",
    type: "subscription",
    userId: userId || null,
  }
}