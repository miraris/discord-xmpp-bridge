const Redis = require('ioredis');

class Cache {
  /**
   * Redis cache
   */
  constructor(url) {
    this.redis = new Redis(url);
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

  /**
   * Add a bridge to the redis list
   * @param {object} bridge
   * @param {string} bridge.guild - Discord guild ID
   * @param {string} bridge.muc - Jabber MUC JID
   * @param {string} bridge.defaultChannel - Default Discord channel ID
   */
  async addBridge(bridge) {
    const len = await this.redis.scard('bridges');
    const key = `bridge:${len + 1}`;

    await this.redis.hmset(key, bridge);

    return this.redis.sadd('bridges', key);
  }

  /**
   * Get bridges
   */
  async getBridges() {
    const pipeline = this.redis.pipeline();

    for (const b of await this.redis.smembers('bridges')) {
      pipeline.hgetall(b);
    }

    return pipeline.exec().then(res => res.map(([err, val]) => val));
  }
}

module.exports = Cache;
