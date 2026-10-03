import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './AppSidebar.css';

const LINKS = [
  { to: '/insights/timeline', label: 'Protected Route', group: 'Insights' },
  { to: '/codex/custom-viz', label: 'Protected Route', group: 'Insights' },
  { to: '/codex/operations', label: 'Protected Route', group: 'Insights' },
  { to: '/', label: 'Dashboard', group: 'Workspace' },
  { to: '/schema-builder', label: 'Schema Builder', group: 'Workspace' },
  { to: '/streaming', label: 'Streaming Generator', group: 'Workspace' },
  { to: '/schema-infer', label: 'Schema Infer', group: 'Workspace' },
  { to: '/redact-pii', label: 'Redact PII', group: 'Workspace' },
  { to: '/distribution-preserve', label: 'Distribution Preserve', group: 'Workspace' },
  { to: '/edge-cases', label: 'Edge Cases', group: 'Workspace' },
  { to: '/custom-views', label: 'Custom Views', group: 'Workspace' },
  { to: '/cf-llm-powered-schema-inference-auto-detecting-schema-from-sample-data', label: 'Protected Route', group: 'Workspace' },
  { to: '/cf-distribution-learning-capturing-statistical-properties-from-real-data', label: 'Protected Route', group: 'Workspace' },
  { to: '/cf-differential-privacy-synthesis-to-prevent-re-identification', label: 'Protected Route', group: 'Workspace' },
  { to: '/cf-relational-data-generation-respecting-foreign-keys-and-cardinality', label: 'Protected Route', group: 'Workspace' },
  { to: '/cf-targeted-edge-case-and-outlier-generation-for-testing', label: 'Protected Route', group: 'Workspace' },
  { to: '/cf-domain-specific-generators-healthcare-finance-with-regulatory-presets', label: 'Protected Route', group: 'Workspace' },
  { to: '/gap-no-synthetic-data-generation-engine-endpoint', label: 'Protected Route', group: 'Workspace' },
  { to: '/gap-no-schema-inference-from-samples', label: 'Protected Route', group: 'Workspace' },
  { to: '/gap-no-distribution-aware-generation', label: 'Protected Route', group: 'Workspace' },
  { to: '/gap-no-data-masking-anonymization-ai', label: 'Protected Route', group: 'Workspace' },
  { to: '/gap-no-schema-editor-backend', label: 'Protected Route', group: 'Workspace' },
  { to: '/gap-no-dataset-preview-endpoint', label: 'Protected Route', group: 'Workspace' },
  { to: '/gap-no-export-to-csv-parquet-json', label: 'Protected Route', group: 'Workspace' },
  { to: '/gap-no-privacy-compliance-pii-redaction', label: 'Protected Route', group: 'Workspace' },
  { to: '/gap-no-notifications-integrations-audit-log-subsystems-only-stub', label: 'Protected Route', group: 'Workspace' },
  { to: '/gap-no-multi-tenant-project-workspaces', label: 'Protected Route', group: 'Workspace' },
];

export default function AppSidebar() {
  const [query, setQuery] = useState('');
  const visible = LINKS.filter(link => link.label.toLowerCase().includes(query.toLowerCase().trim()));
  return <aside className="codex-side" aria-label="Application navigation">
    <div className="codex-side-brand"><strong>AISynthetic Data Generator</strong><span>Workspace</span></div>
    <label className="codex-side-search-label" htmlFor="codex-side-search">Find a section</label>
    <input id="codex-side-search" className="codex-side-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search navigation" />
    <nav className="codex-side-links" aria-label="Sections">
      {['Workspace', 'AI tools', 'Insights'].map(group => {
        const items = visible.filter(link => link.group === group);
        return items.length ? <div className="codex-side-group" key={group}>
          <span className="codex-side-heading">{group}</span>
          {items.map(link => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `codex-side-link${isActive ? ' active' : ''}`}>{link.label}</NavLink>)}
        </div> : null;
      })}
      {visible.length === 0 && <p className="codex-side-empty">No matching sections</p>}
    </nav>
  </aside>;
}
