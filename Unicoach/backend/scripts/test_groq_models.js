import dotenv from 'dotenv';
dotenv.config();

async function testModel(model) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Extract details to JSON: MSc Data Science, 1 year full time, 26000 EUR tuition, IELTS 6.5. Return valid JSON only with keys: courseName, duration, annualFee, currency, minIeltsScore.' }],
        response_format: { type: 'json_object' }
      })
    });
    const data = await res.json();
    console.log(model, 'Status:', res.status, 'Response:', data.choices?.[0]?.message?.content || data);
  } catch (e) {
    console.error(model, e);
  }
}

async function run() {
  console.log('Testing Qwen on Groq...');
  await testModel('qwen/qwen3.8-27b');
  console.log('Testing gpt-oss-120b on Groq...');
  await testModel('openai/gpt-oss-120b');
}

run();
