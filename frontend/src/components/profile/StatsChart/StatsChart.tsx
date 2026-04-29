import { FC } from 'react';
import { motion } from 'framer-motion';

interface StatsChartProps {
  stats?: Record<string, number>;
}

const STATS_KEYS = ['STR', 'AGI', 'VIT', 'INT', 'LUK', 'SPD'];
const MAX_STAT = 100;

const StatsChart: FC<StatsChartProps> = ({ stats = {} }) => {
  const size = 300;
  const center = size / 2;
  const radius = (size / 2) - 40;

  const getPoint = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const distance = (value / MAX_STAT) * radius;
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance
    };
  };

  const points = STATS_KEYS.map((key, i) => getPoint(stats[key] || 0, i, STATS_KEYS.length));
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const gridPoints = [1, 0.75, 0.5, 0.25].map(scale => {
    return STATS_KEYS.map((_, i) => getPoint(MAX_STAT * scale, i, STATS_KEYS.length))
      .map(p => `${p.x},${p.y}`).join(' ');
  });

  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {gridPoints.map((pts, i) => (
            <polygon key={i} points={pts} fill="none" stroke="var(--border)" strokeWidth="2" />
          ))}
          {STATS_KEYS.map((_, i) => {
            const edge = getPoint(MAX_STAT, i, STATS_KEYS.length);
            return (
              <line key={i} x1={center} y1={center} x2={edge.x} y2={edge.y} stroke="var(--border)" strokeWidth="2" />
            );
          })}
          <motion.polygon
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            points={polygonPoints}
            fill="rgba(var(--main-color-rgb), 0.3)"
            stroke="var(--main-color)"
            strokeWidth="4"
            style={{ transformOrigin: 'center' }}
          />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--neutral-white)" />
          ))}
          {STATS_KEYS.map((key, i) => {
            const p = getPoint(MAX_STAT + 30, i, STATS_KEYS.length);
            const val = stats[key] || 0;
            return (
              <g key={key}>
                <text
                  x={p.x}
                  y={p.y - 8}
                  fill="var(--text)"
                  fontSize="12"
                  fontWeight="900"
                  fontStyle="italic"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="uppercase tracking-widest"
                >
                  {key}
                </text>
                <text
                  x={p.x}
                  y={p.y + 12}
                  fill="var(--main-color)"
                  fontSize="16"
                  fontWeight="900"
                  fontStyle="italic"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {val}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default StatsChart;
