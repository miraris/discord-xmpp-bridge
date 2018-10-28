module.exports = function messageCreate(msg) {
  if (msg.author.bot) return;

  const self = this.__self;

  if (
    !(
      msg.content.startsWith(self.options.prefix)
      || (msg.mentions.length && self.discord.user.id === msg.mentions[0].id)
    )
  ) return;

  console.log('Message starts with prefix or got mentioned');

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
