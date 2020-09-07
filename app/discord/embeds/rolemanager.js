module.exports = (comp, member) => comp
      .setColor('purple')
      .setTitle("Role Manager (!makeme and !makemenot)")
      .setDescription("This is a list of roles that users can add and remove from themselves, use `!help rolemanager` to see instructions for how to edit the role manager")
      .setFooter("Requested by " + member.user.username);