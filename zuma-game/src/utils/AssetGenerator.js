class AssetGenerator {
  constructor(scene) {
    this.scene = scene;
    this.textureManager = scene.make.textures();
  }

  generateBallTexture(color, size = 30) {
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d');

    const x = size;
    const y = size;
    const radius = size - 2;

    // Main circle
    const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
    gradient.addColorStop(0, this.lightenColor(color, 50));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, this.darkenColor(color, 30));

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.arc(x - radius/3, y - radius/3, radius/4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();

    // Border
    ctx.strokeStyle = this.darkenColor(color, 20);
    ctx.lineWidth = 2;
    ctx.stroke();

    this.scene.textures.addCanvas('ball_' + color, canvas);

    return 'ball_' + color;
  }

  generateShooterTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');

    const centerX = 60;
    const centerY = 60;

    // Cannon base
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#444';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#666';
    ctx.fill();

    // Cannon barrel
    ctx.beginPath();
    ctx.rect(centerX - 5, centerY - 80, 10, 80);
    const barrelGradient = ctx.createLinearGradient(centerX - 5, centerY - 80, centerX + 5, centerY - 80);
    barrelGradient.addColorStop(0, '#555');
    barrelGradient.addColorStop(1, '#333');
    ctx.fillStyle = barrelGradient;
    ctx.fill();

    // Barrel details
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Wheels
    ctx.beginPath();
    ctx.arc(centerX - 20, centerY + 35, 10, 0, Math.PI * 2);
    ctx.arc(centerX + 20, centerY + 35, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#555';
    ctx.fill();
    ctx.strokeStyle = '#777';
    ctx.stroke();

    // Center point
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();

    this.scene.textures.addCanvas('shooter', canvas);

    return 'shooter';
  }

  generatePathTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Main path
    ctx.beginPath();
    ctx.moveTo(100, 500);
    ctx.bezierCurveTo(100, 300, 300, 200, 400, 200);
    ctx.bezierCurveTo(500, 200, 700, 300, 700, 500);
    ctx.lineTo(700, 550);
    ctx.bezierCurveTo(700, 580, 680, 600, 650, 600);
    ctx.lineTo(150, 600);
    ctx.bezierCurveTo(120, 600, 100, 580, 100, 550);
    ctx.closePath();

    // Path background
    const pathGradient = ctx.createLinearGradient(0, 0, 0, 600);
    pathGradient.addColorStop(0, '#2d3436');
    pathGradient.addColorStop(1, '#636e72');
    ctx.fillStyle = pathGradient;
    ctx.fill();

    // Path border
    ctx.strokeStyle = '#74b9ff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Path glow
    ctx.strokeStyle = 'rgba(116, 185, 255, 0.3)';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Decorative elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(
        100 + (600 * i / 20),
        500 + Math.random() * 100,
        Math.random() * 5 + 2,
        0, Math.PI * 2
      );
      ctx.fill();
    }

    this.scene.textures.addCanvas('gamePath', canvas);

    return 'gamePath';
  }

  generateBackgroundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Deep space gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 800);
    bgGradient.addColorStop(0, '#0f0c29');
    bgGradient.addColorStop(0.5, '#302b63');
    bgGradient.addColorStop(1, '#24243e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 800);

    // Stars
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * 1200;
      const y = Math.random() * 800;
      const size = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.8 + 0.2;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }

    // Floating particles
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 1200;
      const y = Math.random() * 800;
      const radius = Math.random() * 40 + 20;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
      gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant mountains
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, 600);
    for (let i = 0; i <= 1200; i += 50) {
      ctx.lineTo(i, 500 - Math.sin(i * 0.01) * 50);
    }
    ctx.lineTo(1200, 600);
    ctx.fill();

    this.scene.textures.addCanvas('spaceBackground', canvas);

    return 'spaceBackground';
  }

  generateExplosionTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    const centerX = 50;
    const centerY = 50;

    // Particles
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const distance = Math.random() * 30 + 20;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const size = Math.random() * 6 + 2;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    this.scene.textures.addCanvas('explosion', canvas);

    return 'explosion';
  }

  generateComboTextTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 300, 100);

    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd700';
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 4;
    ctx.strokeText('COMBO!', 150, 50);
    ctx.fillText('COMBO!', 150, 50);

    this.scene.textures.addCanvas('comboText', canvas);

    return 'comboText';
  }

  generateScorePopupTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(0, 0, 150, 50, 10);
    ctx.fill();

    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#00ff00';
    ctx.fillText('+100', 75, 25);

    this.scene.textures.addCanvas('scorePopup', canvas);

    return 'scorePopup';
  }

  generatePauseIcon() {
    const canvas = document.createElement('canvas');
    canvas.width = 60;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(15, 5, 10, 50, 5);
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(35, 5, 10, 50, 5);
    ctx.fill();

    this.scene.textures.addCanvas('pauseIcon', canvas);

    return 'pauseIcon';
  }

  generateSoundwaveTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(50, 50, 15 + i * 8, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(102, 126, 234, ${1 - i * 0.15})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    this.scene.textures.addCanvas('soundwave', canvas);

    return 'soundwave';
  }

  generateTargetZoneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    // Concentric circles
    const colors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#34495e'];

    for (let i = 0; i < 6; i++) {
      const radius = 90 - i * 15;
      ctx.beginPath();
      ctx.arc(100, 100, radius, 0, Math.PI * 2);
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    this.scene.textures.addCanvas('targetZone', canvas);

    return 'targetZone';
  }

  // Utility function to adjust color brightness
  lightenColor(color, amount) {
    return this.adjustColor(color, amount);
  }

  darkenColor(color, amount) {
    return this.adjustColor(color, -amount);
  }

  adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export default AssetGenerator;
