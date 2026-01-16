/**
 * Clipboard composable with fallback for older browsers
 */
export function useClipboard() {
  const copy = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        return true
      }
      
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      
      try {
        document.execCommand('copy')
        return true
      } finally {
        document.body.removeChild(textarea)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
      return false
    }
  }

  return { copy }
}
