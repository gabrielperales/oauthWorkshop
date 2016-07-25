const Hapi = require('hapi');
const vision = require('vision');
const handlebars = require('handlebars');
const qs = require('querystring');

require('env2')('./config.env');

const request = require('./request');
const server = new Hapi.Server();
const port = process.env.PORT;

server.register(vision, () => {
  server.connection({ port });

  server.route([{
    method: 'GET',
    path: '/',
    handler(req, reply) {
      return reply.view('index');
    },
  }, {
    method: 'GET',
    path: '/login',
    handler(req, reply) {
      const querystring = qs.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
      });

      const redirectUrl = `https://github.com/login/oauth/authorize?${querystring}`;

      reply.redirect(redirectUrl);
    },
  }, {
    method: 'GET',
    path: '/welcome',
    handler(req, reply) {
      const { code } = req.query;

      const payload = JSON.stringify({
        code,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
      });

      request({
        hostname: 'github.com',
        method: 'POST',
        path: '/login/oauth/access_token',
        port: '443',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Content-Length': payload.length,
        },
        body: payload,
      }, (err, data) => {
        if (err) throw new Error(err);
        reply(data);
      });
    },
  }]);

  server.views({
    engines: {
      html: handlebars,
    },
    relativeTo: __dirname,
    path: 'templates',
  });

  server.start(serverErr => {
    if (serverErr) throw serverErr;

    console.log(`Server running at: ${port}`);
  });
});


