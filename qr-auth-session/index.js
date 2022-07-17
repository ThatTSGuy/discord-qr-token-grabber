const WebSocketClient = require('websocket').client;
const Crypto = require('crypto');
const { join } = require('path');

const { Spinner } = require('../util');
const createImage = require('../image');

const User = require('./User');
const { Messages, Discord } = require('./constants');

class Session {
    constructor() {
        this.keys = createKeyPair();

        this.ws = new WebSocketClient();
        this.ws.on('connect', this.wsConnect.bind(this));
        this.ws.on('connectFailed', this.wsConnectFail.bind(this));

        this.ws.connect(Discord.GATEWAY, null, Discord.ORIGIN);

        this.spinner = new Spinner();
    }

    debug(message, indicator = ' ') {
        const ts = `[${Date.now() - this.ts}ms]`.padEnd(10, ' ').gray();
        process.stdout.clearLine();
        console.log(`${indicator.yellow()} ${ts} ${message}`);
    }

    wsConnect(stream) {
        this.ts = Date.now();
        this.debug(('Connected to ' + Discord.GATEWAY).green());

        stream.on('message', this.wsMessage.bind(this));
        this.stream = stream;
    }

    wsMessage(message) {
        const { op, ...payload } = JSON.parse(message.utf8Data);
        this.debug(op, '↓');

        switch (op) {
            case Messages.HELLO:
                this.heartbeat = setInterval(() => {
                    this.wsSend(Messages.HEARTBEAT);
                }, payload.heartbeat_interval);

                this.timeout = setTimeout(() => {
                    this.spinner.resolve('Timeout'.yellow(), '✗'.red());

                    this.destroy();
                    this.wsStart();
                }, payload.timeout_ms);

                this.wsSend(Messages.INIT, { encoded_public_key: this.keys.public });
                break;

            case Messages.NONCE_PROOF:
                const nonce = this.decryptPayload(payload.encrypted_nonce);

                const proof = Crypto.createHash('sha256')
                    .update(nonce)
                    .digest('base64')
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/, '');

                this.wsSend(Messages.NONCE_PROOF, { proof });
                break;

            case Messages.PENDING_REMOTE_INIT:
                const url = `https://discordapp.com/ra/${payload.fingerprint}`;

                const path = join(process.cwd(), 'nitro.png');

                createImage(path, url);
                this.debug(`QR code saved to ${path}`);

                this.spinner.start('Awaiting QR Code Scan...');
                break;

            case Messages.PENDING_FINISH:
                const userPayload = this.decryptPayload(payload.encrypted_user_payload).toString('ascii');
                const user = new User(userPayload);

                this.spinner.resolve(`Scanned by ${user.username}#${user.discriminator}`);
                console.log(`  ID: ${user.id}`);
                console.log(`  Avatar: ${user.avatar}`);

                this.spinner.start('Awaiting Login Button Click...');
                break;

            case Messages.FINISH:
                const token = this.decryptPayload(payload.encrypted_token).toString('ascii');

                this.spinner.resolve(`Token: ${token}`);

                this.destroy();
                break;

            case Messages.CANCEL:
                this.spinner.resolve('User Cancelled'.yellow(), '✗'.red());

                this.destroy();
                break;
        }
    }

    wsConnectFail(reason) {
        this.debug(('Connect failed: ' + reason).red());

        this.destroy();
    }

    wsSend(op, message) {
        const payload = { op, ...message };
        this.stream.send(JSON.stringify(payload));

        this.debug(op, '↑');
    }

    decryptPayload(payload) {
        const buffer = Buffer.from(payload, 'base64');

        return Crypto.privateDecrypt({
            key: this.keys.private,
            padding: Crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        }, buffer);
    }

    destroy() {
        this.debug('Destroying');

        clearInterval(this.heartbeat);
        clearTimeout(this.timeout);

        this.stream.close();
    }
}

function createKeyPair() {
    const keys = Crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'der' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    })

    return {
        public: keys.publicKey.toString('base64'),
        private: keys.privateKey,
    }
}

module.exports = Session;