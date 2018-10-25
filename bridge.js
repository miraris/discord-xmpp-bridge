const Eris = require('eris');
const Redis = require('ioredis');
const { client, xml, jid } = require('@xmpp/client');
const debug = require('debug')('bridge');
const vcard = require('./lib/vcard/caller');
const avatar = require('./lib/utils/avatar');
const pomfUpload = require('./lib/utils/owo');
const avatarColor = require('./lib/utils/color');
const helpers = require('./lib/utils/helpers');

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

const fetchVCard = id => vcard(xmpp).get({ to: id });

/**
 * We download avatar metadata and all related stuff and cache it in Redis
 * @param {object} stanza
 */
const downloadAvatar = async (stanza) => {
  const {
    attrs: { from },
  } = stanza;
  const avatarHash = await avatar.getHash(stanza);

  if (!avatarHash) return;

  // If this hash exists AND it's the same, we do nothing
  if ((await redis.get(`${avatarHash}:url`)) && (await redis.get(from)) === avatarHash) {
    console.log(`Avatars for ${from} are identical, skipping avatar sync.`);
    return;
  }

  // Fetches the vcard, then returns the photo from it
  const av = (await fetchVCard(from)).PHOTO;

  await redis.set(from, avatarHash);

  await redis.set(`${avatarHash}:data`, av.BINVAL);
  await redis.set(`${avatarHash}:type`, av.TYPE);

  // Upload the avatar to a Pomf compaitable host
  const data = await pomfUpload({ data: av.BINVAL, type: av.TYPE, hash: avatarHash });
  const path = `./data/${data.files[0].name}`;

  // Set the metadata
  await redis.set(`${avatarHash}:path`, path);
  await redis.set(`${avatarHash}:url`, process.env.POMF_HOST + data.files[0].url);
  await redis.set(`${avatarHash}:color`, parseInt(await avatarColor(path), 16));
};

/**
 * Bridge the message to Discord
 * @param {object} stanza
 */
const bridgeToDiscord = async (stanza) => {
  const {
    attrs: { from },
  } = stanza;
  const avatarHash = await redis.get(from);

  await discord.executeWebhook(process.env.DISCORD_WEBHOOK_ID, process.env.DISCORD_WEBHOOK_TOKEN, {
    embeds: [
      {
        description: stanza.getChildText('body'),
        author: {
          name: jid(from).resource,
          icon_url: await redis.get(`${avatarHash}:url`),
        },
        color: avatarHash && (await redis.get(`${avatarHash}:color`)),
      },
    ],
  });
};

/**
 * Bridge a simple message to XMPP
 * TODO: attachments and some other cool stuff
 *
 * @param {string} name
 * @param {string} msg
 */
const bridgeToXMPP = ({ channel, author, msg }) => {
  const message = xml(
    'message',
    { type: 'groupchat', to: process.env.JABBER_MUC },
    xml('body', {}, `[#${channel}] <${author}> ${msg}`),
  );
  xmpp.send(message);
};

// Discord handlers
discord.on('messageCreate', async (msg) => {
  if (msg.author.bot || msg.channel.guild.id !== process.env.DISCORD_GUILD_ID) return;

  await bridgeToXMPP({
    channel: msg.channel.name,
    author: msg.author.username,
    msg: helpers.buildDiscordMsg(msg),
  });
});

discord.on('connect', (id) => {
  console.log('🗸', 'Discord online on shard', id);
});

// XMPP Handlers
xmpp.on('error', (err) => {
  console.error('⚠️', err.toString());
});

xmpp.on('online', async (address) => {
  console.log('🗸', 'XMPP online as', address.toString());

  const msg = xml(
    'presence',
    { to: process.env.JABBER_MUC_JID },
    xml('x', { xmlns: 'http://jabber.org/protocol/muc' }, xml('history', { maxchars: 0 })),
  );

  xmpp.send(msg);
});

xmpp.on('stanza', async (stanza) => {
  debug(stanza.toString());

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
    || stanza.attrs.from === process.env.JABBER_MUC_JID
  ) return;

  bridgeToDiscord(stanza);
});

// Connect to the services
discord.connect();
xmpp.start();
