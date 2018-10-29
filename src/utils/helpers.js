const fs = require('fs');
const path = require('path');
const { xml } = require('@xmpp/client');

const basePath = () => path.dirname(require.main.filename);

const buildDiscordMsg = (msg) => {
  if (msg.attachments.length === 0) {
    return msg.cleanContent;
  }

  return `${msg.cleanContent} ${msg.attachments.map(a => a.url).join(' ')}`;
};

const botChannels = guilds => guilds
  .map(guild => guild.channels.filter(channel => channel.type === 0 && channel.name.startsWith('bot')))
  .filter(g => g.length)
  .reduce((acc, val) => acc.concat(val));

function initMessage() {
  console.log('Started up.');
  // for (const g of botChannels(this.discord.guilds)) {
  //   this.discord.createMessage(g.id, {
  //     content: 'Konnichiwa!',
  //     embed: {
  //       title: 'Niki 0.1.0',
  //       url: 'https://github.com/miraris/discord-xmpp-bridge',
  //       description:
  //         "I'm a Discord <-> Jabber bridge bot, you can message and add me to your guilds and MUCs using the addresses below!",
  //       fields: [
  //         {
  //           name: 'Jabber',
  //           value: this.xmpp.jid.toString(),
  //         },
  //         {
  //           name: 'Discord',
  //           value: `${this.discord.user.username}#${this.discord.user.discriminator}`,
  //         },
  //       ],
  //     },
  //   });
  // }
}

const loadDirectory = (directory, callback) => {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    if (!file.endsWith('.js')) continue;

    const fileName = file.split('.')[0];
    const service = fileName.startsWith('discord') ? 'discord' : 'xmpp';

    // eslint-disable-next-line
    const obj = require(path.join(basePath(), directory, file));

    callback({ name: fileName.replace(service, ''), service, obj });
  }
};

function joinMUC(jid) {
  const msg = xml(
    'presence',
    { to: `${jid}/${this.options.nickname}` },
    xml('x', { xmlns: 'http://jabber.org/protocol/muc' }, xml('history', { maxchars: 0 })),
  );

  this.xmpp.send(msg);
}

module.exports = {
  buildDiscordMsg,
  initMessage,
  loadDirectory,
  joinMUC,
  basePath,
};
