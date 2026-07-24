'use strict';
const router = require('express').Router();
const { pool } = require('../config/database');
const { generateWithAI } = require('../services/openrouter');

router.post('/generate', async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || '').trim();
    const category = String(req.body?.category || 'tabular');
    if (prompt.length < 12) return res.status(400).json({ error: 'prompt must contain at least 12 characters' });
    const output = await generateWithAI(prompt, category, { maxTokens: 1200 });
    if (!output?.result || !Object.keys(output.result).length) throw new Error('OpenRouter returned an empty result');
    const saved = await pool.query(
      `INSERT INTO runtime_ai_results(user_id,endpoint,input_data,result,model_used)
       VALUES($1,'generate',$2,$3,$4) RETURNING id,created_at`,
      [req.user.id, { prompt, category }, output.result, output.model]
    );
    res.json({ ...output, persistence: saved.rows[0] });
  } catch (error) {
    console.error('Runtime AI generation failed:', error.message);
    res.status(502).json({ error: 'AI generation failed' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,endpoint,input_data,result,model_used,created_at FROM runtime_ai_results WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json({ history: result.rows });
  } catch (error) {
    res.status(503).json({ error: 'AI history unavailable' });
  }
});

module.exports = router;
