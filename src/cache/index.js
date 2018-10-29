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
    return this.redis.hget('avatarhash', user);
  }

  /**
   * Set a user's avatar SHA-1 hash string
   * @param {string} user - User XMPP JID string
   * @param {string} hash - The SHA-1 avatar hash
   */
  setAvatarHash(user, hash) {
    return this.redis.hset('avatarhash', user, hash);
  }

  /**
   * Get the full user's avatar object
   * @param {string} hash - The avatar hash
   */
  getAvatar(hash) {
    return this.redis.hgetall(`avatar:${hash}`);
  }

  /**
   * Set user's avatar object
   * @param {string} hash - User's avatar hash
   * @param {object} obj - Avatar data object
   */
  setAvatar(hash, obj) {
    return this.redis.hmset(`avatar:${hash}`, obj);
  }

  /**
   * Get a specific avatar field
   * @param {string} hash - Avatar hash
   * @param {string} field - Specific field to get
   */
  getAvatarField(hash, field) {
    return this.redis.hget(`avatar:${hash}`, field);
  }

  /**
   * Add a bridge to the redis list
   * @param {object} bridge
   * @param {string} bridge.guild - Discord guild ID
   * @param {string} bridge.muc - Jabber MUC JID
   * @param {string} bridge.defaultChannel - Default Discord channel ID
   */
  async addBridge(bridge) {
    return this.redis
      .pipeline()
      .hset('guildtomuc', bridge.guild, bridge.muc)
      .hset('muctoguild', bridge.muc, bridge.guild)
      .hset('guildtochannel', bridge.guild, bridge.defaultChannel)
      .exec();
  }

  /**
   * Get bridges
   */
  async getBridges() {
    return this.redis.hgetall('guildtomuc').then(Object.values);
  }
}

module.exports = Cache;
