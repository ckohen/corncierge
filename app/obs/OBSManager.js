const OBSWebSocket = require('obs-websocket-js');

const events = require('./events');
const Socket = require('../Socket');

class OBSManager extends Socket {
    /**
     * Create a new OBSManager manager instance.
     * @param {Application} app
     * @returns {self}
    */
    constructor(app) {
        super();
        /**
        * The application container.
        * @type {Application}
        */
        this.app = app;

        /**
         * The socket events.
         * @type {Object}
         */
        this.events = events;

        /**
         * The OBS driver.
         * @type {?OBSWebSocket}
         */
        this.driver = new OBSWebSocket();
    }

    /**
  * Initialize the manager.
  * @returns {self}
  */
    init() {
        this.attach();
        return this.connect(this.driver, this.app);
    }

    connect(obs, app) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                obs.connect({address: app.options.obs.address + ":" + app.options.obs.port, password: app.options.obs.password}).then(resolve).catch(function (error) { });
            }, 5000);
        });
    }
}

module.exports = OBSManager;