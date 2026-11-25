const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { issuePaidOrder, redeemedOrders } = require('./issue.cjs');
require('./verify-licence.js');

test('redeem a fictional paid order once and recover the device-specific token', async () => {
  const original = process.cwd();
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ua-order-test-'));
  try {
    process.chdir(directory);
    const init = spawnSync(process.execPath, [path.join(__dirname, 'admin.cjs'), 'init']);
    assert.equal(init.status, 0);
    const device = 'a'.repeat(64);
    const token = issuePaidOrder('sample-123', device, 'android', 'Fictional Customer');
    assert.throws(() => issuePaidOrder(' SAMPLE-123 ', 'b'.repeat(64), 'windows', 'Fictional Customer'), /already been redeemed/);
    assert.equal(redeemedOrders().length, 1);
    assert.equal(redeemedOrders()[0].token, token);
    const key = JSON.parse(fs.readFileSync('ua-public.json', 'utf8'));
    assert.equal(await UALicensing.verifyLicence(token, key, device, 'android'), true);
    assert.equal(await UALicensing.verifyLicence(token, key, 'b'.repeat(64), 'android'), false);
  } finally {
    process.chdir(original);
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('dashboard protects issuance and lists the fictional redeemed order', async () => {
  const { spawn } = require('node:child_process');
  const { once } = require('node:events');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ua-dashboard-test-'));
  const options = { cwd: directory };
  let child;
  try {
    const init = spawnSync(process.execPath, [path.join(__dirname, 'admin.cjs'), 'init'], options);
    assert.equal(init.status, 0);
    child = spawn(process.execPath, [path.join(__dirname, 'dashboard.cjs')], options);
    const [ready] = await once(child.stdout, 'data');
    const address = ready.toString().match(/http:\/\/127\.0\.0\.1:\d+\/[a-f0-9]+/)[0];
    const origin = new URL(address).origin;
    assert.equal((await fetch(origin)).status, 404);
    const order = new URLSearchParams({
      order: 'TEST-42', customer: '<Fictional Customer>', platform: 'windows', device: 'a'.repeat(64)
    });
    const denied = await fetch(address, { method: 'POST', body: order, headers: {
      'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://example.test'
    } });
    assert.equal(denied.status, 403);
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', Origin: origin };
    const issued = await fetch(address, { method: 'POST', body: order, headers });
    assert.equal(issued.status, 200);
    const html = await issued.text();
    assert.match(html, /Licence issued/);
    assert.match(html, /&lt;Fictional Customer&gt;/);
    const duplicate = await fetch(address, { method: 'POST', body: order, headers });
    assert.equal(duplicate.status, 400);
    assert.match(await duplicate.text(), /already been redeemed/);
    assert.match(await (await fetch(address)).text(), /TEST-42/);
  } finally {
    if (child && child.exitCode === null) {
      child.kill();
      await once(child, 'exit');
    }
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
