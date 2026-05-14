import React, { useState } from 'react';
import { datasets } from '../services/api';

const SAMPLE_SCHEMA = `{
  "columns": [
    { "name": "id", "type": "number", "nullable": false, "min": 1, "max": 100000 },
    { "name": "email", "type": "string", "nullable": false, "format": "email", "is_pii": true },
    { "name": "age", "type": "number", "nullable": true, "min": 0, "max": 120 },
    { "name": "country", "type": "enum", "enum_values": ["US", "DE", "FR", "JP"], "nullable": false },
    { "name": "signup_at", "type": "datetime", "nullable": false }
  ]
}`;

function EdgeCases() {
  const [schemaText, setSchemaText] = useState(SAMPLE_SCHEMA);
  const [name, setName] = useState('');
  const [count, setCount] = useState(25);
  const [focus, setFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setResult(null); setParseError(null);
    let schema;
    try {
      schema = JSON.parse(schemaText);
    } catch (err) {
      setParseError('Invalid JSON: ' + err.message);
      return;
    }
    setLoading(true);
    try {
      const res = await datasets.edgeCases({
        schema,
        name: name || undefined,
        count: Number(count) || 25,
        focus: focus || undefined,
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
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>⚠️ Edge-Case Generator</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Generate edge-case rows that stress-test the boundaries of your schema.</p>

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Dataset Name (optional)</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Row Count</label>
            <input type="number" min="1" max="200" value={count} onChange={(e) => setCount(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Focus (optional)</label>
            <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. unicode strings, leap-day"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Schema (JSON)</label>
          <textarea value={schemaText} onChange={(e) => setSchemaText(e.target.value)} rows={12}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: 13 }} />
          {parseError && <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 6 }}>{parseError}</div>}
        </div>
        <button type="submit" disabled={loading}
          style={{ background: loading ? '#9ca3af' : '#F59E0B', color: '#fff', padding: '10px 22px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Generating...' : 'Generate Edge Cases'}
        </button>
      </form>

      {error && <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      {result && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Edge-Case Result</h2>
          {result.result?.edge_case_categories && (
            <div style={{ marginBottom: 12 }}>
              <strong>Categories Covered:</strong>
              <div style={{ marginTop: 6 }}>
                {result.result.edge_case_categories.map((c, i) => (
                  <span key={i} style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 12, fontSize: 12, marginRight: 6, marginBottom: 6 }}>{c}</span>
                ))}
              </div>
            </div>
          )}
          <pre style={{ background: '#f9fafb', padding: 14, borderRadius: 8, fontSize: 12, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(result.result || result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default EdgeCases;
