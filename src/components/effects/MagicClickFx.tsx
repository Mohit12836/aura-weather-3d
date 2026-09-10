import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'star' | 'circle' | 'spark';
  rotation: number;
  rotSpeed: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface MagicClickFxProps {
  enabled?: boolean;
}

export const MagicClickFx: React.FC<MagicClickFxProps> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to match full viewport
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Color palettes for magic
    const magicColors = [
      '#fbbf24', // golden amber
      '#f59e0b', // warm gold
      '#38bdf8', // radiant cyan
      '#818cf8', // celestial indigo
      '#c084fc', // magic purple
      '#34d399', // emerald shimmer
      '#ffffff', // diamond pure white
    ];

    // Click / Tap listener for Magic Burst
    const handleClick = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;

      // 1. Add Ripple Shockwave
      ripplesRef.current.push({
        x,
        y,
        radius: 4,
        maxRadius: 45 + Math.random() * 25,
        alpha: 0.85,
        color: magicColors[Math.floor(Math.random() * magicColors.length)],
      });

      // 2. Add 20-30 Magic Sparkle & Star Particles
      const particleCount = 24 + Math.floor(Math.random() * 12);
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 6.5;
        const color = magicColors[Math.floor(Math.random() * magicColors.length)];
        const shapeChoice = Math.random();
        const shape: Particle['shape'] = shapeChoice > 0.6 ? 'star' : (shapeChoice > 0.3 ? 'spark' : 'circle');

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2, // slight upward buoyancy
          size: 2.5 + Math.random() * 4.5,
          color,
          alpha: 1,
          life: 0,
          maxLife: 35 + Math.floor(Math.random() * 25),
          shape,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.25,
        });
      }
    };

    window.addEventListener('pointerdown', handleClick);

    // Draw 4-point or 5-point star
    const drawStar = (context: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      context.beginPath();
      context.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
      context.lineTo(cx, cy - outerRadius);
      context.closePath();
      context.fill();
    };

    // Animation Loop
    let animId: number;
    const render = () => {
      animId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render & Update Shockwave Ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += 2.2;
        r.alpha -= 0.035;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = Math.max(0, r.alpha);
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      // Render & Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.vx *= 0.96; // drag
        p.vy *= 0.96;
        p.rotation += p.rotSpeed;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife || p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        if (p.shape === 'star') {
          drawStar(ctx, 0, 0, 4, p.size * 1.5, p.size * 0.6);
        } else if (p.shape === 'spark') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.8, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handleClick);
      cancelAnimationFrame(animId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full overflow-hidden"
    />
  );
};
