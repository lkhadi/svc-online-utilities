# Zuma Game Project

This is a complete Zuma-like puzzle game built with Phaser 3 and integrated with a Nuxt 3 application.

## Project Structure

```
zuma-game/
├── app/
│   ├── components/
│   │   ├── PreloadScene.ts       # Phaser scene for loading assets
│   │   ├── MainGameScene.ts      # Main gameplay scene
│   │   ├── GameOverScene.ts      # Game over screen
│   │   ├── LevelCompleteScene.ts # Level completion screen
│   │   ├── PauseMenuScene.ts     # Pause menu
│   │   ├── StartScene.ts         # Game start screen
│   │   ├── ZumaGame.vue          # Vue component for the game
│   │   └── index.vue             # Game page
│   └── classes/
│       ├── Ball.ts               # Ball class with physics
│       ├── BallChain.ts          # Ball chain management
│       ├── Shooter.ts            # Shooter/cannon mechanics
│       ├── PathSystem.ts         # Path following system
│       ├── InputHandler.ts       # Input handling
│       ├── LevelManager.ts       # Level progression
│       ├── ComboSystem.ts        # Combo detection
│       └── AudioManager.ts      # Audio management
├── assets/                         # Game assets (need to be created)
├── phaser-config.ts              # Phaser configuration
├── package.json                  # Dependencies
├── vite.config.ts                # Vite configuration
└── README.md                     # This file
```

## Features

### Core Game Mechanics
- **Ball Chain System**: Balls follow a defined path with proper spacing
- **Shooter Mechanism**: Cannon aims at mouse/touch position
- **Ball Launching**: Proper direction calculation and velocity
- **Collision Detection**: Ball-to-ball and ball-to-obstacle collisions
- **Combo Detection**: Detect 3+ matching balls in sequence
- **Chain Reactions**: Automatic ball merging and removal

### Input Handling
- **Mouse**: Click to shoot
- **Touch**: Tap to shoot
- **Keyboard**: Arrow keys + Space to shoot

### Game Logic
- Ball spawning from start
- Level progression system
- Difficulty progression (increases ball speed)
- Win/lose conditions
- Timer system

## Installation

1. Navigate to the project directory:
```bash
cd /Users/lkhadi/docker/htdocs/webutility/zuma-game
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

## Assets

Create the following directory structure and place your game assets:

```
assets/
├── balls/
│   ├── red-ball.png
│   ├── green-ball.png
│   ├── blue-ball.png
│   ├── yellow-ball.png
│   ├── purple-ball.png
│   └── orange-ball.png
├── backgrounds/
│   └── game-bg.png
├── shooter/
│   └── cannon.png
├── paths/
│   └── level-path.png
├── obstacles/
│   └── obstacle.png
├── sounds/
│   ├── shoot.mp3
│   ├── pop.mp3
│   └── gameover.mp3
├── ui/
│   ├── start-screen.png
│   ├── game-over-screen.png
│   ├── level-complete-screen.png
│   ├── pause-button.png
│   └── play-button.png
```

## Game Controls

### Mouse
- Move mouse to aim
- Click to shoot

### Touch
- Touch and drag to aim
- Tap to shoot

### Keyboard
- Arrow keys: Aim left/right/up/down
- Space bar: Shoot
- Esc: Pause game

## Game Rules

1. **Match 3**: Match three or more balls of the same color to pop them and earn points.
2. **Protect the End**: Prevent balls from reaching the end of the path or you lose a life.
3. **Time Limit**: You have 5 minutes per level. Manage your time wisely!
4. **Combos**: Chain matches together for bonus points!

## Technical Details

### Phaser 3
- Game engine: Phaser 3.60.0
- Physics: Arcade physics system
- Scene management: Preload, Start, Main Game, Game Over, Level Complete, Pause

### Nuxt 3 Integration
- Vue 3 component integration
- Dynamic import of Phaser
- Responsive game container

### Performance Optimizations
- Object pooling for balls
- Optimized collision detection
- Delta time for smooth updates
- Efficient memory cleanup

## Development

### Adding New Levels
Edit the `PathSystem` class to define new path configurations.

### Customizing Difficulty
Modify the `LevelManager` class to adjust ball speed and spawning rates.

### Adding New Colors
Add new ball textures in the `assets/balls/` directory and update the color list in the game classes.

## License

This is a free, non-commercial game project. Use freely for educational purposes.

## Support

For issues or questions, please refer to the main project documentation or create an issue in the project repository.
