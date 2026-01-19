export interface ScrollSyncOptions {
  sourceRatio?: number
  targetRatio?: number
  syncDirection?: 'both' | 'source-to-target' | 'target-to-source'
}

export function useScrollSync(
  sourceRef: Ref<HTMLElement | null>,
  targetRef: Ref<HTMLElement | null>,
  options: ScrollSyncOptions = {}
) {
  const {
    syncDirection = 'both',
  } = options
  
  const isSyncing = ref({ source: false, target: false })
  
  const syncScroll = (source: 'source' | 'target') => {
    const sourceEl = source === 'source' ? sourceRef.value : targetRef.value
    const targetEl = source === 'source' ? targetRef.value : sourceRef.value
    
    if (!sourceEl || !targetEl || isSyncing.value[source === 'source' ? 'target' : 'source']) {
      return
    }
    
    isSyncing.value[source === 'source' ? 'source' : 'target'] = true
    
    const scrollPercentage = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight)
    const targetScrollTop = scrollPercentage * (targetEl.scrollHeight - targetEl.clientHeight)
    
    targetEl.scrollTop = targetScrollTop
    
    requestAnimationFrame(() => {
      isSyncing.value[source === 'source' ? 'source' : 'target'] = false
    })
  }
  
  const handleSourceScroll = () => {
    if (syncDirection !== 'target-to-source') {
      syncScroll('source')
    }
  }
  
  const handleTargetScroll = () => {
    if (syncDirection !== 'source-to-target') {
      syncScroll('target')
    }
  }
  
  onMounted(() => {
    const sourceEl = sourceRef.value
    const targetEl = targetRef.value
    
    if (sourceEl && syncDirection !== 'target-to-source') {
      sourceEl.addEventListener('scroll', handleSourceScroll)
    }
    
    if (targetEl && syncDirection !== 'source-to-target') {
      targetEl.addEventListener('scroll', handleTargetScroll)
    }
  })
  
  onUnmounted(() => {
    const sourceEl = sourceRef.value
    const targetEl = targetRef.value
    
    if (sourceEl) {
      sourceEl.removeEventListener('scroll', handleSourceScroll)
    }
    
    if (targetEl) {
      targetEl.removeEventListener('scroll', handleTargetScroll)
    }
  })
  
  return {
    isSyncing,
  }
}
