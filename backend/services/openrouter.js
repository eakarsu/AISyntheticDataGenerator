const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const generateWithAI = async (prompt, category, options = {}) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.');
  }

  const systemPrompt = getSystemPrompt(category);
  const startTime = Date.now();

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Synthetic Data Generator',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4096,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const duration = Date.now() - startTime;
  const content = data.choices?.[0]?.message?.content || '{}';

  let parsedResult;
  try {
    parsedResult = JSON.parse(content);
  } catch {
    parsedResult = { raw_output: content };
  }

  return {
    result: parsedResult,
    model: data.model || model,
    tokens_used: data.usage?.total_tokens || 0,
    duration_ms: duration,
  };
};

function getSystemPrompt(category) {
  const prompts = {
    tabular: `You are a synthetic tabular data generator. Generate realistic CSV-compatible data with proper column headers and data types. Always respond with valid JSON containing: {"columns": [...], "rows": [[...], ...], "metadata": {"description": "...", "row_count": N}}`,

    text: `You are a synthetic text data generator. Generate realistic text content for NLP training, testing, or augmentation. Always respond with valid JSON containing: {"texts": [{"id": N, "content": "...", "label": "...", "metadata": {...}}], "metadata": {"description": "...", "count": N}}`,

    customers: `You are a synthetic customer profile generator. Generate realistic customer profiles with demographics, preferences, and behavioral data. Always respond with valid JSON containing: {"profiles": [{"id": N, "name": "...", "email": "...", "age": N, "gender": "...", "location": "...", "income": N, "preferences": [...], "purchase_history": [...]}], "metadata": {"description": "...", "count": N}}`,

    medical: `You are a synthetic medical record generator for HIPAA-compliant testing. Generate realistic but completely fictional medical records. Always respond with valid JSON containing: {"records": [{"id": N, "patient_id": "...", "diagnosis": "...", "medications": [...], "vitals": {...}, "notes": "..."}], "metadata": {"description": "...", "count": N}}`,

    financial: `You are a synthetic financial transaction generator. Generate realistic financial transaction data for fraud detection training, compliance testing, or analytics. Always respond with valid JSON containing: {"transactions": [{"id": N, "account_id": "...", "type": "...", "amount": N, "currency": "...", "merchant": "...", "category": "...", "timestamp": "...", "is_fraud": false}], "metadata": {"description": "...", "count": N}}`,

    timeseries: `You are a synthetic time series data generator. Generate realistic time series data for forecasting, anomaly detection, or monitoring. Always respond with valid JSON containing: {"series": [{"timestamp": "...", "value": N, "metric": "...", "tags": {...}}], "metadata": {"description": "...", "frequency": "...", "count": N}}`,

    logs: `You are a synthetic log data generator. Generate realistic application/system log entries. Always respond with valid JSON containing: {"logs": [{"timestamp": "...", "level": "...", "service": "...", "message": "...", "trace_id": "...", "metadata": {...}}], "metadata": {"description": "...", "count": N}}`,

    surveys: `You are a synthetic survey response generator. Generate realistic survey responses with various question types. Always respond with valid JSON containing: {"responses": [{"respondent_id": N, "answers": [{"question": "...", "answer": "...", "type": "..."}], "completed_at": "...", "demographics": {...}}], "metadata": {"description": "...", "count": N}}`,

    reviews: `You are a synthetic product review generator. Generate realistic product reviews with ratings, text, and metadata. Always respond with valid JSON containing: {"reviews": [{"id": N, "product": "...", "rating": N, "title": "...", "body": "...", "author": "...", "verified": true, "helpful_votes": N, "date": "..."}], "metadata": {"description": "...", "count": N}}`,

    iot: `You are a synthetic IoT/sensor data generator. Generate realistic sensor readings and device telemetry. Always respond with valid JSON containing: {"readings": [{"device_id": "...", "sensor_type": "...", "value": N, "unit": "...", "timestamp": "...", "location": {...}, "battery_level": N}], "metadata": {"description": "...", "count": N}}`,

    addresses: `You are a synthetic address/location data generator. Generate realistic but fictional addresses and geographic data. Always respond with valid JSON containing: {"addresses": [{"id": N, "street": "...", "city": "...", "state": "...", "zip": "...", "country": "...", "lat": N, "lng": N, "type": "..."}], "metadata": {"description": "...", "count": N}}`,

    emails: `You are a synthetic email/communication data generator. Generate realistic but fictional email correspondence. Always respond with valid JSON containing: {"emails": [{"id": N, "from": "...", "to": "...", "subject": "...", "body": "...", "timestamp": "...", "has_attachment": false, "labels": [...]}], "metadata": {"description": "...", "count": N}}`,

    social: `You are a synthetic social media post generator. Generate realistic social media content for analysis and testing. Always respond with valid JSON containing: {"posts": [{"id": N, "platform": "...", "author": "...", "content": "...", "likes": N, "shares": N, "comments": N, "hashtags": [...], "timestamp": "...", "sentiment": "..."}], "metadata": {"description": "...", "count": N}}`,

    api_test: `You are a synthetic API test data generator. Generate realistic API request/response payloads for testing. Always respond with valid JSON containing: {"test_cases": [{"id": N, "endpoint": "...", "method": "...", "headers": {...}, "request_body": {...}, "expected_status": N, "expected_response": {...}, "description": "..."}], "metadata": {"description": "...", "count": N}}`,

    images: `You are a synthetic image description/metadata generator. Generate realistic image descriptions and metadata for computer vision training. Always respond with valid JSON containing: {"images": [{"id": N, "filename": "...", "description": "...", "objects": [...], "scene": "...", "tags": [...], "dimensions": {"width": N, "height": N}, "format": "..."}], "metadata": {"description": "...", "count": N}}`,
  };

  return prompts[category] || prompts.tabular;
}

module.exports = { generateWithAI };
