var mysql = require('mysql');
var { Player } = require("./player.js");
var { Score } = require("./score.js");
var { Map } = require("./map.js");
var { Post } = require('./post.js');
const { Message } = require('./message.js');

/**
 * The object that handles all database functions
 */
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

    /**
     * Gets all users registered in the database sorted by ranked score
     * @returns {Player[]} The array of all players
     */
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

    /**
     * Gets the latest 11 messages from chat
     */
    getChat() {
        return new Promise((resolve, reject) => {
            var messages = [];

            this.connection.query('SELECT * FROM osu_chat WHERE target = \'#osu\' ORDER BY `time` DESC LIMIT 11', (err, allMessages, fields) => {
                if (err) throw err;

                allMessages.forEach(message => {
                    messages.push(new Message(message.sender, message.content, message.target, message.time));
                });

                resolve(messages);
            });
        });
    }

    /**
     * Gets the 3 latest posts from the database
     */
    getLatestPosts() {
        return new Promise((resolve, reject) => {
            var posts = [];

            this.connection.query('SELECT * FROM osu_announcements ORDER BY posttime DESC LIMIT 3', (err, allPosts, fields) => {
                if (err) throw err;

                allPosts.forEach(post => {
                    posts.push(new Post(post.title, post.creator, post.content, post.posttime.getFullYear().toString().substr(2) + "." + (post.posttime.getMonth() + 1) + "." + post.posttime.getDate()));
                });

                resolve(posts);
            });
        });
    }

    /**
     * Gets a user from the database
     * @param {string} username The username of the user
     * @returns {Player} The player retrived
     */
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

    /**
     * Adds a user to the database
     * @param {string} email The email of the user
     * @param {string} username The username of the user
     * @param {string} password The password of the user
     */
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

    /**
     * Gets a count of all ranked users
     */
    getNumberOfUsers() {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT count(*) FROM osu_users', function (err, results, fields) {
                var userCount = 0;

                results.forEach(result => {
                    userCount = result["count(*)"];
                });

                resolve(userCount);
            });
        });
    }

    /**
     * Gets a count of all ranked users
     */
    getNumberOfOnlinePlayers() {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT count(*) FROM osu_users WHERE `online` = true', function (err, results, fields) {
                var userCount = 0;

                results.forEach(result => {
                    userCount = result["count(*)"];
                });

                resolve(userCount);
            });
        });
    }

    /**
     * Gets a count of all ranked scores
     */
    getNumberOfScores() {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT count(*) FROM `osu_scores`', function (err, results, fields) {
                var scoreCount = 0;

                results.forEach(result => {
                    scoreCount = result["count(*)"];
                });

                resolve(scoreCount);
            });
        });
    }

    /**
     * Gets all scores of a specific user
     * @param {string} username The username of the user to get all scores from
     */
    getAllUsersScores(username) {
        return new Promise((resolve, reject) => {
            var scores = [];
            var maps = [];

            this.connection.query('SELECT * FROM osu_scores WHERE username = ? and pass = True ORDER BY score DESC', username, (err, usersScores, fields) => {
                if (err) throw err;
                this.connection.query('SELECT * FROM osu_maps WHERE approved = 2;', (err, allRankedMaps, fields) => {
                    allRankedMaps.forEach(map => {
                        maps.push(new Map(map.file_md5, map.artist, map.title, map.version, map.beatmapset_id));
                    });

                    usersScores.forEach(userScore => {
                        var hashIndex = maps.findIndex(function (map) {
                            return map.md5 == userScore.osuhash;
                        });

                        var scoreExist = scores.findIndex(function (score) {
                            return (score.md5 == userScore.osuhash);
                        });

                        if (scoreExist == -1) {
                            if (hashIndex != -1) {
                                scores.push(new Score(userScore.score, maps[hashIndex].artist, maps[hashIndex].title, maps[hashIndex].diff, maps[hashIndex].setId, maps[hashIndex].md5));
                            }
                        }
                    });

                    resolve(scores);
                });
            });
        });
    }
}

exports.Sql = Sql;