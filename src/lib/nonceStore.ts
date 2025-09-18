import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  // Optional configuration
  retry: {
    retries: 3,
    backoff: (retryCount: number) => Math.pow(2, retryCount) * 1000, // exponential backoff
  },
  automaticDeserialization: true,
});

// Test connection function (optional)
export async function testRedisConnection(): Promise<boolean> {
  try {
    const result = await redis.ping();
    console.log("✅ Redis connection test successful:", result);
    return true;
  } catch (error) {
    console.error("❌ Redis connection test failed:", error);
    return false;
  }
}

export async function markNonceAsUsed(nonce: string): Promise<void> {
  try {
    // Store a marker with TTL (5 minutes)
    await redis.set(`used_nonce:${nonce}`, "1", { ex: 300 });
    console.log(`✅ Nonce marked as used: ${nonce.substring(0, 20)}...`);
  } catch (error) {
    console.error("❌ Error marking nonce as used:", error);
    throw new Error("Failed to mark nonce as used");
  }
}

export async function isNonceUsed(nonce: string): Promise<boolean> {
  try {
    const result = await redis.get(`used_nonce:${nonce}`);
    const isUsed = result !== null;
    console.log(`🔍 Nonce ${nonce.substring(0, 20)}... used status: ${isUsed}`);
    return isUsed;
  } catch (error) {
    console.error("❌ Error checking nonce status:", error);
    throw new Error("Failed to check nonce status");
  }
}

// Alternative batch operations (if needed for better performance)
export async function markMultipleNoncesAsUsed(
  nonces: string[]
): Promise<void> {
  try {
    const pipeline = redis.pipeline();

    nonces.forEach(nonce => {
      pipeline.set(`used_nonce:${nonce}`, "1", { ex: 300 });
    });

    await pipeline.exec();
    console.log(`✅ Marked ${nonces.length} nonces as used`);
  } catch (error) {
    console.error("❌ Error marking multiple nonces as used:", error);
    throw new Error("Failed to mark multiple nonces as used");
  }
}

// Clean up expired nonces manually (optional - Redis TTL handles this automatically)
export async function cleanupExpiredNonces(): Promise<void> {
  try {
    // This is just for demonstration - TTL handles cleanup automatically
    console.log("🧹 Expired nonces are automatically cleaned up by Redis TTL");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  }
}

// Export redis client for other operations if needed
export { redis };
