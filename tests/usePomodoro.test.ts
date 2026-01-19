import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePomodoro } from '~/composables/usePomodoro';
import { ref } from 'vue';

describe('usePomodoro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('initializes with default work duration of 25 minutes', () => {
    const { remainingSeconds, timeDisplay } = usePomodoro();
    
    expect(remainingSeconds.value).toBe(1500);
    expect(timeDisplay.value).toBe('25:00');
  });

  it('starts timer and sets isRunning to true', () => {
    const { isRunning, startTimer } = usePomodoro();
    
    expect(isRunning.value).toBe(false);
    startTimer();
    expect(isRunning.value).toBe(true);
  });

  it('pauses timer and sets isRunning to false', () => {
    const { isRunning, startTimer, pauseTimer } = usePomodoro();
    
    startTimer();
    expect(isRunning.value).toBe(true);
    pauseTimer();
    expect(isRunning.value).toBe(false);
  });

  it('resets timer to initial duration', () => {
    const { remainingSeconds, resetTimer } = usePomodoro();
    
    remainingSeconds.value = 100;
    resetTimer('work');
    expect(remainingSeconds.value).toBe(1500);
  });

  it('updates settings correctly', () => {
    const { settings, updateSettings, remainingSeconds } = usePomodoro();
    
    updateSettings({ workDuration: 30 });
    expect(settings.value.workDuration).toBe(30);
  });

  it('calculates progress correctly', () => {
    const { progress, remainingSeconds } = usePomodoro();
    
    remainingSeconds.value = 750;
    expect(progress.value).toBe(50);
  });

  it('provides correct mode labels', () => {
    const { modeLabel, resetTimer } = usePomodoro();
    
    resetTimer('work');
    expect(modeLabel.value).toBe('Work');
    
    resetTimer('shortBreak');
    expect(modeLabel.value).toBe('Short Break');
    
    resetTimer('longBreak');
    expect(modeLabel.value).toBe('Long Break');
  });

  it('formats session time correctly', () => {
    const { formatSessionTime } = usePomodoro();
    
    const time = new Date('2024-01-15T14:30:00');
    const formatted = formatSessionTime(time.toISOString());
    expect(formatted).toMatch(/^\d{1,2}:\d{2}\s*(AM|PM)$/);
  });

  it('formats session date correctly', () => {
    const { formatSessionDate } = usePomodoro();
    
    const today = new Date();
    const todayFormatted = formatSessionDate(today.toISOString());
    expect(todayFormatted).toBe('Today');
  });

  it('clears session history', () => {
    const { sessions, clearSessionHistory } = usePomodoro();
    
    sessions.value = [{ id: '1', type: 'work', startTime: new Date().toISOString(), endTime: new Date().toISOString(), duration: 1500, completed: true }];
    clearSessionHistory();
    expect(sessions.value).toHaveLength(0);
  });

  it('gets today sessions correctly', () => {
    const { sessions, getTodaySessions } = usePomodoro();
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    sessions.value = [
      { id: '1', type: 'work', startTime: today.toISOString(), endTime: today.toISOString(), duration: 1500, completed: true },
      { id: '2', type: 'work', startTime: yesterday.toISOString(), endTime: yesterday.toISOString(), duration: 1500, completed: true }
    ];
    
    const todaySessions = getTodaySessions();
    expect(todaySessions).toHaveLength(1);
    expect(todaySessions[0].id).toBe('1');
  });

  it('calculates today work time correctly', () => {
    const { sessions, getTodayWorkTime } = usePomodoro();
    
    const today = new Date();
    
    sessions.value = [
      { id: '1', type: 'work', startTime: today.toISOString(), endTime: today.toISOString(), duration: 1500, completed: true },
      { id: '2', type: 'shortBreak', startTime: today.toISOString(), endTime: today.toISOString(), duration: 300, completed: true },
      { id: '3', type: 'work', startTime: today.toISOString(), endTime: today.toISOString(), duration: 1500, completed: true }
    ];
    
    const workTime = getTodayWorkTime();
    expect(workTime).toBe(3000);
  });
});
