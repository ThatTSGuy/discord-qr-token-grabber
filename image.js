const { join } = require('path');
const { createCanvas, Image, GlobalFonts } = require('@napi-rs/canvas');
const QRCode = require('qrcode');
const { readFile, writeFile } = require('fs/promises');

const canvas = createCanvas(600, 900);
const ctx = canvas.getContext('2d');

GlobalFonts.registerFromPath('./assets/Whitney.woff2', 'Whitney');

async function createImage(path, fingerprint) {
    const banner = new Image();
    banner.src = await readFile(join(__dirname, 'assets', 'banner.png')); // 1200x718

    ctx.fillStyle = '#23272a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(banner, 0, 0, 600, 359);

    ctx.textAlign = 'center';

    ctx.font = '52px Whitney';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Free Gift', 300, 420);

    ctx.font = '28px Whitney';
    ctx.fillStyle = '#96989d';
    ctx.fillText('You\'ve been gifted a free nitro subscription!', 300, 470);
    ctx.fillText('Scan this with the Discord mobile app to claim it.', 300, 505);

    const qr = new Image();
    qr.src = await qrPromise(fingerprint);

    ctx.drawImage(qr, 150, 550);

    const overlay = new Image();
    overlay.src = await readFile(join(__dirname, 'assets', 'overlay.png')); // 100x100

    ctx.drawImage(overlay, 250, 650);

    writeFile(path, canvas.toBuffer());
}

function qrPromise(fingerprint) {
    return new Promise((resolve, reject) => {
        QRCode.toBuffer(
            fingerprint,
            {
                width: 300,
                margin: 2,
            },
            (err, buffer) => {
                if (err) reject(err);
                resolve(buffer);
            })
    })
}

module.exports = createImage;