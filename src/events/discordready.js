module.exports = async function ready() {
  console.log('🗸', 'Discord ready');

  const self = this.__self;
  const bridgedChannels = await self.cache.redis.hgetall('guildtochannel').then(Object.values);

  // TODO: check if webhook is ours (author/name) & optimize

  for (const channel of bridgedChannels) {
    const webhooks = await self.discord.getChannelWebhooks(channel);
    await self.cache.redis.hmset(`channel:${channel}`, {
      id: webhooks[0].id,
      token: webhooks[0].token,
    });
  }
};
