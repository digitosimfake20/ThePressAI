import { generateResponse } from './services/aiGenerator.js';

async function testAI() {
  console.log('Testing AI generation functionality...');
  try {
    const mockNewsData = [
      {
        source: 'Test Source',
        articles: [
          { title: 'Test Article 1', url: 'https://example.com/1' },
          { title: 'Test Article 2', url: 'https://example.com/2' }
        ]
      }
    ];

    // API key will be loaded from .env file

    const result = await generateResponse('test query', mockNewsData);
    console.log('AI Response (should be fallback):', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('AI test failed:', error);
  }
}

testAI();
