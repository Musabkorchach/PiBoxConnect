// Pi Network authentication utilities

export interface PiUser {
  uid: string
  username: string
  walletAddress?: string
  wallet_address?: string
}

export interface PiAuthResult {
  accessToken: string
  user: PiUser
}

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void | Promise<void>
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound?: (payment: unknown) => void,
      ) => Promise<PiAuthResult>
    }
  }
}

const PI_SDK_URL = "https://sdk.minepi.com/pi-sdk.js"
let sdkLoadingPromise: Promise<void> | null = null

export function isPiSdkAvailable() {
  return typeof window !== "undefined" && typeof window.Pi !== "undefined"
}

export function isProbablyPiBrowser() {
  if (typeof navigator === "undefined") return false
  return /PiBrowser|Pi Network|MinePi/i.test(navigator.userAgent)
}

export async function loadPiSdk(): Promise<void> {
  if (typeof window === "undefined") return
  if (window.Pi) return
  if (sdkLoadingPromise) return sdkLoadingPromise

  sdkLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PI_SDK_URL}"]`)
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error("Pi SDK could not be loaded")), { once: true })
      return
    }

    const script = document.createElement("script")
    script.src = PI_SDK_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Pi SDK could not be loaded"))
    document.head.appendChild(script)
  })

  return sdkLoadingPromise
}

export async function initPiSdk() {
  await loadPiSdk()
  if (!window.Pi) throw new Error("Pi SDK is not available. Open the app in Pi Browser or try again.")
  await window.Pi.init({ version: "2.0", sandbox: false })
}

export async function signInWithPi(): Promise<PiAuthResult> {
  await initPiSdk()
  if (!window.Pi) throw new Error("Pi SDK is not available")

  const onIncompletePaymentFound = (payment: unknown) => {
    console.info("Incomplete Pi payment found:", payment)
  }

  // wallet_address is requested when supported by the Pi environment. Some Pi SDK
  // configurations may only return uid/username, so we retry with username only.
  try {
    return await window.Pi.authenticate(["username", "wallet_address"], onIncompletePaymentFound)
  } catch (firstError) {
    console.warn("Pi auth with wallet_address failed, retrying username-only auth", firstError)
    return await window.Pi.authenticate(["username"], onIncompletePaymentFound)
  }
}

export function getPiIdentity(user: PiUser) {
  return user.walletAddress || user.wallet_address || `pi:${user.uid}`
}
