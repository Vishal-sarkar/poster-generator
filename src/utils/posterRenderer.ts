/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  frameX: number;
  frameY: number;
  frameWidth: number;
  frameHeight: number;
  frameRadius: number;
  themeColor: string;
  frameRotation?: number;
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'cycling-challenge',
    name: 'Cycling Distance Challenge',
    description: 'Dynamic blue background with yellow accents and a slanted name banner',
    frameX: 580,
    frameY: 95,
    frameWidth: 530,
    frameHeight: 770,
    frameRadius: 30,
    themeColor: '#0b4295',
    frameRotation: 3.8
  },
  {
    id: 'run-walk-challenge',
    name: 'Run Walk Challenge',
    description: 'Textured dark blue halftone pattern with a tilted Polaroid frame',
    frameX: 580,
    frameY: 90,
    frameWidth: 530,
    frameHeight: 880,
    frameRadius: 15,
    themeColor: '#083358',
    frameRotation: -4
  }
];

export interface FormState {
  name: string;
  date: string;
  target: string;
  photoUrl: string | null;
  templateId: string;
  photoX: number;
  photoY: number;
  photoScale: number;
  photoRotation: number;
  activityRoute?: 'cycling' | 'walk-runing';
}

// Draw a rounded rectangle on a 2D canvas context
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Procedural QR Code generator
export function drawQRCode(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  
  // Background card for QR
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, x - 8, y - 8, size + 16, size + 16, 12);
  ctx.fill();

  // Fine boundary outline
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw the 3 finder patterns
  const finderSize = Math.floor(size * 0.25);
  const drawFinder = (px: number, py: number) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(px, py, finderSize, finderSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 4, py + 4, finderSize - 8, finderSize - 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(px + 8, py + 8, finderSize - 16, finderSize - 16);
  };

  drawFinder(x, y);
  drawFinder(x + size - finderSize, y);
  drawFinder(x, y + size - finderSize);

  // Generate deterministic noise
  ctx.fillStyle = '#000000';
  const gridSize = 21;
  const cellSize = size / gridSize;
  
  let seed = 12345;
  const rand = () => {
    const s = Math.sin(seed++) * 10000;
    return s - Math.floor(s);
  };

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Avoid finder patterns
      if (r < 7 && c < 7) continue;
      if (r < 7 && c >= gridSize - 7) continue;
      if (r >= gridSize - 7 && c < 7) continue;

      if (rand() > 0.45) {
        ctx.fillRect(
          x + c * cellSize,
          y + r * cellSize,
          cellSize + 0.3,
          cellSize + 0.3
        );
      }
    }
  }

  ctx.restore();
}

// Draw "PEDALS POWER" brand logo
export function drawBrandLogo(ctx: CanvasRenderingContext2D, x: number, y: number, theme: 'republic' | 'midnight' | 'golden') {
  ctx.save();
  
  // Background circle
  ctx.beginPath();
  ctx.arc(x, y, 48, 0, Math.PI * 2);
  ctx.fillStyle = theme === 'midnight' ? '#39ff14' : theme === 'golden' ? '#f1c40f' : '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Inner dark circle outline
  ctx.beginPath();
  ctx.arc(x, y, 43, 0, Math.PI * 2);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Minimal cycle / pedal logo line art
  ctx.beginPath();
  ctx.moveTo(x - 22, y + 12);
  ctx.lineTo(x - 10, y - 18);
  ctx.lineTo(x + 22, y - 18);
  ctx.lineTo(x + 10, y + 12);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Text inside
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 8px "Montserrat", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PEDALS POWER', x, y + 25);

  ctx.restore();
}

