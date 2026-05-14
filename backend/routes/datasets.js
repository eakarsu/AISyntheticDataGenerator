const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, query, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { generateWithAI } = require('../services/openrouter');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// ─── AI Rate Limiter ───────────────────────────────────────────────────────────
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req) => req.user ? 'user:' + (req.user.id || req.user.userId) : req.ip,
  message: { error: 'Too many AI requests. Limit is 20 per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Protect ALL dataset routes ────────────────────────────────────────────────
router.use(authenticate);

// ─── Helpers ───────────────────────────────────────────────────────────────────
function parseAIJson(text) {
  if (!text) return null;
  if (typeof text === 'object') return text;
  try { return JSON.parse(text); } catch (_) {}
  try {
    const stripped = text.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim();
    return JSON.parse(stripped);
  } catch (_) {}
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch (_) {}
  }
  return null;
}

// Category → required top-level key mapping for validation
const CATEGORY_KEYS = {
  tabular: ['columns', 'rows'],
  text: ['texts'],
  customers: ['profiles'],
  medical: ['records'],
  financial: ['transactions'],
  timeseries: ['series'],
  logs: ['logs'],
  surveys: ['responses'],
  reviews: ['reviews'],
  iot: ['readings'],
  addresses: ['addresses'],
  emails: ['emails'],
  social: ['posts'],
  api_test: ['test_cases'],
  images: ['images'],
};

function validateAIOutput(result, category) {
  const keys = CATEGORY_KEYS[category] || [];
  if (!keys.length) return true;
  return keys.every(k => result && result[k] !== undefined);
}

function handleAIError(err, res) {
  const msg = (err && err.message) || '';
  if (/api key not configured/i.test(msg) || /OPENROUTER_API_KEY/i.test(msg)) {
    return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
  }
  return res.status(500).json({ error: msg || 'AI request failed' });
}

