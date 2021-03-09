'use strict';

module.exports = (comp, title, stdout, stderr) => comp.setColor('BLURPLE').setTitle(title).setDescription(`\`\`\`bash\n${stdout}\n${stderr}\`\`\``);
