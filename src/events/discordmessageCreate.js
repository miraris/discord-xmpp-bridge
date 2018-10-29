const { xml } = require('@xmpp/client');
const { buildDiscordMsg } = require('../utils/helpers');

module.exports = async function messageCreate(msg) {
  if (msg.author.bot) return;

  const self = this.__self;

  // If message isn't a command relay to XMPP, if one is set up for the guild
  const to = await self.cache.redis.hget('guildtomuc', msg.channel.guild.id);

  // eslint-disable-next-line no-unused-expressions
  to
    && self.xmpp.send(
      xml(
        'message',
        { type: 'groupchat', to },
        xml('body', {}, `[#${msg.channel.name}] <${msg.author.username}> ${buildDiscordMsg(msg)}`),
      ),
    );

  if (
    !(
      msg.content.startsWith(self.options.prefix)
      || (msg.mentions.length && self.discord.user.id === msg.mentions[0].id)
    )
  ) return;

  const args = msg.content
    .slice(self.options.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();
  const cmd = self.commands.get(command);

  if (!cmd) return;

  cmd.run.bind(self)(msg, args);
};
