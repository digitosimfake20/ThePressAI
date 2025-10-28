console.log('Testing OpenAI import...');
try {
  const OpenAI = require('openai');
  console.log('OpenAI imported successfully');
} catch(e) {
  console.error('OpenAI import failed:', e.message);
}
