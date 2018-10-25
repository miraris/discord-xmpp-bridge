const xml = require('@xmpp/xml');

const NS = 'vcard-temp';

function parse({ children }) {
  return children.reduce((dict, c) => {
    dict[c.name] = c.children && typeof c.children[0] === 'string' ? c.text() : parse(c); // eslint-disable-line no-param-reassign
    return dict;
  }, {});
}

function build(dict, parent) {
  return (parent || xml('vCard', { xmlns: NS })).append(
    Object.entries(dict).map(
      ([key, val]) => (typeof val === 'object' ? build(val, xml(key)) : xml(key, {}, val)),
    ),
  );
}

module.exports = ({ iqCaller }) => ({
  get(...args) {
    return iqCaller.get(xml('vCard', { xmlns: NS }), ...args).then(parse);
  },
  set(vcard, ...args) {
    return iqCaller.set(build(vcard), ...args);
  },
});
