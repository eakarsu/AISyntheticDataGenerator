import React, { useState } from 'react';

function AIResultDisplay({ result, category, categoryInfo, onSave, onClose }) {
  const [viewMode, setViewMode] = useState('formatted');

  const renderValue = (value, depth = 0) => {
    if (value === null || value === undefined) return <span className="ai-null">null</span>;
    if (typeof value === 'boolean') return <span className="ai-boolean">{value ? 'true' : 'false'}</span>;
    if (typeof value === 'number') return <span className="ai-number">{value.toLocaleString()}</span>;
    if (typeof value === 'string') {
      if (value.length > 200) {
        return <span className="ai-string ai-string-long">{value}</span>;
      }
      return <span className="ai-string">{value}</span>;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="ai-empty">[ ]</span>;
      if (typeof value[0] !== 'object') {
        return (
          <span className="ai-array-inline">
            {value.map((v, i) => (
              <span key={i} className="ai-tag">{String(v)}</span>
            ))}
          </span>
        );
      }
      return renderTable(value);
    }
    if (typeof value === 'object') {
      return renderObjectCard(value, depth);
    }
    return <span>{String(value)}</span>;
  };

  const renderTable = (records) => {
    if (!records || records.length === 0) return null;
    const keys = [...new Set(records.flatMap((r) => Object.keys(r)))];

    return (
      <div className="ai-table-wrapper">
        <table className="ai-table">
          <thead>
            <tr>
              {keys.map((key) => (
                <th key={key}>{formatKey(key)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, idx) => (
              <tr key={idx}>
                {keys.map((key) => (
                  <td key={key}>
                    {typeof record[key] === 'object' && record[key] !== null
                      ? (Array.isArray(record[key])
                        ? record[key].map((v, i) => <span key={i} className="ai-tag">{String(v)}</span>)
                        : <span className="ai-mini-json">{JSON.stringify(record[key])}</span>)
                      : renderValue(record[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderObjectCard = (obj, depth = 0) => {
    return (
      <div className={`ai-object-card depth-${Math.min(depth, 3)}`}>
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="ai-field">
            <span className="ai-field-label">{formatKey(key)}</span>
            <span className="ai-field-value">{renderValue(value, depth + 1)}</span>
          </div>
        ))}
      </div>
    );
  };

  const formatKey = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const renderFormattedResult = (data) => {
    if (!data) return <div className="no-data">No data generated</div>;

    return (
      <div className="ai-result-content">
        {Object.entries(data).map(([key, value]) => {
          if (key === 'metadata') {
            return (
              <div key={key} className="ai-metadata-section">
                <h4>Generation Metadata</h4>
                {renderObjectCard(value)}
              </div>
            );
          }

          if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
            return (
              <div key={key} className="ai-section">
                <h4 className="ai-section-title">
                  {formatKey(key)}
                  <span className="ai-count">{value.length} records</span>
                </h4>
                {renderTable(value)}
              </div>
            );
          }

          return (
            <div key={key} className="ai-section">
              <h4 className="ai-section-title">{formatKey(key)}</h4>
              {renderValue(value)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="ai-result-panel">
      <div className="ai-result-header">
        <div className="ai-result-title">
          <span className="ai-spark">✨</span>
          <div>
            <h3>AI Generated {categoryInfo.label}</h3>
            <div className="ai-result-meta">
              <span className="meta-chip">
                <span className="meta-icon">🤖</span>
                {result.model}
              </span>
              <span className="meta-chip">
                <span className="meta-icon">⚡</span>
                {result.tokens_used} tokens
              </span>
              <span className="meta-chip">
                <span className="meta-icon">⏱️</span>
                {(result.duration_ms / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
        </div>
        <div className="ai-result-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'formatted' ? 'active' : ''}`}
              onClick={() => setViewMode('formatted')}
            >
              Formatted
            </button>
            <button
              className={`toggle-btn ${viewMode === 'json' ? 'active' : ''}`}
              onClick={() => setViewMode('json')}
            >
              JSON
            </button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onSave}>
            💾 Save as Dataset
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div className="ai-result-body">
        {viewMode === 'formatted' ? (
          renderFormattedResult(result.result)
        ) : (
          <pre className="ai-json-view">
            {JSON.stringify(result.result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default AIResultDisplay;
