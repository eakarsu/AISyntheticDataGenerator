import React, { useState } from 'react';
import { datasets } from '../services/api';

const SAMPLE = `[
  { "id": 1, "name": "Alice", "email": "alice@example.com", "age": 32, "country": "US" },
  { "id": 2, "name": "Bob", "email": "bob@example.com", "age": 28, "country": "DE" }
]`;

function SchemaInfer() {
  const [samplesText, setSamplesText] = useState(SAMPLE);
  const [name, setName] = useState('');
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
      const res = await datasets.schemaInfer({ samples, name: name || undefined });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>🧠 Schema Inference</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Paste sample rows and let AI infer column types, formats, and PII.</p>

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Dataset Name (optional)</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. customers"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Sample Rows (JSON array)</label>
          <textarea value={samplesText} onChange={(e) => setSamplesText(e.target.value)} rows={10}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: 13 }} />
          {parseError && <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 6 }}>{parseError}</div>}
        </div>
        <button type="submit" disabled={loading}
          style={{ background: loading ? '#9ca3af' : '#3B82F6', color: '#fff', padding: '10px 22px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Inferring...' : 'Infer Schema'}
        </button>
      </form>

      {error && <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      {result && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Inferred Schema</h2>
          <pre style={{ background: '#f9fafb', padding: 14, borderRadius: 8, fontSize: 12, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(result.schema || result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default SchemaInfer;
