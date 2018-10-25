const Eris = require('eris');
const Redis = require('ioredis');
const { client, xml, jid } = require('@xmpp/client');
const vcard = require('./lib/vcard/caller');
const avatar = require('./lib/utils/avatar');
const pomfUpload = require('./lib/utils/owo');
const avatarColor = require('./lib/utils/color');

// Redis
const redis = new Redis(process.env.REDIS_URL);

// Authentication
const discord = new Eris(process.env.DISCORD_TOKEN);
const xmpp = client({
  service: process.env.JABBER_HOST,
  resource: process.env.JABBER_RESOURCE,
  username: process.env.JABBER_USERNAME,
  password: process.env.JABBER_PASSWORD,
});

const fetchAvatar = jid => vcard(xmpp).get({ to: jid });

/**
 * We download avatar metadata and all related stuff and cache it in Redis
 * @param {object} stanza
 */
const downloadAvatar = async (stanza) => {
  const {
    attrs: { from },
  } = stanza;
  const avatarHash = await avatar.getHash(stanza);

  console.log(from);
  console.log(avatarHash);

  if (!avatarHash) return;

  const av = (await fetchAvatar(from)).PHOTO;
  await redis.set(from, avatarHash);
  await redis.set(`${avatarHash}:data`, av.BINVAL);
  await redis.set(`${avatarHash}:type`, av.TYPE);

  const data = await pomfUpload({ data: av.BINVAL, type: av.TYPE, hash: avatarHash });
  const path = `./data/${data.files[0].name}`;

  console.log(data.files[0].url);

  await redis.set(`${avatarHash}:path`, path);
  await redis.set(`${avatarHash}:url`, process.env.POMF_HOST + data.files[0].url);
  await redis.set(`${avatarHash}:color`, parseInt(await avatarColor(path), 16));
};

/**
 * This doesn't work due to Discord's Webhook limit/server
 * I was attempting to give every user a single webhook
 */
// const setWebhooks = ({ from, id, token }) =>
//  Promise.all([redis.set(`${from}:webhook:id`, id), redis.set(`${from}:webhook:token`, token)]);

// const configureWebhooks = async (stanza) => {
//   const name = jid(stanza.attrs.from).resource;
//   const list = await discord.getChannelWebhooks(CHANNEL);

//   // console.log(list);
//   const avHash = await redis.get(stanza.attrs.from);

//   if (list.find(val => val.name === name)) return;

//   const res = await discord.createChannelWebhook(CHANNEL, {
//     name,
//     avatar: `data:${mime.getExtension(await redis.get(`${avHash}:type`))};base64,${await redis.get(
//       `${avHash}:data`,
//     )}`,
//   });

//   console.log({ from: stanza.attrs.from, id: res.id, token: res.token });
//   await setWebhooks({ from: stanza.attrs.from, id: res.id, token: res.token });
// };

const sendToDiscord = async (stanza) => {
  const {
    attrs: { from },
  } = stanza;

  console.log(from);

  // await redis.get(`${from}:webhook:id`),
  // await redis.get(`${from}:webhook:token`),
  const avatarHash = await redis.get(from);

  console.log(avatarHash);

  console.log(await redis.get(avatarHash));

  // console.log(await redis.get(`${avatarHash}:color`));

  const res = await discord.executeWebhook(
    process.env.DISCORD_WEBHOOK_ID,
    process.env.DISCORD_WEBHOOK_TOKEN,
    {
      embeds: [
        {
          // title: 'Message from XMPP',
          description: stanza.getChildText('body'),
          author: {
            name: jid(from).resource,
            icon_url: await redis.get(avatarHash),
          },
          color: avatarHash && (await redis.get(`${avatarHash}:color`)),
        },
      ],
    },
  );
  console.log(res);
};

const sendToXMPP = (name, msg) => {
  const message = xml(
    'message',
    { type: 'groupchat', to: process.env.JABBER_MUC },
    xml('body', {}, `<${name}> ${msg}`),
  );
  xmpp.send(message);
};

// Discord handlers
// message handler
discord.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  console.log(msg);
  await sendToXMPP(msg.author.username, msg.cleanContent);
});

xmpp.on('error', (err) => {
  console.error('❌', err.toString());
});

xmpp.on('online', async (address) => {
  console.log('🗸', 'Online as', address.toString());

  const msg = xml(
    'presence',
    { to: process.env.JABBER_MUC_JID },
    xml('x', { xmlns: 'http://jabber.org/protocol/muc' }, xml('history', { maxchars: 0 })),
  );

  xmpp.send(msg);
});

xmpp.on('stanza', async (stanza) => {
  try {
    if (stanza.is('presence') && stanza.getChild('x').attrs.xmlns === 'vcard-temp:x:update') {
      await downloadAvatar(stanza);
    }
  } catch (err) {
    console.error(err);
  }

  if (
    !stanza.is('message')
    || !stanza.getChild('body')
    || (stanza.is('message') && stanza.attrs.from === process.env.JABBER_MUC_JID)
  ) return;

  sendToDiscord(stanza);
  // console.log(stanza.toString());
});

// Connect to the services
discord.connect();
xmpp.start();
