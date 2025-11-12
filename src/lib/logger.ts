export const logger = {
  info: (...msg: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log("ℹ️", ...msg)
    }
  },
  warn: (...msg: unknown[]) => {
    console.warn("⚠️", ...msg)
  },
  error: (...msg: unknown[]) => {
    console.error("❌", ...msg)
  },
  success: (...msg: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log("✅", ...msg)
    }
  }
}