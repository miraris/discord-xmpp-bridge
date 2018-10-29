const Eris = require('eris');
const { client: xmppClient } = require('@xmpp/client');
const Cache = require('./cache');
const { loadDirectory, initMessage } = require('./utils/helpers');

class Bridge {
  constructor(credentials, options) {
    const defaultOptions = { prefix: 'niki ', embed: false, nickname: 'BridgeBot' };

    this.credentials = credentials;
    this.options = { ...defaultOptions, ...options };
    this.cache = new Cache(credentials.redis);
    this.discord = new Eris(credentials.discord);
    this.xmpp = xmppClient(credentials.xmpp);

    // Set backreference properties
    this.xmpp.__self = this;
    this.discord.__self = this;

    this.commands = new Eris.Collection();

    // Register event and command handlers
    loadDirectory('./src/events/', ({ name, service, obj }) => this[service].on(name, obj));
    loadDirectory('./src/commands/', ({ name, service, obj }) => this.commands.set(name, obj));

    // Connect to the services
    Promise.all([this.xmpp.start(), this.discord.connect()]).then(initMessage.bind(this));
  }
}

module.exports = Bridge;
