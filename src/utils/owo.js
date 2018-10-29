const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const mime = require('mime');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

/**
 * TODO:
 * Pretty yikes right here, remove node-fetch and form-adata
 */

module.exports = async ({
  data, type, hash, url, key,
}) => {
  const fileName = `./data/${hash}.${mime.getExtension(type)}`;
  await writeFile(fileName, data, { encoding: 'base64' });

  const body = new FormData();
  body.append('files[]', fs.createReadStream(fileName));

  return fetch(url + (key ? `?key=${key}` : ''), {
    method: 'POST',
    body,
    headers: body.getHeaders(),
  }).then(result => result.json());
};
