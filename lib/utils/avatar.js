const getAvatarHash = stanza => stanza.getChild('x').getChildText('photo');

module.exports = {
  getHash: getAvatarHash,
};
