const { jid } = require('@xmpp/client');
const { join } = require('path');
const vcard = require('../vcard/caller');
const pomfUpload = require('../utils/owo');
const { basePath } = require('../utils/helpers');
const imageColor = require('../utils/color');

module.exports = async function onstanza(stanza) {
  const self = this.__self;

  try {
    const {
      attrs: { from },
    } = stanza;

    if (stanza.is('presence') && stanza.getChild('x').attrs.xmlns === 'vcard-temp:x:update') {
      const oldHash = await self.cache.getAvatarHash(from);
      const newHash = stanza.getChild('x').getChildText('photo');

      // If hashes are equal, do nothing regarding this avatar
      if (oldHash === newHash) return;

      console.log(
        `Received a VCard update for user ${from} and avatar hashes don't match, udating.`,
      );

      const blob = (await vcard(self.xmpp).get({ to: from })).PHOTO;
      const data = await pomfUpload({
        data: blob.BINVAL,
        type: blob.TYPE,
        hash: newHash,
        url: self.credentials.pomf.url,
        key: self.credentials.pomf.key,
      });

      const path = join(basePath(), 'data', data.files[0].name);

      self.cache.setAvatarHash(from, newHash);
      self.cache
        .setAvatar(newHash, {
          data: blob.BINVAL,
          type: blob.TYPE,
          path,
          url: self.credentials.pomf.host + data.files[0].url,
          color: parseInt(await imageColor(path), 16),
        })
        .then(() => console.log(`Saved avatar for ${from}`));
    }
  } catch (err) {
    console.error(err);
  }

  if (
    !stanza.is('message')
    || !stanza.getChild('body')
    || stanza.attrs.from === `${stanza.getChild('stanza-id').attrs.by}/${self.options.nickname}`
  ) return;

  // TODO: Ewww
  // Also, is there another way to build redis keys?

  const channelId = await self.cache.redis
    .hget('muctoguild', stanza.getChild('stanza-id').attrs.by)
    .then(guild => self.cache.redis.hget('guildtochannel', guild));
  const [id, token] = await self.cache.redis.hmget(`channel:${channelId}`, 'id', 'token');

  await self.discord.executeWebhook(id, token, {
    content: stanza.getChildText('body'),
    username: jid(stanza.attrs.from).resource,
    avatarURL: await self.cache
      .getAvatarHash(stanza.attrs.from)
      .then(hash => self.cache.getAvatarField(hash, 'url')),
  });
};
