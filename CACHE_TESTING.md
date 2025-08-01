# 🧪 Cache Testing Guide

## **Frontend Testing (Browser)**

### **1. Visual Cache Testing**
1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Open the application** and log in

3. **Click "Show Cache Test"** button on the main page

4. **Test Cache Performance**:
   - Click "Test Cache" multiple times quickly
   - Watch for response time differences
   - **Cache HIT**: < 100ms (Fast response)
   - **Cache MISS**: > 100ms (Slower response)

5. **Monitor Results**:
   - Check the test results table
   - Look for performance improvements over time
   - Verify cache invalidation after creating/editing notes

### **2. Browser Developer Tools**
1. **Open Network Tab**:
   - Press F12 → Network tab
   - Filter by "Fetch/XHR"

2. **Monitor API Calls**:
   - Look for repeated calls to `/api/notes`
   - Check response times
   - Verify cache headers

3. **Console Logging**:
   - Open Console tab
   - Look for cache hit/miss messages
   - Monitor performance metrics

## **Backend Testing (Terminal)**

### **1. Server Logs**
1. **Start the backend server**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Monitor console output** for:
   ```
   Cache HIT: Fetching notes from cache
   Cache MISS: Fetching notes from database
   ```

3. **Test cache invalidation**:
   - Create a new note
   - Check logs for cache deletion messages
   - Verify cache is rebuilt on next request

### **2. Redis Cache Testing**
1. **Install Redis CLI** (if not installed):
   ```bash
   # Windows (with WSL)
   sudo apt-get install redis-tools
   
   # macOS
   brew install redis
   ```

2. **Connect to Redis**:
   ```bash
   redis-cli
   ```

3. **Test Redis Commands**:
   ```bash
   # Check all keys
   KEYS *
   
   # Check notes cache keys
   KEYS *notes*
   
   # Check specific user's notes
   KEYS *notes:1*
   
   # Get cache value
   GET "notes:1:{\"page\":1,\"limit\":10,\"sortBy\":\"updatedAt\",\"sortOrder\":\"desc\"}"
   
   # Check TTL
   TTL "notes:1:{\"page\":1,\"limit\":10,\"sortBy\":\"updatedAt\",\"sortOrder\":\"desc\"}"
   ```

### **3. Node.js Cache Test Script**
1. **Install dependencies**:
   ```bash
   cd backend
   npm install ioredis
   ```

2. **Run the test script**:
   ```bash
   node test-cache.js
   ```

3. **Expected Output**:
   ```
   🧪 Testing Redis Cache...

   1. Testing SET/GET operations...
      ✅ SET/GET: PASS

   2. Checking for existing cache keys...
      📊 Total keys: 5
      📝 Notes list keys: 2
      📄 Individual note keys: 1

   3. Testing cache performance...
      ⚡ Cache read time: 2ms
      ✅ Performance: GOOD

   4. Testing cache TTL...
      ⏰ TTL for test:key: 58s

   5. Testing cache invalidation...
      🗑️  Deletion test: PASS

   ✅ Cache testing completed successfully!
   ```

## **API Testing (Postman/cURL)**

### **1. Test Cache Endpoint**
```bash
# Get your auth token first
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"password"}'

# Test cache endpoint
curl -X GET http://localhost:3001/api/notes/test/cache \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **2. Test Pagination with Cache**
```bash
# First request (cache miss)
curl -X GET "http://localhost:3001/api/notes?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Second request (cache hit)
curl -X GET "http://localhost:3001/api/notes?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## **Performance Testing**

### **1. Load Testing with Apache Bench**
```bash
# Install Apache Bench
# Windows: Download from Apache website
# macOS: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Test cache performance
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/notes?page=1&limit=5"
```

### **2. Cache Hit Rate Testing**
1. **Make 10 identical requests** to the same endpoint
2. **Count cache hits vs misses** in server logs
3. **Calculate hit rate**: `(hits / total_requests) * 100`
4. **Expected hit rate**: > 80% after first request

## **Cache Invalidation Testing**

### **1. Test Create Note**
1. Make a request to get notes (cache miss)
2. Make another request (cache hit)
3. Create a new note
4. Make another request (cache miss - invalidation worked)

### **2. Test Update Note**
1. Get a specific note (cache miss)
2. Get the same note again (cache hit)
3. Update the note
4. Get the note again (cache miss - invalidation worked)

### **3. Test Delete Note**
1. Get notes list (cache hit)
2. Delete a note
3. Get notes list again (cache miss - invalidation worked)

## **Expected Results**

### **✅ Successful Cache Implementation**
- **First request**: 50-200ms (database query)
- **Subsequent requests**: 5-20ms (cache hit)
- **Cache hit rate**: > 80% for repeated requests
- **Memory usage**: Stable (Redis handles memory)
- **Database load**: Reduced by 80%+

### **❌ Common Issues**
- **No cache hits**: Check Redis connection
- **Slow cache hits**: Check Redis performance
- **Memory leaks**: Check cache TTL settings
- **Stale data**: Check cache invalidation logic

## **Debugging Tips**

### **1. Enable Debug Logging**
Add to your backend service:
```typescript
console.log('Cache key:', cacheKey);
console.log('Cache TTL:', ttl);
console.log('Cache size:', await this.cacheManager.store.keys());
```

### **2. Monitor Redis Memory**
```bash
redis-cli info memory
```

### **3. Check Cache Keys**
```bash
redis-cli keys "*notes*"
```

### **4. Clear Cache for Testing**
```bash
redis-cli flushall
```

## **Performance Benchmarks**

| **Scenario** | **Without Cache** | **With Cache** | **Improvement** |
|--------------|-------------------|----------------|-----------------|
| First Request | 150ms | 150ms | 0% |
| Repeated Request | 150ms | 15ms | 90% |
| Concurrent Users | 50 req/s | 500 req/s | 900% |
| Database Load | High | Low | 80% reduction |

This comprehensive testing approach will help you verify that your caching implementation is working correctly and providing the expected performance improvements! 