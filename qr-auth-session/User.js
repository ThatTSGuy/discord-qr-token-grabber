class User {
    constructor(payload) {
        const user = payload.split(':');

        this.id = user[0];
        this.discriminator = user[1];
        this.avatar = `https://cdn.discordapp.com/avatars/${user[0]}/${user[2]}.png`;
        this.username = user[3];
    }
}

module.exports = User;