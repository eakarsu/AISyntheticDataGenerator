import React, { useState } from 'react';
import { datasets } from '../services/api';

const PROMPT_TEMPLATES = {
  tabular: 'Generate 10 rows of synthetic employee data with columns: id, name, email, department, role, salary, hire_date, performance_rating',
  text: 'Generate 5 synthetic product review texts with sentiment labels (positive, negative, neutral) and confidence scores',
  customers: 'Generate 5 synthetic customer profiles with name, email, age, location, income, purchase_history, and customer_segment',
  medical: 'Generate 5 synthetic patient records with patient_id, diagnosis (ICD-10), medications, vitals (heart_rate, blood_pressure), and clinical notes',
  financial: 'Generate 5 synthetic credit card transactions with amount, merchant, category, timestamp, and fraud risk score',
  timeseries: 'Generate 24 hourly data points of synthetic server CPU and memory metrics with timestamps for one day',
  logs: 'Generate 10 synthetic application log entries with various levels (INFO, WARN, ERROR), services, and trace IDs',
  surveys: 'Generate 5 synthetic customer satisfaction survey responses with ratings (1-5), NPS score, and open-ended feedback',
  reviews: 'Generate 5 synthetic product reviews with ratings (1-5), review title, body text, author, and helpfulness votes',
  iot: 'Generate 10 synthetic IoT sensor readings from temperature and humidity sensors with timestamps, values, and device health status',
  addresses: 'Generate 5 synthetic US addresses with street, city, state, zip, latitude/longitude, and property type',
  emails: 'Generate 5 synthetic business email records with from, to, subject, body preview, timestamp, and priority level',
  social: 'Generate 5 synthetic social media posts from different platforms with content, engagement metrics, and sentiment analysis',
  api_test: 'Generate 5 synthetic API test cases for a REST user management API with endpoints, request bodies, and expected responses',
  images: 'Generate 5 synthetic image metadata entries with filenames, descriptions, detected objects, scene classification, and tags',
};

function GenerateModal({ category, categoryInfo, onResult, onClose }) {
  const [prompt, setPrompt] = useState(PROMPT_TEMPLATES[category] || '');
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await datasets.generate(category, prompt, { temperature });
      onResult(result);
    } catch (err) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-medium" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon ai-gradient">🤖</span>
            <div>
              <h2>Generate {categoryInfo.label}</h2>
              <p className="modal-subtitle">Powered by OpenRouter AI</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label>Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the synthetic data you want to generate..."
              rows={6}
              className="prompt-textarea"
            />
          </div>

          <div className="generate-options">
            <div className="form-group form-inline">
              <label>Temperature: {temperature}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
              />
              <span className="range-labels">
                <span>Precise</span>
                <span>Creative</span>
              </span>
            </div>
          </div>

          <div className="prompt-suggestions">
            <span className="suggestion-label">Quick prompts:</span>
            <button
              className="suggestion-chip"
              onClick={() => setPrompt(PROMPT_TEMPLATES[category])}
            >
              Default template
            </button>
            <button
              className="suggestion-chip"
              onClick={() => setPrompt(`Generate 20 diverse ${categoryInfo.label.toLowerCase()} records with realistic values and edge cases`)}
            >
              Large dataset
            </button>
            <button
              className="suggestion-chip"
              onClick={() => setPrompt(`Generate 5 ${categoryInfo.label.toLowerCase()} records with intentional anomalies and outliers for testing`)}
            >
              With anomalies
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-ai" onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Generating with AI...
              </>
            ) : (
              '🤖 Generate Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerateModal;
