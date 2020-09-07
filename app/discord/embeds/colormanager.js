module.exports = (comp, member) => comp
      .setColor('gold')
      .setTitle("Color Manager (!color)")
      .setDescription("This is a list of color roles that users can assign themselves. It will automatically remove all other roles on the list. Use `!help colormanager` to see instructions for how to edit the role manager")
      .setFooter("Requested by " + member.user.username);