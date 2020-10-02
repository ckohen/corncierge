'use strict';

module.exports = (socket, before, after) => {
    let embed = false;
    let method = false;

    if (before.displayName !== after.displayName) {
        embed = socket.getEmbed('userChange', ["Nickname", after, before.displayName, after.displayName]);
        method = 'nickChange';

    }
    if (!before.roles.cache.equals(after.roles.cache)) {
        let roleChanged = "";
        let rolesChanged;
        let type;
        if (before.roles.cache.array().length > after.roles.cache.array().length) {
            //Role Removed
            rolesChanged = before.roles.cache.filter(role => testRole(role, after.roles.cache));
            type = "removed";
        }
        else {
            //Role added
            rolesChanged = after.roles.cache.filter(role => testRole(role, before.roles.cache));
            rolesChanged = rolesChanged.filter(role => ignoreRoles(role));
            type = "added";
        }
        rolesChanged.forEach(role => {
            if (role.name !== 'Voice') {
                roleChanged += `${role}`;
            }
        });
        if (!roleChanged) {
            return;
        }
        embed = socket.getEmbed('roleChange', [after, roleChanged, type]);
        method = 'roleUpdate';
    }

    if (socket.isGuild(before.guild.id, 'platicorn')) {
        if (embed) {
            socket.sendWebhook(method, embed);
        }
    }

    else if (before.guild.id === "756319910191300778") {
        if (embed) {
            socket.sendMessage('helpLogs', embed,);
        }
    }

    function testRole(role, findRoles) {
        if (findRoles.find(foundRole => foundRole.name === role.name)) {
            return false;
        }
        else {
            return true;
        }
    }

    function ignoreRoles(role) {
        let ignoredRoles = ["140254897479090176", "581396312914919424"];
        if (ignoredRoles.indexOf(role.id) < 0) {
            return true;
        }
        else {
            return false;
        }
    }
};
