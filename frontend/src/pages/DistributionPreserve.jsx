import React, { useState } from 'react';
import { datasets } from '../services/api';
import FullFieldPresets from '../components/FullFieldPresets';
import AIReport from '../components/AIReport';

const SAMPLE = `[
  { "id": 1, "age": 32, "country": "US", "spend": 120.50, "tier": "gold" },
  { "id": 2, "age": 28, "country": "DE", "spend": 45.10, "tier": "silver" },
  { "id": 3, "age": 41, "country": "US", "spend": 210.00, "tier": "gold" },
  { "id": 4, "age": 24, "country": "FR", "spend": 18.75, "tier": "bronze" }
]`;
const EXAMPLES = [
  { label: 'Tabular distribution', values: { name: 'Example product metrics', category: 'tabular', rowCount: 25, samplesText: JSON.stringify([{ item_id: 101, units: 12, market: 'North', rating: 4 }, { item_id: 102, units: 3, market: 'South', rating: 5 }, { item_id: 103, units: 8, market: 'North', rating: 3 }], null, 2) } },
  { label: 'Time-series observations', values: { name: 'Example hourly readings', category: 'timeseries', rowCount: 48, samplesText: JSON.stringify([{ hour: '2026-01-01T08:00:00Z', temperature: 19.2, status: 'normal' }, { hour: '2026-01-01T09:00:00Z', temperature: 20.1, status: 'normal' }, { hour: '2026-01-01T10:00:00Z', temperature: 18.8, status: 'review' }], null, 2) } },
  { label: 'Survey results', values: { name: 'Example service survey', category: 'surveys', rowCount: 100, samplesText: JSON.stringify([{ response_id: 1, score: 5, channel: 'web', comment: 'Easy to follow' }, { response_id: 2, score: 3, channel: 'email', comment: 'Could be clearer' }, { response_id: 3, score: 4, channel: 'web', comment: 'Helpful details' }], null, 2) } },
];

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
        <FullFieldPresets value={{ samplesText, name, category, rowCount }} presets={EXAMPLES} disabled={loading} onChange={(values) => { setSamplesText(values.samplesText); setName(values.name); setCategory(values.category); setRowCount(values.rowCount); setError(null); setParseError(null); setResult(null); }} />
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
          <AIReport response={result.result || result} title="Distribution-preserving dataset report" />
        </div>
      )}
    </div>
  );
}

export default DistributionPreserve;
