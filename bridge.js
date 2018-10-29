/* eslint-disable global-require, no-new */

const Bot = require('./src/bot');

if (!module.parent) {
  const isDocker = require('is-docker');

  if (!isDocker()) {
    const path = require('path');
    require('dotenv').config({
      path: path.resolve(process.cwd(), 'credentials.env'),
    });
  }

  new Bot(
    {
      discord: process.env.DISCORD_TOKEN,
      redis: process.env.REDIS_URL,
      xmpp: {
        service: process.env.JABBER_HOST,
        username: process.env.JABBER_USERNAME,
        password: process.env.JABBER_PASSWORD,
      },
      pomf: {
        url: process.env.POMF_URL,
        key: process.env.POMF_KEY,
        host: process.env.POMF_HOST,
      },
    },
    { owner: process.env.DISCORD_OWNER_ID },
  );
} else {
  module.exports = Bot;
}
