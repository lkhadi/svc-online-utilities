# Pomodoro Timer Test Suite Documentation

## Test Files

1. **Main Component Tests**: `app/components/__tests__/PomodoroTimer.test.ts`
2. **Web Worker Tests**: `tests/workers/pomodoro.worker.test.ts`

## Test Coverage Overview

| Category | Test Count | Status |
|----------|-----------|--------|
| Timer Countdown Accuracy | 5 | ✅ |
| Start/Pause/Reset | 5 | ✅ |
| Mode Switching | 5 | ✅ |
| Custom Time Settings | 4 | ✅ |
| Web Worker Communication | 6 | ✅ |
| Persistence Across Refreshes | 4 | ✅ |
| Session History Tracking | 5 | ✅ |
| Sound Notification | 3 | ✅ |
| Tab Inactive (Web Worker) | 3 | ✅ |
| Browser Background | 3 | ✅ |
| LocalStorage Persistence | 4 | ✅ |
| Session Counter | 5 | ✅ |
| Progress Ring Animation | 4 | ✅ |
| Very Long Durations | 3 | ✅ |
| Edge Cases | 8 | ✅ |
| Tab Switching Critical | 3 | ✅ |
| **Total** | **70** | **✅** |

---

## 1. Timer Countdown Accuracy Tests

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 1.1 | Countdown from 25:00 to 24:59 in 1 second | Timer decrements by 1 second |
| 1.2 | Countdown accurately over 10 seconds | Timer decrements by 10 seconds |
| 1.3 | Reach 00:00 after full duration | Timer reaches exactly 0 |
| 1.4 | No drift over 5 minute test | No accumulated drift (≤1 second) |
| 1.5 | Maintain accuracy over 1 minute intervals | Accurate decrement every 60 seconds |

### Validation Criteria
- Timer must decrement exactly 1 second per real second
- No accumulation of drift over extended periods
- Timer must complete at exactly 00:00

---

## 2. Start/Pause/Reset Functionality Tests

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 2.1 | Start timer on button click | Worker receives START message |
| 2.2 | Pause timer on button click | Worker receives PAUSE message |
| 2.3 | Reset timer to initial duration | Timer resets to initial value |
| 2.4 | Maintain paused state when reset | Timer stops and resets |
| 2.5 | Allow resume after pause | Timer continues from paused state |

### Validation Criteria
- Start/Pause/Reset buttons must work correctly
- Worker must receive correct messages
- State transitions must be clean

---

## 3. Mode Switching Tests

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 3.1 | Switch to work mode | Duration: 25:00, Mode: work |
| 3.2 | Switch to short break mode | Duration: 05:00, Mode: shortBreak |
| 3.3 | Switch to long break mode | Duration: 15:00, Mode: longBreak |
| 3.4 | Reset timer when switching modes | Timer stops and resets |
| 3.5 | Maintain mode state across pause/resume | Mode persists correctly |

### Validation Criteria
- Each mode must have correct duration
- Switching modes must reset timer
- Mode state must persist

---

## 4. Custom Time Settings Tests

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 4.1 | Accept custom work duration | Timer uses custom duration |
| 4.2 | Accept custom short break duration | Timer uses custom duration |
| 4.3 | Accept custom long break duration | Timer uses custom duration |
| 4.4 | Persist custom settings across mode switches | Settings maintained |

### Validation Criteria
- Custom durations must be accepted
- Settings must persist across mode switches
- Invalid durations must be rejected

---

## 5. Web Worker Communication Tests

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 5.1 | Send START message to worker | Worker receives START with duration |
| 5.2 | Send PAUSE message to worker | Worker receives PAUSE |
| 5.3 | Send RESET message to worker | Worker receives RESET |
| 5.4 | Receive TICK messages from worker | UI updates with remaining time |
| 5.5 | Receive COMPLETE message from worker | UI shows completion |
| 5.6 | Handle worker message errors | Graceful error handling |

### Validation Criteria
- All messages must be sent correctly
- Worker responses must update UI
- Error handling must be robust

---

## 6. Timer Persistence Across Page Refreshes Tests

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 6.1 | Save timer state to localStorage | State saved correctly |
| 6.2 | Restore timer state from localStorage | State restored correctly |
| 6.3 | Maintain session count across refreshes | Session count preserved |
| 6.4 | Clear persisted state on explicit reset | Optional: clear on reset |

### Validation Criteria
- State must be saved to localStorage
- State must be restored on reload
- Session data must persist

---

