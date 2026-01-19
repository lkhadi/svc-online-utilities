let timer: ReturnType<typeof setInterval> | null = null;
let remainingSeconds = 0;
let isRunning = false;

export interface WorkerMessage {
  type: 'START' | 'PAUSE' | 'RESET' | 'TICK' | 'COMPLETE' | 'GET_STATE';
  seconds?: number;
}

export interface WorkerResponse {
  type: 'TICK' | 'COMPLETE' | 'STATE';
  seconds?: number;
  isRunning?: boolean;
  remainingSeconds?: number;
}

const sendState = () => {
  self.postMessage({
    type: 'STATE',
    seconds: remainingSeconds,
    isRunning,
    remainingSeconds
  } as WorkerResponse);
};

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, seconds } = e.data;

  if (type === 'START') {
    if (timer) clearInterval(timer);
    remainingSeconds = seconds || remainingSeconds;
    isRunning = true;

    timer = setInterval(() => {
      remainingSeconds--;
      self.postMessage({ type: 'TICK', seconds: remainingSeconds } as WorkerResponse);

      if (remainingSeconds <= 0) {
        clearInterval(timer!);
        timer = null;
        isRunning = false;
        self.postMessage({ type: 'COMPLETE' } as WorkerResponse);
      }
    }, 1000);
  } else if (type === 'PAUSE') {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    isRunning = false;
    sendState();
  } else if (type === 'RESET') {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    isRunning = false;
    remainingSeconds = seconds || 0;
    sendState();
  } else if (type === 'GET_STATE') {
    sendState();
  }
};

export {};
