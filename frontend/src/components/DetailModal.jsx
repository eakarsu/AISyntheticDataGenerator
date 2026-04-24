import React, { useState } from 'react';

function DetailModal({ item, category, onClose, onEdit, onDelete }) {
  const [activeTab, setActiveTab] = useState('overview');

  const renderDataPreview = (data) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <div className="no-data">No data records available</div>;
    }

    const records = Array.isArray(data) ? data : [data];
    if (records.length === 0) return <div className="no-data">No records</div>;

    const allKeys = [...new Set(records.flatMap((r) => Object.keys(r)))];

    return (
      <div className="data-preview-scroll">
        <table className="preview-table">
          <thead>
            <tr>
              {allKeys.map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.slice(0, 20).map((record, idx) => (
              <tr key={idx}>
                {allKeys.map((key) => (
                  <td key={key}>
                    {typeof record[key] === 'object'
                      ? JSON.stringify(record[key])
                      : String(record[key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {records.length > 20 && (
          <div className="preview-more">Showing 20 of {records.length} records</div>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon" style={{ background: category.color }}>
              {category.icon}
            </span>
            <div>
              <h2>{item.name}</h2>
              <p className="modal-subtitle">{item.description}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data Preview
          </button>
          <button
            className={`tab ${activeTab === 'schema' ? 'active' : ''}`}
            onClick={() => setActiveTab('schema')}
          >
            Schema
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'overview' && (
            <div className="detail-overview">
              <div className="detail-grid">
                <div className="detail-card">
                  <span className="detail-label">Records</span>
                  <span className="detail-value">{(item.record_count || 0).toLocaleString()}</span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge status-${item.status}`}>{item.status}</span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">{new Date(item.created_at).toLocaleString()}</span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">Updated</span>
                  <span className="detail-value">{new Date(item.updated_at).toLocaleString()}</span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{category.label}</span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">ID</span>
                  <span className="detail-value">#{item.id}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && renderDataPreview(item.data)}

          {activeTab === 'schema' && (
            <div className="schema-view">
              <pre className="schema-json">
                {JSON.stringify(item.schema_config || {}, null, 2)}
              </pre>
              {item.data && Array.isArray(item.data) && item.data.length > 0 && (
                <div className="inferred-schema">
                  <h4>Inferred Schema from Data</h4>
                  <div className="schema-fields">
                    {Object.entries(item.data[0] || {}).map(([key, value]) => (
                      <div key={key} className="schema-field">
                        <span className="field-name">{key}</span>
                        <span className="field-type">{typeof value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={onEdit}>✏️ Edit</button>
          <button className="btn btn-danger" onClick={onDelete}>🗑️ Delete</button>
        </div>
      </div>
    </div>
  );
}

export default DetailModal;