## 7. Session History Tracking Tests

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 7.1 | Record completed work session | Session added to history |
| 7.2 | Record multiple sessions | All sessions recorded |
| 7.3 | Increment session counter | Counter increments on work sessions |
| 7.4 | Store session timestamps | Timestamps recorded accurately |
| 7.5 | Preserve session order | Sessions in chronological order |

### Validation Criteria
- All sessions must be recorded
- Only work sessions increment counter
- Timestamps must be accurate

---

## 8. Sound Notification Tests

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 8.1 | Play sound when timer completes | Sound plays on COMPLETE |
| 8.2 | Not play sound during countdown | No sound during normal operation |
| 8.3 | Handle sound play errors gracefully | No crash on audio error |

### Validation Criteria
- Sound must play on completion
- No false positives
- Graceful error handling

---

## 9. Tab Inactive Tests (Web Worker Verification)

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 9.1 | Continue timer when tab is inactive | Timer continues in background |
| 9.2 | Maintain accuracy after tab becomes active | No loss of time |
| 9.3 | Handle rapid visibility changes | Accurate despite rapid changes |

### Validation Criteria
- Timer must continue in background
- No time loss when tab inactive
- Web Worker must be functional

---

## 10. Browser Background Tests

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 10.1 | Continue running when browser in background | Timer continues |
| 10.2 | Not lose time after extended background period | No time loss |
| 10.3 | Handle browser tab suspend gracefully | Handles freeze/resume |

### Validation Criteria
- Timer must work in background
- Extended periods must not cause drift
- Freeze/resume events handled

---

## 11. LocalStorage Persistence Tests

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 11.1 | Persist timer state | All state saved |
| 11.2 | Persist custom settings | Settings saved |
| 11.3 | Persist session history | History saved |
| 11.4 | Clear storage on reset (optional) | Configurable behavior |

### Validation Criteria
- All state must be saved
- Settings must persist
- Session history must be preserved

---

## 12. Session Counter Tests

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 12.1 | Start with zero sessions | Counter at 0 |
| 12.2 | Increment after work session | Counter increments |
| 12.3 | Not increment for break sessions | Breaks don't count |
| 12.4 | Display correct session count | UI shows correct count |
| 12.5 | Handle multiple work sessions | Tracks all work sessions |

### Validation Criteria
- Counter starts at 0
- Only work sessions increment
- Display must be accurate

---

## 13. Progress Ring Animation Tests

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 13.1 | Start with 0% progress | Ring empty |
| 13.2 | Update progress over time | Progress increases accurately |
| 13.3 | Reach 100% at timer completion | Ring full |
| 13.4 | Reset progress on mode switch | Progress resets |

### Validation Criteria
- Progress must start at 0%
- Progress must be proportional to time
- Must reach 100% at completion
- Must reset correctly

---

## 14. Very Long Duration Tests

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 14.1 | Handle 1 hour duration | Timer works correctly |
| 14.2 | Remain accurate over 2 hour test | No drift over long periods |
| 14.3 | Display long durations correctly | Format: HH:MM |

### Validation Criteria
- Long durations must work
- No drift over long periods
- Display format must be correct

---

## 15. Edge Cases Tests

### Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| 15.1 | Handle 0 seconds duration | Displays 00:00 |
| 15.2 | Reject negative time values | Treats as 0 |
| 15.3 | Handle rapid start/stop clicks | Clean state transitions |
| 15.4 | Handle mode switch while running | Stops and resets |
| 15.5 | Handle multiple rapid mode switches | Final mode applies |
| 15.6 | Handle very short break durations | Works with 30 seconds |
| 15.7 | Handle setting 0 for all durations | All timers at 0 |

### Validation Criteria
- Edge cases must not crash
- Invalid inputs handled gracefully
- Rapid clicks handled correctly

---

## Critical Tests

### Tab Switching Test (Web Worker Verification)

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| CRITICAL.1 | Maintain accuracy after 5 minute tab switch | Timer accurate within 1 second |
| CRITICAL.2 | Drift less than 100ms after 5 minute inactive | Drift < 100ms |
| CRITICAL.3 | Complete correctly after extended inactive | Completes at 00:00 |

**Validation Criteria**: Web Worker must prevent any drift, even with extended tab inactivity.

---

## Web Worker Tests

### Worker Initialization Tests (5 tests)
- Worker initializes without errors
- Message listener set up correctly
- Initial state is correct

### START Command Tests (4 tests)
- START command accepted with duration
- START rejected without duration
- Countdown starts with correct duration
- START rejected if already running

### PAUSE Command Tests (3 tests)
- PAUSE command accepted
- PAUSE handled when not running
- Remaining time preserved on PAUSE

### RESET Command Tests (3 tests)
- RESET command accepted
- Timer reset to original duration
- RESET handled when not running

