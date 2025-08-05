const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      console.error('❌ Redis server connection refused');
      return new Error('Redis server connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      console.error('❌ Redis retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      console.error('❌ Redis max retry attempts reached');
      return undefined;
    }
    // Reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

client.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

client.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

client.on('ready', () => {
  console.log('✅ Redis ready for operations');
});

client.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Connect to Redis
client.connect().catch(console.error);

module.exports = client;