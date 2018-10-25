const im = require('imagemagick');
const { promisify } = require('util');
const rgbHex = require('rgb-hex');

const convert = promisify(im.convert);

module.exports = (imagePath) => {
  const imArgs = [imagePath, '-scale', '1x1!', '-format', '%[pixel:u]', 'info:-'];

  return convert(imArgs).then(res => rgbHex(
    ...res
      .substring(res.indexOf('(') + 1, res.indexOf(')'))
      .split(',')
      .map(Number),
  ));
};
