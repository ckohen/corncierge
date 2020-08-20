'use strict';

module.exports = (socket, before, after) => {
    if (before.displayName !== after.displayName) {
        socket.sendWebhook('nickChange', socket.getEmbed(
            'userChange',
            ["Nickname", after, before.displayName, after.displayName]
        ));
    }
    if (!before.roles.equals(after.roles)) {
        let roleChanged;
        let rolesChanged;
        let type;
        if (before.roles.array().length > after.roles.array().length) {
            //Role Removed
            rolesChanged = before.roles.filter(role => testRole(role, after.roles));
            type = "removed";
        }
        else {
            //Role added
            rolesChanged = after.roles.filter(role => testRole(role, before.roles));
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
