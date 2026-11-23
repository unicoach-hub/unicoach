#!/usr/bin/env node
// Run the Irish employment-permit page watcher by hand.
//
//   node scripts/permitWatch.js --once        one pass; emails if something changed
//   node scripts/permitWatch.js --once --dry  one pass; prints what it would email, sends nothing
//   node scripts/permitWatch.js --list        show the watched links
//   node scripts/permitWatch.js --reset       delete the stored snapshots (next run is a fresh baseline)
//
// The very first run only stores baselines and sends nothing.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { runOnce, loadConfig } = require('../services/permitWatchService');

const args = process.argv.slice(2);
const has = (...names) => names.some((n) => args.includes(n));

async function main() {
  if (has('--help', '-h')) {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 10).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
    return;
  }

  if (has('--list')) {
    const cfg = loadConfig();
    const email = process.env.PERMIT_WATCH_EMAIL_TO || process.env.ALERT_EMAIL_TO || '(no ALERT_EMAIL_TO set)';
    const wa = process.env.PERMIT_WATCH_WHATSAPP_TO || process.env.ALERT_WHATSAPP_TO || '(WhatsApp off)';
    console.log(`Every ${cfg.intervalMinutes} min\n  email    → ${email}\n  whatsapp → ${wa}\n`);
    cfg.pages.forEach((p, i) => console.log(`${String(i + 1).padStart(2)}. ${p.label}\n    ${p.url}`));
    return;
  }

  if (has('--reset')) {
    const dir = path.join(__dirname, '..', 'data', 'permit-watch');
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
    files.forEach((f) => fs.unlinkSync(path.join(dir, f)));
    console.log(`Removed ${files.length} snapshot(s). The next run stores fresh baselines and sends no email.`);
    return;
  }

  if (!has('--once')) {
    console.log('Nothing to do. Use --once (or --once --dry), --list, --reset, --help.');
    process.exitCode = 1;
    return;
  }

  await runOnce({ dryRun: has('--dry', '--dry-run') });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[PermitWatch] failed:', err);
    process.exit(1);
  });
