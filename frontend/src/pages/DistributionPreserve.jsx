import React, { useState } from 'react';
import { datasets } from '../services/api';

const SAMPLE = `[
  { "id": 1, "age": 32, "country": "US", "spend": 120.50, "tier": "gold" },
  { "id": 2, "age": 28, "country": "DE", "spend": 45.10, "tier": "silver" },
  { "id": 3, "age": 41, "country": "US", "spend": 210.00, "tier": "gold" },
  { "id": 4, "age": 24, "country": "FR", "spend": 18.75, "tier": "bronze" }
]`;

function DistributionPreserve() {
  const [samplesText, setSamplesText] = useState(SAMPLE);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('tabular');
  const [rowCount, setRowCount] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setResult(null); setParseError(null);
    let samples;
    try {
      samples = JSON.parse(samplesText);
      if (!Array.isArray(samples) || samples.length === 0) {
        setParseError('samples must be a non-empty JSON array of objects.');
        return;
      }
    } catch (err) {
      setParseError('Invalid JSON: ' + err.message);
      return;
    }
    setLoading(true);
    try {
      const res = await datasets.distributionPreserve({
        samples,
        name: name || undefined,
        category,
        rowCount: Number(rowCount) || 25,
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>📊 Distribution-Preserving Generator</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Generate synthetic rows that preserve the statistical distributions of your real data samples.</p>

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Dataset Name (optional)</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <option value="tabular">Tabular</option>
              <option value="customers">Customers</option>
              <option value="medical">Medical</option>
              <option value="financial">Financial</option>
              <option value="timeseries">Time Series</option>
              <option value="logs">Logs</option>
              <option value="surveys">Surveys</option>
              <option value="reviews">Reviews</option>
              <option value="iot">IoT</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Row Count</label>
            <input type="number" min="1" max="500" value={rowCount} onChange={(e) => setRowCount(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Real-Data Samples (JSON array)</label>
          <textarea value={samplesText} onChange={(e) => setSamplesText(e.target.value)} rows={10}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: 13 }} />
          {parseError && <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 6 }}>{parseError}</div>}
        </div>
        <button type="submit" disabled={loading}
          style={{ background: loading ? '#9ca3af' : '#3B82F6', color: '#fff', padding: '10px 22px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {error && <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      {result && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Result</h2>
          <pre style={{ background: '#f9fafb', padding: 14, borderRadius: 8, fontSize: 12, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(result.result || result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default DistributionPreserve;
