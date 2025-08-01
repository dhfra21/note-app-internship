const Redis = require('ioredis');

// Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

async function testCache() {
  console.log('🧪 Testing Redis Cache...\n');

  try {
    // Test 1: Set and Get
    console.log('1. Testing SET/GET operations...');
    await redis.set('test:key', 'test:value', 'EX', 60);
    const value = await redis.get('test:key');
    console.log(`   ✅ SET/GET: ${value === 'test:value' ? 'PASS' : 'FAIL'}`);

    // Test 2: Check if cache keys exist
    console.log('\n2. Checking for existing cache keys...');
    const keys = await redis.keys('*');
    const noteKeys = keys.filter(key => key.includes('notes'));
    const noteKey = keys.filter(key => key.includes('note:'));
    
    console.log(`   📊 Total keys: ${keys.length}`);
    console.log(`   📝 Notes list keys: ${noteKeys.length}`);
    console.log(`   📄 Individual note keys: ${noteKey.length}`);

    if (noteKeys.length > 0) {
      console.log('   📋 Notes cache keys:');
      noteKeys.slice(0, 5).forEach(key => console.log(`      - ${key}`));
    }

    // Test 3: Cache performance
    console.log('\n3. Testing cache performance...');
    const startTime = Date.now();
    await redis.get('test:key');
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`   ⚡ Cache read time: ${duration}ms`);
    console.log(`   ${duration < 10 ? '✅' : '⚠️'} Performance: ${duration < 10 ? 'GOOD' : 'SLOW'}`);

    // Test 4: Cache TTL
    console.log('\n4. Testing cache TTL...');
    const ttl = await redis.ttl('test:key');
    console.log(`   ⏰ TTL for test:key: ${ttl}s`);

    // Test 5: Cache invalidation
    console.log('\n5. Testing cache invalidation...');
    const beforeDelete = await redis.get('test:key');
    await redis.del('test:key');
    const afterDelete = await redis.get('test:key');
    
    console.log(`   🗑️  Deletion test: ${beforeDelete && !afterDelete ? 'PASS' : 'FAIL'}`);

    console.log('\n✅ Cache testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Cache testing failed:', error.message);
  } finally {
    await redis.quit();
  }
}

// Run the test
testCache(); 