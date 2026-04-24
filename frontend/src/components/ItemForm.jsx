import React, { useState } from 'react';

function ItemForm({ item, category, categoryInfo, onSubmit, onClose }) {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [recordCount, setRecordCount] = useState(item?.record_count || 0);
  const [dataStr, setDataStr] = useState(
    item?.data ? JSON.stringify(item.data, null, 2) : '[]'
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(dataStr);
      } catch {
        setError('Invalid JSON in data field');
        setLoading(false);
        return;
      }

      await onSubmit({
        name,
        description,
        record_count: parseInt(recordCount),
        data: parsedData,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-medium" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon" style={{ background: categoryInfo.color }}>
              {categoryInfo.icon}
            </span>
            <h2>{item ? 'Edit Dataset' : 'New Dataset'}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}

            <div className="form-group">
              <label>Dataset Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Enter ${categoryInfo.label.toLowerCase()} dataset name`}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this dataset..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Record Count</label>
              <input
                type="number"
                value={recordCount}
                onChange={(e) => setRecordCount(e.target.value)}
                placeholder="Number of records"
                min={0}
              />
            </div>

            <div className="form-group">
              <label>Data (JSON)</label>
              <textarea
                value={dataStr}
                onChange={(e) => setDataStr(e.target.value)}
                placeholder='[{"field": "value"}]'
                rows={10}
                className="code-textarea"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : (item ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItemForm;
