import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../App';

function StreamingGenerator() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('tabular');
  const [prompt, setPrompt] = useState('');
  const [batches, setBatches] = useState(2);
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState([]);
  const [progress, setProgress] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const eventSourceRef = useRef(null);

  const appendEvent = (type, data) => {
    setEvents(prev => [...prev, { type, data, ts: new Date().toLocaleTimeString() }]);
  };

  const startStream = () => {
    if (!prompt.trim()) return alert('Please enter a prompt.');
    setRunning(true);
    setCancelled(false);
    setEvents([]);
    setProgress(0);
    setTotalBatches(0);

    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ category, prompt, batches });
    // EventSource doesn't support custom headers — pass token in query
    const url = `/api/datasets/generate/stream?${params}&token=${token}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('start', (e) => {
      const data = JSON.parse(e.data);
      setTotalBatches(data.total_batches);
      appendEvent('start', data);
    });

    es.addEventListener('batch_start', (e) => {
      appendEvent('batch_start', JSON.parse(e.data));
    });

    es.addEventListener('batch_done', (e) => {
      const data = JSON.parse(e.data);
      setProgress(prev => prev + 1);
      appendEvent('batch_done', data);
    });

    es.addEventListener('batch_error', (e) => {
      appendEvent('batch_error', JSON.parse(e.data));
    });

    es.addEventListener('complete', (e) => {
      appendEvent('complete', JSON.parse(e.data));
      es.close();
      setRunning(false);
    });

    es.addEventListener('error', (e) => {
      if (!cancelled) {
        appendEvent('error', { error: 'Stream error or connection closed' });
      }
      es.close();
      setRunning(false);
    });
  };

  const cancel = () => {
    setCancelled(true);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setRunning(false);
    appendEvent('cancelled', { message: 'Generation cancelled by user' });
  };

  const progressPct = totalBatches > 0 ? Math.round((progress / totalBatches) * 100) : 0;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Streaming Bulk Generator</h1>
      </div>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Generate large datasets in batches with live progress tracking. Each batch of 25 rows streams in as it completes.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            disabled={running}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          >
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Batches (×25 rows each): {batches}</label>
          <input
            type="range"
            min={1}
            max={4}
            value={batches}
            onChange={e => setBatches(parseInt(e.target.value))}
            disabled={running}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
            <span>25 rows</span><span>100 rows</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Generation Prompt</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={4}
          disabled={running}
          placeholder="Describe the data you want to generate..."
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={startStream}
          disabled={running}
          style={{
            padding: '0.6rem 1.5rem',
            background: running ? '#9CA3AF' : '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: running ? 'not-allowed' : 'pointer',
          }}
        >
          {running ? 'Generating...' : 'Start Streaming Generation'}
        </button>
        {running && (
          <button
            onClick={cancel}
            style={{
              padding: '0.6rem 1.5rem',
              background: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {(running || events.length > 0) && totalBatches > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.9rem' }}>
            <span>Progress: {progress}/{totalBatches} batches</span>
            <span>{progressPct}%</span>
          </div>
          <div style={{ height: '12px', background: '#E5E7EB', borderRadius: '6px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: '#3B82F6',
                borderRadius: '6px',
                width: `${progressPct}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Event Log */}
      {events.length > 0 && (
        <div>
          <h3>Event Log</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
            {events.map((ev, i) => (
              <div key={i} style={{
                padding: '0.3rem 0',
                borderBottom: '1px solid #f3f4f6',
                color: ev.type === 'error' || ev.type === 'batch_error' ? '#EF4444'
                  : ev.type === 'complete' ? '#10B981'
                  : ev.type === 'cancelled' ? '#F59E0B'
                  : '#374151',
              }}>
                <span style={{ color: '#9CA3AF', marginRight: '0.5rem' }}>[{ev.ts}]</span>
                <span style={{ fontWeight: 600 }}>{ev.type}:</span>{' '}
                {ev.type === 'batch_done'
                  ? `Batch ${ev.data.batch} complete (model: ${ev.data.model || 'unknown'})`
                  : ev.type === 'batch_start'
                  ? `Starting batch ${ev.data.batch} of ${ev.data.total}...`
                  : ev.type === 'start'
                  ? `Starting ${ev.data.total_batches} batch(es) for category: ${ev.data.category}`
                  : ev.type === 'complete'
                  ? `All done! ${ev.data.batches_completed} batch(es) completed.`
                  : JSON.stringify(ev.data)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StreamingGenerator;