### Timer Countdown Accuracy Tests (4 tests)
- Countdown by 1 second each interval
- Maintain accuracy over 60 seconds
- No drift over 5 minutes
- Complete exactly at 0 seconds

### TICK Message Tests (3 tests)
- TICK message every second
- Remaining time included in TICK
- TICK messages stop after PAUSE

### COMPLETE Message Tests (3 tests)
- COMPLETE message sent at 0
- Countdown stops after COMPLETE
- COMPLETE sent with 0 remaining

### Duration Change Tests (4 tests)
- New duration accepted while paused
- Duration change rejected while running
- Duration 0 handled
- Negative duration rejected

### Edge Cases Tests (5 tests)
- 1 second duration handled
- Very long duration (2 hours) handled
- Rapid START/PAUSE handled
- Multiple RESETs handled
- PAUSE before START handled

### Worker Lifecycle Tests (3 tests)
- terminate() called on cleanup
- close() called on cleanup
- Interval cleaned up on terminate

### Message Validation Tests (3 tests)
- Unknown message types ignored
- Messages without type ignored
- Malformed messages handled

### Performance Tests (2 tests)
- Not block main thread
- Handle high-frequency updates

### State Persistence Tests (2 tests)
- Remaining time across pause/resume
- No time loss on pause

### Background Tab Tests (3 tests)
- Countdown when tab inactive
- Accuracy over 5 minute inactive
- Complete after extended inactivity

### Multiple Worker Instances Tests (2 tests)
- Multiple instances allowed
- Instances isolated

### Tab Switching Critical Tests (3 tests)
- Accuracy after 5 minute tab switch
- Drift < 100ms after extended inactivity
- Complete after multiple tab switches

### Timer Accuracy Verification Tests (3 tests)
- 0% drift over 1 minute
- Minimal drift over 5 minutes
- Maintain accuracy over 25 minutes

---

## Test Execution Commands

### Run All Tests
```bash
npm test
```

### Run Specific Test Files
```bash
npm test app/components/__tests__/PomodoroTimer.test.ts
npm test tests/workers/pomodoro.worker.test.ts
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run in Watch Mode
```bash
npm test -- --watch
```

---

## Expected Test Results

All 70 tests should pass with the following criteria:

- **Timer Accuracy**: Drift must be < 100ms over 5 minutes
- **Web Worker**: Must continue running in background tabs
- **Persistence**: State must survive page refreshes
- **Edge Cases**: No crashes or unexpected behavior
- **Performance**: No blocking of main thread

---

## Manual Testing Checklist

### UI/UX Verification
- [ ] Timer display shows correct format (MM:SS)
- [ ] Start/Pause/Reset buttons work visually
- [ ] Mode switch buttons highlight current mode
- [ ] Progress ring animates smoothly
- [ ] Session counter displays correctly
- [ ] Settings panel works as expected

### Sound Notification
- [ ] Sound plays on timer completion
- [ ] Sound volume is appropriate
- [ ] Sound can be toggled on/off
- [ ] Sound file loads correctly

### Responsiveness
- [ ] Layout works on mobile
- [ ] Layout works on tablet
- [ ] Layout works on desktop
- [ ] Touch interactions work
- [ ] Keyboard shortcuts work (if implemented)

### Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## Known Limitations

1. **Test Environment**: Tests run in jsdom, not real browser
2. **Web Worker Testing**: Web Worker is mocked in tests
3. **Audio Testing**: Audio is mocked, requires manual verification
4. **Tab Visibility**: Visibility API mocked, requires real browser test
5. **LocalStorage**: Tests use localStorage, cleared between tests

---

## Notes for Developers

### Web Worker Implementation
The timer uses a Web Worker to ensure accuracy even when the tab is inactive. The worker handles:
- Countdown logic (setInterval)
- Message passing (TICK, COMPLETE)
- State management (remaining time)

### Persistence Strategy
Timer state is persisted to localStorage:
- Key: `pomodoroState`
- Contains: mode, timeLeft, isRunning, currentSession, settings, sessions

### Session Tracking
- Work sessions increment counter
- Break sessions do not increment
- All sessions stored in history with timestamps

### Progress Calculation
```
progress = ((totalDuration - timeLeft) / totalDuration) * 100
```

---

## Test Maintenance

### When to Update Tests
- New features added
- Bug fixes implemented
- API changes
- Requirements updated

### Test Quality Metrics
- Coverage: Target > 90%
- Pass Rate: 100%
- Execution Time: < 30 seconds

---

## Contact

For questions or issues with tests, refer to the project documentation or create an issue in the repository.
