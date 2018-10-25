const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const mime = require('mime');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

const KEY = process.env.POMF_KEY;
const URL = process.env.POMF_URL + (KEY ? `?key=${KEY}` : '');

module.exports = async ({ data, type, hash }) => {
  const fileName = `./data/${hash}.${mime.getExtension(type)}`;
  await writeFile(fileName, data, { encoding: 'base64' });

  const body = new FormData();
  body.append('files[]', fs.createReadStream(fileName));

  return fetch(URL, { method: 'POST', body, headers: body.getHeaders() }).then(result => result.json());
};
