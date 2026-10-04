import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  interpolate,
  staticFile,
  spring,
  useVideoConfig,
  Sequence,
} from 'remotion';
import React from 'react';

export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase timing (frames at 30fps)
  const GATHER_END = 45;      // 1.5s - particles gather
  const OUTLINE_END = 120;    // 2.5s - outline draws
  const FILL_END = 180;       // 2s - gradient fill sweeps in
  const SETTLE_END = 240;     // 2s - glow pulse + settle
  // Hold until end (360 frames = 12s total)

  // === PHASE 1: Particle Gather (0-45) ===
  const gatherProgress = interpolate(frame, [0, GATHER_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // === PHASE 2: Outline Draw (45-120) ===
  const outlineProgress = interpolate(frame, [GATHER_END, OUTLINE_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // === PHASE 3: Fill Reveal (120-180) ===
  const fillProgress = interpolate(frame, [OUTLINE_END, FILL_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // === PHASE 4: Settle/Glow (180-240) ===
  const settleProgress = interpolate(frame, [FILL_END, SETTLE_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Spring for final scale bounce
  const scaleSpring = spring({
    frame: Math.max(0, frame - FILL_END),
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Glow pulse during settle
  const glowPulse = interpolate(
    Math.sin(settleProgress * Math.PI * 3),
    [-1, 1],
    [0, 20],
  );

  // Final logo opacity (fades in during fill phase)
  const logoOpacity = interpolate(frame, [OUTLINE_END, FILL_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Logo scale with spring bounce
  const logoScale = frame > FILL_END
    ? interpolate(scaleSpring, [0, 1], [0.95, 1])
    : interpolate(fillProgress, [0, 1], [0.8, 0.95]);

  // Particle system (deterministic)
  const particles = React.useMemo(() => {
    const pts = [];
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const radius = 400 + (i % 7) * 80;
      pts.push({
        startX: 960 + Math.cos(angle) * radius,
        startY: 540 + Math.sin(angle) * radius,
        endX: 960 + (Math.random() - 0.5) * 200,
        endY: 540 + (Math.random() - 0.5) * 200,
        size: 2 + (i % 5) * 1.5,
        delay: (i % 10) / 10,
        hue: 90 + (i % 40),
      });
    }
    return pts;
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Background subtle radial gradient */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(50,180,50,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Particles gathering toward center */}
      {frame < FILL_END &&
        particles.map((p, i) => {
          const adjustedProgress = interpolate(
            gatherProgress,
            [p.delay, 1],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          );
          const eased = adjustedProgress * adjustedProgress * (3 - 2 * adjustedProgress);
          const x = p.startX + (p.endX - p.startX) * eased;
          const y = p.startY + (p.endY - p.startY) * eased;
          const alpha = interpolate(eased, [0, 0.3, 0.9, 1], [0, 0.8, 0.6, 0]);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                backgroundColor: `hsla(${p.hue}, 70%, 60%, ${alpha})`,
                boxShadow: `0 0 ${p.size * 3}px hsla(${p.hue}, 80%, 50%, ${alpha * 0.5})`,
              }}
            />
          );
        })}

      {/* Outline trace effect - SVG-like stroke reveal */}
      {frame >= GATHER_END && frame < FILL_END + 30 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 500,
          }}
        >
          <svg viewBox="0 0 500 500" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="outlineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7fff00" />
                <stop offset="100%" stopColor="#228b22" />
              </linearGradient>
            </defs>
            {/* Simplified cat silhouette path */}
            <path
              d="M150,350 Q130,320 140,280 Q145,250 160,230 L170,200 Q175,180 190,170 
                 Q200,160 210,165 L220,175 Q230,160 250,155 Q270,150 290,155 
                 L300,165 Q310,160 320,170 Q335,180 340,200 L350,230 
                 Q365,250 370,280 Q380,320 360,350 Q350,370 330,380 
                 L310,385 Q290,390 270,388 Q250,390 230,385 L210,380 
                 Q190,370 170,360 Z
                 M180,220 Q185,210 195,215 Q200,220 195,225 Q185,230 180,220 Z
                 M310,220 Q315,210 325,215 Q330,220 325,225 Q315,230 310,220 Z"
              fill="none"
              stroke="url(#outlineGrad)"
              strokeWidth="3"
              strokeDasharray="1200"
              strokeDashoffset={interpolate(outlineProgress, [0, 1], [1200, 0])}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 ${4 + glowPulse}px rgba(100,255,50,0.6))`,
              }}
            />
          </svg>
        </div>
      )}

      {/* Main logo with fill reveal */}
      {frame >= OUTLINE_END && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              opacity: logoOpacity,
              transform: `scale(${logoScale})`,
              filter: frame >= FILL_END
                ? `drop-shadow(0 0 ${8 + glowPulse}px rgba(100,255,50,0.4))`
                : 'none',
            }}
          >
            {/* Gradient mask wipe for fill reveal */}
            <div
              style={{
                overflow: 'hidden',
                clipPath: `inset(0 ${(1 - fillProgress) * 100}% 0 0)`,
              }}
            >
              <Img
                src={staticFile('cat_logo.png')}
                style={{
                  width: 400,
                  height: 'auto',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Sparkle particles during settle */}
      {frame >= FILL_END && frame < SETTLE_END + 60 && (
        <>
          {Array.from({ length: 20 }).map((_, i) => {
            const t = settleProgress + i * 0.05;
            const angle = (i / 20) * Math.PI * 2 + t * 2;
            const r = 180 + Math.sin(t * 5 + i) * 30;
            const x = 960 + Math.cos(angle) * r;
            const y = 540 + Math.sin(angle) * r;
            const sparkleAlpha = interpolate(
              Math.sin(t * 10 + i * 2),
              [-1, 1],
              [0, 0.9],
            );
            return (
              <div
                key={`sparkle-${i}`}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  backgroundColor: `rgba(180,255,100,${sparkleAlpha})`,
                  boxShadow: `0 0 6px rgba(150,255,80,${sparkleAlpha})`,
                }}
              />
            );
          })}
        </>
      )}
    </AbsoluteFill>
};