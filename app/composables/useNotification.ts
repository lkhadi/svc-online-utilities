/**
 * Notification composable for toast messages
 */
export function useNotification() {
  const show = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (import.meta.client) {
      let notification = document.querySelector('.notification') as HTMLDivElement | null
      
      if (!notification) {
        notification = document.createElement('div')
        notification.className = 'notification'
        document.body.appendChild(notification)
      }
      
      notification.textContent = message
      notification.className = `notification ${type}`
      
      // Use slight delay to allow transition
      setTimeout(() => {
        notification?.classList.add('show')
      }, 10)
      
      setTimeout(() => {
        notification?.classList.remove('show')
      }, 3000)
    }
  }

  return { show }
}
