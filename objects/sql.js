var mysql = require('mysql');
var { Player } = require("./player.js");
var { Score } = require("./score.js");
var { Map } = require("./map.js");

class Sql {
    constructor(hostname, username, password, database) {
        this.connection = mysql.createPool({
            host: hostname,
            user: username,
            password: password,
            database: database,
            insecureAuth: true
        });
    }

    getAllUsers() {
        return new Promise((resolve, reject) => {
            var players = [];

            this.connection.query('SELECT * FROM osu_users ORDER BY rankedscore DESC', (err, allUsers, fields) => {
                if (err) throw err;
                var rank = 1;

                allUsers.forEach(user => {
                    players.push(new Player(user.username, user.rankedscore, user.accuracy, user.totalscore, rank, user.playcount));
                    rank++;
                });

                resolve(players);
            });
        });
    }

    getUser(username) {
        return new Promise((resolve, reject) => {
            var player = null;

            this.connection.query('SELECT * FROM osu_users ORDER BY rankedscore DESC', (err, allUsers, fields) => {
                if (err) throw err;
                var rank = 1;

                allUsers.forEach(user => {
                    if (username == user.username)
                        player = new Player(user.username, user.rankedscore, user.accuracy, user.totalscore, rank, user.playcount);

                    rank++;
                });

                resolve(player);
            });
        });
    }

    addUser(email, username, password) {
        return new Promise((resolve, reject) => {
            this.connection.query('INSERT INTO osu_users (email, username, password, playcount, totalscore, rankedscore, accuracy, s300, s100, s50, s0) VALUES (?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0)', [email, username, password], function (err, results, fields) {
                var message = "";

                if (err) {
                    if (err.code == 'ER_DUP_ENTRY' || err.errno == 1062) {
                        message = "error happened, username already in use";
                    } else {
                        console.log(err);
                        message = "error happened, unknown one";
                    }
                } else {
                    message = "user is created go play";
                }

                resolve(message);
            });
        });
    }

    getAllUsersScores(username) {
        return new Promise((resolve, reject) => {
            var scores = [];
            var maps = [];

            this.connection.query('SELECT * FROM osu_scores WHERE username = ? and pass = True ORDER BY score DESC', username, (err, usersScores, fields) => {
                if (err) throw err;
                this.connection.query('SELECT * FROM osu_maps WHERE ranking = 2;', (err, allRankedMaps, fields) => {
                    allRankedMaps.forEach(map => {
                        var mapName = map.name.split("|");

                        maps.push(new Map(map.md5, mapName[0], mapName[1], mapName[2], map.setid));
                    });



                    usersScores.forEach(userScore => {
                        var hashIndex = maps.findIndex(function (map) {
                            return map.md5 == userScore.osuhash;
                        });

                        if (hashIndex != -1) {
                            scores.push(new Score(userScore.score, maps[hashIndex].artist, maps[hashIndex].title, maps[hashIndex].diff, maps[hashIndex].setId));
                        }
                    });

                    resolve(scores);
                });
            });
        });
    }
}

exports.Sql = Sql;