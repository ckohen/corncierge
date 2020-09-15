'use strict';

module.exports = (socket, before, after) => {
    if (before.displayName !== after.displayName) {
        socket.sendWebhook('nickChange', socket.getEmbed(
            'userChange',
            ["Nickname", after, before.displayName, after.displayName]
        ));
    }
    if (!before.roles.cache.equals(after.roles.cache)) {
        let roleChanged;
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
            type = "added";
        }
        roleChanged = rolesChanged.array()[0];
        if(roleChanged.name === 'Voice') {
            return;
        }
        socket.sendWebhook('roleUpdate', socket.getEmbed(
            'roleChange', [after, roleChanged, type]
        ));
    }

    function testRole(role, findRoles) {
        if(findRoles.find(foundRole => foundRole.name === role.name)) {
            return false;
        }
        else {
            return true;
        }
    }
};