async function persistAIResult(userId, endpoint, inputData, result) {
  try {
    await pool.query(
      `INSERT INTO ai_results (user_id, endpoint, input_data, result, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, endpoint, JSON.stringify(inputData), JSON.stringify(result)]
    );
  } catch (err) {
    console.error('Failed to persist AI result:', err.message);
  }
}

async function checkDailyQuota(userId) {
  const res = await pool.query(
    `SELECT COUNT(*) as cnt FROM ai_results
     WHERE user_id = $1 AND endpoint = 'generate'
       AND created_at > NOW() - INTERVAL '24 hours'`,
    [userId]
  );
  return parseInt(res.rows[0].cnt, 10) >= 100;
}

// ─── GET /api/datasets/categories ─────────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category, COUNT(*) as count, MAX(updated_at) as last_updated
      FROM datasets GROUP BY category ORDER BY category
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ─── GET /api/datasets ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
    const pageSize = Math.min(100, parseInt(limit));

    let where = '';
    const params = [pageSize, offset];
    if (category) {
      where = ' WHERE category = $3';
      params.push(category);
    }

    const countQuery = `SELECT COUNT(*) FROM datasets${where.replace('$3', '$1')}`;
    const countParams = category ? [category] : [];
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count, 10);

    const query = `SELECT id, category, name, description, record_count, status, created_at, updated_at
                   FROM datasets${where} ORDER BY updated_at DESC LIMIT $1 OFFSET $2`;
    const result = await pool.query(query, params);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
});

// ─── GET /api/datasets/generations/history ────────────────────────────────────
router.get('/generations/history', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM generations';
    const params = [];
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    query += ' ORDER BY created_at DESC LIMIT 50';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching generation history:', error);
    res.status(500).json({ error: 'Failed to fetch generation history' });
  }
});

// ─── GET /api/datasets/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM datasets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Dataset not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching dataset:', error);
    res.status(500).json({ error: 'Failed to fetch dataset' });
  }
});

// ─── GET /api/datasets/:id/export ─────────────────────────────────────────────
router.get('/:id/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const result = await pool.query('SELECT * FROM datasets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Dataset not found' });

    const dataset = result.rows[0];
    const data = dataset.data || [];
    const filename = (dataset.name || 'dataset').replace(/[^a-z0-9]/gi, '_');

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.send(JSON.stringify(data, null, 2));
    }

    if (format === 'jsonl') {
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.jsonl"`);
      const rows = Array.isArray(data) ? data : Object.values(data)[0] || [];
      return res.send(rows.map(r => JSON.stringify(r)).join('\n'));
    }

    if (format === 'csv') {
      // Flatten the dataset to an array of objects
      let rows = [];
      if (Array.isArray(data)) {
        rows = data;
      } else {
        // Try to find the first array value in the response
        const firstArray = Object.values(data).find(v => Array.isArray(v));
        rows = firstArray || [data];
      }
      if (rows.length === 0) {
        return res.status(400).json({ error: 'No rows to export' });
      }
      const allKeys = [...new Set(rows.flatMap(r => Object.keys(r || {})))];
      const csvLines = [allKeys.join(',')];
      for (const row of rows) {
        const vals = allKeys.map(k => {
          const v = row[k];
          if (v === null || v === undefined) return '';
          const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        });
        csvLines.push(vals.join(','));
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csvLines.join('\n'));
    }

    if (format === 'sql') {
      let rows = [];
      if (Array.isArray(data)) {
        rows = data;
      } else {
        const firstArray = Object.values(data).find(v => Array.isArray(v));
        rows = firstArray || [data];
      }
      if (rows.length === 0) return res.status(400).json({ error: 'No rows to export' });

      const tableName = filename.toLowerCase();
      const allKeys = [...new Set(rows.flatMap(r => Object.keys(r || {})))];
      const lines = [`-- SQL Export for dataset: ${dataset.name}`, `-- Generated at: ${new Date().toISOString()}`, ''];
      for (const row of rows) {
        const cols = allKeys.join(', ');
        const vals = allKeys.map(k => {
          const v = row[k];
          if (v === null || v === undefined) return 'NULL';
          if (typeof v === 'number') return v;
          const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
          return `'${s.replace(/'/g, "''")}'`;
        });
        lines.push(`INSERT INTO ${tableName} (${cols}) VALUES (${vals.join(', ')});`);
      }
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.sql"`);
      return res.send(lines.join('\n'));
    }

    res.status(400).json({ error: 'Invalid format. Supported: json, jsonl, csv, sql' });
  } catch (error) {
    console.error('Error exporting dataset:', error);
    res.status(500).json({ error: 'Failed to export dataset' });
  }
});

// ─── POST /api/datasets ───────────────────────────────────────────────────────
router.post('/',
  body('category').notEmpty().withMessage('category is required'),
  body('name').notEmpty().withMessage('name is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { category, name, description, schema_config, data, record_count } = req.body;
      const result = await pool.query(
        `INSERT INTO datasets (category, name, description, schema_config, data, record_count, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ready') RETURNING *`,
        [category, name, description, schema_config || {}, data || [], record_count || 0]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating dataset:', error);
      res.status(500).json({ error: 'Failed to create dataset' });
    }
  }
);

