import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { datasets } from '../services/api';

const EXPORT_FORMATS = ['json', 'jsonl', 'csv', 'sql'];

function DatasetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const [privacyScore, setPrivacyScore] = useState(null);
  const [loadingPrivacy, setLoadingPrivacy] = useState(false);
  const [activeTab, setActiveTab] = useState('data');

  useEffect(() => {
    loadDataset();
  }, [id]);

  const loadDataset = async () => {
    setLoading(true);
    try {
      const data = await datasets.getOne(id);
      setDataset(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/datasets/${id}/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Export failed');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(dataset?.name || 'dataset').replace(/[^a-z0-9]/gi, '_')}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(null);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    setValidation(null);
    try {
      const result = await datasets.validateDataset(id);
      setValidation(result);
    } catch (err) {
      alert('Validation failed: ' + err.message);
    } finally {
      setValidating(false);
    }
  };

  const handlePrivacyScore = async () => {
    setLoadingPrivacy(true);
    setPrivacyScore(null);
    try {
      const result = await datasets.getPrivacyScore(id);
      setPrivacyScore(result);
      setActiveTab('privacy');
    } catch (err) {
      alert('Privacy score failed: ' + err.message);
    } finally {
      setLoadingPrivacy(false);
    }
  };

  const getRows = () => {
    if (!dataset?.data) return [];
    const d = dataset.data;
    if (Array.isArray(d)) return d;
    const firstArray = Object.values(d).find(v => Array.isArray(v));
    return firstArray || [];
  };

  if (loading) return <div className="loading-page" style={{ padding: '2rem', textAlign: 'center' }}>Loading dataset...</div>;
  if (error) return <div className="error-page" style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
  if (!dataset) return null;

  const rows = getRows();
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  const sensitiveCategories = ['medical', 'financial', 'customers'];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{dataset.name}</h1>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>
            {dataset.category} · {dataset.record_count} records · {dataset.status}
          </div>
        </div>
      </div>

      {/* Description */}
      {dataset.description && (
        <p style={{ color: '#555', marginBottom: '1.5rem' }}>{dataset.description}</p>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Export:</span>
          {EXPORT_FORMATS.map(fmt => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              disabled={exporting === fmt}
              style={{
                padding: '0.4rem 0.8rem',
                cursor: 'pointer',
                background: exporting === fmt ? '#ccc' : '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
              }}
            >
              {exporting === fmt ? '...' : fmt}
            </button>
          ))}
        </div>

        <button
          onClick={handleValidate}
          disabled={validating}
          style={{
            padding: '0.4rem 0.8rem',
            cursor: 'pointer',
            background: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.85rem',
          }}
        >
          {validating ? 'Validating...' : 'Validate Schema'}
        </button>

        {sensitiveCategories.includes(dataset.category) && (
          <button
            onClick={handlePrivacyScore}
            disabled={loadingPrivacy}
            style={{
              padding: '0.4rem 0.8rem',
              cursor: 'pointer',
              background: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.85rem',
            }}
          >
            {loadingPrivacy ? 'Scoring...' : 'Privacy Score'}
          </button>
        )}
      </div>

      {/* Validation Result */}
      {validation && (
        <div style={{
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          borderRadius: '6px',
          background: validation.valid ? '#D1FAE5' : '#FEE2E2',
          color: validation.valid ? '#065F46' : '#991B1B',
          border: `1px solid ${validation.valid ? '#6EE7B7' : '#FCA5A5'}`,
        }}>
          {validation.valid
            ? `Schema valid. Required keys present: ${validation.requiredKeys.join(', ')}`
            : `Schema invalid. Missing keys: ${validation.missingKeys.join(', ')}`}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #e5e7eb', marginBottom: '1rem' }}>
        {['data', 'schema', 'privacy'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.6rem 1.2rem',
              cursor: 'pointer',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #3B82F6' : '2px solid transparent',
              background: 'none',
              fontWeight: activeTab === tab ? 700 : 400,
              color: activeTab === tab ? '#3B82F6' : '#666',
              marginBottom: '-2px',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div>
          {rows.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No rows found in dataset.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Showing {Math.min(rows.length, 100)} of {rows.length} rows
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#F3F4F6' }}>
                    {columns.map(col => (
                      <th key={col} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', border: '1px solid #e5e7eb', fontWeight: 600 }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 100).map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#F9FAFB' }}>
                      {columns.map(col => (
                        <td key={col} style={{ padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Schema Tab */}
      {activeTab === 'schema' && (
        <div>
          <h3>Schema Configuration</h3>
          <pre style={{ background: '#F3F4F6', padding: '1rem', borderRadius: '6px', overflow: 'auto', fontSize: '0.85rem' }}>
            {JSON.stringify(dataset.schema_config || {}, null, 2)}
          </pre>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div>
          {!privacyScore ? (
            <div style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
              {sensitiveCategories.includes(dataset.category)
                ? 'Click "Privacy Score" to analyze this dataset for k-anonymity risks.'
                : 'Privacy scoring is only available for medical, financial, and customer datasets.'}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, minWidth: '150px', background: '#F3F4F6', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: privacyScore.privacy_score >= 70 ? '#10B981' : privacyScore.privacy_score >= 40 ? '#F59E0B' : '#EF4444' }}>
                    {privacyScore.privacy_score}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Privacy Score</div>
                </div>
                <div style={{ flex: 1, minWidth: '150px', background: '#F3F4F6', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700 }}>{privacyScore.k_anonymity_estimate}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>K-Anonymity</div>
                </div>
                <div style={{ flex: 1, minWidth: '150px', background: '#F3F4F6', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700 }}>{((privacyScore.uniqueness_ratio || 0) * 100).toFixed(0)}%</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Uniqueness</div>
                </div>
              </div>
              <p style={{ color: '#555', marginBottom: '1rem' }}>{privacyScore.summary}</p>
              {privacyScore.risks?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4>Identified Risks</h4>
                  {privacyScore.risks.map((r, i) => (
                    <div key={i} style={{
                      padding: '0.5rem 0.75rem', marginBottom: '0.5rem', borderRadius: '4px',
                      background: r.severity === 'HIGH' ? '#FEE2E2' : r.severity === 'MEDIUM' ? '#FEF3C7' : '#D1FAE5',
                      fontSize: '0.9rem',
                    }}>
                      <strong>{r.field}</strong>: {r.risk} <span style={{ opacity: 0.7 }}>({r.severity})</span>
                    </div>
                  ))}
                </div>
              )}
              {privacyScore.recommendations?.length > 0 && (
                <div>
                  <h4>Recommendations</h4>
                  <ul>
                    {privacyScore.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DatasetDetail;
