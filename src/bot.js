const Eris = require('eris');
const env = require('good-env');
const { client: xmppClient, xml, jid } = require('@xmpp/client');
const debug = require('debug')('bridge');
const Cache = require('./cache');
const vcard = require('./vcard/caller');

const NS_MUC = 'http://jabber.org/protocol/muc';
const NS_DISCO = 'http://jabber.org/protocol/disco#info';
const NS_DATA_FORM = 'jabber:x:data';

class Bridge {
  constructor(credentials, options) {
    this.credentials = credentials;

    this.cache = new Cache();

    // connections
    this.discord = new Eris(this.credentials.discord.token);
    this.xmpp = xmppClient(this.credentials.xmpp);

    // Register event handlers
    this.xmpp.on('stanza', this.onStanza.bind(this));
    this.xmpp.on('online', this.onOnline.bind(this));
    // etc.
    this.discord.on('messageCreate', this.onMessageCreate.bind(this));

    // Alternatively, set a backreference property?
    // xmpp.__self = this;
    // xmpp.on('stanza', this.onStanza);

    // Connect to the services
    this.discord.connect();
    this.xmpp.start();
  }
}

module.exports = Bridge;
