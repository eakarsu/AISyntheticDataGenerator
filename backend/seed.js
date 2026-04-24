const bcrypt = require('bcryptjs');
const { pool, initDatabase } = require('./config/database');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const CATEGORIES = {
  tabular: {
    label: 'Tabular Data',
    icon: 'table',
    description: 'Generate structured CSV/table data with custom schemas',
  },
  text: {
    label: 'Text Data',
    icon: 'file-text',
    description: 'NLP training text, sentiment data, and text corpora',
  },
  customers: {
    label: 'Customer Profiles',
    icon: 'users',
    description: 'Synthetic customer demographics and behavioral data',
  },
  medical: {
    label: 'Medical Records',
    icon: 'heart-pulse',
    description: 'HIPAA-compliant synthetic health records',
  },
  financial: {
    label: 'Financial Transactions',
    icon: 'dollar-sign',
    description: 'Transaction data for fraud detection and analytics',
  },
  timeseries: {
    label: 'Time Series',
    icon: 'trending-up',
    description: 'Temporal data for forecasting and anomaly detection',
  },
  logs: {
    label: 'Log Data',
    icon: 'terminal',
    description: 'Application and system log entries',
  },
  surveys: {
    label: 'Survey Responses',
    icon: 'clipboard-list',
    description: 'Survey and questionnaire response data',
  },
  reviews: {
    label: 'Product Reviews',
    icon: 'star',
    description: 'Product ratings, reviews, and feedback data',
  },
  iot: {
    label: 'IoT Sensor Data',
    icon: 'cpu',
    description: 'Device telemetry and sensor readings',
  },
  addresses: {
    label: 'Address Data',
    icon: 'map-pin',
    description: 'Synthetic addresses and geographic locations',
  },
  emails: {
    label: 'Email Data',
    icon: 'mail',
    description: 'Synthetic email correspondence and metadata',
  },
  social: {
    label: 'Social Media',
    icon: 'share-2',
    description: 'Social media posts, engagement, and sentiment data',
  },
  api_test: {
    label: 'API Test Data',
    icon: 'code',
    description: 'API request/response payloads for testing',
  },
  images: {
    label: 'Image Metadata',
    icon: 'image',
    description: 'Image descriptions and metadata for CV training',
  },
};

