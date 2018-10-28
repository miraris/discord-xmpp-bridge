const { joinMUC } = require('../utils/helpers');

exports.run = async function addbridge(msg, args) {
  await this.cache.addBridge({
    guild: args[0],
    muc: args[1],
    defaultChannel: args[2],
  });

  // join the muc
  joinMUC.bind(this)(args[1]);

  await msg.channel.createMessage(
    `Success! Added a bridge between ${this.discord.guilds.find(g => g.id === args[0]).name} and ${
      args[1]
    }`,
  );
};
