import React, { useState } from 'react';

// NON-VIZ 1: Dataset specification PDF/text generator
export default function SynthSpecPdf() {
  const [dataset, setDataset] = useState('customers_synth');
  const [rows, setRows] = useState(10000);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSpec = async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('token') || '';
      const url = `/api/custom-views/spec-pdf?dataset=${encodeURIComponent(dataset)}&rows=${encodeURIComponent(rows)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const txt = await res.text();
      setPreview(txt);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const download = () => {
    const blob = new Blob([preview], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${dataset}-spec.txt`;
    a.click();
  };

  return (
    <div style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 12, padding: 18 }}>
      <h3 style={{ color: '#e8e8f0', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Dataset Specification (PDF/Text)</h3>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: 11, color: '#a0a0b8', marginBottom: 4 }}>Dataset</label>
          <input value={dataset} onChange={e => setDataset(e.target.value)}
            style={{ width: '100%', background: '#1a1a30', border: '1px solid #2a2a4a', color: '#e8e8f0', padding: 8, borderRadius: 6, fontSize: 13 }} />
        </div>
        <div style={{ flex: '0 0 140px' }}>
          <label style={{ display: 'block', fontSize: 11, color: '#a0a0b8', marginBottom: 4 }}>Rows</label>
          <input type="number" value={rows} onChange={e => setRows(Number(e.target.value) || 0)}
            style={{ width: '100%', background: '#1a1a30', border: '1px solid #2a2a4a', color: '#e8e8f0', padding: 8, borderRadius: 6, fontSize: 13 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <button onClick={fetchSpec} disabled={loading} className="btn btn-primary">
            {loading ? 'Loading...' : 'Generate Spec'}
          </button>
          <button onClick={download} disabled={!preview} className="btn btn-secondary">Download</button>
        </div>
      </div>
      {error && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{error}</div>}
      {preview && (
        <pre style={{
          background: '#0a0a0f', color: '#a0a0b8', padding: 14, borderRadius: 8,
          fontSize: 12, maxHeight: 320, overflow: 'auto', whiteSpace: 'pre-wrap',
          border: '1px solid #2a2a4a',
        }}>{preview}</pre>
      )}
    </div>
  );
}
