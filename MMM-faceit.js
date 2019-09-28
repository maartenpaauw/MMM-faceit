Module.register('MMM-faceit', {

    defaults: {
        updateInterval: 5 * 60 * 1000,
        apiKey: null,
        players: [],
    },

    interval: null,

    players: [],

    start() {
        this.sendSocketNotification('CONFIG_SET', this.config);
        this.sendSocketNotification('PLAYERS_FETCH', this.config.players);
        this.scheduleFetch();
    },

    getStyles() {
        return [
            'MMM-faceit.css',
        ];
    },

    getTemplate() {
        return `templates/MMM-faceit.njk`;
    },

    getTemplateData() {
        return {
            config: this.config,
            players: this.players,
            helper: function(elo) {
                return new Elo(elo);
            },
        };
    },

    suspend() {
        clearInterval(this.interval);
    },

    resume() {
        this.scheduleFetch();
    },

    socketNotificationReceived(notification, payload) {
        switch (notification) {
            case 'PLAYERS_RECEIVED':
                this.setPlayers(payload);
                break;
        };
    },

    scheduleFetch() {
        this.interval = setInterval(() => {
            this.sendSocketNotification('PLAYERS_FETCH');
        }, this.config.updateInterval);
    },

    setPlayers(players) {
        console.info(players);
        this.players = players;
        this.updateDom(500);
    },
});

class Elo {

    LEVELS = {
        1: [1, 800],
        2: [801, 950],
        3: [951, 1100],
        4: [1101, 1250],
        5: [1251, 1400],
        6: [1401, 1550],
        7: [1551, 1700],
        8: [1701, 1850],
        9: [1851, 2000],
        10: [2001, null],
    }

    constructor (game) {
        this.game = game;
        this.elo = this.game.faceit_elo;
        [this.minElo, this.maxElo] = this.LEVELS[this.game.skill_level];
    }

    getProgressBarValue() {
        return this.elo - this.minElo;
    }
    
    getProgressBarMax() {
        return this.maxElo - this.minElo;
    }

    belowDiff() {
        return this.minElo - this.elo - 1;
    }

    aboveDiff() {
        if (this.maxElo === null) {
            return '∞';
        }

        return `+${this.maxElo - this.elo + 1}`;
    }

    getMinElo() {
        return this.minElo;
    }
    
    getMaxElo() {
        return this.maxElo ? this.maxElo : '∞';
    }
}
