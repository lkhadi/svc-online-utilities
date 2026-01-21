import Phaser from 'phaser';
import PreloadScene from './components/PreloadScene';
import MainGameScene from './components/MainGameScene';
import GameOverScene from './components/GameOverScene';
import LevelCompleteScene from './components/LevelCompleteScene';
import PauseMenuScene from './components/PauseMenuScene';
import StartScene from './components/StartScene';

export default {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  width: 1600,
  height: 1200,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [
    StartScene,
    PreloadScene,
    MainGameScene,
    GameOverScene,
    LevelCompleteScene,
    PauseMenuScene
  ],
  pixelArt: true,
  transparent: false
};
