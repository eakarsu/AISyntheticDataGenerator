const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Validate critical env vars at startup
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set. Using default-secret (insecure for production).');
}
if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
  console.warn('WARNING: OPENROUTER_API_KEY not configured. AI features will fail.');
}

const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const datasetRoutes = require('./routes/datasets');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    await initDatabase();
    app.use('/api/schema-inference', require('./routes/schemaInference')); app.use('/api/distribution-learning', require('./routes/distributionLearning')); app.use('/api/differential-privacy', require('./routes/differentialPrivacy')); app.use('/api/relational-generation', require('./routes/relationalGeneration')); app.use('/api/edge-case-generation', require('./routes/edgeCaseGeneration')); app.use('/api/domain-presets', require('./routes/domainPresets'));

// === Batch 08 Gaps & Frontend Mounts ===
app.use('/api/gap-no-synthetic-data-generation-engine-endpoint', require('./routes/gapNoSyntheticDataGenerationEngineEndpoint'));
app.use('/api/gap-no-schema-inference-from-samples', require('./routes/gapNoSchemaInferenceFromSamples'));
app.use('/api/gap-no-distribution-aware-generation', require('./routes/gapNoDistributionAwareGeneration'));
app.use('/api/gap-no-data-masking-anonymization-ai', require('./routes/gapNoDataMaskingAnonymizationAi'));
app.use('/api/gap-no-schema-editor-backend', require('./routes/gapNoSchemaEditorBackend'));
app.use('/api/gap-no-dataset-preview-endpoint', require('./routes/gapNoDatasetPreviewEndpoint'));
app.use('/api/gap-no-export-to-csv-parquet-json', require('./routes/gapNoExportToCsvParquetJson'));
app.use('/api/gap-no-privacy-compliance-pii-redaction', require('./routes/gapNoPrivacyCompliancePiiRedaction'));
app.use('/api/gap-no-notifications-integrations-audit-log-subsystems-only-stub', require('./routes/gapNoNotificationsIntegrationsAuditLogSubsystemsOnlyStub'));
app.use('/api/gap-no-multi-tenant-project-workspaces', require('./routes/gapNoMultiTenantProjectWorkspaces'));

app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
