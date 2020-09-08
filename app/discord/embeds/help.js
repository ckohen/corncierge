module.exports = (comp, prefix) => comp
      .setColor('red')
      .setTitle("Help")
      .setDescription("If a command is not listed here, see the full help for that command by using `" + prefix + "help legacy <command>`");