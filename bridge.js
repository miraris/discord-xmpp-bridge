const Eris = require('eris');
const Redis = require('ioredis');
const { client, xml } = require('@xmpp/client');

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

const getAvatar = _ => redis.get('foo');

// Discord handlers
// message handler
discord.on('messageCreate', async (msg) => {
  console.log(`[#${msg.channel.name}] ${msg.content}`);
  const av = await getAvatar('sha1'); // by sha sum?
  console.log(av);
});

xmpp.on('error', (err) => {
  console.error('❌', err.toString());
});

xmpp.on('offline', () => {
  console.log('🛈', 'Offline');
});

xmpp.on('online', async (address) => {
  console.log('🗸', 'Online as', address.toString());

  const msg = xml(
    'presence',
    { to: process.env.JABBER_MUC_JID },
    xml('x', { xmlns: 'http://jabber.org/protocol/muc' }),
  );

  xmpp.send(msg);
});

xmpp.on('stanza', (stanza) => {
  console.log('⮈', stanza.toString());
});

// Connect to the services
discord.connect();
xmpp.start();
