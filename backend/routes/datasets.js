const express = require('express');
const { pool } = require('../config/database');
const { generateWithAI } = require('../services/openrouter');
const router = express.Router();

// Get all categories with counts
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category, COUNT(*) as count,
             MAX(updated_at) as last_updated
      FROM datasets
      GROUP BY category
      ORDER BY category
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all datasets (optionally filtered by category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT id, category, name, description, record_count, status, created_at, updated_at FROM datasets';
    const params = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    query += ' ORDER BY updated_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
});

// Get single dataset with full data
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM datasets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching dataset:', error);
    res.status(500).json({ error: 'Failed to fetch dataset' });
  }
});

// Create dataset
router.post('/', async (req, res) => {
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
});

// Update dataset
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
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating dataset:', error);
    res.status(500).json({ error: 'Failed to update dataset' });
  }
});

// Delete dataset
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM datasets WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    res.json({ message: 'Dataset deleted successfully' });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    res.status(500).json({ error: 'Failed to delete dataset' });
  }
});

// Generate synthetic data with AI
router.post('/generate', async (req, res) => {
  try {
    const { category, prompt, options } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const aiResult = await generateWithAI(prompt, category, options);

    // Save generation record
    const genResult = await pool.query(
      `INSERT INTO generations (category, prompt, result, model, tokens_used, duration_ms, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'completed') RETURNING *`,
      [category, prompt, aiResult.result, aiResult.model, aiResult.tokens_used, aiResult.duration_ms]
    );

    res.json({
      generation: genResult.rows[0],
      result: aiResult.result,
      model: aiResult.model,
      tokens_used: aiResult.tokens_used,
      duration_ms: aiResult.duration_ms,
    });
  } catch (error) {
    console.error('Error generating data:', error);
    res.status(500).json({ error: error.message || 'Failed to generate data' });
  }
});

// Save generated data as dataset
router.post('/generate/save', async (req, res) => {
  try {
    const { category, name, description, data, record_count, generation_id } = req.body;
    const result = await pool.query(
      `INSERT INTO datasets (category, name, description, data, record_count, status)
       VALUES ($1, $2, $3, $4, $5, 'ready') RETURNING *`,
      [category, name, description, data, record_count || 0]
    );

    if (generation_id) {
      await pool.query('UPDATE generations SET dataset_id = $1 WHERE id = $2', [result.rows[0].id, generation_id]);
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving generated data:', error);
    res.status(500).json({ error: 'Failed to save generated data' });
  }
});

// Get generation history
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

module.exports = router;
