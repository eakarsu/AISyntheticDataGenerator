'use strict';
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');

async function prepareRuntime() {
  if (process.env.MIGRATE_ON_START === 'true') {
    for (const filename of ['001_governed_synthetic_data.sql', '002_runtime_ai.sql']) {
      await pool.query(fs.readFileSync(path.join(__dirname, 'migrations', filename), 'utf8'));
    }
  }
  const email = (process.env.PROVISION_ADMIN_EMAIL || 'runtime-admin@example.com').trim().toLowerCase();
  const passwordHash = await bcrypt.hash(process.env.PROVISION_ADMIN_PASSWORD || 'RuntimeAcceptance123!', 12);
  const user = await pool.query(
    `INSERT INTO synth_users(email,password_hash,name) VALUES($1,$2,$3)
     ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,name=EXCLUDED.name RETURNING id`,
    [email, passwordHash, process.env.PROVISION_ADMIN_NAME || 'RuntimeAdmin']
  );
  let tenant = await pool.query('SELECT id FROM synth_tenants ORDER BY id LIMIT 1');
  if (!tenant.rows[0]) tenant = await pool.query("INSERT INTO synth_tenants(name) VALUES('Runtime Tenant') RETURNING id");
  await pool.query(
    `INSERT INTO synth_memberships(tenant_id,user_id,role,active) VALUES($1,$2,'admin',TRUE)
     ON CONFLICT(tenant_id,user_id) DO UPDATE SET role='admin',active=TRUE`,
    [tenant.rows[0].id, user.rows[0].id]
  );
  await pool.query(
    'UPDATE synth_memberships SET active=FALSE WHERE user_id=$1 AND tenant_id<>$2',
    [user.rows[0].id, tenant.rows[0].id]
  );
}

module.exports = { prepareRuntime };