// Draw custom high-fidelity medals
export function drawMedal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: 'bronze' | 'silver' | 'gold',
  targetText: string,
  dateText: string
) {
  ctx.save();

  // 1. Hanging Ribbon
  if (type === 'bronze') {
    // Indian Tricolor ribbon
    ctx.beginPath();
    ctx.moveTo(x - 40, y - 120);
    ctx.lineTo(x - 15, y - 120);
    ctx.lineTo(x - 18, y);
    ctx.lineTo(x - 43, y);
    ctx.closePath();
    ctx.fillStyle = '#FF9933';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - 15, y - 120);
    ctx.lineTo(x + 15, y - 120);
    ctx.lineTo(x + 10, y);
    ctx.lineTo(x - 18, y);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + 15, y - 120);
    ctx.lineTo(x + 40, y - 120);
    ctx.lineTo(x + 35, y);
    ctx.lineTo(x + 10, y);
    ctx.closePath();
    ctx.fillStyle = '#128807';
    ctx.fill();
  } else if (type === 'silver') {
    // Athletic slate ribbon with neon green stripe
    ctx.beginPath();
    ctx.moveTo(x - 35, y - 120);
    ctx.lineTo(x + 35, y - 120);
    ctx.lineTo(x + 25, y);
    ctx.lineTo(x - 25, y);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    ctx.fillStyle = '#39ff14';
    ctx.fillRect(x - 6, y - 120, 12, 120);
  } else {
    // Luxury purple and golden ribbon
    ctx.beginPath();
    ctx.moveTo(x - 35, y - 120);
    ctx.lineTo(x + 35, y - 120);
    ctx.lineTo(x + 25, y);
    ctx.lineTo(x - 25, y);
    ctx.closePath();
    ctx.fillStyle = '#4a148c';
    ctx.fill();

    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(x - 6, y - 120, 12, 120);
  }

  // 2. Medal Base (Radial metallic gradients)
  const outerRadius = 100;
  const innerRadius = 88;

  let radial = ctx.createRadialGradient(x - 15, y - 15, 10, x, y, outerRadius);
  if (type === 'bronze') {
    radial.addColorStop(0, '#f5b041'); // highlighting
    radial.addColorStop(0.3, '#ca6f1e'); // copper bronze
    radial.addColorStop(1, '#6e2c00'); // dark bronze shadow
  } else if (type === 'silver') {
    radial.addColorStop(0, '#ffffff');
    radial.addColorStop(0.3, '#bdc3c7');
    radial.addColorStop(1, '#566573');
  } else {
    radial.addColorStop(0, '#fef9e7');
    radial.addColorStop(0.3, '#f1c40f'); // rich gold
    radial.addColorStop(1, '#7d6608');
  }

  ctx.beginPath();
  ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
  ctx.fillStyle = radial;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 10;
  ctx.fill();
  ctx.shadowColor = 'transparent'; // Reset shadows

  // Embossed outer rim
  ctx.beginPath();
  ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
  ctx.strokeStyle = type === 'bronze' ? '#5e2300' : type === 'silver' ? '#2c3e50' : '#7d6608';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Inner coin body
  let innerRadial = ctx.createRadialGradient(x, y, 0, x, y, innerRadius);
  if (type === 'bronze') {
    innerRadial.addColorStop(0, '#dc7633');
    innerRadial.addColorStop(1, '#a04000');
  } else if (type === 'silver') {
    innerRadial.addColorStop(0, '#e5e7eb');
    innerRadial.addColorStop(1, '#9ca3af');
  } else {
    innerRadial.addColorStop(0, '#f9e79f');
    innerRadial.addColorStop(1, '#d4ac0d');
  }

  ctx.beginPath();
  ctx.arc(x, y, innerRadius - 2, 0, Math.PI * 2);
  ctx.fillStyle = innerRadial;
  ctx.fill();

  // Medal text and icons
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Stars
  ctx.fillStyle = type === 'bronze' ? '#fdebd0' : type === 'silver' ? '#1f2937' : '#7d6608';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('★ ★ ★', x, y - 55);

  // Finisher text
  ctx.font = '900 20px "Montserrat", sans-serif';
  ctx.fillStyle = type === 'bronze' ? '#ffffff' : type === 'silver' ? '#111827' : '#4a148c';
  ctx.fillText('FINISHER', x, y - 28);

  // Bicycle symbol
  ctx.font = '36px sans-serif';
  ctx.fillText('🚲', x, y + 10);

  // Target overlay
  ctx.font = 'bold 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = type === 'bronze' ? '#fef9e7' : type === 'silver' ? '#1f2937' : '#4a148c';
  ctx.fillText(targetText || '100 KM', x, y + 46);

  // Date banner inside medal or subtitle
  ctx.font = '800 10px "Montserrat", sans-serif';
  ctx.fillStyle = type === 'bronze' ? '#fdebd0' : type === 'silver' ? '#374151' : '#7d6608';
  ctx.fillText(dateText ? dateText.toUpperCase() : 'EVENT', x, y + 62);

  ctx.restore();
}

