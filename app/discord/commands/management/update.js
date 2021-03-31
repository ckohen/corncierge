'use strict';

const { exec } = require('child_process');
const BaseCommand = require('../BaseCommand');

class UpdateCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'update',
      description: 'updates to the latest master (make sure .env is still good!)',
      user: '140214425276776449',
    };
    super(socket, info);
  }

  async run(message) {
    let { stdout, stderr } = await promiseExec('git pull').catch(err => message.channel.send(`\`\`\`bash\n${err}\`\`\``));
    if (!stdout && !stderr) return;
    stdout = clean(stdout);
    stderr = clean(stderr);
    let embed = this.socket.getEmbed('update', ['Git Pulled', stdout, stderr]);
    await message.channel.send(embed);

    ({ stdout, stderr } = await promiseExec('npm i').catch(err => message.channel.send(`\`\`\`bash\n${err}\`\`\``)));
    if (!stdout && !stderr) return;
    stdout = clean(stdout);
    stderr = clean(stderr);
    embed = this.socket.getEmbed('update', ['Packages Updated', stdout, stderr]);
    await message.channel.send(embed);
  }
}

function promiseExec(action) {
  return new Promise((resolve, reject) =>
    exec(action, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    }),
  );
}

function clean(text) {
  if (typeof text === 'string') {
    return text.replace(/` /g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`);
  }
  return text;
}

module.exports = UpdateCommand;
