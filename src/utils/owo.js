const FormData = require('form-data');
const fs = require('fs');
const https = require('https');
const mime = require('mime');
const { promisify } = require('util');
const { join } = require('path');

const writeFile = promisify(fs.writeFile);

module.exports = async ({
  data, type, hash, url, key,
}) => {
  const form = new FormData();
  // const path = `./data/${hash}.${mime.getExtension(type)}`;
  const path = join('./data', `${hash}.${mime.getExtension(type)}`);
  const pomfUrl = new URL(url);

  // Add a key search param if one is provided
  key && pomfUrl.searchParams.append('key', key);

  const options = {
    hostname: pomfUrl.hostname,
    port: 443,
    path: pomfUrl.pathname + pomfUrl.search,
    method: 'post',
    headers: form.getHeaders(),
  };

  await writeFile(path, data, { encoding: 'base64' });

  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
      }

      const body = [];
      response.on('data', chunk => body.push(chunk));
      response.on('end', () => resolve(JSON.parse(body.join(''))));
    });

    form.append('files[]', fs.createReadStream(path));
    form.pipe(request);

    request.on('error', err => reject(err));
  });
};
