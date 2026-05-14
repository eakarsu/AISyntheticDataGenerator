import React, { useState } from 'react';
import { datasets } from '../services/api';

const SAMPLE = `[
  { "id": 1, "name": "Alice Smith", "email": "alice@example.com", "phone": "+1-555-0123", "ssn": "123-45-6789" },
  { "id": 2, "name": "Bob Jones", "email": "bob@example.com", "phone": "+1-555-9876", "ssn": "987-65-4321" }
]`;

function RedactPII() {
  const [recordsText, setRecordsText] = useState(SAMPLE);
  const [strategy, setStrategy] = useState('token-replacement');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setResult(null); setParseError(null);
    let records;
    try {
      records = JSON.parse(recordsText);
      if (!Array.isArray(records) || records.length === 0) {
        setParseError('records must be a non-empty JSON array.');
        return;
      }
    } catch (err) {
      setParseError('Invalid JSON: ' + err.message);
      return;
    }
    setLoading(true);
    try {
      const res = await datasets.redactPII({ records, strategy });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>🛡️ PII Redaction</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Identify PII fields and redact them with the chosen strategy.</p>

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Redaction Strategy</label>
          <select value={strategy} onChange={(e) => setStrategy(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <option value="token-replacement">Token Replacement</option>
            <option value="masking">Masking (e.g. ***)</option>
            <option value="hashing">Hashing</option>
            <option value="generalization">Generalization</option>
            <option value="suppression">Suppression (remove)</option>
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Records (JSON array)</label>
          <textarea value={recordsText} onChange={(e) => setRecordsText(e.target.value)} rows={10}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: 13 }} />
          {parseError && <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 6 }}>{parseError}</div>}
        </div>
        <button type="submit" disabled={loading}
          style={{ background: loading ? '#9ca3af' : '#EF4444', color: '#fff', padding: '10px 22px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Redacting...' : 'Redact PII'}
        </button>
      </form>

      {error && <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      {result && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Redaction Result</h2>
          {result.result?.pii_fields && (
            <div style={{ marginBottom: 12 }}>
              <strong>PII Fields Detected:</strong>
              <div style={{ marginTop: 6 }}>
                {result.result.pii_fields.map((f, i) => (
                  <span key={i} style={{ display: 'inline-block', background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: 12, fontSize: 12, marginRight: 6, marginBottom: 6 }}>{f}</span>
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

export default RedactPII;
