# Game Assets Guide

This guide helps you create the necessary assets for the Zuma game.

## Ball Textures

Create simple circular ball textures using any image editor. Recommended sizes: 50x50 pixels or larger.

### Colors to Create
- Red ball
- Green ball
- Blue ball
- Yellow ball
- Purple ball
- Orange ball

### Creating with CSS/HTML

You can generate simple colored balls for testing:

```html
<!DOCTYPE html>
<html>
<body>
  <canvas id="canvas" width="50" height="50"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(25, 25, 24, 0, 2 * Math.PI);
    ctx.fill();
    const data = canvas.toDataURL();
    console.log(data);
  </script>
</body>
</html>
```

Run this in a browser and save the resulting base64 image as PNG files.

## Background

Create a scenic background image. Recommended size: 1600x1200 pixels. Could use:
- Fantasy landscape
- Temple entrance
- Ancient ruins

## Shooter/Cannon

Create a cannon or turret sprite. It should:
- Point upward when idle
- Rotate smoothly when aiming
- Have a visual indicator for the next ball

## Path

Create the path that the balls will follow. It can be:
- An image of a winding path
- A vector illustration
- A simple line drawing

## Obstacles

Create decorative obstacles that the balls might collide with. Examples:
- Rocks
- Trees
- Temples
- Statues

## Sound Effects

### Shoot Sound
- Short, snappy sound
- Time: 0.1-0.3 seconds
- Recommended: Laser or cannon sound

### Pop Sound
- Satisfying popping sound
- Time: 0.1-0.2 seconds
- Recommended: Bubble pop or marble pop

### Game Over Sound
- Dramatic or melancholic
- Time: 1-2 seconds
- Recommended: Chime or bell sound

## UI Elements

### Screens
- Start screen with title and play button
- Game over screen with final score
- Level complete screen with next level button
- Pause menu with resume and quit options

### Buttons
- Play button (green)
- Quit button (red)
- Resume button (green)
- Next Level button (green)

### Icons
- Life indicators (hearts)
- Score display
- Timer display
- Level display

## Asset Creation Tips

1. **Consistent Style**: Keep all assets consistent in style and size
2. **Optimized**: Keep file sizes reasonable for quick loading
3. **Simple Shapes**: Simple shapes work best for games
4. **Transparency**: Use PNG with transparency for ball textures
5. **Testing**: Test assets at different scales and colors

## Generating Placeholder Assets

You can use online tools to generate simple game assets:
- Flaticon for icons
- Freepik for game elements
- Canva for UI elements

## Testing Without Assets

The game will work with colored circles if you don't have assets:
- Ball colors: red, green, blue, yellow, purple, orange
- No background
- No shooter graphic
- No sound effects

The game will still be fully functional but less visually appealing.
