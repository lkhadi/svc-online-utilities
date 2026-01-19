import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

export interface PomodoroSession {
  id: string;
  type: 'work' | 'shortBreak' | 'longBreak';
  startTime: string;
  endTime: string;
  duration: number;
  completed: boolean;
}

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  soundEnabled: true,
  autoStartBreaks: false,
  autoStartWork: false
};

const MODE_LABELS = {
  work: 'Work',
  shortBreak: 'Short Break',
  longBreak: 'Long Break'
};

function useStorage<T>(key: string, defaultValue: T) {
  const storedValue = ref<T>(defaultValue);

  const load = () => {
    if (import.meta.client) {
      try {
        const item = localStorage.getItem(key);
        if (item !== null) {
          storedValue.value = JSON.parse(item);
        }
      } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
      }
    }
  };

  const save = (value: T) => {
    if (import.meta.client) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    }
  };

  load();

  watch(
    storedValue,
    (newValue) => {
      save(newValue);
    },
    { deep: true }
  );

  return storedValue;
}

export function usePomodoro() {
  const remainingSeconds = ref(1500);
  const isRunning = ref(false);
  const mode = ref<TimerMode>('work');
  const completedSessions = ref(0);
  const worker = ref<Worker | null>(null);
  const audioContext = ref<AudioContext | null>(null);

  const settings = useStorage<PomodoroSettings>('pomodoro-settings', DEFAULT_SETTINGS);
  const sessions = useStorage<PomodoroSession[]>('pomodoro-sessions', []);
  
  const savedState = ref<{
    remainingSeconds: number;
    isRunning: boolean;
    mode: TimerMode;
    completedSessions: number;
  } | null>(null);

  const modeLabel = computed(() => MODE_LABELS[mode.value]);

  const timeDisplay = computed(() => {
    const minutes = Math.floor(remainingSeconds.value / 60);
    const seconds = remainingSeconds.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  const progress = computed(() => {
    const totalSeconds = getModeDuration(mode.value);
    return ((totalSeconds - remainingSeconds.value) / totalSeconds) * 100;
  });

  const getModeDuration = (timerMode: TimerMode): number => {
    switch (timerMode) {
      case 'work':
        return settings.value.workDuration * 60;
      case 'shortBreak':
        return settings.value.shortBreakDuration * 60;
      case 'longBreak':
        return settings.value.longBreakDuration * 60;
    }
  };

  const initWorker = () => {
    if (import.meta.client && !worker.value) {
      const workerUrl = new URL('/workers/pomodoro.worker.ts', import.meta.url).href;
      worker.value = new Worker(workerUrl, { type: 'module' });

      worker.value.onmessage = (e) => {
        const { type, seconds } = e.data;

        if (type === 'TICK') {
          remainingSeconds.value = seconds;
        } else if (type === 'COMPLETE') {
          isRunning.value = false;
          handleTimerComplete();
        } else if (type === 'STATE') {
          if (seconds !== undefined) {
            remainingSeconds.value = seconds;
          }
        }
      };
    }
  };

  const playNotificationSound = () => {
    if (!settings.value.soundEnabled) return;

    try {
      if (!audioContext.value) {
        audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const oscillator = audioContext.value.createOscillator();
      const gainNode = audioContext.value.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.value.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.value.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.value.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.value.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.value.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.5);

      oscillator.start(audioContext.value.currentTime);
      oscillator.stop(audioContext.value.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const handleTimerComplete = () => {
    playNotificationSound();

    const session: PomodoroSession = {
      id: crypto.randomUUID(),
      type: mode.value,
      startTime: new Date(Date.now() - (getModeDuration(mode.value) - remainingSeconds.value) * 1000).toISOString(),
      endTime: new Date().toISOString(),
      duration: getModeDuration(mode.value),
      completed: true
    };

    sessions.value.unshift(session);

    if (mode.value === 'work') {
      completedSessions.value++;

      if (completedSessions.value >= settings.value.sessionsBeforeLongBreak) {
        completedSessions.value = 0;
        mode.value = 'longBreak';
      } else {
        mode.value = 'shortBreak';
      }

      if (settings.value.autoStartBreaks) {
        setTimeout(() => startTimer(), 1000);
      } else {
        remainingSeconds.value = getModeDuration(mode.value);
      }
    } else {
      mode.value = 'work';

      if (settings.value.autoStartWork) {
        setTimeout(() => startTimer(), 1000);
      } else {
        remainingSeconds.value = getModeDuration(mode.value);
      }
    }
  };

  const startTimer = () => {
    if (!worker.value) initWorker();
    if (remainingSeconds.value <= 0) {
      remainingSeconds.value = getModeDuration(mode.value);
    }
    worker.value?.postMessage({ type: 'START', seconds: remainingSeconds.value });
    isRunning.value = true;
    saveState();
  };

  const pauseTimer = () => {
    worker.value?.postMessage({ type: 'PAUSE' });
    isRunning.value = false;
    saveState();
  };

  const resetTimer = (newMode?: TimerMode) => {
    if (newMode) {
      mode.value = newMode;
    }
    const duration = getModeDuration(mode.value);
    worker.value?.postMessage({ type: 'RESET', seconds: duration });
    remainingSeconds.value = duration;
    isRunning.value = false;
    saveState();
  };

  const saveState = () => {
    if (import.meta.client) {
      savedState.value = {
        remainingSeconds: remainingSeconds.value,
        isRunning: isRunning.value,
        mode: mode.value,
        completedSessions: completedSessions.value
      };
      try {
        localStorage.setItem('pomodoro-state', JSON.stringify(savedState.value));
      } catch (error) {
        console.error('Error saving state to localStorage:', error);
      }
    }
  };

  const loadState = () => {
    if (import.meta.client) {
      try {
        const item = localStorage.getItem('pomodoro-state');
        if (item) {
          savedState.value = JSON.parse(item);
          if (savedState.value) {
            remainingSeconds.value = savedState.value.remainingSeconds;
            isRunning.value = savedState.value.isRunning;
            mode.value = savedState.value.mode;
            completedSessions.value = savedState.value.completedSessions;

            if (isRunning.value) {
              initWorker();
              worker.value?.postMessage({ type: 'START', seconds: remainingSeconds.value });
            }
          }
        }
      } catch (error) {
        console.error('Error loading state from localStorage:', error);
      }
    }
  };

  const clearSessionHistory = () => {
    sessions.value = [];
    completedSessions.value = 0;
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    settings.value = { ...settings.value, ...newSettings };

    if (!isRunning.value) {
      remainingSeconds.value = getModeDuration(mode.value);
    }
  };

  const formatSessionTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatSessionDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getTodaySessions = () => {
    const today = new Date().toDateString();
    return sessions.value.filter(session => 
      new Date(session.startTime).toDateString() === today
    );
  };

  const getTodayWorkTime = () => {
    const todaySessions = getTodaySessions();
    return todaySessions
      .filter(s => s.type === 'work')
      .reduce((total, s) => total + s.duration, 0);
  };

  watch([remainingSeconds, isRunning, mode, completedSessions], saveState);

  onMounted(() => {
    loadState();
  });

  onUnmounted(() => {
    if (worker.value) {
      worker.value.terminate();
      worker.value = null;
    }
    if (audioContext.value) {
      audioContext.value.close();
      audioContext.value = null;
    }
  });

  return {
    remainingSeconds,
    isRunning,
    mode,
    modeLabel,
    timeDisplay,
    progress,
    completedSessions,
    sessions,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    updateSettings,
    clearSessionHistory,
    formatSessionTime,
    formatSessionDate,
    getTodaySessions,
    getTodayWorkTime
  };
}
