// Comprehensive Backend API Test & Benchmark Suite
const BASE_URL = process.env.BACKEND_URL || 'https://unicoach.onrender.com';

const testResults = [];

async function benchmarkEndpoint(name, path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const start = performance.now();
  let status = 0;
  let success = false;
  let errorMsg = null;
  let responseSize = 0;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'UniCoach-Automated-QA/1.0',
        ...(options.headers || {})
      },
      signal: AbortSignal.timeout(15000)
    });
    const duration = Math.round(performance.now() - start);
    status = res.status;
    const body = await res.text();
    responseSize = body.length;

    // Evaluate success condition
    const expectedStatus = options.expectedStatus || [200, 201, 400, 401]; // Expected HTTP codes
    if (Array.isArray(expectedStatus) ? expectedStatus.includes(status) : status === expectedStatus) {
      success = true;
    } else {
      errorMsg = `Unexpected status ${status} (expected ${expectedStatus})`;
    }

    testResults.push({
      name,
      path,
      status,
      durationMs: duration,
      sizeBytes: responseSize,
      success,
      error: errorMsg
    });

    console.log(`${success ? '✅ PASS' : '❌ FAIL'} [${status}] ${name} (${duration}ms) - ${responseSize} bytes`);
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    testResults.push({
      name,
      path,
      status: 0,
      durationMs: duration,
      sizeBytes: 0,
      success: false,
      error: err.message
    });
    console.log(`❌ FAIL [TIMEOUT/ERR] ${name} (${duration}ms) - ${err.message}`);
  }
}

async function runBackendAudit() {
  console.log(`\n======================================================`);
  console.log(`🚀 UNICOACH BACKEND AUTOMATED API TEST & BENCHMARK`);
  console.log(`🎯 Target Host: ${BASE_URL}`);
  console.log(`======================================================\n`);

  // 1. Core Health
  await benchmarkEndpoint('1. Core Health Check', '/api/health', { expectedStatus: 200 });

  // 2. Events API
  await benchmarkEndpoint('2. Public Events Feed', '/api/events', { expectedStatus: [200, 304] });

  // 3. Country Data API
  await benchmarkEndpoint('3. Study Destinations (Countries)', '/api/public/universities-data/countries', { expectedStatus: 200 });

  // 4. Universities Data API
  await benchmarkEndpoint('4. Global Universities Directory', '/api/public/universities-data/universities', { expectedStatus: 200 });

  // 5. News Feed API
  await benchmarkEndpoint('5. Educational News Feed', '/api/news', { expectedStatus: [200, 304] });

  // 6. Blogs Feed API
  await benchmarkEndpoint('6. Public Blogs & Articles', '/api/blogs', { expectedStatus: [200, 304] });

  // 7. Scholarships Directory API
  await benchmarkEndpoint('7. Scholarships Database', '/api/scholarships', { expectedStatus: [200, 304] });

  // 8. Lead Capture Validation (Zod schema rejects empty body with 400)
  await benchmarkEndpoint('8. Lead Capture Validation Guard', '/api/leads/submit', {
    method: 'POST',
    body: JSON.stringify({}),
    expectedStatus: [400, 422]
  });

  // 9. Auth Security Guard (Unauthorized login attempt rejection)
  await benchmarkEndpoint('9. Auth Security Guard (Invalid Login)', '/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'invalid_qa_user@nonexistent.domain', password: 'wrongpassword123' }),
    expectedStatus: [400, 401, 404]
  });

  // 10. AI Admin Security Guard (Requires JWT + Admin privileges)
  await benchmarkEndpoint('10. AI Admin Security Guard (Unauthorized)', '/api/ai/generate-blog', {
    method: 'POST',
    body: JSON.stringify({ topic: 'Top Universities in 2026' }),
    expectedStatus: [401, 403]
  });

  // Summary Table
  console.log(`\n======================================================`);
  console.log(`📊 BACKEND TEST RESULTS SUMMARY`);
  console.log(`======================================================`);
  const total = testResults.length;
  const passed = testResults.filter(r => r.success).length;
  const failed = total - passed;
  const avgLatency = Math.round(testResults.reduce((acc, r) => acc + r.durationMs, 0) / total);

  console.table(testResults.map(r => ({
    Endpoint: r.name,
    Path: r.path,
    HTTP: r.status,
    'Latency (ms)': r.durationMs,
    'Payload (bytes)': r.sizeBytes,
    Result: r.success ? 'PASSED ✅' : 'FAILED ❌'
  })));

  console.log(`Total Endpoints Tested: ${total}`);
  console.log(`Passed: ${passed} / ${total} (${Math.round((passed / total) * 100)}%)`);
  console.log(`Average API Latency: ${avgLatency}ms`);
  console.log(`======================================================\n`);
}

runBackendAudit();
