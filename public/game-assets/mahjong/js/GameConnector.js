/**
 * GameConnector for Green Mahjong
 *
 * Vanilla JavaScript connector for communication with the Game Portal.
 * Handles save/load game progress and achievement unlocking.
 *
 * Usage:
 *   // Initialize (call this when game starts)
 *   GameConnector.initialize();
 *
 *   // Save progress (throttled to 1 req/5s)
 *   GameConnector.saveProgress({ score: 100, gamesWon: 5 });
 *
 *   // Unlock achievement
 *   GameConnector.unlockAchievement('MAHJONG_FIRST_WIN');
 *
 *   // Get initial save data
 *   const saveData = GameConnector.getSaveData();
 */
(function(window) {
  'use strict';

  // Bridge event types (must match @game-portal/shared)
  var BRIDGE_EVENTS = {
    INIT_GAME: 'INIT_GAME',
    SAVE_PROGRESS: 'SAVE_PROGRESS',
    UNLOCK_ACHIEVEMENT: 'UNLOCK_ACHIEVEMENT',
    GET_SAVE_DATA: 'GET_SAVE_DATA',
    SAVE_DATA_RESPONSE: 'SAVE_DATA_RESPONSE',
    ACHIEVEMENT_CONFIRMED: 'ACHIEVEMENT_CONFIRMED'
  };

  // Connector state
  var state = {
    initialized: false,
    ready: false,
    initPayload: null,
    parentWindow: null,
    lastSaveTime: 0,
    onReadyCallbacks: [],
    onSaveDataCallbacks: []
  };

  // Configuration
  var THROTTLE_DURATION = 5000; // 5 seconds
  var INIT_TIMEOUT = 5000; // 5 seconds

  /**
   * Log helper (only in development)
   */
  function log() {
    if (window.location.hostname === 'localhost') {
      console.log.apply(console, ['[GameConnector]'].concat(Array.prototype.slice.call(arguments)));
    }
  }

  /**
   * Validate message origin
   */
  function validateOrigin(event) {
    if (!event.origin) return false;

    try {
      var origin = new URL(event.origin);
      // Allow localhost for development
      if (origin.hostname === 'localhost' || origin.hostname === '127.0.0.1') {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Handle incoming messages from portal
   */
  function handleMessage(event) {
    if (!validateOrigin(event)) {
      log('Message from untrusted origin:', event.origin);
      return;
    }

    var message = event.data;
    if (!message || !message.type) return;

    log('Received message:', message.type);

    switch (message.type) {
      case BRIDGE_EVENTS.INIT_GAME:
        handleInitGame(message.payload);
        break;
      case BRIDGE_EVENTS.SAVE_DATA_RESPONSE:
        handleSaveDataResponse(message.payload);
        break;
      case BRIDGE_EVENTS.ACHIEVEMENT_CONFIRMED:
        handleAchievementConfirmed(message.payload);
        break;
    }
  }

  /**
   * Handle INIT_GAME message
   */
  function handleInitGame(payload) {
    log('Game initialized with payload:', payload);

    state.initPayload = payload;
    state.ready = true;

    // Call ready callbacks
    state.onReadyCallbacks.forEach(function(cb) {
      try { cb(payload); } catch (e) { console.error(e); }
    });
  }

  /**
   * Handle SAVE_DATA_RESPONSE message
   */
  function handleSaveDataResponse(payload) {
    log('Save data received:', payload);

    state.onSaveDataCallbacks.forEach(function(cb) {
      try { cb(payload ? payload.data : null); } catch (e) { console.error(e); }
    });
    state.onSaveDataCallbacks = [];
  }

  /**
   * Handle ACHIEVEMENT_CONFIRMED message
   */
  function handleAchievementConfirmed(payload) {
    log('Achievement confirmed:', payload);
  }

  /**
   * Send message to portal
   */
  function sendMessage(message) {
    if (!state.parentWindow) {
      log('Cannot send message: not in iframe');
      return;
    }

    log('Sending message:', message.type);
    state.parentWindow.postMessage(message, '*');
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  var GameConnector = {
    /**
     * Initialize the connector
     * Call this when the game starts
     */
    initialize: function() {
      if (state.initialized) {
        log('Already initialized');
        return;
      }

      // Check if in iframe
      if (window.parent === window) {
        log('Not in iframe, running standalone');
        state.initialized = true;
        return;
      }

      state.parentWindow = window.parent;
      state.initialized = true;

      // Set up message listener
      window.addEventListener('message', handleMessage);

      // Request save data from portal
      sendMessage({ type: BRIDGE_EVENTS.GET_SAVE_DATA });

      log('Initialized, waiting for INIT_GAME...');

      // Set timeout for initialization
      setTimeout(function() {
        if (!state.ready) {
          log('INIT_GAME timeout, continuing without portal');
          state.ready = true;
        }
      }, INIT_TIMEOUT);
    },

    /**
     * Check if connector is ready
     */
    isReady: function() {
      return state.ready;
    },

    /**
     * Check if running in portal iframe
     */
    isInPortal: function() {
      return state.parentWindow !== null;
    },

    /**
     * Register callback for when connector is ready
     */
    onReady: function(callback) {
      if (state.ready) {
        callback(state.initPayload);
      } else {
        state.onReadyCallbacks.push(callback);
      }
    },

    /**
     * Get user ID from portal
     */
    getUserId: function() {
      return state.initPayload ? state.initPayload.userId : null;
    },

    /**
     * Get username from portal
     */
    getUsername: function() {
      return state.initPayload ? state.initPayload.username : null;
    },

    /**
     * Get initial save data
     */
    getSaveData: function() {
      if (state.initPayload && state.initPayload.initialSaveData) {
        return state.initPayload.initialSaveData.data;
      }
      return null;
    },

    /**
     * Request save data from portal (async)
     */
    requestSaveData: function(callback) {
      if (!state.parentWindow) {
        callback(null);
        return;
      }

      state.onSaveDataCallbacks.push(callback);
      sendMessage({ type: BRIDGE_EVENTS.GET_SAVE_DATA });
    },

    /**
     * Save game progress (throttled)
     */
    saveProgress: function(data) {
      if (!state.parentWindow || !state.ready) {
        log('Cannot save: not ready or not in portal');
        return false;
      }

      var now = Date.now();
      if (now - state.lastSaveTime < THROTTLE_DURATION) {
        log('Save throttled');
        return false;
      }

      state.lastSaveTime = now;

      sendMessage({
        type: BRIDGE_EVENTS.SAVE_PROGRESS,
        payload: {
          gameId: state.initPayload ? String(state.initPayload.userId) : '0',
          payload: data,
          timestamp: now
        }
      });

      log('Progress saved');
      return true;
    },

    /**
     * Unlock an achievement
     */
    unlockAchievement: function(achievementCode) {
      if (!state.parentWindow || !state.ready) {
        log('Cannot unlock achievement: not ready or not in portal');
        return false;
      }

      sendMessage({
        type: BRIDGE_EVENTS.UNLOCK_ACHIEVEMENT,
        payload: {
          achievementCode: achievementCode,
          gameId: state.initPayload ? String(state.initPayload.userId) : '0',
          timestamp: Date.now()
        }
      });

      log('Achievement unlocked:', achievementCode);
      return true;
    },

    /**
     * Destroy the connector
     */
    destroy: function() {
      window.removeEventListener('message', handleMessage);
      state.initialized = false;
      state.ready = false;
      state.initPayload = null;
      state.parentWindow = null;
      log('Destroyed');
    }
  };

  // Expose to window
  window.GameConnector = GameConnector;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      GameConnector.initialize();
    });
  } else {
    GameConnector.initialize();
  }

})(window);