const seedData = {
  tabular: [
    { name: 'Employee Directory', description: 'Synthetic employee records with departments, roles, and salaries', record_count: 500, data: [{ id: 1, name: 'John Smith', department: 'Engineering', role: 'Senior Developer', salary: 125000, hire_date: '2021-03-15' }, { id: 2, name: 'Sarah Johnson', department: 'Marketing', role: 'Marketing Manager', salary: 95000, hire_date: '2020-07-22' }, { id: 3, name: 'Michael Chen', department: 'Sales', role: 'Account Executive', salary: 85000, hire_date: '2022-01-10' }] },
    { name: 'Product Catalog', description: 'E-commerce product listing with pricing and inventory', record_count: 1000, data: [{ id: 1, product: 'Wireless Headphones', category: 'Electronics', price: 79.99, stock: 342 }, { id: 2, product: 'Organic Coffee Beans', category: 'Food', price: 14.99, stock: 1200 }] },
    { name: 'Student Records', description: 'Academic records with grades, courses, and enrollment data', record_count: 750, data: [{ id: 1, student: 'Emma Wilson', major: 'Computer Science', gpa: 3.8, credits: 96 }] },
    { name: 'Inventory Tracking', description: 'Warehouse inventory with SKU, location, and quantity data', record_count: 2000, data: [{ sku: 'WH-001', item: 'Widget A', warehouse: 'NYC-1', quantity: 5000, reorder_point: 1000 }] },
    { name: 'Sales Pipeline', description: 'CRM sales opportunity data with stages and values', record_count: 300, data: [{ id: 1, company: 'Acme Corp', deal_value: 50000, stage: 'Negotiation', probability: 0.75 }] },
    { name: 'Weather Station Data', description: 'Multi-station weather readings with temperature, humidity, and pressure', record_count: 8760, data: [{ station: 'WS-101', temp_f: 72.5, humidity: 45, pressure: 29.92, wind_mph: 12 }] },
    { name: 'Vehicle Fleet', description: 'Fleet management data with maintenance and fuel records', record_count: 150, data: [{ vehicle_id: 'V-001', make: 'Toyota', model: 'Camry', year: 2023, mileage: 15420, fuel_efficiency: 32.5 }] },
    { name: 'Real Estate Listings', description: 'Property listing data with pricing, features, and location', record_count: 500, data: [{ id: 1, address: '123 Oak St', city: 'Portland', price: 450000, bedrooms: 3, sqft: 1850 }] },
    { name: 'Event Registration', description: 'Conference attendee data with sessions and preferences', record_count: 400, data: [{ id: 1, attendee: 'Dr. Lisa Park', company: 'TechCorp', ticket: 'VIP', sessions: ['AI Workshop', 'Keynote'] }] },
    { name: 'Nutrition Database', description: 'Food nutrition facts with macro and micronutrient values', record_count: 600, data: [{ food: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }] },
    { name: 'Airline Flight Data', description: 'Flight schedules with routes, delays, and passenger counts', record_count: 1500, data: [{ flight: 'AA-1234', origin: 'JFK', dest: 'LAX', scheduled: '08:00', delay_min: 15, passengers: 189 }] },
    { name: 'Gym Membership', description: 'Fitness center member data with attendance and programs', record_count: 250, data: [{ member_id: 'M-001', name: 'Alex Turner', plan: 'Premium', visits_month: 18, trainer: 'Coach Kim' }] },
    { name: 'Library Catalog', description: 'Book catalog with checkout history and availability', record_count: 3000, data: [{ isbn: '978-0-123456-78-9', title: 'Data Science Fundamentals', author: 'R. Martinez', available: true, checkouts: 45 }] },
    { name: 'Hospital Bed Occupancy', description: 'Real-time bed occupancy data across departments', record_count: 200, data: [{ ward: 'ICU', total_beds: 20, occupied: 17, available: 3, avg_stay_days: 4.2 }] },
    { name: 'Shipping Manifests', description: 'International shipping container tracking data', record_count: 800, data: [{ container: 'MSKU-123456', origin: 'Shanghai', dest: 'Long Beach', weight_kg: 22000, status: 'In Transit' }] },
  ],
  text: [
    { name: 'Sentiment Analysis Corpus', description: 'Product review texts labeled with sentiment scores', record_count: 1000, data: [{ text: 'This product exceeded my expectations. Great quality!', sentiment: 'positive', score: 0.92 }, { text: 'Terrible experience. Would not recommend.', sentiment: 'negative', score: 0.15 }] },
    { name: 'News Article Summaries', description: 'News articles with headlines and category labels', record_count: 500, data: [{ headline: 'Tech Giants Report Record Earnings', category: 'Business', summary: 'Major technology companies surpassed analyst expectations...' }] },
    { name: 'Chatbot Training Data', description: 'Intent-labeled conversational exchanges', record_count: 2000, data: [{ intent: 'greeting', user: 'Hi, how can you help me?', response: 'Hello! I can assist you with account inquiries, billing, and technical support.' }] },
    { name: 'Legal Document Excerpts', description: 'Contract clauses and legal text for NER training', record_count: 300, data: [{ type: 'indemnification', text: 'The Company shall indemnify and hold harmless the Contractor...', entities: ['Company', 'Contractor'] }] },
    { name: 'Multilingual Translations', description: 'Parallel text corpus for translation models', record_count: 1500, data: [{ en: 'The weather is beautiful today.', es: 'El clima es hermoso hoy.', fr: 'Le temps est magnifique aujourd\'hui.' }] },
    { name: 'Email Subject Lines', description: 'Marketing email subjects with open rate data', record_count: 800, data: [{ subject: '50% Off - Today Only!', category: 'promotional', open_rate: 0.32 }] },
    { name: 'Technical Documentation', description: 'API documentation snippets for code generation', record_count: 400, data: [{ endpoint: '/api/users', method: 'GET', description: 'Retrieve a list of all users with pagination support' }] },
    { name: 'Customer Support Tickets', description: 'Support ticket descriptions with priority labels', record_count: 600, data: [{ ticket: 'Unable to reset password after multiple attempts', priority: 'high', category: 'authentication' }] },
    { name: 'Social Media Captions', description: 'Instagram/Twitter captions with engagement metrics', record_count: 1000, data: [{ caption: 'Living my best life! #sunset #travel', platform: 'instagram', likes: 1243 }] },
    { name: 'Resume Summaries', description: 'Professional summary paragraphs for resume screening', record_count: 500, data: [{ summary: 'Experienced data scientist with 8+ years in ML/AI...', industry: 'Technology', level: 'Senior' }] },
    { name: 'Medical Notes', description: 'Clinical notes for medical NLP training', record_count: 400, data: [{ note: 'Patient presents with acute onset of chest pain...', specialty: 'Cardiology', type: 'progress_note' }] },
    { name: 'FAQ Pairs', description: 'Question-answer pairs for conversational AI', record_count: 350, data: [{ question: 'How do I return an item?', answer: 'You can initiate a return within 30 days of purchase through your account settings.' }] },
    { name: 'Book Descriptions', description: 'Book blurbs and descriptions for recommendation systems', record_count: 700, data: [{ title: 'The Algorithm', genre: 'Sci-Fi', description: 'In a world where AI governs every decision...' }] },
    { name: 'Spam Detection Dataset', description: 'Labeled spam/ham text messages', record_count: 2000, data: [{ text: 'Congratulations! You won a free iPhone!', label: 'spam', confidence: 0.98 }] },
    { name: 'Poetry Collection', description: 'Generated poetry with style and mood labels', record_count: 200, data: [{ poem: 'Whispers in the digital wind...', style: 'free_verse', mood: 'contemplative' }] },
  ],
  customers: [
    { name: 'E-Commerce Customers', description: 'Online retail customer profiles with purchase behavior', record_count: 1000, data: [{ id: 1, name: 'Alice Brown', email: 'alice@example.com', age: 34, location: 'San Francisco, CA', lifetime_value: 2450.00, segment: 'High Value' }] },
    { name: 'B2B Client Profiles', description: 'Business customer data for CRM systems', record_count: 200, data: [{ company: 'TechStart Inc', industry: 'SaaS', employees: 150, annual_revenue: 5000000, contact: 'James Park' }] },
    { name: 'Banking Customers', description: 'Bank customer demographics and account summaries', record_count: 500, data: [{ id: 1, name: 'Robert Lee', age: 45, income: 95000, credit_score: 780, accounts: ['checking', 'savings', 'mortgage'] }] },
    { name: 'Subscription Users', description: 'SaaS user profiles with subscription and usage data', record_count: 800, data: [{ user_id: 'U-001', plan: 'Professional', mrr: 99.00, usage_pct: 78, churn_risk: 'low' }] },
    { name: 'Healthcare Patients', description: 'Patient demographic profiles for health systems', record_count: 600, data: [{ patient_id: 'P-001', age: 52, gender: 'M', insurance: 'BlueCross', primary_physician: 'Dr. Martinez' }] },
    { name: 'Loyalty Program Members', description: 'Retail loyalty program participant data', record_count: 1500, data: [{ member_id: 'L-001', name: 'Maria Garcia', tier: 'Gold', points: 45200, last_purchase: '2024-11-15' }] },
    { name: 'Mobile App Users', description: 'App user profiles with engagement metrics', record_count: 2000, data: [{ user_id: 'APP-001', device: 'iPhone 15', os: 'iOS 17', sessions_weekly: 12, avg_session_min: 8 }] },
    { name: 'Insurance Policyholders', description: 'Insurance customer data with policy details', record_count: 400, data: [{ policy_id: 'INS-001', holder: 'David Kim', type: 'Auto', premium: 1200, deductible: 500 }] },
    { name: 'Restaurant Diners', description: 'Restaurant customer profiles and dining preferences', record_count: 300, data: [{ id: 1, name: 'Sophie Chen', favorite_cuisine: 'Italian', avg_spend: 45, visits_monthly: 4 }] },
    { name: 'Telecom Subscribers', description: 'Mobile carrier customer data with plan details', record_count: 700, data: [{ subscriber_id: 'T-001', plan: 'Unlimited Plus', data_usage_gb: 25, tenure_months: 36, satisfaction: 4.2 }] },
    { name: 'Travel Agency Clients', description: 'Travel customer profiles with booking history', record_count: 350, data: [{ client_id: 'TR-001', name: 'Ana Rodriguez', preferred_dest: 'Europe', annual_trips: 3, budget_range: '$3000-$5000' }] },
    { name: 'Fitness App Users', description: 'Fitness tracker user profiles and activity data', record_count: 900, data: [{ user_id: 'FIT-001', age: 28, goal: 'Weight Loss', daily_steps: 8500, workout_frequency: 4 }] },
    { name: 'Education Platform Learners', description: 'Online learning platform user data', record_count: 1200, data: [{ learner_id: 'EDU-001', name: 'Ryan O\'Brien', courses_enrolled: 5, completion_rate: 0.72, skill_level: 'Intermediate' }] },
    { name: 'Automotive Customers', description: 'Car dealership customer data and preferences', record_count: 250, data: [{ id: 1, name: 'Tom Harris', preferred_make: 'Toyota', budget: 35000, trade_in: true }] },
    { name: 'Gaming Platform Users', description: 'Online gaming user profiles and behavior', record_count: 1500, data: [{ gamer_tag: 'NightHawk42', age: 22, platform: 'PC', hours_weekly: 20, genre: 'FPS', spend_monthly: 29.99 }] },
  ],
  medical: [
    { name: 'Patient Vitals Dataset', description: 'Patient vital signs monitoring data', record_count: 5000, data: [{ patient_id: 'PAT-001', heart_rate: 72, blood_pressure: '120/80', temperature: 98.6, oxygen_sat: 98, timestamp: '2024-01-15T08:30:00Z' }] },
    { name: 'Diagnosis Records', description: 'ICD-10 coded diagnosis records', record_count: 1000, data: [{ record_id: 'DX-001', icd10: 'J06.9', description: 'Acute upper respiratory infection', severity: 'mild', department: 'Internal Medicine' }] },
    { name: 'Medication Prescriptions', description: 'Prescription data with dosage and interactions', record_count: 800, data: [{ rx_id: 'RX-001', medication: 'Lisinopril', dosage: '10mg', frequency: 'Daily', indication: 'Hypertension' }] },
    { name: 'Lab Results', description: 'Clinical laboratory test results', record_count: 3000, data: [{ lab_id: 'LAB-001', test: 'Complete Blood Count', wbc: 7.2, rbc: 4.8, hemoglobin: 14.2, status: 'Normal' }] },
    { name: 'Radiology Reports', description: 'Imaging study reports and findings', record_count: 500, data: [{ report_id: 'RAD-001', modality: 'CT', body_part: 'Chest', finding: 'No acute cardiopulmonary process', impression: 'Normal' }] },
    { name: 'Surgical Records', description: 'Surgical procedure documentation', record_count: 200, data: [{ surgery_id: 'SUR-001', procedure: 'Laparoscopic Cholecystectomy', duration_min: 45, surgeon: 'Dr. Williams', outcome: 'Successful' }] },
    { name: 'Allergy Records', description: 'Patient allergy and adverse reaction data', record_count: 600, data: [{ patient_id: 'PAT-002', allergen: 'Penicillin', reaction: 'Rash', severity: 'moderate', verified: true }] },
    { name: 'Immunization Records', description: 'Vaccination history and schedules', record_count: 1500, data: [{ patient_id: 'PAT-003', vaccine: 'Influenza', date: '2024-10-01', lot_number: 'FL2024-789', site: 'Left Deltoid' }] },
    { name: 'Emergency Department Visits', description: 'ED visit records with triage and disposition', record_count: 400, data: [{ visit_id: 'ED-001', chief_complaint: 'Chest pain', triage_level: 2, arrival: '2024-01-15T14:22:00Z', disposition: 'Admitted' }] },
    { name: 'Mental Health Assessments', description: 'Psychiatric evaluation scores and notes', record_count: 300, data: [{ assessment_id: 'MH-001', scale: 'PHQ-9', score: 8, severity: 'Mild depression', recommendations: ['Counseling', 'Follow-up in 4 weeks'] }] },
    { name: 'Physical Therapy Sessions', description: 'PT session records with exercises and progress', record_count: 700, data: [{ session_id: 'PT-001', diagnosis: 'ACL Reconstruction', exercises: ['Quad Sets', 'Heel Slides'], pain_level: 3, progress: '45% improved' }] },
    { name: 'Insurance Claims', description: 'Medical insurance claim data', record_count: 900, data: [{ claim_id: 'CLM-001', procedure_code: '99213', amount: 250.00, status: 'Approved', payer: 'Aetna' }] },
    { name: 'Clinical Trial Data', description: 'Anonymized clinical trial participant data', record_count: 150, data: [{ participant_id: 'CT-001', arm: 'Treatment', week: 4, primary_endpoint: 0.82, adverse_events: 0, completed: true }] },
    { name: 'Nursing Assessments', description: 'Nursing care documentation and assessments', record_count: 1200, data: [{ assessment_id: 'NA-001', patient_id: 'PAT-004', pain_score: 4, mobility: 'Ambulatory', nutrition: 'Regular diet', fall_risk: 'Low' }] },
    { name: 'Discharge Summaries', description: 'Hospital discharge documentation', record_count: 350, data: [{ discharge_id: 'DC-001', admission_date: '2024-01-10', discharge_date: '2024-01-15', diagnosis: 'Community-acquired pneumonia', follow_up: '1 week' }] },
  ],
  financial: [
    { name: 'Credit Card Transactions', description: 'Credit card transaction data for fraud detection', record_count: 10000, data: [{ tx_id: 'TX-001', card_last4: '4532', amount: 127.50, merchant: 'Amazon', category: 'Online Shopping', is_fraud: false }] },
    { name: 'Stock Market Data', description: 'Historical stock price OHLCV data', record_count: 5000, data: [{ symbol: 'AAPL', date: '2024-01-15', open: 185.50, high: 187.20, low: 184.80, close: 186.90, volume: 52000000 }] },
    { name: 'Bank Transfers', description: 'Inter-bank wire transfer records', record_count: 2000, data: [{ transfer_id: 'WT-001', from_account: 'ACC-1234', to_account: 'ACC-5678', amount: 5000.00, currency: 'USD', status: 'Completed' }] },
    { name: 'Loan Applications', description: 'Consumer loan application data', record_count: 800, data: [{ app_id: 'LA-001', amount: 25000, type: 'Personal', credit_score: 720, income: 85000, status: 'Approved', rate: 7.5 }] },
    { name: 'Insurance Premiums', description: 'Insurance premium calculation data', record_count: 600, data: [{ policy_id: 'POL-001', type: 'Auto', annual_premium: 1450, risk_score: 'B+', deductible: 500 }] },
    { name: 'Cryptocurrency Trades', description: 'Crypto exchange trade history', record_count: 3000, data: [{ trade_id: 'CR-001', pair: 'BTC/USD', side: 'buy', price: 43250.00, quantity: 0.5, exchange: 'Coinbase' }] },
    { name: 'Expense Reports', description: 'Corporate expense report submissions', record_count: 500, data: [{ report_id: 'EXP-001', employee: 'Jane Doe', category: 'Travel', amount: 1250.00, status: 'Pending', receipts: 5 }] },
    { name: 'Revenue Forecasts', description: 'Quarterly revenue projection data', record_count: 200, data: [{ quarter: 'Q1-2024', product_line: 'SaaS', projected: 2500000, actual: 2650000, variance: 0.06 }] },
    { name: 'Payment Processing', description: 'Payment gateway transaction logs', record_count: 8000, data: [{ payment_id: 'PAY-001', gateway: 'Stripe', amount: 49.99, currency: 'USD', status: 'succeeded', processing_time_ms: 850 }] },
    { name: 'Tax Records', description: 'Tax filing and deduction data', record_count: 400, data: [{ filing_id: 'TAX-001', year: 2023, gross_income: 120000, deductions: 25000, tax_owed: 22750, status: 'Filed' }] },
    { name: 'Portfolio Holdings', description: 'Investment portfolio composition data', record_count: 300, data: [{ portfolio_id: 'PF-001', asset: 'MSFT', shares: 100, cost_basis: 280.50, current_price: 375.20, gain_pct: 33.7 }] },
    { name: 'Invoice Data', description: 'B2B invoice and payment terms data', record_count: 700, data: [{ invoice_id: 'INV-001', client: 'Acme Corp', amount: 15000, terms: 'Net 30', status: 'Paid', due_date: '2024-02-15' }] },
    { name: 'Budget Allocations', description: 'Department budget planning data', record_count: 150, data: [{ dept: 'Engineering', annual_budget: 5000000, spent: 3750000, remaining: 1250000, utilization: 0.75 }] },
    { name: 'Audit Trail', description: 'Financial audit log entries', record_count: 2000, data: [{ audit_id: 'AUD-001', action: 'Account Modification', user: 'admin@corp.com', timestamp: '2024-01-15T10:30:00Z', details: 'Updated credit limit' }] },
    { name: 'Merchant Data', description: 'Merchant onboarding and risk assessment data', record_count: 350, data: [{ merchant_id: 'M-001', name: 'Coffee House LLC', mcc: '5812', risk_level: 'Low', monthly_volume: 45000 }] },
  ],
  timeseries: [
    { name: 'Server CPU Metrics', description: 'Server CPU utilization time series', record_count: 8760, data: [{ timestamp: '2024-01-01T00:00:00Z', cpu_pct: 45.2, server: 'web-01', cores: 8 }] },
    { name: 'Website Traffic', description: 'Hourly website visitor counts', record_count: 4380, data: [{ timestamp: '2024-01-01T00:00:00Z', visitors: 1250, page_views: 3400, bounce_rate: 0.42 }] },
    { name: 'Energy Consumption', description: 'Smart grid energy consumption readings', record_count: 17520, data: [{ timestamp: '2024-01-01T00:00:00Z', kwh: 125.5, building: 'HQ-1', zone: 'HVAC' }] },
    { name: 'Stock Tick Data', description: 'High-frequency stock tick data', record_count: 50000, data: [{ timestamp: '2024-01-15T09:30:00.123Z', symbol: 'AAPL', price: 185.42, volume: 1500, bid: 185.40, ask: 185.44 }] },
    { name: 'Temperature Readings', description: 'Multi-sensor temperature monitoring', record_count: 10000, data: [{ timestamp: '2024-01-01T00:00:00Z', sensor_id: 'TEMP-01', value: 22.5, unit: 'celsius', location: 'Floor 3' }] },
    { name: 'Network Bandwidth', description: 'Network throughput time series', record_count: 6000, data: [{ timestamp: '2024-01-01T00:00:00Z', interface: 'eth0', rx_mbps: 450, tx_mbps: 230, errors: 0 }] },
    { name: 'Air Quality Index', description: 'AQI measurements from monitoring stations', record_count: 8760, data: [{ timestamp: '2024-01-01T00:00:00Z', station: 'AQ-SF-01', aqi: 42, pm25: 8.5, pm10: 15.2, category: 'Good' }] },
    { name: 'Database Query Latency', description: 'Database response time measurements', record_count: 12000, data: [{ timestamp: '2024-01-01T00:00:00.000Z', query_type: 'SELECT', latency_ms: 12.5, db: 'postgres-primary', rows_returned: 150 }] },
    { name: 'Sales by Hour', description: 'Hourly point-of-sale transaction totals', record_count: 4380, data: [{ timestamp: '2024-01-01T10:00:00Z', store: 'Downtown', total: 2340.50, transactions: 45, avg_basket: 52.01 }] },
    { name: 'Heart Rate Monitor', description: 'Continuous heart rate monitoring data', record_count: 86400, data: [{ timestamp: '2024-01-01T00:00:00Z', bpm: 68, activity: 'resting', device: 'watch-v3' }] },
    { name: 'CO2 Emissions Tracking', description: 'Industrial CO2 emission measurements', record_count: 2190, data: [{ timestamp: '2024-01-01T00:00:00Z', facility: 'Plant-A', co2_tons: 12.5, efficiency: 0.92 }] },
    { name: 'API Response Times', description: 'API endpoint latency monitoring', record_count: 15000, data: [{ timestamp: '2024-01-01T00:00:00Z', endpoint: '/api/users', method: 'GET', latency_ms: 45, status: 200 }] },
    { name: 'Water Flow Rates', description: 'Municipal water system flow measurements', record_count: 5000, data: [{ timestamp: '2024-01-01T00:00:00Z', meter: 'WM-001', flow_gpm: 150, pressure_psi: 60, zone: 'North' }] },
    { name: 'Social Media Engagement', description: 'Post engagement metrics over time', record_count: 3000, data: [{ timestamp: '2024-01-01T00:00:00Z', platform: 'Twitter', impressions: 5200, engagements: 312, rate: 0.06 }] },
    { name: 'Manufacturing Output', description: 'Production line output metrics', record_count: 4380, data: [{ timestamp: '2024-01-01T06:00:00Z', line: 'Assembly-1', units_produced: 125, defect_rate: 0.02, downtime_min: 5 }] },
  ],
  logs: [
    { name: 'Application Error Logs', description: 'Web application error and exception logs', record_count: 5000, data: [{ timestamp: '2024-01-15T10:23:45Z', level: 'ERROR', service: 'api-gateway', message: 'Connection timeout to upstream service', trace_id: 'abc-123' }] },
    { name: 'Access Logs', description: 'HTTP access logs from web servers', record_count: 50000, data: [{ timestamp: '2024-01-15T10:23:45Z', method: 'GET', path: '/api/users', status: 200, response_time_ms: 45, ip: '192.168.1.100' }] },
    { name: 'Authentication Logs', description: 'Login and auth event logs', record_count: 3000, data: [{ timestamp: '2024-01-15T10:23:45Z', event: 'login_success', user: 'john@example.com', ip: '10.0.0.1', method: 'password', mfa: true }] },
    { name: 'Database Slow Queries', description: 'Slow query log entries', record_count: 500, data: [{ timestamp: '2024-01-15T10:23:45Z', query: 'SELECT * FROM orders WHERE...', duration_ms: 2500, rows_examined: 50000, db: 'orders_db' }] },
    { name: 'Kubernetes Events', description: 'K8s cluster event logs', record_count: 8000, data: [{ timestamp: '2024-01-15T10:23:45Z', type: 'Warning', reason: 'BackOff', object: 'pod/api-7d8f9', message: 'Back-off restarting failed container', namespace: 'production' }] },
    { name: 'Security Audit Logs', description: 'Security event and compliance logs', record_count: 2000, data: [{ timestamp: '2024-01-15T10:23:45Z', event: 'file_access', user: 'admin', resource: '/etc/passwd', action: 'read', result: 'allowed' }] },
    { name: 'CI/CD Pipeline Logs', description: 'Build and deployment pipeline logs', record_count: 1500, data: [{ timestamp: '2024-01-15T10:23:45Z', pipeline: 'deploy-prod', stage: 'build', status: 'success', duration_s: 145, commit: 'a1b2c3d' }] },
    { name: 'Message Queue Logs', description: 'RabbitMQ/Kafka message processing logs', record_count: 10000, data: [{ timestamp: '2024-01-15T10:23:45Z', queue: 'order-processing', action: 'consume', message_id: 'msg-001', processing_ms: 25, status: 'ack' }] },
    { name: 'DNS Query Logs', description: 'DNS resolver query logs', record_count: 20000, data: [{ timestamp: '2024-01-15T10:23:45Z', query: 'api.example.com', type: 'A', response: '10.0.0.5', ttl: 300, client: '192.168.1.1' }] },
    { name: 'Container Runtime Logs', description: 'Docker/containerd runtime logs', record_count: 6000, data: [{ timestamp: '2024-01-15T10:23:45Z', container: 'web-app-1', image: 'nginx:1.25', event: 'start', cpu_pct: 12.5, memory_mb: 256 }] },
    { name: 'Load Balancer Logs', description: 'Load balancer access and health check logs', record_count: 15000, data: [{ timestamp: '2024-01-15T10:23:45Z', backend: 'web-pool-1', health: 'healthy', active_connections: 450, request_rate: 1200 }] },
    { name: 'Cron Job Logs', description: 'Scheduled task execution logs', record_count: 1000, data: [{ timestamp: '2024-01-15T00:00:00Z', job: 'daily-cleanup', status: 'completed', duration_s: 32, records_processed: 15000 }] },
    { name: 'Firewall Logs', description: 'Network firewall rule match logs', record_count: 25000, data: [{ timestamp: '2024-01-15T10:23:45Z', src_ip: '203.0.113.5', dst_ip: '10.0.0.1', port: 443, protocol: 'TCP', action: 'allow', rule: 'web-inbound' }] },
    { name: 'Application Performance', description: 'APM trace and span logs', record_count: 8000, data: [{ timestamp: '2024-01-15T10:23:45Z', trace_id: 'tr-001', span: 'db.query', service: 'order-service', duration_ms: 15, status: 'ok' }] },
    { name: 'Backup Job Logs', description: 'Database and file backup operation logs', record_count: 500, data: [{ timestamp: '2024-01-15T02:00:00Z', job: 'pg-backup-daily', type: 'full', size_gb: 45.2, duration_min: 12, status: 'completed', target: 's3://backups/' }] },
  ],
  surveys: [
    { name: 'Customer Satisfaction Survey', description: 'CSAT survey responses from product users', record_count: 500, data: [{ respondent_id: 1, satisfaction: 4, nps: 8, recommend: 'yes', feedback: 'Great product, could improve onboarding' }] },
    { name: 'Employee Engagement Survey', description: 'Annual employee engagement questionnaire', record_count: 300, data: [{ respondent_id: 1, engagement_score: 4.2, work_life_balance: 3.8, career_growth: 4.0, manager_rating: 4.5 }] },
    { name: 'Market Research Survey', description: 'Consumer preference and market analysis survey', record_count: 1000, data: [{ respondent_id: 1, age_group: '25-34', brand_preference: 'Brand A', purchase_frequency: 'Weekly', price_sensitivity: 'Medium' }] },
    { name: 'UX Feedback Survey', description: 'User experience and usability survey', record_count: 400, data: [{ respondent_id: 1, task_completion: true, ease_of_use: 4, visual_appeal: 5, time_on_task_sec: 45, sus_score: 82 }] },
    { name: 'Event Feedback', description: 'Post-event attendee feedback', record_count: 250, data: [{ respondent_id: 1, event: 'Tech Conference 2024', overall_rating: 4, speakers: 5, venue: 3, networking: 4, would_attend_again: true }] },
    { name: 'Healthcare Patient Survey', description: 'Patient experience survey responses', record_count: 600, data: [{ respondent_id: 1, wait_time_rating: 3, doctor_communication: 5, staff_friendliness: 4, facility_cleanliness: 5, overall: 4 }] },
    { name: 'Product Feature Prioritization', description: 'Feature request voting and prioritization', record_count: 350, data: [{ respondent_id: 1, role: 'Developer', top_feature: 'API Integration', priority: 'High', willing_to_pay: true, comments: 'Critical for our workflow' }] },
    { name: 'Training Effectiveness', description: 'Post-training assessment survey', record_count: 200, data: [{ respondent_id: 1, course: 'Data Science 101', knowledge_before: 2, knowledge_after: 4, instructor_rating: 5, apply_to_work: true }] },
    { name: 'Website Usability Survey', description: 'Website navigation and usability feedback', record_count: 800, data: [{ respondent_id: 1, found_info: true, navigation_ease: 4, page_load_speed: 3, mobile_experience: 4, search_effective: true }] },
    { name: 'Brand Perception Study', description: 'Brand awareness and perception survey', record_count: 1500, data: [{ respondent_id: 1, brand_awareness: true, perception: 'Innovative', trust_level: 4, competitor_comparison: 'Better', purchase_intent: 'Likely' }] },
    { name: 'Remote Work Survey', description: 'Remote work preferences and productivity', record_count: 450, data: [{ respondent_id: 1, work_preference: 'Hybrid', productivity_change: 'Increased', home_setup: 'Adequate', collaboration_tools: ['Slack', 'Zoom'] }] },
    { name: 'Food Preference Survey', description: 'Dietary preferences and restaurant feedback', record_count: 700, data: [{ respondent_id: 1, diet: 'Omnivore', favorite_cuisine: 'Japanese', meal_prep: true, dining_out_freq: '2x/week', budget: '$15-25' }] },
    { name: 'Transportation Survey', description: 'Commuting and transportation habit survey', record_count: 350, data: [{ respondent_id: 1, primary_transport: 'Car', commute_min: 35, open_to_transit: true, ev_interest: 'High', monthly_cost: 250 }] },
    { name: 'Financial Literacy Assessment', description: 'Personal finance knowledge assessment', record_count: 500, data: [{ respondent_id: 1, budgeting_knowledge: 4, investment_knowledge: 2, retirement_planning: 3, debt_management: 4, overall_score: 65 }] },
    { name: 'Technology Adoption Survey', description: 'Technology usage and adoption readiness', record_count: 600, data: [{ respondent_id: 1, tech_savviness: 'Advanced', ai_comfort: 4, privacy_concern: 3, smart_home_devices: 5, early_adopter: true }] },
  ],
  reviews: [
    { name: 'Electronics Reviews', description: 'Consumer electronics product reviews', record_count: 2000, data: [{ id: 1, product: 'Sony WH-1000XM5', rating: 5, title: 'Best noise cancelling ever', body: 'Incredible sound quality and the noise cancellation is unmatched...', author: 'AudioFan92', verified: true, helpful: 234 }] },
    { name: 'Restaurant Reviews', description: 'Restaurant and dining experience reviews', record_count: 1500, data: [{ id: 1, restaurant: 'La Maison', cuisine: 'French', rating: 4, title: 'Excellent ambiance', body: 'The foie gras was divine...', author: 'FoodieExplorer', price_range: '$$$$' }] },
    { name: 'Software/App Reviews', description: 'SaaS and mobile app user reviews', record_count: 3000, data: [{ id: 1, app: 'ProjectFlow', platform: 'iOS', rating: 4, title: 'Great project management tool', body: 'Replaced our old PM tool...', author: 'PMPro', version: '3.2.1' }] },
    { name: 'Book Reviews', description: 'Book reviews with genre and reading data', record_count: 1000, data: [{ id: 1, book: 'The Algorithm', author_book: 'J. Chen', rating: 5, review: 'A masterful exploration of AI ethics...', genre: 'Sci-Fi', pages_read: 384 }] },
    { name: 'Hotel Reviews', description: 'Hotel and accommodation reviews', record_count: 800, data: [{ id: 1, hotel: 'Grand Pacific', city: 'Tokyo', rating: 4, title: 'Beautiful location', body: 'The view from the 30th floor was breathtaking...', room_type: 'Suite', value_rating: 3 }] },
    { name: 'Automotive Reviews', description: 'Vehicle owner reviews and ratings', record_count: 500, data: [{ id: 1, vehicle: '2024 Tesla Model 3', rating: 4, title: 'Great EV, some quirks', body: 'The range is impressive at 350+ miles...', ownership_months: 6, miles_driven: 8500 }] },
    { name: 'Online Course Reviews', description: 'E-learning course reviews and ratings', record_count: 700, data: [{ id: 1, course: 'Machine Learning A-Z', platform: 'Udemy', rating: 5, title: 'Best ML course out there', instructor_rating: 5, completion: true }] },
    { name: 'Fitness Equipment Reviews', description: 'Home gym equipment reviews', record_count: 400, data: [{ id: 1, product: 'Peloton Bike+', rating: 4, title: 'Worth the investment', body: 'Great workout variety...', months_owned: 12, usage: 'Daily' }] },
    { name: 'Skincare Product Reviews', description: 'Beauty and skincare product reviews', record_count: 1200, data: [{ id: 1, product: 'CeraVe Moisturizer', rating: 5, skin_type: 'Sensitive', title: 'Holy grail moisturizer', body: 'Finally found something that works...', repurchase: true }] },
    { name: 'Subscription Box Reviews', description: 'Monthly subscription box reviews', record_count: 300, data: [{ id: 1, box: 'SnackCrate', category: 'Food', rating: 4, title: 'Fun international snacks', value_for_money: 4, months_subscribed: 8 }] },
    { name: 'Travel Destination Reviews', description: 'Travel destination and experience reviews', record_count: 600, data: [{ id: 1, destination: 'Kyoto, Japan', rating: 5, season: 'Spring', title: 'Cherry blossom paradise', highlights: ['Fushimi Inari', 'Bamboo Grove'], budget_per_day: 150 }] },
    { name: 'Pet Product Reviews', description: 'Pet food and accessory reviews', record_count: 500, data: [{ id: 1, product: 'Blue Buffalo Dog Food', pet_type: 'Dog', rating: 4, title: 'My dog loves it', body: 'Switched from generic brand...', pet_age: 5, repurchase: true }] },
    { name: 'Kitchen Appliance Reviews', description: 'Kitchen gadget and appliance reviews', record_count: 450, data: [{ id: 1, product: 'Instant Pot Duo', rating: 5, title: 'Game changer for meal prep', cooking_frequency: 'Daily', ease_of_use: 5, cleanup: 4 }] },
    { name: 'Streaming Service Reviews', description: 'Video streaming platform reviews', record_count: 350, data: [{ id: 1, service: 'Netflix', rating: 4, title: 'Great content variety', content_quality: 4, ui_rating: 5, value: 3, hours_weekly: 10 }] },
    { name: 'Workspace/Coworking Reviews', description: 'Coworking space reviews', record_count: 200, data: [{ id: 1, space: 'WeWork Downtown', city: 'NYC', rating: 3, title: 'Good location, pricey', amenities: 4, noise_level: 'Moderate', wifi_speed: 'Fast', monthly_cost: 500 }] },
  ],
  iot: [
    { name: 'Smart Home Sensors', description: 'Home automation sensor data', record_count: 50000, data: [{ device_id: 'SH-001', type: 'temperature', value: 72.5, unit: 'F', room: 'Living Room', battery: 85, timestamp: '2024-01-15T10:00:00Z' }] },
    { name: 'Industrial Vibration Sensors', description: 'Manufacturing equipment vibration monitoring', record_count: 100000, data: [{ sensor_id: 'VIB-001', machine: 'CNC-Mill-03', frequency_hz: 120.5, amplitude_mm: 0.02, status: 'Normal', timestamp: '2024-01-15T10:00:00Z' }] },
    { name: 'Fleet GPS Tracking', description: 'Vehicle GPS and telemetry data', record_count: 20000, data: [{ vehicle_id: 'V-001', lat: 37.7749, lng: -122.4194, speed_mph: 35, heading: 270, fuel_level: 0.65, timestamp: '2024-01-15T10:00:00Z' }] },
    { name: 'Agricultural Soil Sensors', description: 'Farm soil condition monitoring', record_count: 15000, data: [{ sensor_id: 'SOIL-001', field: 'North-40', moisture_pct: 35, ph: 6.8, nitrogen_ppm: 45, temperature: 18.5, timestamp: '2024-01-15T10:00:00Z' }] },
    { name: 'Weather Station Network', description: 'Multi-station weather monitoring', record_count: 30000, data: [{ station_id: 'WX-001', temp_c: 22.5, humidity: 65, wind_speed_kmh: 15, precipitation_mm: 0, pressure_hpa: 1013, timestamp: '2024-01-15T10:00:00Z' }] },
    { name: 'Smart Meter Readings', description: 'Utility smart meter electricity data', record_count: 25000, data: [{ meter_id: 'EM-001', kwh: 2.5, voltage: 120.1, current_a: 20.8, power_factor: 0.95, timestamp: '2024-01-15T10:00:00Z' }] },
    { name: 'Wearable Health Devices', description: 'Fitness tracker and health wearable data', record_count: 40000, data: [{ device_id: 'FIT-001', heart_rate: 72, steps: 150, calories: 12, sleep_quality: null, spo2: 98, timestamp: '2024-01-15T10:00:00Z' }] },
    { name: 'Building HVAC Sensors', description: 'Commercial building HVAC monitoring', record_count: 20000, data: [{ sensor_id: 'HVAC-001', zone: 'Floor-3-East', temp_set: 72, temp_actual: 71.5, mode: 'cooling', energy_kwh: 1.2, timestamp: '2024-01-15T10:00:00Z' }] },
    { name: 'Water Quality Monitors', description: 'Water treatment plant sensor data', record_count: 10000, data: [{ sensor_id: 'WQ-001', location: 'Intake', turbidity_ntu: 1.2, ph: 7.1, chlorine_ppm: 0.8, flow_gpm: 500, timestamp: '2024-01-15T10:00:00Z' }] },
    { name: 'Parking Lot Sensors', description: 'Smart parking occupancy data', record_count: 8000, data: [{ sensor_id: 'PK-001', lot: 'Garage-A', spot: 'A-142', occupied: true, duration_min: 45, timestamp: '2024-01-15T10:00:00Z' }] },
    { name: 'Air Quality Sensors', description: 'Indoor/outdoor air quality monitoring', record_count: 12000, data: [{ sensor_id: 'AQ-001', location: 'Office-Floor-2', co2_ppm: 650, pm25: 8.5, voc_ppb: 120, temp_c: 22, timestamp: '2024-01-15T10:00:00Z' }] },
    { name: 'Traffic Flow Sensors', description: 'Road traffic volume and speed sensors', record_count: 30000, data: [{ sensor_id: 'TF-001', intersection: 'Main & 5th', vehicle_count: 45, avg_speed_mph: 28, congestion: 'moderate', timestamp: '2024-01-15T10:00:00Z' }] },
    { name: 'Solar Panel Monitors', description: 'Solar installation performance data', record_count: 15000, data: [{ panel_id: 'SP-001', array: 'Roof-South', power_w: 280, irradiance: 850, temp_c: 45, efficiency: 0.18, timestamp: '2024-01-15T10:00:00Z' }] },
    { name: 'Cold Chain Monitors', description: 'Refrigerated transport temperature tracking', record_count: 10000, data: [{ sensor_id: 'CC-001', shipment: 'SHP-456', temp_c: -18.2, humidity: 30, door_open: false, location: 'In Transit', timestamp: '2024-01-15T10:00:00Z' }] },
    { name: 'Elevator IoT Data', description: 'Elevator operational monitoring', record_count: 5000, data: [{ elevator_id: 'EL-001', building: 'Tower-A', floor: 12, direction: 'up', weight_kg: 450, trips_today: 89, timestamp: '2024-01-15T10:00:00Z' }] },
  ],
  addresses: [
    { name: 'US Residential Addresses', description: 'Fictional US residential addresses', record_count: 1000, data: [{ id: 1, street: '742 Evergreen Terrace', city: 'Springfield', state: 'IL', zip: '62704', type: 'residential', lat: 39.7817, lng: -89.6501 }] },
    { name: 'US Business Addresses', description: 'Fictional commercial addresses', record_count: 500, data: [{ id: 1, business: 'TechHub Inc', street: '100 Innovation Drive', city: 'Austin', state: 'TX', zip: '73301', type: 'commercial' }] },
    { name: 'European Addresses', description: 'Fictional European addresses', record_count: 500, data: [{ id: 1, street: '23 Baker Street', city: 'London', country: 'UK', postal_code: 'W1U 6TL', type: 'residential' }] },
    { name: 'Asian Pacific Addresses', description: 'Fictional Asia-Pacific addresses', record_count: 400, data: [{ id: 1, street: '1-2-3 Shibuya', city: 'Tokyo', country: 'Japan', postal_code: '150-0002', type: 'commercial' }] },
    { name: 'Warehouse Locations', description: 'Distribution center and warehouse addresses', record_count: 100, data: [{ id: 1, facility: 'DC-East', street: '500 Logistics Pkwy', city: 'Memphis', state: 'TN', zip: '38118', sqft: 250000 }] },
    { name: 'Hospital Locations', description: 'Healthcare facility addresses', record_count: 200, data: [{ id: 1, hospital: 'Metro General', street: '1000 Medical Center Dr', city: 'Chicago', state: 'IL', zip: '60612', beds: 500 }] },
    { name: 'School Addresses', description: 'Educational institution addresses', record_count: 300, data: [{ id: 1, school: 'Lincoln Elementary', street: '200 Education Way', city: 'Portland', state: 'OR', zip: '97201', type: 'K-5' }] },
    { name: 'Restaurant Locations', description: 'Restaurant and food service addresses', record_count: 400, data: [{ id: 1, restaurant: 'The Golden Spoon', street: '88 Culinary Ave', city: 'San Francisco', state: 'CA', zip: '94102', cuisine: 'Italian' }] },
    { name: 'Latin American Addresses', description: 'Fictional Latin American addresses', record_count: 300, data: [{ id: 1, street: 'Av. Paulista 1000', city: 'São Paulo', country: 'Brazil', postal_code: '01310-100', type: 'commercial' }] },
    { name: 'Retail Store Locations', description: 'Retail chain store addresses', record_count: 350, data: [{ id: 1, store: 'MegaMart #142', street: '3500 Commerce Blvd', city: 'Dallas', state: 'TX', zip: '75201', format: 'Superstore' }] },
    { name: 'Gas Station Network', description: 'Fuel station location data', record_count: 500, data: [{ id: 1, brand: 'QuickFuel', street: '1 Highway Rest Stop', city: 'Barstow', state: 'CA', zip: '92311', has_ev_charging: true }] },
    { name: 'Gym/Fitness Locations', description: 'Fitness center addresses', record_count: 200, data: [{ id: 1, gym: 'FitLife Studio', street: '420 Wellness Dr', city: 'Denver', state: 'CO', zip: '80202', type: 'Boutique' }] },
    { name: 'Coworking Spaces', description: 'Coworking and shared office addresses', record_count: 150, data: [{ id: 1, space: 'InnoHub', street: '55 Creative Way', city: 'Brooklyn', state: 'NY', zip: '11201', desks: 120 }] },
    { name: 'EV Charging Stations', description: 'Electric vehicle charging location data', record_count: 600, data: [{ id: 1, network: 'ChargePoint', street: '200 Green Energy Ln', city: 'Seattle', state: 'WA', zip: '98101', connectors: ['CCS', 'CHAdeMO'], kw: 150 }] },
    { name: 'Airport Locations', description: 'Airport facility addresses and data', record_count: 100, data: [{ id: 1, code: 'SFO', name: 'San Francisco International', city: 'San Francisco', state: 'CA', runways: 4, annual_passengers: 57000000 }] },
  ],
  emails: [
    { name: 'Sales Outreach Emails', description: 'B2B sales email templates and responses', record_count: 500, data: [{ id: 1, from: 'sales@techcorp.com', to: 'buyer@client.com', subject: 'Transform Your Data Pipeline', type: 'outreach', open_rate: 0.35, reply_rate: 0.12 }] },
    { name: 'Customer Support Threads', description: 'Support email conversation threads', record_count: 800, data: [{ id: 1, from: 'user@example.com', to: 'support@company.com', subject: 'Issue with account access', priority: 'high', resolution_time_hrs: 2.5 }] },
    { name: 'Newsletter Campaigns', description: 'Marketing newsletter email data', record_count: 200, data: [{ id: 1, campaign: 'Weekly Digest #45', subject: 'Top Stories This Week', sent: 50000, opened: 12500, clicked: 3750, unsubscribed: 25 }] },
    { name: 'Internal Communications', description: 'Corporate internal email data', record_count: 1000, data: [{ id: 1, from: 'ceo@company.com', to: 'all-hands@company.com', subject: 'Q4 Results & 2025 Vision', type: 'announcement', department: 'Executive' }] },
    { name: 'Onboarding Email Sequences', description: 'New user onboarding email flows', record_count: 150, data: [{ id: 1, sequence: 'Welcome Series', step: 1, subject: 'Welcome to DataPro!', delay_hours: 0, open_rate: 0.72, cta_click: 0.45 }] },
    { name: 'Transactional Emails', description: 'Order confirmation and receipt emails', record_count: 3000, data: [{ id: 1, type: 'order_confirmation', order_id: 'ORD-12345', to: 'customer@email.com', subject: 'Order Confirmed #12345', amount: 149.99 }] },
    { name: 'Event Invitation Emails', description: 'Event and webinar invitation emails', record_count: 300, data: [{ id: 1, event: 'AI Summit 2024', subject: 'You\'re Invited: AI Summit 2024', sent: 10000, rsvp_yes: 1500, rsvp_no: 500 }] },
    { name: 'Job Application Emails', description: 'Recruitment and job application correspondence', record_count: 400, data: [{ id: 1, from: 'applicant@email.com', position: 'Senior Developer', subject: 'Application: Senior Developer Role', status: 'Under Review' }] },
    { name: 'Feedback Request Emails', description: 'Post-purchase feedback solicitation', record_count: 600, data: [{ id: 1, trigger: 'post_purchase', delay_days: 7, subject: 'How was your experience?', response_rate: 0.18, avg_rating: 4.2 }] },
    { name: 'Account Alert Emails', description: 'Security and account notification emails', record_count: 1500, data: [{ id: 1, type: 'security_alert', subject: 'New login from unknown device', urgency: 'high', action_required: true }] },
    { name: 'Subscription Renewal Emails', description: 'Subscription renewal reminder emails', record_count: 250, data: [{ id: 1, type: 'renewal_reminder', days_before: 7, subject: 'Your subscription renews in 7 days', plan: 'Professional', amount: 99.00 }] },
    { name: 'Partner Communication', description: 'Business partner correspondence', record_count: 350, data: [{ id: 1, from: 'partnerships@company.com', partner: 'DataViz Inc', subject: 'Integration Partnership Proposal', stage: 'Negotiation' }] },
    { name: 'Bug Report Emails', description: 'Software bug report submissions', record_count: 500, data: [{ id: 1, reporter: 'dev@team.com', subject: 'Critical: API timeout on /users endpoint', severity: 'P1', environment: 'Production', steps_to_reproduce: 3 }] },
    { name: 'Invoice Emails', description: 'Billing and invoice notification emails', record_count: 1000, data: [{ id: 1, invoice: 'INV-2024-001', to: 'billing@client.com', subject: 'Invoice #2024-001 - Due Jan 30', amount: 5000.00, due_date: '2024-01-30' }] },
    { name: 'Compliance Notification Emails', description: 'Regulatory and compliance update emails', record_count: 100, data: [{ id: 1, regulation: 'GDPR', subject: 'Updated Privacy Policy - Action Required', effective_date: '2024-03-01', action_required: true }] },
  ],
  social: [
    { name: 'Twitter/X Posts', description: 'Synthetic tweet data with engagement', record_count: 5000, data: [{ id: 1, author: '@techguru', content: 'Just shipped our new AI feature! The future is here. #AI #ProductLaunch', likes: 342, retweets: 89, replies: 23, sentiment: 'positive' }] },
    { name: 'Instagram Posts', description: 'Instagram post data with visual metadata', record_count: 3000, data: [{ id: 1, author: '@travelblogger', caption: 'Sunset over Santorini. Pure magic. #travel #greece', likes: 5234, comments: 187, saves: 892, filter: 'Clarendon' }] },
    { name: 'LinkedIn Posts', description: 'Professional social media content', record_count: 1000, data: [{ id: 1, author: 'Sarah CEO', content: 'Excited to announce our Series B! $50M to build the future of data.', likes: 1200, comments: 89, shares: 234, industry: 'Technology' }] },
    { name: 'Reddit Comments', description: 'Reddit comment threads and discussions', record_count: 8000, data: [{ id: 1, subreddit: 'r/datascience', author: 'ml_enthusiast', content: 'Has anyone tried fine-tuning LLaMA for synthetic data generation?', upvotes: 156, awards: 2 }] },
    { name: 'YouTube Comments', description: 'Video comment data with sentiment', record_count: 10000, data: [{ id: 1, video: 'AI Tutorial #5', author: 'LearnAI', comment: 'This is the best explanation of GANs I\'ve ever seen!', likes: 89, sentiment: 'positive' }] },
    { name: 'TikTok Metadata', description: 'Short-form video engagement data', record_count: 5000, data: [{ id: 1, creator: '@danceking', description: 'New trend alert! #viral #dance', views: 2500000, likes: 450000, shares: 89000, duration_sec: 30 }] },
    { name: 'Facebook Group Posts', description: 'Community group discussion data', record_count: 2000, data: [{ id: 1, group: 'Data Science Professionals', author: 'Jane D.', content: 'What tools do you use for synthetic data?', reactions: 45, comments: 32, type: 'question' }] },
    { name: 'Pinterest Pins', description: 'Pinterest pin and board data', record_count: 3000, data: [{ id: 1, pinner: 'DesignInspo', board: 'Modern Interiors', description: 'Minimalist living room design', saves: 1500, clicks: 450, category: 'Home Decor' }] },
    { name: 'Influencer Campaigns', description: 'Influencer marketing campaign data', record_count: 300, data: [{ id: 1, influencer: '@fashionista', platform: 'Instagram', followers: 500000, campaign: 'Spring Collection', engagement_rate: 0.045, roi: 3.2 }] },
    { name: 'Hashtag Analytics', description: 'Hashtag performance and trend data', record_count: 1000, data: [{ hashtag: '#AI', platform: 'Twitter', posts_24h: 125000, engagement_rate: 0.032, trend_direction: 'rising', top_location: 'San Francisco' }] },
    { name: 'Social Mentions', description: 'Brand mention monitoring data', record_count: 2000, data: [{ id: 1, brand: 'DataCorp', platform: 'Twitter', mention: 'Just tried @DataCorp and it\'s amazing!', sentiment: 'positive', reach: 15000 }] },
    { name: 'Podcast Episode Data', description: 'Podcast episode metadata and engagement', record_count: 500, data: [{ id: 1, podcast: 'The Data Pod', episode: 'EP45: Synthetic Data Revolution', duration_min: 42, downloads: 15000, rating: 4.8 }] },
    { name: 'Discord Server Activity', description: 'Discord community engagement data', record_count: 5000, data: [{ id: 1, server: 'AI Community', channel: '#general', author: 'DataNerd', message: 'Anyone working on synthetic data generation?', reactions: 12, replies: 8 }] },
    { name: 'Twitch Stream Data', description: 'Live stream metadata and chat activity', record_count: 1000, data: [{ id: 1, streamer: 'CodeLive', category: 'Science & Technology', viewers_peak: 2500, chat_messages: 15000, duration_hrs: 4 }] },
    { name: 'Newsletter Subscriber Data', description: 'Newsletter engagement and growth data', record_count: 400, data: [{ id: 1, newsletter: 'AI Weekly', subscribers: 45000, open_rate: 0.42, click_rate: 0.12, growth_monthly: 0.08 }] },
  ],
  api_test: [
    { name: 'REST API CRUD Tests', description: 'Standard CRUD operation test payloads', record_count: 200, data: [{ id: 1, endpoint: '/api/users', method: 'POST', body: { name: 'Test User', email: 'test@example.com' }, expected_status: 201, description: 'Create new user' }] },
    { name: 'Authentication API Tests', description: 'Auth endpoint test cases', record_count: 100, data: [{ id: 1, endpoint: '/api/auth/login', method: 'POST', body: { email: 'admin@test.com', password: 'test123' }, expected_status: 200, description: 'Valid login' }] },
    { name: 'GraphQL Query Tests', description: 'GraphQL query and mutation test data', record_count: 150, data: [{ id: 1, query: '{ users { id name email } }', variables: {}, expected_data: { users: [] }, description: 'Fetch all users' }] },
    { name: 'File Upload Tests', description: 'File upload endpoint test payloads', record_count: 50, data: [{ id: 1, endpoint: '/api/upload', method: 'POST', content_type: 'multipart/form-data', file_type: 'image/png', file_size_kb: 500, expected_status: 200 }] },
    { name: 'Pagination Tests', description: 'API pagination test cases', record_count: 80, data: [{ id: 1, endpoint: '/api/items?page=1&limit=10', method: 'GET', expected_status: 200, expected_count: 10, has_next: true }] },
    { name: 'Error Response Tests', description: 'Error handling and edge case tests', record_count: 100, data: [{ id: 1, endpoint: '/api/users/999999', method: 'GET', expected_status: 404, expected_error: 'User not found', description: 'Non-existent resource' }] },
    { name: 'Rate Limiting Tests', description: 'API rate limit test scenarios', record_count: 30, data: [{ id: 1, endpoint: '/api/search', method: 'GET', requests_per_second: 100, expected_status: 429, description: 'Exceed rate limit' }] },
    { name: 'Webhook Payloads', description: 'Webhook delivery test payloads', record_count: 60, data: [{ id: 1, event: 'order.created', url: 'https://webhook.test/receive', payload: { order_id: 'ORD-001', amount: 99.99 }, expected_status: 200 }] },
    { name: 'OAuth Flow Tests', description: 'OAuth 2.0 flow test scenarios', record_count: 40, data: [{ id: 1, flow: 'authorization_code', client_id: 'test-app', redirect_uri: 'http://localhost/callback', scope: 'read write', description: 'Standard OAuth flow' }] },
    { name: 'WebSocket Message Tests', description: 'WebSocket message format tests', record_count: 70, data: [{ id: 1, event: 'subscribe', channel: 'updates', payload: { topic: 'prices' }, expected_ack: true, description: 'Subscribe to channel' }] },
    { name: 'Batch API Tests', description: 'Batch/bulk operation test payloads', record_count: 45, data: [{ id: 1, endpoint: '/api/batch', method: 'POST', operations: [{ action: 'create', data: {} }, { action: 'update', id: 1, data: {} }], expected_status: 200 }] },
    { name: 'Search API Tests', description: 'Search and filter endpoint tests', record_count: 80, data: [{ id: 1, endpoint: '/api/search?q=test&category=electronics&sort=price', method: 'GET', expected_status: 200, expected_min_results: 1, description: 'Search with filters' }] },
    { name: 'Multipart Request Tests', description: 'Complex multipart request tests', record_count: 35, data: [{ id: 1, endpoint: '/api/documents', method: 'POST', parts: ['metadata.json', 'document.pdf'], expected_status: 201, description: 'Upload document with metadata' }] },
    { name: 'API Versioning Tests', description: 'API version compatibility tests', record_count: 40, data: [{ id: 1, endpoint_v1: '/api/v1/users', endpoint_v2: '/api/v2/users', breaking_changes: ['field_rename: name -> full_name'], description: 'V1 to V2 migration' }] },
    { name: 'CORS Configuration Tests', description: 'Cross-origin request test scenarios', record_count: 25, data: [{ id: 1, origin: 'https://app.example.com', method: 'OPTIONS', expected_headers: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods'], description: 'Preflight request' }] },
  ],
  images: [
    { name: 'Street Scene Descriptions', description: 'Urban street scene image metadata', record_count: 1000, data: [{ id: 1, filename: 'street_001.jpg', description: 'Busy downtown intersection with pedestrians crossing', objects: ['car', 'person', 'traffic_light', 'building'], scene: 'urban', tags: ['city', 'daytime', 'traffic'] }] },
    { name: 'Product Photography', description: 'E-commerce product image descriptions', record_count: 2000, data: [{ id: 1, filename: 'product_001.jpg', description: 'Red leather handbag on white background', category: 'Fashion', objects: ['handbag'], tags: ['product', 'fashion', 'red', 'leather'], background: 'white' }] },
    { name: 'Medical Imaging Metadata', description: 'Medical image descriptions for ML training', record_count: 500, data: [{ id: 1, filename: 'xray_001.dcm', modality: 'X-Ray', body_part: 'Chest', finding: 'Normal cardiac silhouette', pathology: false, format: 'DICOM' }] },
    { name: 'Satellite Imagery', description: 'Satellite/aerial image annotations', record_count: 800, data: [{ id: 1, filename: 'sat_001.tif', description: 'Agricultural land with crop patterns', resolution_m: 0.5, objects: ['field', 'road', 'building'], coordinates: { lat: 38.5, lng: -90.2 } }] },
    { name: 'Face Detection Dataset', description: 'Face detection training image metadata', record_count: 5000, data: [{ id: 1, filename: 'face_001.jpg', faces_detected: 3, bounding_boxes: [{ x: 100, y: 50, w: 80, h: 100 }], attributes: { age_range: '25-35', expression: 'smiling' } }] },
    { name: 'Food Photography', description: 'Food image descriptions for recipe apps', record_count: 1500, data: [{ id: 1, filename: 'food_001.jpg', description: 'Margherita pizza on rustic wooden board', cuisine: 'Italian', ingredients_visible: ['tomato', 'mozzarella', 'basil'], plating: 'rustic' }] },
    { name: 'Wildlife Photography', description: 'Wildlife image annotations', record_count: 600, data: [{ id: 1, filename: 'wildlife_001.jpg', species: 'Red Fox', description: 'Red fox in snowy forest setting', habitat: 'Temperate Forest', behavior: 'hunting', tags: ['fox', 'winter', 'wildlife'] }] },
    { name: 'Interior Design', description: 'Interior design image descriptions', record_count: 1000, data: [{ id: 1, filename: 'interior_001.jpg', room: 'Living Room', style: 'Modern Minimalist', objects: ['sofa', 'coffee_table', 'lamp'], colors: ['white', 'gray', 'natural_wood'] }] },
    { name: 'Document OCR Training', description: 'Document image metadata for OCR', record_count: 800, data: [{ id: 1, filename: 'doc_001.png', type: 'Invoice', language: 'English', text_regions: 12, quality: 'High', rotation_deg: 0 }] },
    { name: 'Autonomous Driving Scenes', description: 'Self-driving car image annotations', record_count: 3000, data: [{ id: 1, filename: 'drive_001.jpg', objects: [{ type: 'vehicle', distance_m: 15 }, { type: 'pedestrian', distance_m: 8 }], weather: 'clear', time: 'daytime', road_type: 'urban' }] },
    { name: 'Fashion Catalog', description: 'Fashion item image descriptions', record_count: 2000, data: [{ id: 1, filename: 'fashion_001.jpg', category: 'Dress', color: 'Navy Blue', pattern: 'Solid', material: 'Silk', season: 'Spring/Summer' }] },
    { name: 'Art & Painting Descriptions', description: 'Artwork image metadata and descriptions', record_count: 500, data: [{ id: 1, filename: 'art_001.jpg', title: 'Sunset Harbor', artist: 'Generated', style: 'Impressionism', medium: 'Oil', dominant_colors: ['orange', 'blue', 'gold'] }] },
    { name: 'Security Camera Footage', description: 'Surveillance image annotations', record_count: 4000, data: [{ id: 1, filename: 'cam_001.jpg', camera: 'CAM-LOBBY-01', persons_detected: 2, vehicles_detected: 0, alert_level: 'normal', timestamp: '2024-01-15T10:30:00Z' }] },
    { name: 'Plant/Botany Images', description: 'Plant species image metadata', record_count: 700, data: [{ id: 1, filename: 'plant_001.jpg', species: 'Rosa gallica', common_name: 'French Rose', family: 'Rosaceae', health: 'Healthy', growth_stage: 'Flowering' }] },
    { name: 'Construction Site Imagery', description: 'Construction progress image data', record_count: 300, data: [{ id: 1, filename: 'site_001.jpg', project: 'Tower-B', phase: 'Foundation', progress_pct: 35, equipment: ['crane', 'excavator'], workers_visible: 8 }] },
  ],
};

async function seed() {
  try {
    await initDatabase();
    console.log('Starting seed process...');

    // Clear existing data
    await pool.query('DELETE FROM generations');
    await pool.query('DELETE FROM datasets');
    await pool.query('DELETE FROM users');
    console.log('Cleared existing data');

    // Seed default user
    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'admin123', 10);
    await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3)',
      [process.env.DEFAULT_EMAIL || 'admin@synthdata.ai', hashedPassword, 'Admin User']
    );
    console.log('Created default user');

    // Seed datasets for each category
    for (const [category, items] of Object.entries(seedData)) {
      for (const item of items) {
        await pool.query(
          `INSERT INTO datasets (category, name, description, record_count, data, status)
           VALUES ($1, $2, $3, $4, $5, 'ready')`,
          [category, item.name, item.description, item.record_count, JSON.stringify(item.data)]
        );
      }
      console.log(`Seeded ${items.length} items for category: ${category}`);
    }

    const total = Object.values(seedData).reduce((sum, items) => sum + items.length, 0);
    console.log(`\nSeed complete! Total datasets: ${total}`);
    console.log(`Categories: ${Object.keys(seedData).length}`);
    console.log(`Default login: ${process.env.DEFAULT_EMAIL || 'admin@synthdata.ai'} / ${process.env.DEFAULT_PASSWORD || 'admin123'}`);

  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
