export type Segment = {
  index: number;
  p1: { world: { x: number; y: number; z: number }; camera: { x: number; y: number; z: number }; screen: { x: number; y: number; w: number; scale: number } };
  p2: { world: { x: number; y: number; z: number }; camera: { x: number; y: number; z: number }; screen: { x: number; y: number; w: number; scale: number } };
  curve: number;
  color: { road: string; grass: string; rumble: string; lane?: string };
};

export const SEGMENT_LENGTH = 20;
const RUMBLE_LENGTH = 3;

const SYNTH_COLORS = {
  LIGHT: { road: '#1e293b', grass: '#020617', rumble: '#f59e0b', lane: '#ffffff' },
  DARK: { road: '#0f172a', grass: '#000000', rumble: '#dc2626' },
  START: { road: '#ffffff', grass: '#020617', rumble: '#ffffff' },
  FINISH: { road: '#000000', grass: '#020617', rumble: '#000000' },
};

export const buildTrack = (): Segment[] => {
  const segments: Segment[] = [];
  const numSegments = 500; // 10,000 meters

  for (let i = 0; i < numSegments + 200; i++) { // Add buffer for finish line
    let curve = 0;
    let y = 0;

    // Track Design
    if (i > 20 && i < 60) curve = 1.5;
    if (i > 70 && i < 110) curve = -2;
    if (i > 130 && i < 190) { curve = 3.5; y = Math.sin(((i - 130) / 60) * Math.PI) * 1500; }
    if (i > 200 && i < 250) { curve = -3; }
    if (i > 270 && i < 350) { curve = 1.5; y = Math.sin(((i - 270) / 80) * Math.PI) * 4500; }
    if (i > 360 && i < 410) { curve = -2; y = -Math.sin(((i - 360) / 50) * Math.PI) * 3500; } // Downhill
    if (i > 430 && i < 480) { curve = 2; y = Math.sin(((i - 430) / 50) * Math.PI) * 1000; }

    let color = Math.floor(i / RUMBLE_LENGTH) % 2 ? SYNTH_COLORS.LIGHT : SYNTH_COLORS.DARK;
    if (i < 2) color = SYNTH_COLORS.START;
    if (i >= 500 && i < 502) color = SYNTH_COLORS.FINISH;

    segments.push({
      index: i,
      p1: { world: { x: 0, y: 0, z: i * SEGMENT_LENGTH }, camera: { x: 0, y: 0, z: 0 }, screen: { x: 0, y: 0, w: 0, scale: 0 } },
      p2: { world: { x: 0, y: y, z: (i + 1) * SEGMENT_LENGTH }, camera: { x: 0, y: 0, z: 0 }, screen: { x: 0, y: 0, w: 0, scale: 0 } },
      curve,
      color,
    });
  }

  // Smooth Y connections
  for (let i = 1; i < segments.length; i++) {
    segments[i].p1.world.y = segments[i - 1].p2.world.y;
  }

  return segments;
};

const drawPolygon = (ctx: CanvasRenderingContext2D, x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, color: string) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1 - w1, y1);
  ctx.lineTo(x2 - w2, y2);
  ctx.lineTo(x2 + w2, y2);
  ctx.lineTo(x1 + w1, y1);
  ctx.closePath();
  ctx.fill();
};

