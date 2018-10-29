module.exports = async function ready() {
  console.log('🗸', 'Discord ready');

  const self = this.__self;
  const bridgedChannels = await self.cache.redis.hgetall('guildtochannel').then(Object.values);

  const configureWebhooks = async (channel) => {
    const existingWebhooks = await self.discord.getChannelWebhooks(channel);

    const webhook = existingWebhooks.length
      ? existingWebhooks[0]
      : await self.discord.createChannelWebhook(channel, { name: self.options.nickname });

    await self.cache.redis.hmset(`channel:${channel}`, {
      id: webhook.id,
      token: webhook.token,
    });
  };

  const results = [];

  for (const channel of bridgedChannels) {
    results.push(configureWebhooks(channel));
  }

  // Wait for the webhooks to configure
  await Promise.all(results);
};
