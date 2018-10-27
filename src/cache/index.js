const Redis = require('ioredis');

class Cache {
  /**
   * Redis cache
   */
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  /**
   * Get a user's avatar SHA-1 hash
   * @param {string} user - The user avatar hash (SHA-1)
   */
  getAvatarHash(user) {
    return this.redis.hget(user, 'avatarHash');
  }

  /**
   * Set a user's avatar SHA-1 hash string
   * @param {string} user - User XMPP JID string
   * @param {string} hash - The SHA-1 avatar hash
   */
  setAvatarHash(user, hash) {
    return this.redis.hget(user, 'avatarHash', hash);
  }

  /**
   * Get the full user's avatar object
   * @param {string} hash - The avatar hash
   */
  getAvatar(hash) {
    return this.redis.hgetall(hash);
  }

  /**
   * Set user's avatar object
   * @param {string} hash - User's avatar hash
   * @param {object} obj - Avatar data object
   */
  setAvatar(hash, obj) {
    return this.redis.hmset(hash, obj);
  }

  /**
   * Get a specific avatar field
   * @param {string} hash - Avatar hash
   * @param {string} field - Specific field to get
   */
  getAvatarField(hash, field) {
    return this.redis.hget(hash, field);
  }
}

module.exports = Cache;
