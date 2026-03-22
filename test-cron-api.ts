// Test script for the cron API
// Run with: npx tsx test-cron-api.ts

async function testCronAPI() {
  try {
    console.log('Testing cron API...');

    // Test GET request (should return basic info)
    const getResponse = await fetch('http://localhost:3000/api/cron/sync', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`,
      },
    });
    const getData = await getResponse.json();
    console.log('GET Response:', getData);

    // Test POST request (actual sync)
    console.log('\nTesting POST sync...');
    const postResponse = await fetch('http://localhost:3000/api/cron/sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`,
      },
    });

    const postData = await postResponse.json();
    console.log('POST Response:', postData);

    if (postData.success) {
      console.log('\n✅ Cron API test successful!');
      console.log('Data summary:', postData.dataSummary);
    } else {
      console.log('\n❌ Cron API test failed:', postData.error);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testCronAPI();
}

export { testCronAPI };
