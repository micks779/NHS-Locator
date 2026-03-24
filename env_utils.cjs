const fs = require('fs');
const path = require('path');

/**
 * Reads env vars: process.env first, then .env.local, then .env (project root).
 */
function readEnvVar(name) {
  const fromProcess = process.env[name];
  if (fromProcess !== undefined && String(fromProcess).trim() !== '') {
    return String(fromProcess).trim();
  }
  for (const file of ['.env.local', '.env']) {
    const envPath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(envPath)) continue;
    const env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(new RegExp(`^\\s*${name}\\s*=\\s*(.+)\\s*$`, 'm'));
    if (match) return match[1].trim().replace(/^['"]|['"]$/g, '');
  }
  return '';
}

module.exports = { readEnvVar };
