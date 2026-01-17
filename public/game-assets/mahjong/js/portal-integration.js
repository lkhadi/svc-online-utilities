/**
 * Portal Integration for Green Mahjong
 *
 * This file hooks into the existing game to add save/achievement functionality
 * without modifying the original game code.
 */
(function() {
  'use strict';

  // Achievement codes
  var ACHIEVEMENTS = {
    FIRST_WIN: 'MAHJONG_FIRST_WIN',
    FAST_WIN: 'MAHJONG_FAST_WIN',        // Under 5 minutes
    NO_HINTS: 'MAHJONG_NO_HINTS',        // Won without hints
    NO_UNDO: 'MAHJONG_NO_UNDO',          // Won without undo
    FIVE_WINS: 'MAHJONG_FIVE_WINS',      // 5 games won
    TEN_WINS: 'MAHJONG_TEN_WINS'         // 10 games won
  };

  // Game statistics (will be saved/loaded)
  var stats = {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    totalPoints: 0,
    bestTime: null,
    hintsUsed: false,
    undoUsed: false
  };

  // Load saved stats from portal
  function loadStats() {
    if (window.GameConnector && GameConnector.isInPortal()) {
      var saveData = GameConnector.getSaveData();
      if (saveData) {
        console.log('[Portal] Loaded save data:', saveData);
        stats = Object.assign(stats, saveData);
      }
    }
  }

  // Save stats to portal
  function saveStats() {
    if (window.GameConnector && GameConnector.isInPortal()) {
      GameConnector.saveProgress(stats);
    }
  }

  // Check and unlock achievements
  function checkAchievements(isWin, gameTime) {
    if (!window.GameConnector || !GameConnector.isInPortal()) return;

    if (isWin) {
      // First win
      if (stats.gamesWon === 1) {
        GameConnector.unlockAchievement(ACHIEVEMENTS.FIRST_WIN);
      }

      // Fast win (under 5 minutes = 300 seconds)
      if (gameTime && gameTime < 300) {
        GameConnector.unlockAchievement(ACHIEVEMENTS.FAST_WIN);
      }

      // Won without hints
      if (!stats.hintsUsed) {
        GameConnector.unlockAchievement(ACHIEVEMENTS.NO_HINTS);
      }

      // Won without undo
      if (!stats.undoUsed) {
        GameConnector.unlockAchievement(ACHIEVEMENTS.NO_UNDO);
      }

      // 5 games won
      if (stats.gamesWon >= 5) {
        GameConnector.unlockAchievement(ACHIEVEMENTS.FIVE_WINS);
      }

      // 10 games won
      if (stats.gamesWon >= 10) {
        GameConnector.unlockAchievement(ACHIEVEMENTS.TEN_WINS);
      }
    }
  }

  // Parse timer display to seconds
  function parseTimer() {
    var timerText = document.getElementById('timer');
    if (timerText) {
      var parts = timerText.textContent.split(':');
      if (parts.length === 2) {
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      }
    }
    return null;
  }

  // Hook into game events
  function setupHooks() {
    // Wait for jQuery to be available
    if (typeof $ === 'undefined') {
      setTimeout(setupHooks, 100);
      return;
    }

    console.log('[Portal] Setting up game hooks...');

    // Hook: Winning message shown
    var originalWinShow = $.fn.show;
    $(document).on('DOMSubtreeModified', '#winningMessage', function() {
      if ($(this).is(':visible')) {
        console.log('[Portal] Game won!');
        stats.gamesPlayed++;
        stats.gamesWon++;
        stats.totalPoints += (window.matchingGame ? matchingGame.points : 0);

        var gameTime = parseTimer();
        if (gameTime && (!stats.bestTime || gameTime < stats.bestTime)) {
          stats.bestTime = gameTime;
        }

        checkAchievements(true, gameTime);
        saveStats();

        // Reset for next game
        stats.hintsUsed = false;
        stats.undoUsed = false;
      }
    });

    // Hook: Lose message shown
    $(document).on('DOMSubtreeModified', '#loseMessage', function() {
      if ($(this).is(':visible')) {
        console.log('[Portal] Game lost!');
        stats.gamesPlayed++;
        stats.gamesLost++;
        stats.totalPoints += (window.matchingGame ? matchingGame.points : 0);

        saveStats();

        // Reset for next game
        stats.hintsUsed = false;
        stats.undoUsed = false;
      }
    });

    // Hook: Hint button clicked
    $('#activateHints').on('click', function() {
      stats.hintsUsed = true;
      console.log('[Portal] Hint used');
    });

    // Hook: Undo button clicked
    $('#undoButton').on('click', function() {
      stats.undoUsed = true;
      console.log('[Portal] Undo used');
    });

    console.log('[Portal] Hooks set up successfully');
  }

  // Initialize when ready
  function init() {
    if (window.GameConnector) {
      GameConnector.onReady(function(payload) {
        console.log('[Portal] Connected to portal:', payload);
        loadStats();
        setupHooks();
      });
    } else {
      // Not in portal, but still set up hooks for local play
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupHooks);
      } else {
        setupHooks();
      }
    }
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
