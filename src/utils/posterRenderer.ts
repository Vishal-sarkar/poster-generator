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
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'republic-cycling',
    name: 'Republic Day Cycling',
    description: 'Deep teal themed with painted tricolor swoosh, bronze medal & orange footer',
    frameX: 520,
    frameY: 180,
    frameWidth: 500,
    frameHeight: 650,
    frameRadius: 40,
    themeColor: '#1E5E75'
  },
  {
    id: 'midnight-endurance',
    name: 'Midnight Aero Speed',
    description: 'Stealth black with glowing neon-lime accents, speed streaks & silver medal',
    frameX: 530,
    frameY: 190,
    frameWidth: 490,
    frameHeight: 630,
    frameRadius: 20,
    themeColor: '#12141c'
  },
  {
    id: 'golden-horizon',
    name: 'Golden Horizon Trail',
    description: 'Scenic warm purple sunset, mountain silhouettes & gold medal',
    frameX: 520,
    frameY: 185,
    frameWidth: 500,
    frameHeight: 640,
    frameRadius: 30,
    themeColor: '#2d124d'
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

/**
 * Main draw function.
 * Combines all canvas operations to render the high fidelity 1080x1080 event poster.
 */
export function renderPoster(
  canvas: HTMLCanvasElement,
  state: FormState,
  loadedPhoto: HTMLImageElement | null,
  isInteractive: boolean = false
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set internal canvas bounds to exactly 1080x1080
  canvas.width = 1080;
  canvas.height = 1080;

  ctx.clearRect(0, 0, 1080, 1080);

  const { templateId, name, date, target, photoX, photoY, photoScale, photoRotation } = state;
  const config = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];

  // Helper to format Date beautifully (e.g. "26th Jul 2026")
  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return '26th Jan-28th Jan';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      
      // Suffix
      let suffix = 'th';
      if (day === 1 || day === 21 || day === 31) suffix = 'st';
      else if (day === 2 || day === 22) suffix = 'nd';
      else if (day === 3 || day === 23) suffix = 'rd';

      return `${day}${suffix} ${month} ${year}`;
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatDateStr(date);

  // --------------------------------------------------
  // 1. DRAW BACKGROUND LAYER FIRST (So photo and other overlays are visible on top!)
  // --------------------------------------------------
  if (config.id === 'republic-cycling') {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1080);
    bgGrad.addColorStop(0, '#246e88');
    bgGrad.addColorStop(1, '#144252');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1080);
  } else if (config.id === 'midnight-endurance') {
    const bgGrad = ctx.createRadialGradient(540, 540, 100, 540, 540, 800);
    bgGrad.addColorStop(0, '#1a1f2c');
    bgGrad.addColorStop(1, '#090a0f');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1080);
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
    bgGrad.addColorStop(0, '#2d124d'); // Deep violet
    bgGrad.addColorStop(0.5, '#7b1fa2'); // Purple
    bgGrad.addColorStop(1, '#e65100'); // Sunset orange
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1080);
  }

  // --------------------------------------------------
  // 2. DRAW PHOTO (WITH CLIPPING MASK)
  // --------------------------------------------------
  ctx.save();
  // Draw the rounded photo frame path and clip
  drawRoundedRect(ctx, config.frameX, config.frameY, config.frameWidth, config.frameHeight, config.frameRadius);
  ctx.clip();

  // Draw background behind photo inside frame
  ctx.fillStyle = '#d0d7de';
  ctx.fillRect(config.frameX, config.frameY, config.frameWidth, config.frameHeight);

  if (loadedPhoto) {
    ctx.save();
    // 1. Move to the center of the photo frame
    const centerX = config.frameX + config.frameWidth / 2;
    const centerY = config.frameY + config.frameHeight / 2;
    ctx.translate(centerX, centerY);

    // 2. Apply drag offsets (on 1080x1080 scale)
    ctx.translate(photoX, photoY);

    // 3. Apply rotation
    ctx.rotate((photoRotation * Math.PI) / 180);

    // 4. Apply scale
    ctx.scale(photoScale, photoScale);

    // 5. Draw image centered
    const imgRatio = loadedPhoto.width / loadedPhoto.height;
    let drawW = config.frameWidth;
    let drawH = config.frameWidth / imgRatio;
    
    // Fit image inside center
    if (drawH < config.frameHeight) {
      drawH = config.frameHeight;
      drawW = config.frameHeight * imgRatio;
    }

    ctx.drawImage(loadedPhoto, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  } else {
    // Show premium placeholder inside photo frame
    ctx.fillStyle = '#334155';
    ctx.fillRect(config.frameX, config.frameY, config.frameWidth, config.frameHeight);
    
    // Icon
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '64px sans-serif';
    ctx.fillText('👤', config.frameX + config.frameWidth / 2, config.frameY + config.frameHeight / 2 - 40);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 22px "Montserrat", sans-serif';
    ctx.fillText('PLACEHOLDER PHOTO', config.frameX + config.frameWidth / 2, config.frameY + config.frameHeight / 2 + 30);
    ctx.font = '500 16px "Montserrat", sans-serif';
    ctx.fillText('Upload photo to see live preview', config.frameX + config.frameWidth / 2, config.frameY + config.frameHeight / 2 + 65);
  }

  // Draw interactive overlays like target crosshairs/guidelines when dragging
  if (isInteractive && loadedPhoto) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    // Grid lines
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

  ctx.restore(); // Restore from photo clip

  // --------------------------------------------------
  // 3. DRAW TEMPLATE LAYERS & TEXT ON TOP (FOREGROUND)
  // --------------------------------------------------
  if (config.id === 'republic-cycling') {
    // --------------------------------------------------
    // TEMPLATE 1: REPUBLIC DAY CYCLING CHALLENGE
    // --------------------------------------------------

    // Redraw the photo inside its elegant white frame
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    drawRoundedRect(ctx, config.frameX, config.frameY, config.frameWidth, config.frameHeight, config.frameRadius);
    ctx.stroke();
    ctx.restore();

    // Indian Tricolor Swoosh on the left/bottom margins
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = -5;
    
    // Saffron paint stroke
    ctx.strokeStyle = '#FF9933';
    ctx.lineWidth = 100;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-50, 200);
    ctx.bezierCurveTo(150, 250, 200, 650, -50, 920);
    ctx.stroke();

    // White paint stroke
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 60;
    ctx.beginPath();
    ctx.moveTo(-50, 200);
    ctx.bezierCurveTo(120, 250, 170, 650, -50, 920);
    ctx.stroke();

    // Green paint stroke
    ctx.strokeStyle = '#128807';
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.moveTo(-50, 200);
    ctx.bezierCurveTo(90, 250, 140, 650, -50, 920);
    ctx.stroke();
    ctx.restore();

    // QR Code top left
    drawQRCode(ctx, 40, 40, 100);

    // Brand logo top right
    drawBrandLogo(ctx, 940, 90, 'republic');

    // Headers & Main Titles
    ctx.save();
    ctx.textAlign = 'center';
    
    // Main heading: REPUBLIC DAY
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 48px "Montserrat", sans-serif';
    ctx.fillText('REPUBLIC DAY', 510, 72);

    // Subheading: CYCLING CHALLENGE
    ctx.font = '600 36px "Montserrat", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CYCLING CHALLENGE', 510, 115);
    ctx.restore();

    // Categories details
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 20px "Montserrat", sans-serif';
    ctx.fillText('Categories', 270, 210);

    // Badges / list
    ctx.font = '700 21px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#f9e79f';
    ctx.fillText('10 KM | 25 KM | 50 KM | 100 KM', 270, 245);
    ctx.restore();

    // Blue Chevron/Banner for the Date
    ctx.save();
    const ribbonX = 70;
    const ribbonY = 280;
    const ribbonW = 400;
    const ribbonH = 65;
    
    // Draw ribbon shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;

    // Draw ribbon shape
    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.moveTo(ribbonX, ribbonY);
    ctx.lineTo(ribbonX + ribbonW, ribbonY);
    ctx.lineTo(ribbonX + ribbonW - 20, ribbonY + ribbonH / 2);
    ctx.lineTo(ribbonX + ribbonW, ribbonY + ribbonH);
    ctx.lineTo(ribbonX, ribbonY + ribbonH);
    ctx.lineTo(ribbonX + 20, ribbonY + ribbonH / 2);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Highlight border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text on ribbon
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 21px "Montserrat", sans-serif';
    ctx.fillText(formattedDate.toUpperCase(), ribbonX + ribbonW / 2, ribbonY + ribbonH / 2);
    ctx.restore();

    // Draw the bronze Finisher Medal
    drawMedal(ctx, 270, 560, 'bronze', target, formattedDate);

    // Goal Callout Text under medal
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 18px "Montserrat", sans-serif';
    ctx.fillText('Complete your target on any 1', 270, 755);
    ctx.fillText(`day between ${formattedDate}`, 270, 785);
    ctx.restore();

    // Contact/Info
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('📞 8076388960', 525, 915);
    ctx.fillText('🌐 www.pedalspower.com', 525, 945);
    ctx.restore();

    // Bottom Saffron name footer bar
    ctx.save();
    const footerY = 980;
    ctx.fillStyle = '#FF9933';
    ctx.fillRect(0, footerY, 1080, 100);

    // Shadow line separating
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, footerY, 1080, 6);

    // Participant name text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 46px "Montserrat", sans-serif';
    ctx.fillText((name || 'YOUR NAME HERE').toUpperCase(), 540, footerY + 50);
    ctx.restore();

  } else if (config.id === 'midnight-endurance') {
    // --------------------------------------------------
    // TEMPLATE 2: MIDNIGHT AERO ENDURANCE
    // --------------------------------------------------

    // Redraw the photo inside neon-green borders
    ctx.save();
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 15;
    drawRoundedRect(ctx, config.frameX, config.frameY, config.frameWidth, config.frameHeight, config.frameRadius);
    ctx.stroke();
    // Inner white frame border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 0;
    drawRoundedRect(ctx, config.frameX + 3, config.frameY + 3, config.frameWidth - 6, config.frameHeight - 6, config.frameRadius - 3);
    ctx.stroke();
    ctx.restore();

    // Geometric neon-glowing cyber vectors
    ctx.save();
    ctx.strokeStyle = 'rgba(57, 255, 20, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Grid lines on left panel
    for (let i = 0; i < 500; i += 50) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1080);
      ctx.moveTo(0, i + 100);
      ctx.lineTo(500, i + 100);
    }
    ctx.stroke();
    ctx.restore();

    // Speed lines on left
    ctx.save();
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 150);
    ctx.lineTo(150, 150);
    ctx.moveTo(0, 170);
    ctx.lineTo(80, 170);
    ctx.moveTo(0, 190);
    ctx.lineTo(210, 190);
    ctx.stroke();
    ctx.restore();

    // QR Code top left
    drawQRCode(ctx, 40, 40, 100);

    // Brand logo top right
    drawBrandLogo(ctx, 940, 90, 'midnight');

    // Headers & Main Titles
    ctx.save();
    ctx.textAlign = 'center';
    
    // Main heading: MIDNIGHT AERO
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 10;
    ctx.font = '900 50px "Space Grotesk", sans-serif';
    ctx.fillText('MIDNIGHT AERO', 510, 72);

    // Subheading: ENDURANCE SPEED
    ctx.font = '700 32px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.fillText('ENDURANCE SPEED CHALLENGE', 510, 115);
    ctx.restore();

    // Categories details
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px "Space Grotesk", sans-serif';
    ctx.fillText('TRACK VARIATION CATEGORIES', 270, 210);

    // Neon badge text
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillStyle = '#39ff14';
    ctx.fillText('10KM • 25KM • 50KM • 100KM', 270, 245);
    ctx.restore();

    // Slate Neumorph-style Date Box
    ctx.save();
    const boxX = 70;
    const boxY = 280;
    const boxW = 400;
    const boxH = 65;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 12);
    ctx.fill();
    ctx.stroke();

    // Date Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 20px "Space Grotesk", sans-serif';
    ctx.fillText(formattedDate.toUpperCase(), boxX + boxW / 2, boxY + boxH / 2);
    ctx.restore();

    // Draw the silver Finisher Medal
    drawMedal(ctx, 270, 560, 'silver', target, formattedDate);

    // Goal Callout Text under medal
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 18px "Space Grotesk", sans-serif';
    ctx.fillText('LOCK IN YOUR TARGET DISTANCE', 270, 755);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 15px "JetBrains Mono", monospace';
    ctx.fillText(`Event logged: ${formattedDate}`, 270, 785);
    ctx.restore();

    // Contact/Info
    ctx.save();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('📞 8076388960', 525, 915);
    ctx.fillText('🌐 www.pedalspower.com', 525, 945);
    ctx.restore();

    // Bottom Stealth name footer bar
    ctx.save();
    const fY = 980;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, fY, 1080, 100);

    // Top neon green strip
    ctx.fillStyle = '#39ff14';
    ctx.fillRect(0, fY, 1080, 6);

    // Participant name text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 48px "Space Grotesk", sans-serif';
    ctx.fillText((name || 'YOUR NAME HERE').toUpperCase(), 540, fY + 53);
    ctx.restore();

  } else {
    // --------------------------------------------------
    // TEMPLATE 3: GOLDEN HORIZON TRAIL
    // --------------------------------------------------

    // Redraw the photo inside metallic golden frame
    ctx.save();
    const goldGrad = ctx.createLinearGradient(config.frameX, config.frameY, config.frameX + config.frameWidth, config.frameY + config.frameHeight);
    goldGrad.addColorStop(0, '#f1c40f');
    goldGrad.addColorStop(0.5, '#f39c12');
    goldGrad.addColorStop(1, '#9a7d0a');
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 12;
    ctx.shadowColor = 'rgba(241, 196, 15, 0.3)';
    ctx.shadowBlur = 15;
    drawRoundedRect(ctx, config.frameX, config.frameY, config.frameWidth, config.frameHeight, config.frameRadius);
    ctx.stroke();
    ctx.restore();

    // Mountain path silhouettes drawn on bottom left
    ctx.save();
    ctx.fillStyle = 'rgba(45, 18, 77, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, 1080);
    ctx.lineTo(0, 800);
    ctx.lineTo(180, 680);
    ctx.lineTo(340, 750);
    ctx.lineTo(500, 620);
    ctx.lineTo(540, 1080);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(45, 18, 77, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, 1080);
    ctx.lineTo(0, 860);
    ctx.lineTo(120, 780);
    ctx.lineTo(260, 840);
    ctx.lineTo(440, 720);
    ctx.lineTo(540, 1080);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // QR Code top left
    drawQRCode(ctx, 40, 40, 100);

    // Brand logo top right
    drawBrandLogo(ctx, 940, 90, 'golden');

    // Headers & Main Titles
    ctx.save();
    ctx.textAlign = 'center';
    
    // Main heading: GOLDEN HORIZON
    ctx.fillStyle = '#f1c40f';
    ctx.font = '800 50px "Cinzel", serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 6;
    ctx.fillText('GOLDEN HORIZON', 510, 72);

    // Subheading: TRAIL RIDE
    ctx.font = '700 28px "Montserrat", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.fillText('OFF-ROAD ENDURO & TRAIL RIDE', 510, 115);
    ctx.restore();

    // Categories details
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fdebd0';
    ctx.font = '700 18px "Montserrat", sans-serif';
    ctx.fillText('TRAIL MILESTONES AVAILABLE', 270, 210);

    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText('10 KM • 25 KM • 50 KM • 100 KM', 270, 245);
    ctx.restore();

    // Elegant Gold bordered Date Box
    ctx.save();
    const boxX = 70;
    const boxY = 280;
    const boxW = 400;
    const boxH = 65;

    ctx.fillStyle = 'rgba(45, 18, 77, 0.7)';
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    // Date Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 18px "Montserrat", sans-serif';
    ctx.fillText(formattedDate.toUpperCase(), boxX + boxW / 2, boxY + boxH / 2);
    ctx.restore();

    // Draw the gold Finisher Medal
    drawMedal(ctx, 270, 560, 'gold', target, formattedDate);

    // Goal Callout Text under medal
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 16px "Montserrat", sans-serif';
    ctx.fillText('CONQUER THE SUMMIT & COLLECT GOLD', 270, 755);
    ctx.fillStyle = '#fdebd0';
    ctx.font = '500 14px "JetBrains Mono", monospace';
    ctx.fillText(`Event Period: ${formattedDate}`, 270, 785);
    ctx.restore();

    // Contact/Info
    ctx.save();
    ctx.fillStyle = '#fdebd0';
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('📞 8076388960', 525, 915);
    ctx.fillText('🌐 www.pedalspower.com', 525, 945);
    ctx.restore();

    // Bottom luxury golden name footer bar
    ctx.save();
    const footerY3 = 980;
    ctx.fillStyle = '#4a148c'; // Dark royal purple
    ctx.fillRect(0, footerY3, 1080, 100);

    // Metallic gold line separating
    const footerGoldGrad = ctx.createLinearGradient(0, 0, 1080, 0);
    footerGoldGrad.addColorStop(0, '#f1c40f');
    footerGoldGrad.addColorStop(0.5, '#fcf3cf');
    footerGoldGrad.addColorStop(1, '#f39c12');
    ctx.fillStyle = footerGoldGrad;
    ctx.fillRect(0, footerY3, 1080, 6);

    // Participant name text
    ctx.fillStyle = '#f1c40f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 44px "Cinzel", serif';
    ctx.fillText((name || 'YOUR NAME HERE').toUpperCase(), 540, footerY3 + 53);
    ctx.restore();
  }
}