// ─── PUT /api/datasets/:id ────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { name, description, schema_config, data, record_count, status } = req.body;
    const result = await pool.query(
      `UPDATE datasets SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        schema_config = COALESCE($3, schema_config),
        data = COALESCE($4, data),
        record_count = COALESCE($5, record_count),
        status = COALESCE($6, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [name, description, schema_config, data, record_count, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Dataset not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating dataset:', error);
    res.status(500).json({ error: 'Failed to update dataset' });
  }
});

// ─── DELETE /api/datasets/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM datasets WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Dataset not found' });
    res.json({ message: 'Dataset deleted successfully' });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    res.status(500).json({ error: 'Failed to delete dataset' });
  }
});

// ─── POST /api/datasets/generate ──────────────────────────────────────────────
router.post('/generate', aiRateLimiter,
  body('prompt').notEmpty().withMessage('prompt is required'),
  body('category').notEmpty().withMessage('category is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { category, prompt, options } = req.body;
      const userId = req.user?.id || req.user?.userId;

      // Check daily quota
      const quotaExceeded = await checkDailyQuota(userId);
      if (quotaExceeded) {
        return res.status(429).json({ error: 'Daily generation quota (100) exceeded. Try again tomorrow.' });
      }

      const requestedRows = options?.rowCount || 25;
      let mergedResult = null;

      if (requestedRows > 50) {
        // Split into 2 batches of 25
        const batch1 = await generateWithAI(prompt, category, { ...options, rowCount: 25 });
        const batch2 = await generateWithAI(prompt, category, { ...options, rowCount: 25 });

        // Merge arrays
        const r1 = batch1.result;
        const r2 = batch2.result;
        const keys = CATEGORY_KEYS[category] || [];
        mergedResult = { ...r1 };
        for (const key of keys) {
          if (Array.isArray(r1[key]) && Array.isArray(r2[key])) {
            mergedResult[key] = [...r1[key], ...r2[key]];
          }
        }
        if (mergedResult.metadata) {
          mergedResult.metadata.row_count = (mergedResult.metadata.row_count || 0) + (r2.metadata?.row_count || 0);
        }
      } else {
        const aiResult = await generateWithAI(prompt, category, options);
        mergedResult = aiResult.result;
      }

      // Validate output — re-prompt once if invalid
      if (!validateAIOutput(mergedResult, category)) {
        console.warn(`AI output invalid for category ${category}, re-prompting...`);
        const retry = await generateWithAI(prompt, category, options);
        mergedResult = retry.result;
      }

      const aiResult = { result: mergedResult };
      const finalAI = await generateWithAI(prompt, category, options); // get model/token metadata
      // Use merged result but keep token metadata
      const genResult = await pool.query(
        `INSERT INTO generations (category, prompt, result, model, tokens_used, duration_ms, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'completed') RETURNING *`,
        [category, prompt, mergedResult, finalAI.model, finalAI.tokens_used, finalAI.duration_ms]
      );

      await persistAIResult(userId, 'generate', { category, prompt, options }, mergedResult);

      res.json({
        generation: genResult.rows[0],
        result: mergedResult,
        model: finalAI.model,
        tokens_used: finalAI.tokens_used,
        duration_ms: finalAI.duration_ms,
      });
    } catch (error) {
      console.error('Error generating data:', error);
      res.status(500).json({ error: error.message || 'Failed to generate data' });
    }
  }
);

// ─── POST /api/datasets/generate/save ─────────────────────────────────────────
router.post('/generate/save',
  body('name').notEmpty().withMessage('name is required'),
  body('category').notEmpty().withMessage('category is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { category, name, description, data, record_count, generation_id } = req.body;
      const result = await pool.query(
        `INSERT INTO datasets (category, name, description, data, record_count, status)
         VALUES ($1, $2, $3, $4, $5, 'ready') RETURNING *`,
        [category, name, description, data, record_count || 0]
      );

      if (generation_id) {
        // Verify FK exists before updating
        const genCheck = await pool.query('SELECT id FROM generations WHERE id = $1', [generation_id]);
        if (genCheck.rows.length > 0) {
          await pool.query('UPDATE generations SET dataset_id = $1 WHERE id = $2', [result.rows[0].id, generation_id]);
        }
      }

      const userId = req.user?.id || req.user?.userId;
      await persistAIResult(userId, 'save', { category, name, generation_id }, result.rows[0]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error saving generated data:', error);
      res.status(500).json({ error: 'Failed to save generated data' });
    }
  }
);

// ─── POST /api/datasets/generate/validate ─────────────────────────────────────
router.post('/generate/validate', async (req, res) => {
  try {
    const { datasetId, category } = req.body;
    if (!datasetId) return res.status(400).json({ error: 'datasetId is required' });

    const result = await pool.query('SELECT * FROM datasets WHERE id = $1', [datasetId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Dataset not found' });

    const dataset = result.rows[0];
    const cat = category || dataset.category;
    const valid = validateAIOutput(dataset.data, cat);
    const keys = CATEGORY_KEYS[cat] || [];
    const missing = keys.filter(k => !dataset.data || dataset.data[k] === undefined);

    res.json({ valid, category: cat, requiredKeys: keys, missingKeys: missing });
  } catch (error) {
    console.error('Error validating dataset:', error);
    res.status(500).json({ error: 'Failed to validate dataset' });
  }
});

// ─── POST /api/datasets/generate-from-schema ──────────────────────────────────
router.post('/generate-from-schema', aiRateLimiter,
  body('schema').notEmpty().withMessage('schema is required'),
  body('count').isInt({ min: 1, max: 100 }).withMessage('count must be 1-100'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { schema, count = 10, name, description } = req.body;
      const userId = req.user?.id || req.user?.userId;

      const quotaExceeded = await checkDailyQuota(userId);
      if (quotaExceeded) {
        return res.status(429).json({ error: 'Daily generation quota exceeded.' });
      }

      const prompt = `Generate exactly ${count} synthetic data records conforming to this JSON Schema:

${JSON.stringify(schema, null, 2)}

Return a JSON object with key "records" containing an array of ${count} objects, each strictly conforming to the schema above.
Include a "metadata" object with description and count.`;

      const systemPrompt = `You are a JSON Schema-aware synthetic data generator. Always return valid JSON where every record conforms exactly to the provided schema. Respond only with valid JSON matching: {"records": [...], "metadata": {"description": "...", "count": N}}`;

      const { generateWithAICustomSystem } = require('../services/openrouter');
      let aiResult;
      try {
        aiResult = await generateWithAICustomSystem(systemPrompt, prompt, {});
      } catch (e) {
        // Fallback to standard generate
        aiResult = await generateWithAI(prompt, 'tabular', {});
      }

      let result = aiResult.result;

      // Validate each record against schema properties
      const records = result?.records || [];
      const schemaProps = schema.properties || {};
      const requiredFields = schema.required || Object.keys(schemaProps);
      const validRecords = records.filter(r =>
        requiredFields.every(f => r && r[f] !== undefined)
      );

      if (validRecords.length < records.length) {
        console.warn(`Schema validation: ${records.length - validRecords.length} records dropped`);
      }

      const saved = await pool.query(
        `INSERT INTO datasets (category, name, description, data, record_count, status, schema_config)
         VALUES ('tabular', $1, $2, $3, $4, 'ready', $5) RETURNING *`,
        [name || 'Schema-Generated Dataset', description || '', { records: validRecords, metadata: result?.metadata }, validRecords.length, schema]
      );

      await persistAIResult(userId, 'generate-from-schema', { schema, count, name }, result);

      res.status(201).json({
        dataset: saved.rows[0],
        records: validRecords,
        totalGenerated: records.length,
        validRecords: validRecords.length,
      });
    } catch (error) {
      console.error('Error generating from schema:', error);
      res.status(500).json({ error: error.message || 'Failed to generate from schema' });
    }
  }
);

// ─── POST /api/datasets/:id/privacy-score ─────────────────────────────────────
router.post('/:id/privacy-score', aiRateLimiter, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM datasets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Dataset not found' });

    const dataset = result.rows[0];
    const sensitiveCategories = ['medical', 'financial', 'customers'];
    if (!sensitiveCategories.includes(dataset.category)) {
      return res.status(400).json({ error: 'Privacy scoring only available for medical, financial, and customer datasets' });
    }

    const data = dataset.data || {};
    const rows = Array.isArray(data) ? data : Object.values(data).find(v => Array.isArray(v)) || [];

    const prompt = `Analyze this ${dataset.category} synthetic dataset for privacy risks and k-anonymity.

Dataset sample (first 5 rows): ${JSON.stringify(rows.slice(0, 5), null, 2)}
Total records: ${rows.length}
Category: ${dataset.category}

Return a JSON object:
{
  "privacy_score": <number 0-100, higher is safer>,
  "k_anonymity_estimate": <estimated k value>,
  "uniqueness_ratio": <ratio of unique records 0-1>,
  "risks": [{"field": "...", "risk": "...", "severity": "HIGH|MEDIUM|LOW"}],
  "recommendations": ["..."],
  "summary": "..."
}`;

    const aiResult = await generateWithAI(prompt, 'tabular', { temperature: 0.2 });
    const privacyResult = aiResult.result;

    const userId = req.user?.id || req.user?.userId;
    await persistAIResult(userId, 'privacy-score', { datasetId: req.params.id, category: dataset.category }, privacyResult);

    res.json(privacyResult);
  } catch (error) {
    console.error('Error computing privacy score:', error);
    res.status(500).json({ error: error.message || 'Failed to compute privacy score' });
  }
});

// ─── GET /api/datasets/generate/stream (SSE) ──────────────────────────────────
router.get('/generate/stream', aiRateLimiter, async (req, res) => {
  const { category = 'tabular', prompt, batches = 2 } = req.query;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const batchCount = Math.min(parseInt(batches), 4);
  let allResults = [];
  let closed = false;

  req.on('close', () => { closed = true; });

  const send = (event, data) => {
    if (!closed) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    send('start', { total_batches: batchCount, category });

    for (let i = 0; i < batchCount; i++) {
      if (closed) break;
      send('batch_start', { batch: i + 1, total: batchCount });
      try {
        const aiResult = await generateWithAI(String(prompt), String(category), { rowCount: 25 });
        allResults.push(aiResult.result);
        send('batch_done', { batch: i + 1, result: aiResult.result, model: aiResult.model });
      } catch (err) {
        send('batch_error', { batch: i + 1, error: err.message });
      }
    }

    if (!closed) {
      send('complete', { batches_completed: allResults.length, total_batches: batchCount });
      res.end();
    }
  } catch (error) {
    if (!closed) {
      send('error', { error: error.message });
      res.end();
    }
  }
});

// ─── POST /api/datasets/schema-infer — infer schema from sample rows ─────────
router.post('/schema-infer', aiRateLimiter,
  body('samples').isArray({ min: 1 }).withMessage('samples must be a non-empty array'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const { samples, name } = req.body;
      const prompt = `Infer a tabular schema from the following sample rows. Detect column names, types, formats, ranges, nullability, and likely PII. Suggest validation rules.

Dataset name: ${name || 'unnamed'}
Sample rows (max 50): ${JSON.stringify(samples.slice(0, 50))}

Return JSON:
{
  "columns": [{"name": "...", "type": "string|number|boolean|date|datetime|enum|json", "nullable": <bool>, "format": "...", "min": <number>, "max": <number>, "enum_values": ["..."], "is_pii": <bool>, "description": "..."}],
  "primary_key_candidates": ["..."],
  "row_count_sampled": <number>,
  "notes": ["..."]
}`;
      const aiResult = await generateWithAI(prompt, 'tabular', { temperature: 0.2 });
      const parsed = aiResult.result || parseAIJson(aiResult.result) || {};
      await persistAIResult(req.user.id, 'schema-infer', { name, sampleCount: samples.length }, parsed);
      res.json({ schema: parsed, model: aiResult.model, tokens_used: aiResult.tokens_used });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── POST /api/datasets/redact-pii — flag and redact PII fields ─────────────
router.post('/redact-pii', aiRateLimiter,
  body('records').isArray({ min: 1 }).withMessage('records must be a non-empty array'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const { records, strategy } = req.body;
      const prompt = `Identify PII in the following records and return them with PII redacted using strategy "${strategy || 'token-replacement'}". Track fields detected as PII.

Records (max 30): ${JSON.stringify(records.slice(0, 30))}

Return JSON:
{
  "pii_fields": ["..."],
  "redaction_strategy": "${strategy || 'token-replacement'}",
  "redacted_records": [<record-objects-with-pii-redacted>],
  "notes": ["..."]
}`;
      const aiResult = await generateWithAI(prompt, 'tabular', { temperature: 0.1 });
      const parsed = aiResult.result || parseAIJson(aiResult.result) || {};
      await persistAIResult(req.user.id, 'redact-pii', { recordCount: records.length, strategy }, parsed);
      res.json({ result: parsed, model: aiResult.model, tokens_used: aiResult.tokens_used });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── POST /api/datasets/distribution-preserve — generate rows that preserve real-data distributions ───
router.post('/distribution-preserve', aiRateLimiter,
  body('samples').isArray({ min: 1 }).withMessage('samples must be a non-empty array of real rows'),
  body('rowCount').optional().isInt({ min: 1, max: 500 }).withMessage('rowCount must be 1-500'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const { samples, rowCount, name, category } = req.body;
      const cat = category || 'tabular';
      const count = parseInt(rowCount, 10) || 25;
      const prompt = `You are generating synthetic rows that PRESERVE the statistical distributions of the provided real-data samples.
Preserve these properties for each column when possible:
- numeric: mean, variance, min/max, skew
- categorical: value frequencies (proportions)
- date/datetime: range and density
- text: length distribution and vocabulary mix
Do NOT copy any sample row verbatim. Vary identifiers and PII.

Dataset name: ${name || 'unnamed'}
Target category: ${cat}
Number of synthetic rows requested: ${count}
Real-data samples (max 50): ${JSON.stringify((samples || []).slice(0, 50))}

Return JSON:
{
  "columns": [{"name": "...", "type": "..."}],
  "rows": [<synthetic-row-objects>],
  "distribution_summary": {
    "numeric": {"<col>": {"mean": <num>, "std": <num>, "min": <num>, "max": <num>}},
    "categorical": {"<col>": {"<value>": <freq>}},
    "preserved_properties": ["..."],
    "deviations": ["..."]
  },
  "notes": ["..."]
}`;
      const aiResult = await generateWithAI(prompt, cat, { temperature: 0.4, rowCount: count });
      const parsed = (aiResult && aiResult.result && typeof aiResult.result === 'object')
        ? aiResult.result
        : (parseAIJson(aiResult && aiResult.result) || {});
      await persistAIResult(req.user.id, 'distribution-preserve', { name, category: cat, sampleCount: samples.length, rowCount: count }, parsed);
      res.json({ result: parsed, model: aiResult && aiResult.model, tokens_used: aiResult && aiResult.tokens_used });
    } catch (err) {
      return handleAIError(err, res);
    }
  }
);

// ─── POST /api/datasets/edge-cases — generate edge-case rows around a schema/distribution ────
router.post('/edge-cases', aiRateLimiter,
  body('schema').exists().withMessage('schema is required'),
  body('count').optional().isInt({ min: 1, max: 200 }).withMessage('count must be 1-200'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const { schema, count, focus, name } = req.body;
      const target = parseInt(count, 10) || 25;
      const prompt = `Generate ${target} EDGE-CASE synthetic rows that stress-test the following schema.
Cover at minimum:
- numeric extremes (min, max, just-below-min, just-above-max, zero, negatives where allowed)
- string boundary lengths (empty, single char, max length, unicode, RTL, emoji, leading/trailing whitespace)
- date/datetime extremes (epoch, far-future, leap day, DST transitions, timezone-naive/aware)
- nullable fields actually null
- enum values including unknown / case-variant
- combinatorial conflicts (mutually-exclusive flags both true, etc. when business rules suggest them)
${focus ? `Focus area: ${focus}` : ''}

Dataset name: ${name || 'unnamed'}
Schema: ${JSON.stringify(schema).slice(0, 6000)}

Return JSON:
{
  "rows": [<edge-case-row-objects>],
  "edge_case_categories": ["numeric-extremes", "string-boundaries", "..."],
  "rationale_per_row": ["..."],
  "warnings": ["..."]
}`;
      const aiResult = await generateWithAI(prompt, 'tabular', { temperature: 0.6 });
      const parsed = (aiResult && aiResult.result && typeof aiResult.result === 'object')
        ? aiResult.result
        : (parseAIJson(aiResult && aiResult.result) || {});
      await persistAIResult(req.user.id, 'edge-cases', { name, count: target, focus }, parsed);
      res.json({ result: parsed, model: aiResult && aiResult.model, tokens_used: aiResult && aiResult.tokens_used });
    } catch (err) {
      return handleAIError(err, res);
    }
  }
);

module.exports = router;
