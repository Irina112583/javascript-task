'use strict';

const http = require('http');

const server = http.createServer();
const url = require('url');
const queryString = require('querystring');
const commands = {
    GET: get,
    POST: post
};

let messages = [];

server.on('request', (req, res) => {
    if ((/^\/messages(\/|\?|$)/).test(req.url)) {
        res.setHeader('Content-Type', 'application/json');
        commands[req.method](req, res);
    } else {
        res.statusCode = 404;
        res.end();
    }
});

function get(req, res) {
    let query = url.parse(req.url).query;
    let { from, to } = queryString.parse(query);

    let posts = messages.filter(message =>
        (!from || from === message.from) &&
        (!to || to === message.to));
    res.end(JSON.stringify(posts));
}

function post(req, res) {
    let query = url.parse(req.url).query;
    let { from, to } = queryString.parse(query);
    let message = {};
    let text = '';
    req
        .on('data', data => {
            text += data;
        })
        .on('end', () => {
            message.from = from;
            message.to = to;
            message.text = JSON.parse(text).text;
            messages.push(message);
            res.end(JSON.stringify(message));
        });
}

module.exports = server;
