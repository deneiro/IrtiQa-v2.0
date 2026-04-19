// Simple toast utility to replace sonner if it's missing from dependencies
// This prevents build errors while providing basic feedback

export const toast = {
  success: (message: string) => {
    console.log('✅ SUCCESS:', message)
    // You can replace this with a real toast library like sonner
  },
  error: (message: string) => {
    console.warn('❌ ERROR:', message)
  },
  info: (message: string) => {
    console.info('ℹ️ INFO:', message)
  }
}
