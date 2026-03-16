import type { GameSnapshot } from '../types/game';
import { GAME_CONFIG } from '../constants/config';

export function setupCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const nextW = Math.floor(vw * dpr);
  const nextH = Math.floor(vh * dpr);
  if (canvas.width !== nextW || canvas.height !== nextH) {
    canvas.width = nextW;
    canvas.height = nextH;
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }
}

function drawRotatedImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, angle: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawCenteredImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number): void {
  ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
}

function drawFlippedImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, flipX: boolean): void {
  ctx.save();
  ctx.translate(x, y);
  if (flipX) ctx.scale(-1, 1);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + radius * 0.7, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function isImageReady(img?: HTMLImageElement): img is HTMLImageElement {
  return !!img && img.complete && img.naturalWidth > 0;
}

// Pickup rendering config
const PICKUP_SPRITE_MAP: Record<string, { imgKey: string; fallbackEmoji: string; color: string; glowColor: string }> = {
  heart:          { imgKey: 'pickup_heart',        fallbackEmoji: '❤️',  color: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.5)' },
  weapon_shotgun: { imgKey: 'pickup_bomb',         fallbackEmoji: '💣',  color: '#f97316', glowColor: 'rgba(249, 115, 22, 0.5)' },
  weapon_rapid:   { imgKey: 'pickup_acceleration', fallbackEmoji: '⚡',  color: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.5)' },
  powerup_double: { imgKey: 'pickup_pearl',        fallbackEmoji: '✨',  color: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.5)' },
  shield:         { imgKey: 'pickup_shield',       fallbackEmoji: '🛡️',  color: '#22d3ee', glowColor: 'rgba(34, 211, 238, 0.5)' },
  speed_boost:    { imgKey: 'pickup_acceleration', fallbackEmoji: '🏃',  color: '#22c55e', glowColor: 'rgba(34, 197, 94, 0.5)' },
  coin:           { imgKey: 'pickup_coin',         fallbackEmoji: '🪙',  color: '#fbbf24', glowColor: 'rgba(251, 191, 36, 0.5)' },
  energy_pack:    { imgKey: 'energy_10',           fallbackEmoji: '⚡',  color: '#22d3ee', glowColor: 'rgba(34, 211, 238, 0.5)' },
  dimsum:         { imgKey: 'pickup_dimsum',       fallbackEmoji: '🥟',  color: '#fbbf24', glowColor: 'rgba(251, 191, 36, 0.6)' },
};

// Boss animation frame keys
const BOSS_ANIM_MAP: Record<string, { idle: string[]; attack: string[]; hurt: string; walk: string[] }> = {
  boss_viking: {
    idle: ['boss_viking_idle', 'boss_viking_idle_1', 'boss_viking_idle_2'],
    attack: ['boss_viking_attack', 'boss_viking_attack_1', 'boss_viking_attack_2'],
    hurt: 'boss_viking_hurt',
    walk: ['boss_viking_walk', 'boss_viking_walk_1', 'boss_viking_run'],
  },
  boss_goblin: {
    idle: ['boss_goblin_idle', 'boss_goblin_idle_1', 'boss_goblin_idle_2'],
    attack: ['boss_goblin_attack', 'boss_goblin_attack_1', 'boss_goblin_attack_2'],
    hurt: 'boss_goblin_hurt',
    walk: ['boss_goblin_walk', 'boss_goblin_run'],
  },
  boss_caveman: {
    idle: ['boss_caveman_idle', 'boss_caveman_idle_1', 'boss_caveman_idle_2'],
    attack: ['boss_caveman_attack', 'boss_caveman_attack_1', 'boss_caveman_attack_2'],
    hurt: 'boss_caveman_hurt',
    walk: ['boss_caveman_walk', 'boss_caveman_run'],
  },
};

// Animated bullet sprite maps
const BULLET_SPRITE_MAP: Record<string, string[]> = {
  fire: ['fire_ball_1', 'fire_ball_2', 'fire_ball_3', 'fire_ball_4', 'fire_ball_5', 'fire_ball_6', 'fire_ball_7', 'fire_ball_8'],
  water: ['water_ball_1', 'water_ball_2', 'water_ball_3', 'water_ball_4', 'water_ball_5', 'water_ball_6'],
  fire_arrow: ['fire_arrow_1', 'fire_arrow_2', 'fire_arrow_3', 'fire_arrow_4'],
  water_arrow: ['water_arrow_1', 'water_arrow_2', 'water_arrow_3', 'water_arrow_4'],
  fire_spell: ['fire_spell_1', 'fire_spell_4'],
  water_spell: ['water_spell_1', 'water_spell_4'],
  boss_fire: ['fire_ball_4', 'fire_ball_5', 'fire_ball_6', 'fire_ball_7'],
};

export function renderFrame(ctx: CanvasRenderingContext2D, state: GameSnapshot, time: number, vw: number, vh: number): void {
  ctx.clearRect(0, 0, vw, vh);
  if (state.state !== 'playing') return;

  const cam = state.camera;
  const shakeX = state.shake.offsetX || 0;
  const shakeY = state.shake.offsetY || 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // ── Background ─────────────────────────────────────────────────────
  const bg = state.images.arena_background;
  if (bg?.complete) {
    const tileW = bg.width;
    const tileH = bg.height;
    const startX = Math.floor(cam.x / tileW) * tileW;
    const startY = Math.floor(cam.y / tileH) * tileH;
    for (let tx = startX; tx < cam.x + vw; tx += tileW) {
      for (let ty = startY; ty < cam.y + vh; ty += tileH) {
        ctx.drawImage(bg, tx - cam.x, ty - cam.y, tileW, tileH);
      }
    }
  } else {
    const bgGrad = ctx.createRadialGradient(vw / 2, vh / 2, 0, vw / 2, vh / 2, Math.max(vw, vh));
    bgGrad.addColorStop(0, '#1a1a2e');
    bgGrad.addColorStop(0.5, '#16213e');
    bgGrad.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, vw, vh);
  }

  // ── Grid ───────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(100, 120, 200, 0.06)';
  ctx.lineWidth = 1;
  const gridSize = 200;
  const gridStartX = Math.floor(cam.x / gridSize) * gridSize;
  const gridStartY = Math.floor(cam.y / gridSize) * gridSize;
  for (let gx = gridStartX; gx < cam.x + vw; gx += gridSize) {
    ctx.beginPath(); ctx.moveTo(gx - cam.x, 0); ctx.lineTo(gx - cam.x, vh); ctx.stroke();
  }
  for (let gy = gridStartY; gy < cam.y + vh; gy += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, gy - cam.y); ctx.lineTo(vw, gy - cam.y); ctx.stroke();
  }

  // ── Map decorations ────────────────────────────────────────────────
  renderMapDecorations(ctx, state, cam.x, cam.y, vw, vh, time);

  // ── Map boundary ───────────────────────────────────────────────────
  ctx.save();
  ctx.shadowColor = 'rgba(255, 50, 50, 0.6)';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = 'rgba(255, 50, 50, 0.5)';
  ctx.lineWidth = 3;
  ctx.strokeRect(-cam.x, -cam.y, GAME_CONFIG.mapWidth, GAME_CONFIG.mapHeight);
  ctx.restore();

  // ── Obstacles ──────────────────────────────────────────────────────
  state.obstacles.forEach((obs) => {
    const sx = obs.x - cam.x;
    const sy = obs.y - cam.y;
    if (sx < -60 || sx > vw + 60 || sy < -60 || sy > vh + 60) return;

    const obsImg = state.images[obs.spriteKey];
    if (isImageReady(obsImg)) {
      ctx.save();
      const size = obs.radius * 2.2;

      // Bomb glow effect
      if (obs.type === 'bomb') {
        ctx.shadowColor = 'rgba(255, 68, 68, 0.5)';
        ctx.shadowBlur = 10 + Math.sin(time / 200) * 5;
      }

      drawCenteredImage(ctx, obsImg, sx, sy, size, size);
      ctx.restore();
    } else {
      // Fallback circles
      ctx.save();
      const colors: Record<string, string> = { bomb: '#ff4444', barrel: '#8b6f47', stone: '#6b7280', net: '#4b5563', seaweed: '#22c55e' };
      ctx.fillStyle = colors[obs.type] || '#666';
      ctx.beginPath();
      ctx.arc(sx, sy, obs.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });

  // ── Turrets ────────────────────────────────────────────────────────
  state.turrets.forEach((t) => {
    const sx = t.x - cam.x;
    const sy = t.y - cam.y;
    if (sx < -80 || sx > vw + 80 || sy < -80 || sy > vh + 80) return;
    drawShadow(ctx, sx, sy, t.radius);
    ctx.save();
    ctx.translate(sx, sy);
    const pulse = 0.8 + Math.sin(time / 300) * 0.2;
    ctx.strokeStyle = `rgba(255, 50, 50, ${0.05 * pulse})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, t.range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    const baseGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, t.radius + 6);
    baseGrad.addColorStop(0, 'rgba(80, 40, 20, 0.6)');
    baseGrad.addColorStop(1, 'rgba(40, 20, 10, 0.3)');
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.arc(0, 0, t.radius + 6, 0, Math.PI * 2);
    ctx.fill();
    const bodyGrad = ctx.createRadialGradient(-4, -4, t.radius * 0.2, 0, 0, t.radius);
    bodyGrad.addColorStop(0, '#ff8c42');
    bodyGrad.addColorStop(0.5, '#c9500a');
    bodyGrad.addColorStop(1, '#6b1a04');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 10;
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, t.radius * 0.35);
    coreGrad.addColorStop(0, '#ffaa44');
    coreGrad.addColorStop(1, '#ff4444');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, t.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const barrelAngle = Math.atan2(state.player.y - t.y, state.player.x - t.x);
    ctx.save();
    ctx.rotate(barrelAngle);
    ctx.fillStyle = '#1a0a04';
    ctx.fillRect(t.radius * 0.2, -4, t.radius * 1.2, 8);
    const barrelGrad = ctx.createLinearGradient(0, -3, 0, 3);
    barrelGrad.addColorStop(0, '#888');
    barrelGrad.addColorStop(0.5, '#555');
    barrelGrad.addColorStop(1, '#333');
    ctx.fillStyle = barrelGrad;
    ctx.fillRect(t.radius * 0.2, -3, t.radius * 1.1, 6);
    ctx.fillStyle = '#ffaa44';
    ctx.fillRect(t.radius * 1.2, -2, 4, 4);
    ctx.restore();
    ctx.restore();
    const ratio = Math.max(0, t.health / t.maxHealth);
    const barW = t.radius * 2.4;
    const barH = 5;
    const barX = sx - barW / 2;
    const barY = sy - t.radius - 16;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    if (ratio > 0) {
      const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW * ratio, 0);
      if (ratio > 0.5) { hpGrad.addColorStop(0, '#22c55e'); hpGrad.addColorStop(1, '#16a34a'); }
      else if (ratio > 0.25) { hpGrad.addColorStop(0, '#eab308'); hpGrad.addColorStop(1, '#ca8a04'); }
      else { hpGrad.addColorStop(0, '#ef4444'); hpGrad.addColorStop(1, '#dc2626'); }
      ctx.fillStyle = hpGrad;
      ctx.fillRect(barX, barY, barW * ratio, barH);
    }
  });

  // ── Pickups ────────────────────────────────────────────────────────
  state.pickups.forEach((p) => {
    const sx = p.x - cam.x;
    const sy = p.y - cam.y;
    if (sx < -40 || sx > vw + 40 || sy < -40 || sy > vh + 40) return;

    // Mystery box (chest) rendering
    if (p.type === 'mystery_box') {
      const floatPhase = p.floatOffset ?? 0;
      const floatY = sy + Math.sin(time / 400 + floatPhase) * 4;

      // Chest glow
      ctx.save();
      ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
      ctx.shadowBlur = 15 + Math.sin(time / 200) * 5;
      ctx.globalAlpha = 0.5 + Math.sin(time / 200) * 0.2;
      ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.beginPath();
      ctx.arc(sx, floatY, p.radius + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Determine chest image
      const chestKey = p.chestState === 'open' ? 'chest_open' : p.chestState === 'ajar' ? 'chest_ajar' : 'chest_closed';
      const chestImg = state.images[chestKey];
      const chestSize = p.radius * 2.6;

      if (isImageReady(chestImg)) {
        ctx.save();
        ctx.globalAlpha = 0.95;
        drawCenteredImage(ctx, chestImg, sx, floatY, chestSize, chestSize);
        ctx.restore();
      } else {
        // Fallback chest
        ctx.save();
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(sx - 15, floatY - 12, 30, 24);
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(sx - 4, floatY - 4, 8, 8);
        ctx.restore();
      }

      // Label
      ctx.save();
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 3;
      ctx.fillText(p.chestState === 'open' ? '✨ OPEN!' : '🎁 Mystery', sx, floatY - p.radius - 8);
      ctx.restore();
      return;
    }

    // Energy pack rendering with dynamic sprite
    if (p.type === 'energy_pack') {
      const floatPhase = p.floatOffset ?? 0;
      const floatY = sy + Math.sin(time / 400 + floatPhase) * 5;
      const bobScale = 1 + Math.sin(time / 300 + floatPhase) * 0.08;

      // Energy glow
      ctx.save();
      ctx.shadowColor = 'rgba(34, 211, 238, 0.6)';
      ctx.shadowBlur = 12 + Math.sin(time / 200) * 5;
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = 'rgba(34, 211, 238, 0.3)';
      ctx.beginPath();
      ctx.arc(sx, floatY, p.radius + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const energyKey = `energy_${p.energyVariant ?? 10}`;
      const energyImg = state.images[energyKey];
      if (isImageReady(energyImg)) {
        ctx.save();
        ctx.globalAlpha = 0.95;
        const imgSize = p.radius * 2.6 * bobScale;
        drawCenteredImage(ctx, energyImg, sx, floatY, imgSize, imgSize);
        ctx.restore();
      } else {
        ctx.save();
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(sx, floatY, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText('⚡', sx, floatY);
        ctx.restore();
      }
      return;
    }

    // Standard pickups
    const config = PICKUP_SPRITE_MAP[p.type] || { imgKey: '', fallbackEmoji: '?', color: '#fff', glowColor: 'rgba(255,255,255,0.5)' };
    const floatPhase = p.floatOffset ?? 0;
    const floatY = sy + Math.sin(time / 400 + floatPhase) * 5;
    const bobScale = 1 + Math.sin(time / 300 + floatPhase) * 0.05;

    ctx.save();
    ctx.shadowColor = config.glowColor;
    ctx.shadowBlur = 15 + Math.sin(time / 200) * 5;
    ctx.globalAlpha = 0.4 + Math.sin(time / 200) * 0.2;
    ctx.fillStyle = config.glowColor;
    ctx.beginPath();
    ctx.arc(sx, floatY, p.radius + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const spriteImg = state.images[config.imgKey];
    if (isImageReady(spriteImg)) {
      ctx.save();
      ctx.globalAlpha = 0.95;
      const imgSize = p.radius * 2.4 * bobScale;
      drawCenteredImage(ctx, spriteImg, sx, floatY, imgSize, imgSize);
      ctx.restore();
    } else {
      ctx.save();
      ctx.globalAlpha = 0.9;
      const pickGrad = ctx.createRadialGradient(sx - 2, floatY - 2, 2, sx, floatY, p.radius);
      pickGrad.addColorStop(0, '#ffffff');
      pickGrad.addColorStop(0.4, config.color);
      pickGrad.addColorStop(1, config.color);
      ctx.fillStyle = pickGrad;
      ctx.beginPath();
      ctx.arc(sx, floatY, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.fillText(config.fallbackEmoji, sx, floatY);
      ctx.restore();
    }
  });

  // ── Minions ────────────────────────────────────────────────────────
  state.minions.forEach((m) => {
    const sx = m.x - cam.x;
    const sy = m.y - cam.y;
    const cullMargin = m.type.startsWith('boss_') ? 120 : 60;
    if (sx < -cullMargin || sx > vw + cullMargin || sy < -cullMargin || sy > vh + cullMargin) return;

    drawShadow(ctx, sx, sy, m.radius);

    if (m.type.startsWith('boss_')) {
      renderBoss(ctx, state, m, sx, sy, time);
      return;
    }

    if (m.type === 'elite') {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(m.angle);
      const eliteImg = state.images['goblin_bay_local'];
      if (isImageReady(eliteImg)) {
        ctx.drawImage(eliteImg, -45, -45, 90, 90);
      } else {
        const eliteGrad = ctx.createRadialGradient(-5, -5, 5, 0, 0, m.radius);
        eliteGrad.addColorStop(0, '#dc2626');
        eliteGrad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = eliteGrad;
        ctx.beginPath();
        ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(-8, -5, 3, 0, Math.PI * 2);
        ctx.arc(8, -5, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      const ratio = Math.max(0, m.health / m.maxHealth);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(sx - 30, sy - 56, 60, 6);
      const eliteHpGrad = ctx.createLinearGradient(sx - 30, 0, sx + 30, 0);
      eliteHpGrad.addColorStop(0, '#f43f5e');
      eliteHpGrad.addColorStop(1, '#e11d48');
      ctx.fillStyle = eliteHpGrad;
      ctx.fillRect(sx - 30, sy - 56, 60 * ratio, 6);
    } else if (isImageReady(state.images.goblin_minion)) {
      drawRotatedImage(ctx, state.images.goblin_minion, sx, sy, 50, 50, m.angle);
    } else {
      const minionGrad = ctx.createRadialGradient(sx - 3, sy - 3, 3, sx, sy, m.radius);
      minionGrad.addColorStop(0, '#4ade80');
      minionGrad.addColorStop(1, '#166534');
      ctx.fillStyle = minionGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, m.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // ── Player ─────────────────────────────────────────────────────────
  const px = state.player.x - cam.x;
  const py = state.player.y - cam.y;
  drawShadow(ctx, px, py, state.player.radius);

  if (state.shieldActive) {
    ctx.save();
    const shieldPulse = 0.3 + Math.sin(time / 200) * 0.15;
    ctx.globalAlpha = shieldPulse;

    // Water spell effect for shield
    const waterShieldImg = state.images['water_spell_1'];
    if (isImageReady(waterShieldImg)) {
      ctx.globalCompositeOperation = 'lighter';
      const shieldSize = (state.player.radius + 20) * 2;
      drawRotatedImage(ctx, waterShieldImg, px, py, shieldSize, shieldSize, time / 500);
    } else {
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(px, py, state.player.radius + 12, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (state.speedMultiplier > 1) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#22c55e';
    for (let tr = 1; tr <= 3; tr++) {
      const trailX = px - Math.cos(state.player.angle) * tr * 12;
      const trailY = py - Math.sin(state.player.angle) * tr * 12;
      ctx.globalAlpha = 0.2 / tr;
      ctx.beginPath();
      ctx.arc(trailX, trailY, state.player.radius * (1 - tr * 0.15), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (time - state.lastDamage < 200 && Math.floor(time / 50) % 2 === 0) ctx.globalAlpha = 0.5;

  if (isImageReady(state.images.trooper_character)) {
    // Player rotates 360° to face the aim/bullet direction
    drawRotatedImage(ctx, state.images.trooper_character, px, py, 70, 70, state.player.angle);
  } else {
    const playerGrad = ctx.createRadialGradient(px - 5, py - 5, 5, px, py, state.player.radius);
    playerGrad.addColorStop(0, '#60a5fa');
    playerGrad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = playerGrad;
    ctx.beginPath();
    ctx.arc(px, py, state.player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Player health bar
  const hpPct = Math.max(0, state.health / GAME_CONFIG.playerMaxHealth);
  const hpBarW = 60;
  const hpBarH = 7;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(px - hpBarW / 2 - 1, py + 40 - 1, hpBarW + 2, hpBarH + 2);
  if (hpPct > 0) {
    const hpGrad = ctx.createLinearGradient(px - hpBarW / 2, 0, px + hpBarW / 2, 0);
    if (hpPct > 0.5) { hpGrad.addColorStop(0, '#22c55e'); hpGrad.addColorStop(1, '#16a34a'); }
    else if (hpPct > 0.25) { hpGrad.addColorStop(0, '#eab308'); hpGrad.addColorStop(1, '#ca8a04'); }
    else { hpGrad.addColorStop(0, '#ef4444'); hpGrad.addColorStop(1, '#dc2626'); }
    ctx.fillStyle = hpGrad;
    ctx.fillRect(px - hpBarW / 2, py + 40, hpBarW * hpPct, hpBarH);
  }

  // ── Bullets (animated sprite effects) ──────────────────────────────
  state.bullets.forEach((b) => {
    const bx = b.x - cam.x;
    const by = b.y - cam.y;
    if (bx < -20 || bx > vw + 20 || by < -20 || by > vh + 20) return;
    const bulletAngle = Math.atan2(b.vy, b.vx);

    // Sprite-based bullet rendering
    if (b.visualType && BULLET_SPRITE_MAP[b.visualType]) {
      const frames = BULLET_SPRITE_MAP[b.visualType];
      const frameIdx = (b.animFrame ?? 0) % frames.length;
      const spriteImg = state.images[frames[frameIdx]];

      if (isImageReady(spriteImg)) {
        ctx.save();
        ctx.globalAlpha = 0.9;
        const fSize = b.fromBoss ? 36 : b.fromTurret ? 28 : 24;
        drawRotatedImage(ctx, spriteImg, bx, by, fSize, fSize, bulletAngle);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.25;
        drawRotatedImage(ctx, spriteImg, bx, by, fSize * 1.4, fSize * 1.4, bulletAngle);
        ctx.restore();
        return;
      }
    }

    // Default bullet rendering
    ctx.save();
    if (b.fromTurret || b.fromBoss) {
      ctx.shadowColor = b.fromBoss ? '#a855f7' : '#ff4444';
      ctx.shadowBlur = 12;
      const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, b.radius + 2);
      bGrad.addColorStop(0, '#ffffff');
      bGrad.addColorStop(0.3, b.fromBoss ? '#c084fc' : '#ff6666');
      bGrad.addColorStop(1, b.fromBoss ? '#7c3aed' : '#ff0000');
      ctx.fillStyle = bGrad;
    } else {
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 10;
      const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, b.radius + 2);
      bGrad.addColorStop(0, '#ffffff');
      bGrad.addColorStop(0.3, '#ffffaa');
      bGrad.addColorStop(1, '#ffcc00');
      ctx.fillStyle = bGrad;
    }
    ctx.beginPath();
    ctx.arc(bx, by, b.radius + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // ── Particles ──────────────────────────────────────────────────────
  state.particles.forEach((p) => {
    const ppx = p.x - cam.x;
    const ppy = p.y - cam.y;
    if (ppx < -60 || ppx > vw + 60 || ppy < -60 || ppy > vh + 60) return;
    const size = p.size ?? 3;
    if (size <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));

    // Score bubble particles
    if (p.isScoreBubble && p.text) {
      const bubbleImg = state.images['bubble_2'];
      if (isImageReady(bubbleImg)) {
        drawCenteredImage(ctx, bubbleImg, ppx, ppy, size, size);
      } else {
        ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(ppx, ppy, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.font = `bold ${p.fontSize ?? 12}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 3;
      ctx.fillText(p.text, ppx, ppy);
      ctx.restore();
      return;
    }

    // Sprite-based particles
    if (p.spriteKey) {
      const spriteImg = state.images[p.spriteKey];
      if (isImageReady(spriteImg)) {
        if (p.glow) ctx.globalCompositeOperation = 'lighter';
        ctx.translate(ppx, ppy);
        if (p.rotation !== undefined) ctx.rotate(p.rotation);
        ctx.drawImage(spriteImg, -size / 2, -size / 2, size, size);
        ctx.restore();
        return;
      }
    }

    if (p.glow) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowColor = p.color || '#4ade80';
      ctx.shadowBlur = size * 3;
    }
    ctx.fillStyle = p.color || '#4ade80';
    ctx.beginPath();
    ctx.arc(ppx, ppy, Math.max(0.5, size), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // ── Joystick ───────────────────────────────────────────────────────
  if (state.joysticks.left.active) {
    const jl = state.joysticks.left;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(jl.baseX, jl.baseY, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(jl.baseX + jl.dx * 50, jl.baseY + jl.dy * 50, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  renderMinimap(ctx, state, vw, vh);
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER RENDERERS
// ═══════════════════════════════════════════════════════════════════════════

function renderBoss(
  ctx: CanvasRenderingContext2D, state: GameSnapshot,
  m: import('../types/game').Minion, sx: number, sy: number, time: number,
) {
  const bossAnim = BOSS_ANIM_MAP[m.type];
  if (!bossAnim) return;

  const bossState = m.bossState || 'idle';
  const bossSize = m.radius * 2.8;
  const facingRight = m.facingRight !== false;
  const animIdx = Math.floor((m.animFrame ?? 0) % 3);

  // Determine which sprite to use
  let spriteKey: string;
  if (bossState === 'hurt') {
    spriteKey = bossAnim.hurt;
  } else if (bossState === 'attacking') {
    spriteKey = bossAnim.attack[animIdx % bossAnim.attack.length];
  } else {
    // Check if moving
    const isMoving = Math.hypot(state.player.x - m.x, state.player.y - m.y) > m.radius * 3;
    if (isMoving) {
      spriteKey = bossAnim.walk[animIdx % bossAnim.walk.length];
    } else {
      spriteKey = bossAnim.idle[animIdx % bossAnim.idle.length];
    }
  }

  const bossImg = state.images[spriteKey];

  // Boss aura glow
  ctx.save();
  const auraPulse = 0.15 + Math.sin(time / 250) * 0.08;
  const auraColors: Record<string, string> = {
    boss_viking: 'rgba(168, 85, 247, 0.3)',
    boss_goblin: 'rgba(239, 68, 68, 0.3)',
    boss_caveman: 'rgba(251, 191, 36, 0.3)',
  };
  ctx.globalAlpha = auraPulse;
  ctx.fillStyle = auraColors[m.type] || 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.arc(sx, sy, m.radius + 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Boss sprite with hurt flash
  if (isImageReady(bossImg)) {
    ctx.save();
    const bobY = sy + Math.sin(time / 300) * 3;

    // Hurt flash effect
    if (bossState === 'hurt') {
      ctx.globalAlpha = 0.7 + Math.sin(time / 50) * 0.3;
    }

    drawFlippedImage(ctx, bossImg, sx, bobY, bossSize, bossSize, !facingRight);
    ctx.restore();
  } else {
    ctx.save();
    const bossGrad = ctx.createRadialGradient(sx - 8, sy - 8, 8, sx, sy, m.radius);
    const colors: Record<string, string[]> = {
      boss_viking: ['#a855f7', '#581c87'],
      boss_goblin: ['#ef4444', '#7f1d1d'],
      boss_caveman: ['#f59e0b', '#78350f'],
    };
    const c = colors[m.type] || ['#888', '#444'];
    bossGrad.addColorStop(0, c[0]);
    bossGrad.addColorStop(1, c[1]);
    ctx.fillStyle = bossGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, m.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Boss health bar
  const ratio = Math.max(0, m.health / m.maxHealth);
  const barW = m.radius * 2.8;
  const barH = 8;
  const barX = sx - barW / 2;
  const barY = sy - m.radius - 28;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4);

  if (ratio > 0) {
    const hpColors: Record<string, string[]> = {
      boss_viking: ['#a855f7', '#7c3aed'],
      boss_goblin: ['#ef4444', '#dc2626'],
      boss_caveman: ['#f59e0b', '#d97706'],
    };
    const hc = hpColors[m.type] || ['#a855f7', '#7c3aed'];
    const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    hpGrad.addColorStop(0, hc[0]);
    hpGrad.addColorStop(1, hc[1]);
    ctx.fillStyle = hpGrad;
    ctx.fillRect(barX, barY, barW * ratio, barH);
  }

  // Boss name tag
  ctx.save();
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  const bossNames: Record<string, string> = {
    boss_viking: '⚔️ Viking Leader',
    boss_goblin: '👹 Giant Goblin',
    boss_caveman: '🪨 Caveman Boss',
  };
  ctx.fillText(bossNames[m.type] || 'Boss', sx, barY - 6);
  ctx.restore();
}

function renderMapDecorations(
  ctx: CanvasRenderingContext2D, state: GameSnapshot,
  camX: number, camY: number, vw: number, vh: number, _time: number,
) {
  const decorKeys = [
    'obstacle_stone_1', 'obstacle_stone_2', 'obstacle_stone_3',
    'obstacle_stone_4', 'obstacle_stone_5', 'obstacle_stone_6',
    'obstacle_barrel_1', 'obstacle_barrel_2', 'obstacle_anchor',
    'obstacle_seaweed_1', 'obstacle_seaweed_2', 'obstacle_steering_wheel',
  ];
  const gridStep = 600;

  for (let dx = Math.floor(camX / gridStep) * gridStep - gridStep; dx < camX + vw + gridStep; dx += gridStep) {
    for (let dy = Math.floor(camY / gridStep) * gridStep - gridStep; dy < camY + vw + gridStep; dy += gridStep) {
      const hash = ((dx * 73856093) ^ (dy * 19349663)) & 0x7FFFFFFF;
      if (hash % 3 !== 0) continue;
      const ox = dx + (hash % 400) - 200;
      const oy = dy + ((hash >> 8) % 400) - 200;
      if (ox < 50 || ox > GAME_CONFIG.mapWidth - 50 || oy < 50 || oy > GAME_CONFIG.mapHeight - 50) continue;
      if (Math.hypot(ox - GAME_CONFIG.mapWidth / 2, oy - GAME_CONFIG.mapHeight / 2) < 300) continue;
      const sx = ox - camX;
      const sy = oy - camY;
      if (sx < -60 || sx > vw + 60 || sy < -60 || sy > vh + 60) continue;
      const decorKey = decorKeys[hash % decorKeys.length];
      const decorImg = state.images[decorKey];
      if (isImageReady(decorImg)) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        const size = 40 + (hash % 30);
        drawCenteredImage(ctx, decorImg, sx, sy, size, size);
        ctx.restore();
      }
    }
  }
}

function renderMinimap(ctx: CanvasRenderingContext2D, state: GameSnapshot, vw: number, vh: number) {
  const cam = state.camera;
  const mmSize = Math.min(90, vw * 0.18);
  const mmPad = 12;
  const mmX = vw - mmSize - mmPad;
  const mmY = vh - mmSize - mmPad;
  const scaleX = mmSize / GAME_CONFIG.mapWidth;
  const scaleY = mmSize / GAME_CONFIG.mapHeight;

  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = 'rgba(10, 10, 20, 0.85)';
  ctx.beginPath();
  const r = 6;
  ctx.moveTo(mmX + r, mmY);
  ctx.lineTo(mmX + mmSize - r, mmY);
  ctx.quadraticCurveTo(mmX + mmSize, mmY, mmX + mmSize, mmY + r);
  ctx.lineTo(mmX + mmSize, mmY + mmSize - r);
  ctx.quadraticCurveTo(mmX + mmSize, mmY + mmSize, mmX + mmSize - r, mmY + mmSize);
  ctx.lineTo(mmX + r, mmY + mmSize);
  ctx.quadraticCurveTo(mmX, mmY + mmSize, mmX, mmY + mmSize - r);
  ctx.lineTo(mmX, mmY + r);
  ctx.quadraticCurveTo(mmX, mmY, mmX + r, mmY);
  ctx.fill();
  ctx.strokeStyle = 'rgba(100, 120, 200, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(mmX + cam.x * scaleX, mmY + cam.y * scaleY, vw * scaleX, vh * scaleY);

  ctx.fillStyle = '#ff6b35';
  state.turrets.forEach((t) => ctx.fillRect(mmX + t.x * scaleX - 2, mmY + t.y * scaleY - 2, 4, 4));

  state.minions.forEach((m) => {
    if (m.type.startsWith('boss_')) {
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(mmX + m.x * scaleX - 2, mmY + m.y * scaleY - 2, 5, 5);
    } else {
      ctx.fillStyle = 'rgba(74, 222, 128, 0.6)';
      ctx.fillRect(mmX + m.x * scaleX - 1, mmY + m.y * scaleY - 1, 2, 2);
    }
  });

  // Obstacles on minimap
  ctx.fillStyle = 'rgba(255, 100, 100, 0.4)';
  state.obstacles.forEach((o) => ctx.fillRect(mmX + o.x * scaleX - 1, mmY + o.y * scaleY - 1, 3, 3));

  ctx.fillStyle = '#fbbf24';
  state.pickups.forEach((p) => {
    if (p.type === 'mystery_box') {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(mmX + p.x * scaleX - 2, mmY + p.y * scaleY - 2, 4, 4);
    } else {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(mmX + p.x * scaleX - 1, mmY + p.y * scaleY - 1, 3, 3);
    }
  });

  ctx.save();
  ctx.shadowColor = '#3b82f6';
  ctx.shadowBlur = 4;
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath();
  ctx.arc(mmX + state.player.x * scaleX, mmY + state.player.y * scaleY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
