// ...existing code...

export default function DecorativeBlobs() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <style>{`
        .blob-anim-1 { transform-origin: 50% 50%; animation: float1 12s ease-in-out infinite; }
        .blob-anim-2 { transform-origin: 50% 50%; animation: float2 16s ease-in-out infinite; }
        .blob-anim-3 { transform-origin: 50% 50%; animation: float3 20s ease-in-out infinite; }
        @keyframes float1 { 0% { transform: translateY(0) rotate(0deg) scale(1); } 50% { transform: translateY(-18px) rotate(3deg) scale(1.02); } 100% { transform: translateY(0) rotate(0deg) scale(1); } }
        @keyframes float2 { 0% { transform: translateY(0) rotate(0deg) scale(1); } 50% { transform: translateY(-24px) rotate(-2deg) scale(1.03); } 100% { transform: translateY(0) rotate(0deg) scale(1); } }
        @keyframes float3 { 0% { transform: translateY(0) rotate(0deg) scale(1); } 50% { transform: translateY(-12px) rotate(1deg) scale(1.01); } 100% { transform: translateY(0) rotate(0deg) scale(1); } }
      `}</style>
      <svg width="100%" height="100%" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.14" />
          </linearGradient>
          <linearGradient id="g2" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#86efac" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        <g transform="translate(-100,-50)">
          <ellipse className="blob-anim-1" cx="300" cy="180" rx="380" ry="160" fill="url(#g1)" />
          <ellipse className="blob-anim-2" cx="900" cy="420" rx="360" ry="200" fill="url(#g2)" />
          <path className="blob-anim-3" d="M150 420 C220 320, 380 300, 480 360 C580 420, 760 460, 920 380 L920 620 L0 620 Z" fill="#fef3c7" opacity="0.06" />
        </g>
      </svg>
    </div>
  );
}
