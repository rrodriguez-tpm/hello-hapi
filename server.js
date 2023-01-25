'use strict';

const os = require('os');
const Hapi = require('@hapi/hapi');

let numVisits = 0;

const init = async () => {
    const server = Hapi.server({
        port: 8080,
        host: '0.0.0.0'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: async (request, h) => {
            return `${os.hostname()}: Number of visits is: ${++numVisits}`;
        }
    });


    server.ext('onRequest', (request, reply) => {
        let p = request.path;
        let isHtmlResourceRequest = p.endsWith('.js') || p.endsWith('.css') || p.endsWith('.png') || p.endsWith('.gif') || p.endsWith('.css') || p.endsWith('.json') || p.endsWith('.ttf') || p.endsWith('.ico');
        if (!isHtmlResourceRequest) {
            console.log('');

            let ip = 'remoteAddress: ' + request.info.remoteAddress;
            if (request.headers['x-real-ip'] !== undefined) ip += ', x-real-ip:' + request.headers['x-real-ip'];
            if (request.headers['x-forwarded-for'] !== undefined) ip += ', x-forwarded-for:' + request.headers['x-forwarded-for'];

            console.log(JSON.stringify({ msg: `Request received - [${request.method}] ${request.server.info.protocol + "://" + request.headers.host + request.path} from IP ${ip}` }));
        }
        return reply.continue;
    });

    server.events.on('response', (data) => {
        let raw = data.raw.req;
        let url = data.server.info.protocol + "://" + raw.headers.host + raw.url;
        let isHtmlResourceRequest = url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.png') || url.endsWith('.gif') || url.endsWith('.css') || url.endsWith('.json') || url.endsWith('.ttf') || url.endsWith('.ico');
        let isSwaggerHtml = data._route.path === '/documentation';

        if (!isHtmlResourceRequest && !isSwaggerHtml) {
            if (data.response._error === null) {
                console.log(JSON.stringify({ msg: `Request reply sent - ${url}`, responseData: data.response.source }));
            } else {
                console.log(JSON.stringify({ msg: `Request reply sent - ${url}`, responseData: data.response.source, error: data.response._error }));
            }
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
