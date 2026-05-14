import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { datasets } from '../services/api';

const SAMPLE_SCHEMA = {
  type: 'object',
  required: ['id', 'name', 'email', 'age'],
  properties: {
    id: { type: 'integer', description: 'Unique identifier' },
    name: { type: 'string', description: 'Full name' },
    email: { type: 'string', format: 'email' },
    age: { type: 'integer', minimum: 18, maximum: 80 },
    country: { type: 'string', description: 'Country of residence' },
  },
};

function SchemaBuilder() {
  const navigate = useNavigate();
  const [schemaText, setSchemaText] = useState(JSON.stringify(SAMPLE_SCHEMA, null, 2));
  const [count, setCount] = useState(10);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [schemaError, setSchemaError] = useState(null);

  const validateSchema = () => {
    try {
      const parsed = JSON.parse(schemaText);
      setSchemaError(null);
      return parsed;
    } catch (e) {
      setSchemaError('Invalid JSON: ' + e.message);
      return null;
    }
  };

  const handleGenerate = async () => {
    const schema = validateSchema();
    if (!schema) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await datasets.generateFromSchema({
        schema,
        count: parseInt(count),
        name: name || 'Schema-Generated Dataset',
        description,
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = result?.records?.length > 0 ? Object.keys(result.records[0]) : [];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Schema-First Generator</h1>
      </div>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Provide a JSON Schema and the AI will generate synthetic records conforming to it exactly.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Schema Editor */}
        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>JSON Schema</label>
          <textarea
            value={schemaText}
            onChange={e => { setSchemaText(e.target.value); setSchemaError(null); }}
            rows={20}
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              padding: '0.75rem',
              border: schemaError ? '2px solid #EF4444' : '1px solid #d1d5db',
              borderRadius: '6px',
              boxSizing: 'border-box',
            }}
          />
          {schemaError && <div style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>{schemaError}</div>}
        </div>

        {/* Config */}
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Dataset Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My Schema Dataset"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe this dataset..."
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Number of Records: {count}</label>
            <input
              type="range"
              min={1}
              max={100}
              value={count}
              onChange={e => setCount(e.target.value)}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
              <span>1</span><span>100</span>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? '#9CA3AF' : '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Generating...' : 'Generate from Schema'}
          </button>

          {error && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#FEE2E2', color: '#991B1B', borderRadius: '6px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {result && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#D1FAE5', color: '#065F46', borderRadius: '6px', fontSize: '0.9rem' }}>
              Generated {result.validRecords} valid records (out of {result.totalGenerated} total).{' '}
              <span
                style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => navigate(`/dataset/${result.dataset?.id}`)}
              >
                View Dataset
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Preview Table */}
      {result?.records?.length > 0 && (
        <div>
          <h3>Preview ({result.records.length} records)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F3F4F6' }}>
                  {columns.map(col => (
                    <th key={col} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', border: '1px solid #e5e7eb' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.records.slice(0, 20).map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#F9FAFB' }}>
                    {columns.map(col => (
                      <td key={col} style={{ padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchemaBuilder;
