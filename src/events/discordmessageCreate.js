const { xml } = require('@xmpp/client');
const { buildDiscordMsg } = require('../utils/helpers');

module.exports = async function messageCreate(msg) {
  if (msg.author.bot) return;

  const self = this.__self;
  const to = await self.cache.redis.hget('guildtomuc', msg.channel.guild.id);

  if (to) {
    const message = xml(
      'message',
      { type: 'groupchat', to },
      xml('body', {}, `[#${msg.channel.name}] <${msg.author.username}> ${buildDiscordMsg(msg)}`),
    );
    self.xmpp.send(message);
    return;
  }

  if (
    !(
      msg.content.startsWith(self.options.prefix)
      || (msg.mentions.length && self.discord.user.id === msg.mentions[0].id)
    )
  ) return;

  // Our standard argument/command name definition.
  const args = msg.content
    .slice(self.options.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();
  const cmd = self.commands.get(command);

  if (!cmd) return;

  // Run the command
  cmd.run.bind(self)(msg, args);
};