export const renderRacingCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  segments: Segment[],
  distance: number,
  skyOffset: number
) => {
  // Draw Sky Gradient
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
  skyGradient.addColorStop(0, '#020617');
  skyGradient.addColorStop(0.35, '#1e1b4b');
  skyGradient.addColorStop(0.55, '#701a75');
  skyGradient.addColorStop(0.75, '#f59e0b');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height);

  // Draw Sun
  const sunX = width / 2 - skyOffset;
  const sunY = height * 0.25;
  const sunRadius = width * 0.12;
  
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  const sunGradient = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
  sunGradient.addColorStop(0, '#fef3c7');
  sunGradient.addColorStop(0.5, '#fcd34d');
  sunGradient.addColorStop(1, '#ea580c');
  ctx.fillStyle = sunGradient;
  ctx.fill();

  // Draw Sun Grid Lines (Retro effect)
  ctx.fillStyle = '#020617';
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 10; i++) {
    const lineY = sunY + (i * sunRadius) / 5;
    ctx.fillRect(sunX - sunRadius, lineY, sunRadius * 2, 4);
  }
  ctx.globalAlpha = 1.0;

  const baseSegmentIndex = Math.floor(distance / SEGMENT_LENGTH);
  const baseSegment = segments[baseSegmentIndex % segments.length];
  if (!baseSegment) return;

  const cameraHeight = 1200;
  const cameraZ = distance;
  const cameraDepth = 0.8;
  const roadWidth = 2500;
  const drawDistance = 250;

  // Render background sky/sun pseudo-parallax based on skyOffset
  // Actually, we can let CSS handle the sky background, and just draw the road and grass here.
  // Grass covers the bottom half.
  
  let maxY = height;
  let x = 0;
  let dx = -(baseSegment.curve * ((distance % SEGMENT_LENGTH) / SEGMENT_LENGTH)); // Smooth curve interpolation

  // We start drawing from back to front for proper z-ordering of sprites (if any).
  // But road segments must be drawn front to back for painter's algorithm on hills, wait no, 
  // actually road should be drawn front to back (bottom to top of screen) so hills in front occlude roads behind!
  // Wait, if we draw front to back, we only draw if `p2.screen.y < maxY`. This occludes perfectly.
  
  for (let i = 0; i < drawDistance; i++) {
    const segmentIndex = (baseSegmentIndex + i) % segments.length;
    const segment = segments[segmentIndex];
    
    // Project P1
    const p1c = segment.p1.camera;
    const p1s = segment.p1.screen;
    p1c.x = x; 
    p1c.y = segment.p1.world.y - cameraHeight; 
    p1c.z = segment.p1.world.z - cameraZ;
    
    // Fix loop around wrapping
    if (p1c.z < 0) p1c.z += segments.length * SEGMENT_LENGTH;
    
    p1s.scale = cameraDepth / (p1c.z || 0.1);
    p1s.x = Math.round(width / 2 + p1s.scale * p1c.x * width / 2);
    p1s.y = Math.round(height / 2 - p1s.scale * p1c.y * height / 2);
    p1s.w = Math.round(p1s.scale * roadWidth * width / 2);

    // Project P2
    const p2c = segment.p2.camera;
    const p2s = segment.p2.screen;
    p2c.x = x + dx; 
    p2c.y = segment.p2.world.y - cameraHeight; 
    p2c.z = segment.p2.world.z - cameraZ;
    
    if (p2c.z < 0) p2c.z += segments.length * SEGMENT_LENGTH;
    
    p2s.scale = cameraDepth / (p2c.z || 0.1);
    p2s.x = Math.round(width / 2 + p2s.scale * p2c.x * width / 2);
    p2s.y = Math.round(height / 2 - p2s.scale * p2c.y * height / 2);
    p2s.w = Math.round(p2s.scale * roadWidth * width / 2);

    x += dx;
    dx += segment.curve;

    // Culling
    if (p1c.z <= 0 || p2s.y >= maxY) continue;
    maxY = p2s.y;

    // Draw Grass (fills from road edge to screen edge)
    ctx.fillStyle = segment.color.grass;
    ctx.fillRect(0, p2s.y, width, p1s.y - p2s.y + 1); // +1 to overlap and avoid gaps

    // Draw Rumble
    drawPolygon(ctx, p1s.x, p1s.y, p1s.w * 1.2, p2s.x, p2s.y, p2s.w * 1.2, segment.color.rumble);
    
    // Draw Road
    drawPolygon(ctx, p1s.x, p1s.y, p1s.w, p2s.x, p2s.y, p2s.w, segment.color.road);
    
    // Draw Lane
    if (segment.color.lane) {
      const laneW1 = p1s.w * 0.03;
      const laneW2 = p2s.w * 0.03;
      // Center dashed line
      drawPolygon(ctx, p1s.x, p1s.y, laneW1, p2s.x, p2s.y, laneW2, segment.color.lane);
    }
  }
};
