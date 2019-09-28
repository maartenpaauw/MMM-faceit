const NodeHelper = require('node_helper');
const Faceit = require('faceit-js');

module.exports = NodeHelper.create({

    api: null,

    config: [],

    players: [],

    socketNotificationReceived(notification, payload) {
        switch(notification) {
            case 'CONFIG_SET':
                this.initialize(payload);
                break;
            case 'PLAYERS_FETCH':
                this.fetchPlayers(payload);
                break;
        }
    },

    initialize (config) {
        this.config = config;
        this.api = new Faceit(config.apiKey);
    },

    async fetchPlayers (players) {
        this.players = await Promise.all(players.map(player => {
            return this.api.nickname(player.name);
        }));

        this.sendSocketNotification('PLAYERS_RECEIVED', this.players);
    }
});
