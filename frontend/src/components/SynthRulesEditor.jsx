import React, { useEffect, useState } from 'react';

// NON-VIZ 2: Generation rules editor — CRUD over privacy/utility tradeoffs
export default function SynthRulesEditor() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState({ name: '', privacy: 0.7, utility: 0.7, epsilon: 1.0, notes: '' });
  const [editingId, setEditingId] = useState(null);

  const headers = () => {
    const t = localStorage.getItem('token') || '';
    return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) };
  };

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/custom-views/rules', { headers: headers() });
      const data = await res.json();
      setRules(data.rules || []);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`/api/custom-views/rules/${editingId}`, { method: 'PUT', headers: headers(), body: JSON.stringify(draft) });
      } else {
        await fetch('/api/custom-views/rules', { method: 'POST', headers: headers(), body: JSON.stringify(draft) });
      }
      setDraft({ name: '', privacy: 0.7, utility: 0.7, epsilon: 1.0, notes: '' });
      setEditingId(null);
      load();
    } catch (e) { setError(e.message); }
  };

  const edit = (r) => {
    setEditingId(r.id);
    setDraft({ name: r.name, privacy: r.privacy, utility: r.utility, epsilon: r.epsilon, notes: r.notes || '' });
  };

  const del = async (id) => {
    if (!confirm('Delete rule?')) return;
    await fetch(`/api/custom-views/rules/${id}`, { method: 'DELETE', headers: headers() });
    load();
  };

  const inputStyle = { width: '100%', background: '#1a1a30', border: '1px solid #2a2a4a', color: '#e8e8f0', padding: 8, borderRadius: 6, fontSize: 13 };
  const lbl = { display: 'block', fontSize: 11, color: '#a0a0b8', marginBottom: 4 };

  return (
    <div style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 12, padding: 18 }}>
      <h3 style={{ color: '#e8e8f0', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Generation Rules — Privacy/Utility Tradeoffs</h3>
      {error && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{error}</div>}

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, background: '#1a1a30', padding: 14, borderRadius: 8, marginBottom: 14 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Rule name</label>
          <input style={inputStyle} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} required />
        </div>
        <div><label style={lbl}>Privacy (0..1)</label>
          <input type="number" step="0.01" min="0" max="1" style={inputStyle} value={draft.privacy} onChange={e => setDraft({ ...draft, privacy: Number(e.target.value) })} /></div>
        <div><label style={lbl}>Utility (0..1)</label>
          <input type="number" step="0.01" min="0" max="1" style={inputStyle} value={draft.utility} onChange={e => setDraft({ ...draft, utility: Number(e.target.value) })} /></div>
        <div><label style={lbl}>Epsilon (DP)</label>
          <input type="number" step="0.1" min="0" style={inputStyle} value={draft.epsilon} onChange={e => setDraft({ ...draft, epsilon: Number(e.target.value) })} /></div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Notes</label>
          <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} />
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary">{editingId ? 'Update Rule' : 'Add Rule'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setDraft({ name: '', privacy: 0.7, utility: 0.7, epsilon: 1.0, notes: '' }); }} className="btn btn-ghost">Cancel</button>}
        </div>
      </form>

      <div>
        {loading && <div style={{ color: '#a0a0b8' }}>Loading...</div>}
        {!loading && rules.map(r => (
          <div key={r.id} style={{ background: '#1a1a30', padding: 12, borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#e8e8f0', fontWeight: 600, fontSize: 14 }}>{r.name}</div>
              <div style={{ display: 'flex', gap: 14, marginTop: 4, fontSize: 11, color: '#a0a0b8', flexWrap: 'wrap' }}>
                <span>privacy: <strong style={{ color: '#10b981' }}>{r.privacy}</strong></span>
                <span>utility: <strong style={{ color: '#6366f1' }}>{r.utility}</strong></span>
                <span>epsilon: <strong style={{ color: '#f59e0b' }}>{r.epsilon}</strong></span>
              </div>
              {r.notes && <div style={{ color: '#6a6a80', fontSize: 11, marginTop: 4 }}>{r.notes}</div>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => edit(r)} className="btn btn-secondary btn-sm">Edit</button>
              <button onClick={() => del(r.id)} className="btn btn-danger btn-sm">Delete</button>
            </div>
          </div>
        ))}
        {!loading && rules.length === 0 && <div style={{ color: '#6a6a80', fontSize: 13 }}>No rules yet — add one above.</div>}
      </div>
    </div>
  );
}
