const util = require('util');

module.exports = {
    description: 'Evaluates code passed as string',
    guild: 'helpDesk',
    permissions: 'ADMINISTRATOR',
    usage: [
        '<eval string> (available bases are socket, message, util, and client)',
    ],

    async run(socket, message, args) {
        const client = socket.driver;
        args = args.join(' ');
        if (args.includes('token')) {
            return message.channel.send(`Error: Execution of command refused`);
        }
        function clean(text) {
            if (typeof text === "string") {
                return text.replace(/` /g, "`" + String.fromCharCode(8203)).replace(/@/g,  "@" + String.fromCharCode(8203));
            }
            return text;
        }
        let evaluated = eval(args);
        let cleaned = await clean(evaluated);
        message.channel.send(`\`\`\`js\n${cleaned}\n\`\`\``);
    }
};