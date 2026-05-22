import React, { useEffect, useState } from 'react';

// VIZ 2: Quality metric heatmap (metric rows x dataset columns)
export default function SynthQualityHeatmap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    fetch('/api/custom-views/quality-heatmap', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setData)
      .catch(e => setError(e.message));
  }, []);

  if (error) return <div style={{ color: '#ef4444', padding: 12 }}>Heatmap error: {error}</div>;
  if (!data) return <div style={{ color: '#a0a0b8', padding: 12 }}>Loading heatmap...</div>;

  const colorFor = (v) => {
    // 0..1 -> red -> amber -> green
    if (v < 0.5) {
      const t = v / 0.5;
      const r = 239, g = Math.round(68 + (158 - 68) * t), b = Math.round(68 + (11 - 68) * t);
      return `rgb(${r},${g},${b})`;
    }
    const t = (v - 0.5) / 0.5;
    const r = Math.round(245 + (16 - 245) * t), g = Math.round(158 + (185 - 158) * t), b = Math.round(11 + (129 - 11) * t);
    return `rgb(${r},${g},${b})`;
  };

  const cellByKey = {};
  data.cells.forEach(c => { cellByKey[`${c.metric}|${c.dataset}`] = c.value; });

  return (
    <div style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 12, padding: 18 }}>
      <h3 style={{ color: '#e8e8f0', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Quality Metrics Heatmap</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 4, minWidth: 540 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', color: '#a0a0b8', fontSize: 11, fontWeight: 500, padding: 6 }}></th>
              {data.datasets.map(d => (
                <th key={d} style={{ color: '#a0a0b8', fontSize: 11, fontWeight: 500, padding: 6, textAlign: 'center', minWidth: 90 }}>
                  {d.replace(/_synth$/, '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.metrics.map(m => (
              <tr key={m}>
                <td style={{ color: '#e8e8f0', fontSize: 12, padding: 6, fontWeight: 500, whiteSpace: 'nowrap' }}>{m}</td>
                {data.datasets.map(d => {
                  const v = cellByKey[`${m}|${d}`] ?? 0;
                  return (
                    <td key={d} style={{
                      background: colorFor(v),
                      color: v > 0.6 ? '#0a0a0f' : '#fff',
                      padding: '10px 8px',
                      borderRadius: 6,
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: 12,
                      minWidth: 80,
                    }}>
                      {v.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, fontSize: 11, color: '#a0a0b8' }}>
        <span>Low</span>
        <div style={{ flex: '0 0 220px', height: 10, borderRadius: 6, background: 'linear-gradient(90deg, rgb(239,68,68), rgb(245,158,11), rgb(16,185,129))' }} />
        <span>High</span>
      </div>
    </div>
  );
}