// Draw custom vector globe icon
export function drawGlobeIcon(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  
  // Outer circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Horizontal line (equator)
  ctx.beginPath();
  ctx.moveTo(x - radius, y);
  ctx.lineTo(x + radius, y);
  ctx.stroke();
  
  // Vertical ellipse (meridian)
  ctx.beginPath();
  ctx.ellipse(x, y, radius * 0.5, radius, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.restore();
}

// Draw dynamic vector landscape placeholder (sky, green hills, and cloud)
export function drawLandscapePlaceholder(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number, ph: number) {
  ctx.save();
  
  // Sky
  ctx.fillStyle = '#a5f3fc';
  ctx.fillRect(px, py, pw, ph);

  // Hill 1 (rear)
  ctx.fillStyle = '#8ade5d';
  ctx.beginPath();
  ctx.arc(px + pw * 0.25, py + ph * 0.85, pw * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Hill 2 (front)
  ctx.fillStyle = '#4cb723';
  ctx.beginPath();
  ctx.arc(px + pw * 0.75, py + ph * 0.9, pw * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Cloud
  ctx.fillStyle = '#ffffff';
  const cloudX = px + pw * 0.5;
  const cloudY = py + ph * 0.3;
  ctx.beginPath();
  ctx.arc(cloudX, cloudY, pw * 0.12, 0, Math.PI * 2);
  ctx.arc(cloudX - pw * 0.1, cloudY + pw * 0.02, pw * 0.09, 0, Math.PI * 2);
  ctx.arc(cloudX + pw * 0.1, cloudY + pw * 0.02, pw * 0.09, 0, Math.PI * 2);
  ctx.arc(cloudX, cloudY + pw * 0.05, pw * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cloudX - pw * 0.18, cloudY + pw * 0.02, pw * 0.36, pw * 0.07);

  ctx.restore();
}

/**
 * Main draw function.
 * Combines all canvas operations to render the high fidelity 1080x1080 event poster.
 */
export function renderPoster(
  canvas: HTMLCanvasElement,
  state: FormState,
  loadedPhoto: HTMLImageElement | null,
  loadedCyclingBg: HTMLImageElement | null,
  loadedRunWalkBg: HTMLImageElement | null,
  isInteractive: boolean = false,
  loadedHalftone: HTMLImageElement | null = null
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set internal canvas bounds to exactly 1080x1080
  canvas.width = 1080;
  canvas.height = 1080;

  ctx.clearRect(0, 0, 1080, 1080);

  const { templateId, name, date, target, photoX, photoY, photoScale, photoRotation } = state;
  const config = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];

  // Helper to format Date beautifully (e.g. "1st Nov-30th Nov")
  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return '1ST NOV-30TH NOV';
    // If it is already a custom string, return it as-is
    if (dateStr.includes('-') || dateStr.toLowerCase().includes('nov') || dateStr.toLowerCase().includes('jan')) {
      return dateStr;
    }
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      
      // Suffix
      let suffix = 'TH';
      if (day === 1 || day === 21 || day === 31) suffix = 'ST';
      else if (day === 2 || day === 22) suffix = 'ND';
      else if (day === 3 || day === 23) suffix = 'RD';

      return `${day}${suffix} ${month} ${year}`;
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatDateStr(date);

  // --------------------------------------------------
  // 1. DRAW BACKGROUND LAYER FIRST
  // --------------------------------------------------
  if (config.id === 'cycling-challenge') {
    if (loadedCyclingBg) {
      // Draw custom background image loaded from user asset
      ctx.drawImage(loadedCyclingBg, 0, 0, 1080, 1080);
    } else {
      // Deep royal blue background fallback
      ctx.fillStyle = '#083c91';
      ctx.fillRect(0, 0, 1080, 1080);

      // Draw darker blue/purple-blue triangles for dynamic speed texture
      ctx.fillStyle = '#052c6c';
      
      // Shard 1 (Top left)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(400, 0);
      ctx.lineTo(0, 500);
      ctx.closePath();
      ctx.fill();

      // Shard 2 (Bottom left)
      ctx.beginPath();
      ctx.moveTo(0, 800);
      ctx.lineTo(350, 1080);
      ctx.lineTo(0, 1080);
      ctx.closePath();
      ctx.fill();

      // Shard 3 (Bottom right)
      ctx.beginPath();
      ctx.moveTo(1080, 500);
      ctx.lineTo(700, 1080);
      ctx.lineTo(1080, 1080);
      ctx.closePath();
      ctx.fill();

      // Speed streak 1
      ctx.fillStyle = '#1c5cb8';
      ctx.beginPath();
      ctx.moveTo(0, 350);
      ctx.lineTo(200, 500);
      ctx.lineTo(0, 650);
      ctx.closePath();
      ctx.fill();

      // Top-right yellow/lime shards
      ctx.fillStyle = '#d4fb02';
      
      // Strip 1
      ctx.beginPath();
      ctx.moveTo(800, -50);
      ctx.lineTo(950, -50);
      ctx.lineTo(700, 200);
      ctx.lineTo(620, 100);
      ctx.closePath();
      ctx.fill();

      // Strip 2
      ctx.beginPath();
      ctx.moveTo(970, -50);
      ctx.lineTo(1080, -50);
      ctx.lineTo(1080, 150);
      ctx.lineTo(850, 270);
      ctx.closePath();
      ctx.fill();

      // Strip 3
      ctx.beginPath();
      ctx.moveTo(1080, 100);
      ctx.lineTo(1080, 250);
      ctx.lineTo(950, 320);
      ctx.closePath();
      ctx.fill();
    }

  } else {
    // run-walk-challenge
    if (loadedRunWalkBg) {
      ctx.drawImage(loadedRunWalkBg, 0, 0, 1080, 1080);
    } else {
      // Dark textured blue background
      ctx.fillStyle = '#08253a';
      ctx.fillRect(0, 0, 1080, 1080);

      // Draw halftone dots on the left
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      for (let dx = 30; dx < 480; dx += 25) {
        for (let dy = 30; dy < 1050; dy += 25) {
          const distRatio = (480 - dx) / 480;
          const radius = 5 * distRatio * (0.5 + 0.5 * Math.sin((dx + dy) * 0.05));
          if (radius > 0.5) {
            ctx.beginPath();
            ctx.arc(dx, dy, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }

  // --------------------------------------------------
  // 2. DRAW PHOTO (WITH CLIPPING MASK AND ROTATION IF APPLICABLE)
  // --------------------------------------------------
  const frameCenterX = config.frameX + config.frameWidth / 2;
  const frameCenterY = config.frameY + config.frameHeight / 2;

  ctx.save();
  if (config.frameRotation) {
    ctx.translate(frameCenterX, frameCenterY);
    ctx.rotate((config.frameRotation * Math.PI) / 180);
    ctx.translate(-frameCenterX, -frameCenterY);
  }

  if (config.id === 'run-walk-challenge') {
    // Draw the neon purple glowing outer line
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 6;
    drawRoundedRect(ctx, config.frameX - 3, config.frameY - 3, config.frameWidth + 6, config.frameHeight + 6, config.frameRadius + 3);
    ctx.stroke();

    // Draw the Polaroid black border
    ctx.fillStyle = '#0b0c10';
    drawRoundedRect(ctx, config.frameX, config.frameY, config.frameWidth, config.frameHeight, config.frameRadius);
    ctx.fill();

    // Define inner photo frame bounds (Polaroid has thin margins on top/left/right, thick on bottom)
    const px = config.frameX + 24;
    const py = config.frameY + 24;
    const pw = config.frameWidth - 48;
    const ph = config.frameHeight - 48;

    // Clip to the photo frame area
    ctx.save();
    drawRoundedRect(ctx, px, py, pw, ph, 8);
    ctx.clip();

    ctx.fillStyle = '#d0d7de';
    ctx.fillRect(px, py, pw, ph);

    if (loadedPhoto) {
      ctx.save();
      // Move to center of inner photo frame
      const ipCenterX = px + pw / 2;
      const ipCenterY = py + ph / 2;
      ctx.translate(ipCenterX, ipCenterY);

      // Apply offset, rotation, scale
      ctx.translate(photoX, photoY);
      ctx.rotate((photoRotation * Math.PI) / 180);
      ctx.scale(photoScale, photoScale);

      const imgRatio = loadedPhoto.width / loadedPhoto.height;
      let drawW = pw;
      let drawH = pw / imgRatio;
      if (drawH < ph) {
        drawH = ph;
        drawW = ph * imgRatio;
      }
      ctx.drawImage(loadedPhoto, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    } else {
      // Draw dynamic hills and cloud placeholder
      drawLandscapePlaceholder(ctx, px, py, pw, ph);
    }

    if (isInteractive && loadedPhoto) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(px + pw / 3, py);
      ctx.lineTo(px + pw / 3, py + ph);
      ctx.moveTo(px + (2 * pw) / 3, py);
      ctx.lineTo(px + (2 * pw) / 3, py + ph);
      ctx.moveTo(px, py + ph / 3);
      ctx.lineTo(px + pw, py + ph / 3);
      ctx.moveTo(px, py + (2 * ph) / 3);
      ctx.lineTo(px + pw, py + (2 * ph) / 3);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore(); // Restore from photo clip

    // Draw Polaroid Text and Markings (in rotated space!)
    ctx.fillStyle = '#55555d';
    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw vertical text "CANVA STORIES Z850"
    ctx.save();
    ctx.translate(config.frameX + 13, config.frameY + config.frameHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('CANVA STORIES Z850', 0, 0);
    ctx.restore();

    // Markings "009" and "◀ 600"
    ctx.font = '800 10px "JetBrains Mono", monospace';
    ctx.fillText('009', config.frameX + 35, config.frameY + 45);
    ctx.fillText('◀ 600', config.frameX + 13, config.frameY + 280);

  } else {
    // cycling-challenge
    // Draw the rounded photo frame path and clip
    drawRoundedRect(ctx, config.frameX, config.frameY, config.frameWidth, config.frameHeight, config.frameRadius);
    ctx.clip();

    ctx.fillStyle = '#d0d7de';
    ctx.fillRect(config.frameX, config.frameY, config.frameWidth, config.frameHeight);

    if (loadedPhoto) {
      ctx.save();
      ctx.translate(frameCenterX, frameCenterY);
      ctx.translate(photoX, photoY);
      ctx.rotate((photoRotation * Math.PI) / 180);
      ctx.scale(photoScale, photoScale);

      const imgRatio = loadedPhoto.width / loadedPhoto.height;
      let drawW = config.frameWidth;
      let drawH = config.frameWidth / imgRatio;
      if (drawH < config.frameHeight) {
        drawH = config.frameHeight;
        drawW = config.frameHeight * imgRatio;
      }
      ctx.drawImage(loadedPhoto, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    } else {
      // Draw landscape placeholder (sky, hills, cloud)
      drawLandscapePlaceholder(ctx, config.frameX, config.frameY, config.frameWidth, config.frameHeight);
    }

    if (isInteractive && loadedPhoto) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(config.frameX + config.frameWidth / 3, config.frameY);
      ctx.lineTo(config.frameX + config.frameWidth / 3, config.frameY + config.frameHeight);
      ctx.moveTo(config.frameX + (2 * config.frameWidth) / 3, config.frameY);
      ctx.lineTo(config.frameX + (2 * config.frameWidth) / 3, config.frameY + config.frameHeight);
      ctx.moveTo(config.frameX, config.frameY + config.frameHeight / 3);
      ctx.lineTo(config.frameX + config.frameWidth, config.frameY + config.frameHeight / 3);
      ctx.moveTo(config.frameX, config.frameY + (2 * config.frameHeight) / 3);
      ctx.lineTo(config.frameX + config.frameWidth, config.frameY + (2 * config.frameHeight) / 3);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  ctx.restore(); // Restore from photo clip and frameRotation

  // Draw halftone circle on top of the Polaroid photo frame
  if (config.id === 'run-walk-challenge' && loadedHalftone) {
    ctx.save();
    const size = 680;
    const centerX = 1120;
    const centerY = 1100;
    ctx.translate(centerX, centerY);
    // Rotate clockwise slightly (20 degrees)
    ctx.rotate((180 * Math.PI) / 180);
    ctx.drawImage(loadedHalftone, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  // --------------------------------------------------
  // 3. DRAW TEMPLATE FOREGROUND LAYERS & TEXT ON TOP
  // --------------------------------------------------
  if (config.id === 'cycling-challenge') {
    // --------------------------------------------------
    // TEMPLATE 1: CYCLING DISTANCE CHALLENGE
    // --------------------------------------------------

    if (!loadedCyclingBg) {
      // Draw static logo, labels and QR code only if background image is not loaded
      // Brand logo top left
      drawBrandLogo(ctx, 130, 110, 'republic');

      // Yellow badge: DISTANCE CHALLENGE
      ctx.save();
      ctx.fillStyle = '#d4fb02';
      drawRoundedRect(ctx, 55, 290, 410, 80, 0); // sharp rectangle matching design
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#083c91';
      ctx.font = 'italic 900 32px "Montserrat", sans-serif';
      ctx.fillText('DISTANCE CHALLENGE', 260, 330);
      ctx.restore();

      // "JOIN NOW" + QR Code
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 16px "Montserrat", sans-serif';
      ctx.fillText('JOIN NOW', 260, 620);
      drawQRCode(ctx, 200, 645, 120);
      ctx.restore();

      // PUSH YOUR LIMITS
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px "Montserrat", sans-serif';
      ctx.fillText('PUSH YOUR LIMITS', 260, 835);
      ctx.restore();

      // URL with vector Globe Icon
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Inter", sans-serif';
      const textStr = 'www.pedalspower.com';
      const textWidth = ctx.measureText(textStr).width;
      const startX = 260 - (textWidth + 24) / 2;
      drawGlobeIcon(ctx, startX + 9, 880, 9);
      ctx.textAlign = 'left';
      ctx.fillText(textStr, startX + 24, 886);
      ctx.restore();
    }

    // Always draw dynamic text (since they are blank in the background template)
    // Title: CYCLING or RUN/WALK (italic bold Montserrat)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 900 84px "Montserrat", sans-serif';
    const isWalkRunning = state.activityRoute === 'walk-runing' || 
      (typeof window !== 'undefined' && window.location.pathname.includes('/walk-runing'));
    const titleText = isWalkRunning ? 'WALK/RUN' : 'CYCLING';
    ctx.fillText(titleText, 280, 340);
    ctx.restore();

    // Always draw Target Text (e.g. "100KM") in Orbitron futuristic font
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 56px "Montserrat", sans-serif';
    ctx.fillText(target.replace(/\s+/g, '').toUpperCase(), 260, 580);
    ctx.restore();

    // Always draw Date Text
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 34px "Montserrat", sans-serif';
    ctx.fillText(formattedDate.toUpperCase(), 260, 630);
    ctx.restore();

    // Participant Name drawn in the slanted yellow box of the background image
    ctx.save();
    const bannerCenterX = 820;
    const bannerCenterY = 925;
    ctx.translate(bannerCenterX, bannerCenterY);
    // Rotate matching the background slant (frameRotation = 3.8 degrees)
    ctx.rotate(((config.frameRotation || 3.8) * Math.PI) / 180);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#083c91'; // dark blue

    const nameUpper = name.toUpperCase() || 'YOUR NAME';
    const maxNameWidth = 530; // bounds of the slanted yellow banner

    // Measure at default 52px font
    ctx.font = 'italic 950 52px "Montserrat", sans-serif';
    const singleLineWidth = ctx.measureText(nameUpper).width;

    if (singleLineWidth > maxNameWidth && nameUpper.includes(' ')) {
      // Split into two lines
      const words = nameUpper.split(' ');
      const midPoint = Math.ceil(words.length / 2);
      const line1 = words.slice(0, midPoint).join(' ');
      const line2 = words.slice(midPoint).join(' ');

      // Use a smaller font size so two lines fit vertically inside the box
      ctx.font = 'italic 950 32px "Montserrat", sans-serif';
      
      // Draw both lines with vertical offsets
      ctx.fillText(line1, 0, -18);
      ctx.fillText(line2, 0, 18);
    } else {
      // Single line rendering with dynamic font size scaling if it still overflows
      let fontSize = 52;
      ctx.font = `italic 950 ${fontSize}px "Montserrat", sans-serif`;
      let textWidth = ctx.measureText(nameUpper).width;
      
      if (textWidth > maxNameWidth) {
        fontSize = Math.floor(fontSize * (maxNameWidth / textWidth));
        fontSize = Math.max(fontSize, 20); // don't scale below 20px
        ctx.font = `italic 950 ${fontSize}px "Montserrat", sans-serif`;
      }
      ctx.fillText(nameUpper, 0, 0);
    }
    ctx.restore();

  } else {
    // --------------------------------------------------
    // TEMPLATE 2: RUN WALK CHALLENGE
    // --------------------------------------------------

    // Film clapper/strip borders, Brand logo, "challenge" suffix, target milestone, tape banner, PUSH YOUR LIMITS, and URL
    // are pre-printed/baked in the template image, so we only draw them as fallback if template image is not loaded
    if (!loadedRunWalkBg) {
      // Film clapper/strip border at top (cyan with dark shapes)
      ctx.save();
      ctx.fillStyle = '#8de3f2';
      ctx.fillRect(0, 0, 1080, 45);
      
      ctx.fillStyle = '#08253a';
      for (let i = -50; i < 1100; i += 120) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 60, 0);
        ctx.lineTo(i + 30, 45);
        ctx.lineTo(i - 30, 45);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Film clapper/strip border at bottom (white with dark shapes)
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 1035, 1080, 45);
      
      ctx.fillStyle = '#08253a';
      for (let i = -50; i < 1100; i += 120) {
        ctx.beginPath();
        ctx.moveTo(i, 1035);
        ctx.lineTo(i + 60, 1035);
        ctx.lineTo(i + 90, 1080);
        ctx.lineTo(i + 30, 1080);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Brand logo top left
      drawBrandLogo(ctx, 260, 125, 'midnight');

      // Static 'challenge' text
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic bold 96px "Playball", cursive';
      ctx.fillText('challenge', 260, 385);
      ctx.restore();



      // Black Gaffer Tape style Name Banner shape
      ctx.save();
      ctx.fillStyle = '#111115';
      ctx.beginPath();
      ctx.moveTo(95, 605);
      ctx.lineTo(425, 600);
      ctx.lineTo(430, 620);
      ctx.lineTo(422, 640);
      ctx.lineTo(428, 660);
      ctx.lineTo(420, 685);
      ctx.lineTo(100, 690);
      ctx.lineTo(96, 670);
      ctx.lineTo(104, 650);
      ctx.lineTo(92, 630);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // PUSH YOUR LIMITS
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px "Montserrat", sans-serif';
      ctx.fillText('PUSH YOUR LIMITS', 260, 835);
      ctx.restore();

      // URL with vector Globe Icon
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Inter", sans-serif';
      const textStr = 'www.pedalspower.com';
      const textWidth = ctx.measureText(textStr).width;
      const startX = 260 - (textWidth + 24) / 2;
      drawGlobeIcon(ctx, startX + 9, 880, 9);
      ctx.textAlign = 'left';
      ctx.fillText(textStr, startX + 24, 886);
      ctx.restore();
    }

    // Always draw dynamic text (since they are blank in the background template)
    // Title: Run Walk or Cycling (Serif script matching Migra style)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic bold 126px "Migra",  serif';
    const isWalkRunning = state.activityRoute === 'walk-runing' || 
      (typeof window !== 'undefined' && window.location.pathname.includes('/walk-runing'));
    const titleText = isWalkRunning ? 'Walk/Run' : 'Cycling';
    ctx.fillText(titleText, 300, 365);
    ctx.restore();

    // Always draw Target Text (e.g. "50KMS") in Orbitron futuristic font
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 56px "Orbitron", sans-serif';
    ctx.fillText(target.replace(/\s+/g, '').toUpperCase(), 300, 580);
    ctx.restore();

    // Always draw Date range blocky text below the target km
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px "Orbitron", sans-serif';
    ctx.fillText(formattedDate.toUpperCase(), 300, 640);
    ctx.restore();

    // Draw Name text inside tape (pre-printed tape or fallback tape)
    ctx.save();
    // Center of the tape: x is around 272, y is around 708 to center inside the pre-printed/fallback tape
    const tapeCenterX = 322;
    const tapeCenterY = 748;
    ctx.translate(tapeCenterX, tapeCenterY);
    // Rotate counter-clockwise slightly to match the slant of the tape (about -3.5 degrees)
    ctx.rotate((-3.5 * Math.PI) / 180);
    
    const words = name.trim().toUpperCase().split(/\s+/);
    
    // Measure text width dynamically to size the black rectangular box
    let maxTextWidth = 300;
    if (words.length > 1) {
      const halfIndex = Math.ceil(words.length / 2);
      const line1 = words.slice(0, halfIndex).join(' ');
      const line2 = words.slice(halfIndex).join(' ');
      
      ctx.font = 'bold 64px "Permanent Marker", cursive';
      const width1 = ctx.measureText(line1).width;
      const width2 = ctx.measureText(line2).width;
      maxTextWidth = Math.max(width1, width2);
    } else {
      const nameStr = name.trim().toUpperCase() || 'UNIQUE JAIN';
      let fontSize = 48;
      ctx.font = `bold ${fontSize}px "Permanent Marker", cursive`;
      let textWidth = ctx.measureText(nameStr).width;
      const maxTapeWidth = 300;
      if (textWidth > maxTapeWidth) {
        fontSize = Math.max(22, Math.floor(48 * (maxTapeWidth / textWidth)));
        ctx.font = `bold ${fontSize}px "Permanent Marker", cursive`;
        textWidth = ctx.measureText(nameStr).width;
      }
      maxTextWidth = textWidth;
    }
    
    // Draw black rectangular box around the name with dynamic width
    ctx.fillStyle = '#111115';
    const boxWidth = Math.max(340, maxTextWidth + 60);
    const boxHeight = words.length > 1 ? 140 : 80;
    ctx.fillRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#8de3f2'; // light cyan matching design
    
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#8de3f2';
    if (words.length > 1) {
      // Split into two lines to fit beautifully in the tape height
      const halfIndex = Math.ceil(words.length / 2);
      const line1 = words.slice(0, halfIndex).join(' ');
      const line2 = words.slice(halfIndex).join(' ');
      
      ctx.font = '500 64px "Permanent Marker", cursive';
      ctx.fillText(line1, 0, -26);
      ctx.strokeText(line1, 0, -26);
      ctx.fillText(line2, 0, 26);
      ctx.strokeText(line2, 0, 26);
    } else {
      // Single line rendering with dynamic font size if it is a long single word
      const nameStr = name.trim().toUpperCase() || 'UNIQUE JAIN';
      let fontSize = 48;
      ctx.font = `500 ${fontSize}px "Permanent Marker", cursive`;
      const singleLineWidth = ctx.measureText(nameStr).width;
      const maxTapeWidth = 300;
      if (singleLineWidth > maxTapeWidth) {
        fontSize = Math.max(22, Math.floor(48 * (maxTapeWidth / singleLineWidth)));
        ctx.font = `500 ${fontSize}px "Permanent Marker", cursive`;
      }
      ctx.fillText(nameStr, 0, 0);
      ctx.strokeText(nameStr, 0, 0);
    }
    ctx.restore();
  }
}
