import React, { useEffect, useState } from 'react';

// VIZ 1: Generation volume bar/line chart (rows per day per dataset)
export default function SynthVolumeChart() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    fetch('/api/custom-views/volume', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setData)
      .catch(e => setError(e.message));
  }, []);

  if (error) return <div style={{ color: '#ef4444', padding: 12 }}>Volume error: {error}</div>;
  if (!data) return <div style={{ color: '#a0a0b8', padding: 12 }}>Loading volume...</div>;

  const colors = ['#6366f1', '#a855f7', '#ec4899', '#10b981'];
  const allRows = data.series.flatMap(s => s.points.map(p => p.rows));
  const maxR = Math.max(...allRows, 1);
  const W = 720, H = 240, padL = 50, padB = 28, padT = 16, padR = 12;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const days = data.series[0]?.points.length || 14;

  return (
    <div style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ color: '#e8e8f0', fontSize: 16, fontWeight: 600 }}>Generation Volume (last {data.days} days)</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {data.series.map((s, i) => (
            <span key={s.dataset} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#a0a0b8' }}>
              <span style={{ width: 10, height: 10, background: colors[i % colors.length], borderRadius: 2 }} />
              {s.dataset}
            </span>
          ))}
        </div>
      </div>
      <svg width={W} height={H} style={{ width: '100%', height: 'auto', maxWidth: W }}>
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const y = padT + innerH * (1 - t);
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#2a2a4a" strokeDasharray="3 4" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#6a6a80">{Math.round(maxR * t)}</text>
            </g>
          );
        })}
        {data.series.map((s, si) => {
          const path = s.points.map((p, i) => {
            const x = padL + (innerW * i) / (days - 1);
            const y = padT + innerH * (1 - p.rows / maxR);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
          }).join(' ');
          return (
            <g key={s.dataset}>
              <path d={path} stroke={colors[si % colors.length]} strokeWidth={2} fill="none" />
              {s.points.map((p, i) => {
                const x = padL + (innerW * i) / (days - 1);
                const y = padT + innerH * (1 - p.rows / maxR);
                return <circle key={i} cx={x} cy={y} r={2.5} fill={colors[si % colors.length]} />;
              })}
            </g>
          );
        })}
        {data.series[0].points.map((p, i) => {
          if (i % 3 !== 0) return null;
          const x = padL + (innerW * i) / (days - 1);
          return <text key={i} x={x} y={H - padB + 16} textAnchor="middle" fontSize="10" fill="#6a6a80">{p.date.slice(5)}</text>;
        })}
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 12 }}>
        {data.totals.map(t => (
          <div key={t.dataset} style={{ background: '#1a1a30', padding: 10, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: '#6a6a80' }}>{t.dataset}</div>
            <div style={{ fontSize: 18, color: '#e8e8f0', fontWeight: 600 }}>{t.total.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
