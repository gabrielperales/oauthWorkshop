const https = require('https');

/**
 * @param options {object}
 * @param callback {function}
 */
const request = (options, callback) => {
  const req = https.request(options, res => {
    let data = '';

    res.on('data', chunk => { data += chunk; });

    res.on('end', () => {
      callback(null, data);
    });
  });

  req.write(options.body || '');
  req.end();

  req.on('error', err => {
    if (err) throw new Error(err);
    callback(err);
  });
};

module.exports = request;

