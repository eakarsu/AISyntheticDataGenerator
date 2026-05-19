import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import DatasetDetail from './pages/DatasetDetail';
import SchemaBuilder from './pages/SchemaBuilder';
import StreamingGenerator from './pages/StreamingGenerator';
import SchemaInfer from './pages/SchemaInfer';
import RedactPII from './pages/RedactPII';
import DistributionPreserve from './pages/DistributionPreserve';
import EdgeCases from './pages/EdgeCases';
import Navbar from './components/Navbar';
import CustomViewsPage from './pages/CustomViewsPage';
// === Batch 08 Gaps & Frontend Mounts ===
import CfLlmPoweredSchemaInferenceAutoDetectingSchema from './pages/CfLlmPoweredSchemaInferenceAutoDetectingSchema'
import CfDistributionLearningCapturingStatisticalPropertiesFromReal from './pages/CfDistributionLearningCapturingStatisticalPropertiesFromReal'
import CfDifferentialPrivacySynthesisToPreventReIdentification from './pages/CfDifferentialPrivacySynthesisToPreventReIdentification'
import CfRelationalDataGenerationRespectingForeignKeysAnd from './pages/CfRelationalDataGenerationRespectingForeignKeysAnd'
import CfTargetedEdgeCaseAndOutlierGenerationFor from './pages/CfTargetedEdgeCaseAndOutlierGenerationFor'
import CfDomainSpecificGeneratorsHealthcareFinanceWithRegulatory from './pages/CfDomainSpecificGeneratorsHealthcareFinanceWithRegulatory'
import GapNoSyntheticDataGenerationEngineEndpoint from './pages/GapNoSyntheticDataGenerationEngineEndpoint'
import GapNoSchemaInferenceFromSamples from './pages/GapNoSchemaInferenceFromSamples'
import GapNoDistributionAwareGeneration from './pages/GapNoDistributionAwareGeneration'
import GapNoDataMaskingAnonymizationAi from './pages/GapNoDataMaskingAnonymizationAi'
import GapNoSchemaEditorBackend from './pages/GapNoSchemaEditorBackend'
import GapNoDatasetPreviewEndpoint from './pages/GapNoDatasetPreviewEndpoint'
import GapNoExportToCsvParquetJson from './pages/GapNoExportToCsvParquetJson'
import GapNoPrivacyCompliancePiiRedaction from './pages/GapNoPrivacyCompliancePiiRedaction'
import GapNoNotificationsIntegrationsAuditLogSubsystemsOnly from './pages/GapNoNotificationsIntegrationsAuditLogSubsystemsOnly'
import GapNoMultiTenantProjectWorkspaces from './pages/GapNoMultiTenantProjectWorkspaces'

const CATEGORIES = {
  tabular: { label: 'Tabular Data', icon: '📊', color: '#3B82F6', description: 'Generate structured CSV/table data with custom schemas' },
  text: { label: 'Text Data', icon: '📝', color: '#8B5CF6', description: 'NLP training text, sentiment data, and text corpora' },
  customers: { label: 'Customer Profiles', icon: '👥', color: '#EC4899', description: 'Synthetic customer demographics and behavioral data' },
  medical: { label: 'Medical Records', icon: '🏥', color: '#EF4444', description: 'HIPAA-compliant synthetic health records' },
  financial: { label: 'Financial Transactions', icon: '💰', color: '#10B981', description: 'Transaction data for fraud detection and analytics' },
  timeseries: { label: 'Time Series', icon: '📈', color: '#F59E0B', description: 'Temporal data for forecasting and anomaly detection' },
  logs: { label: 'Log Data', icon: '🖥️', color: '#6366F1', description: 'Application and system log entries' },
  surveys: { label: 'Survey Responses', icon: '📋', color: '#14B8A6', description: 'Survey and questionnaire response data' },
  reviews: { label: 'Product Reviews', icon: '⭐', color: '#F97316', description: 'Product ratings, reviews, and feedback data' },
  iot: { label: 'IoT Sensor Data', icon: '📡', color: '#06B6D4', description: 'Device telemetry and sensor readings' },
  addresses: { label: 'Address Data', icon: '📍', color: '#84CC16', description: 'Synthetic addresses and geographic locations' },
  emails: { label: 'Email Data', icon: '✉️', color: '#A855F7', description: 'Synthetic email correspondence and metadata' },
  social: { label: 'Social Media', icon: '💬', color: '#E11D48', description: 'Social media posts, engagement, and sentiment data' },
  api_test: { label: 'API Test Data', icon: '🔗', color: '#0EA5E9', description: 'API request/response payloads for testing' },
  images: { label: 'Image Metadata', icon: '🖼️', color: '#D946EF', description: 'Image descriptions and metadata for CV training' },
};

