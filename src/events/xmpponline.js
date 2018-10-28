const { joinMUC } = require('../utils/helpers');

module.exports = async function online(address) {
  const self = this.__self;

  console.log('🗸', 'XMPP online as', address.toString());

  for (const b of await self.cache.getBridges()) {
    joinMUC.bind(self)(b.muc);
  }
};
