const title = `
████████╗░█████╗░██╗░░██╗███████╗███╗░░██╗  ░██████╗░██████╗░░█████╗░██████╗░██████╗░███████╗██████╗░
╚══██╔══╝██╔══██╗██║░██╔╝██╔════╝████╗░██║  ██╔════╝░██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗
░░░██║░░░██║░░██║█████═╝░█████╗░░██╔██╗██║  ██║░░██╗░██████╔╝███████║██████╦╝██████╦╝█████╗░░██████╔╝
░░░██║░░░██║░░██║██╔═██╗░██╔══╝░░██║╚████║  ██║░░╚██╗██╔══██╗██╔══██║██╔══██╗██╔══██╗██╔══╝░░██╔══██╗
░░░██║░░░╚█████╔╝██║░╚██╗███████╗██║░╚███║  ╚██████╔╝██║░░██║██║░░██║██████╦╝██████╦╝███████╗██║░░██║
░░░╚═╝░░░░╚════╝░╚═╝░░╚═╝╚══════╝╚═╝░░╚══╝  ░╚═════╝░╚═╝░░╚═╝╚═╝░░╚═╝╚═════╝░╚═════╝░╚══════╝╚═╝░░╚═╝`;

const colors = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    gray: "\x1b[90m",
    reset: "\x1b[0m",
}

for (let [color, code] of Object.entries(colors)) {
    Object.defineProperty(String.prototype, color, {
        value: function () {
            return `${code}${this}${colors.reset}`;
        },
    })
}

class Spinner {
    constructor() {
        this.frames = [
            "⠋",
            "⠙",
            "⠹",
            "⠸",
            "⠼",
            "⠴",
            "⠦",
            "⠧",
            "⠇",
            "⠏"
        ]
        this.interval = 80;
        this.frame = 0;
    }

    start(text) {
        this.hook = setInterval(() => {
            process.stdout.clearLine();
            process.stdout.write(`${this.frames[this.frame]} ${text}\r`);
            this.frame = (this.frame + 1) % this.frames.length;
        }, this.interval);
    }

    resolve(text, icon = '✓'.green()) {
        clearInterval(this.hook);
        process.stdout.clearLine();
        process.stdout.write(`${icon} ${text}\n`);
    }
}

module.exports = { title, Spinner };