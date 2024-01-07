const {createClient} = require('redis');

const client = createClient({
    username:'Sugam50',
    password: 'Sugam@123',
    socket: {
        host: 'redis-12718.c326.us-east-1-3.ec2.cloud.redislabs.com',
        port: 12718
    }
});

module.exports = client;