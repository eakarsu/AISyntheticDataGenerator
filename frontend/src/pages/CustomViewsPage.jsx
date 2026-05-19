import React from 'react';
import SynthVolumeChart from '../components/SynthVolumeChart';
import SynthQualityHeatmap from '../components/SynthQualityHeatmap';
import SynthSpecPdf from '../components/SynthSpecPdf';
import SynthRulesEditor from '../components/SynthRulesEditor';

export default function CustomViewsPage() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ color: '#e8e8f0', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Synth Views</h1>
        <p style={{ color: '#a0a0b8', fontSize: 14 }}>
          Custom dashboards for synthetic data generation: volume tracking, quality heatmaps,
          dataset specification PDFs, and privacy/utility rule management.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(540px, 1fr))', gap: 20 }}>
        <SynthVolumeChart />
        <SynthQualityHeatmap />
        <SynthSpecPdf />
        <SynthRulesEditor />
      </div>
    </div>
  );
}