export { CATEGORIES };

// Inline ProtectedRoute stub: relies on top-level auth gate in App
function ProtectedRoute({ children }) {
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard categories={CATEGORIES} />} />
          <Route path="/feature/:category" element={<FeaturePage categories={CATEGORIES} />} />
          <Route path="/dataset/:id" element={<DatasetDetail />} />
          <Route path="/schema-builder" element={<SchemaBuilder />} />
          <Route path="/streaming" element={<StreamingGenerator />} />
          <Route path="/schema-infer" element={<SchemaInfer />} />
          <Route path="/redact-pii" element={<RedactPII />} />
          <Route path="/distribution-preserve" element={<DistributionPreserve />} />
          <Route path="/edge-cases" element={<EdgeCases />} />
          <Route path="/custom-views" element={<CustomViewsPage />} />
          {/* // === Batch 08 Gaps & Frontend Mounts === */}
      <Route path="/cf-llm-powered-schema-inference-auto-detecting-schema-from-sample-data" element={<ProtectedRoute><CfLlmPoweredSchemaInferenceAutoDetectingSchema /></ProtectedRoute>} />
      <Route path="/cf-distribution-learning-capturing-statistical-properties-from-real-data" element={<ProtectedRoute><CfDistributionLearningCapturingStatisticalPropertiesFromReal /></ProtectedRoute>} />
      <Route path="/cf-differential-privacy-synthesis-to-prevent-re-identification" element={<ProtectedRoute><CfDifferentialPrivacySynthesisToPreventReIdentification /></ProtectedRoute>} />
      <Route path="/cf-relational-data-generation-respecting-foreign-keys-and-cardinality" element={<ProtectedRoute><CfRelationalDataGenerationRespectingForeignKeysAnd /></ProtectedRoute>} />
      <Route path="/cf-targeted-edge-case-and-outlier-generation-for-testing" element={<ProtectedRoute><CfTargetedEdgeCaseAndOutlierGenerationFor /></ProtectedRoute>} />
      <Route path="/cf-domain-specific-generators-healthcare-finance-with-regulatory-presets" element={<ProtectedRoute><CfDomainSpecificGeneratorsHealthcareFinanceWithRegulatory /></ProtectedRoute>} />
      <Route path="/gap-no-synthetic-data-generation-engine-endpoint" element={<ProtectedRoute><GapNoSyntheticDataGenerationEngineEndpoint /></ProtectedRoute>} />
      <Route path="/gap-no-schema-inference-from-samples" element={<ProtectedRoute><GapNoSchemaInferenceFromSamples /></ProtectedRoute>} />
      <Route path="/gap-no-distribution-aware-generation" element={<ProtectedRoute><GapNoDistributionAwareGeneration /></ProtectedRoute>} />
      <Route path="/gap-no-data-masking-anonymization-ai" element={<ProtectedRoute><GapNoDataMaskingAnonymizationAi /></ProtectedRoute>} />
      <Route path="/gap-no-schema-editor-backend" element={<ProtectedRoute><GapNoSchemaEditorBackend /></ProtectedRoute>} />
      <Route path="/gap-no-dataset-preview-endpoint" element={<ProtectedRoute><GapNoDatasetPreviewEndpoint /></ProtectedRoute>} />
      <Route path="/gap-no-export-to-csv-parquet-json" element={<ProtectedRoute><GapNoExportToCsvParquetJson /></ProtectedRoute>} />
      <Route path="/gap-no-privacy-compliance-pii-redaction" element={<ProtectedRoute><GapNoPrivacyCompliancePiiRedaction /></ProtectedRoute>} />
      <Route path="/gap-no-notifications-integrations-audit-log-subsystems-only-stub" element={<ProtectedRoute><GapNoNotificationsIntegrationsAuditLogSubsystemsOnly /></ProtectedRoute>} />
      <Route path="/gap-no-multi-tenant-project-workspaces" element={<ProtectedRoute><GapNoMultiTenantProjectWorkspaces /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
