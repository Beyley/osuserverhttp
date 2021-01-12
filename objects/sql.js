var mysql = require('mysql');
var { Player } = require("./player.js");
var { Score } = require("./score.js");
var { Map } = require("./map.js");
var { Post } = require('./post.js');
const { Message } = require('./message.js');
var { StringBuilder } = require("./stringbuilder.js");

/**
     * Gets the time in plain text since the seconds
     * @param {number} originTime 
     * @returns {String} 
     */
function getSecondsFixed(originTime) {
    const year = 31540000;
    const month = 2628000; // assume 30 days in a month
    const day = 86400;
    const hour = 3600;
    const minute = 60;

    const years = Math.floor(originTime / year);
    const months = Math.floor((originTime - years * year) / month);
    const days = Math.floor(((originTime - years * year) - months * month) / day);
    const hours = Math.floor((((originTime - years * year) - months * month) - days * day) / hour);
    const minutes = Math.floor(((((originTime - years * year) - months * month) - days * day) - hours * hour) / minute);
    const seconds = Math.floor(((((originTime - years * year) - months * month) - days * day) - hours * hour) - minutes * minute);

    let returnString = new StringBuilder();

    if (years != 0) returnString.append(`${years} Year${years > 1 ? 's' : ''}, `);
    if (months != 0) returnString.append(`${months} Month${months > 1 ? 's' : ''}, `);
    if (days != 0) returnString.append(`${days} Day${days > 1 ? 's' : ''}, `);
    if (days < 3 && hours != 0) returnString.append(`${hours} Hour${hours > 1 ? 's' : ''}, `);
    if (days < 3 && minutes != 0) returnString.append(`${minutes} Minute${minutes > 1 ? 's' : ''}, `);
    if (days < 3 && seconds != 0) returnString.append(`${seconds} Second${seconds > 1 ? 's' : ''}, `);

    returnString = returnString.toString();

    return returnString.substring(0, returnString.length - 2);
}

function getSecondsFixedSinceToday(time) {
    let currentDate = new Date();

    let timeDifference = (currentDate - time) / 1000;

    return getSecondsFixed(timeDifference);
}

/**
 * The object that handles all database functions
 */
class Sql {
    /**
     * Constructs a new database handler
     * @param {String} hostname The hostname (address) to use
     * @param {String} username The username to use
     * @param {String} password The password to use
     * @param {String} database The database to use
     */
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
    getTop50() {
        return new Promise((resolve, reject) => {
            let players = [];

            this.connection.query('SELECT * FROM osu_users ORDER BY rankedscore DESC LIMIT 50', (err, allUsers, fields) => {
                if (err) throw err;

                let rank = 1;

                allUsers.forEach(user => {
                    let tempPlayer = new Player(user.username, user.rankedscore, user.accuracy, user.totalscore, rank, user.playcount, user.registertime, user.lastlogintime, user.userid);

                    players.push(tempPlayer);
                    rank++;
                });

                resolve(players);
            });
        });
    }

    /**
     * Gets the user id of a user
     * @param {String} username The users username
     * @param {String} password The users password
     * 
     * @returns {Number} The user id (-1 if not exist)
     */
    getUserId(username, password) {
        return new Promise((resolve, reject) => {
            let exist = -1;

            this.connection.query('SELECT * FROM osu_users WHERE username = ? AND password = ?', [username, password], (err, results, fields) => {
                if (err) throw err;

                if (results.length > 0) {
                    exist = results[0].userid;
                }

                resolve(exist);
            });
        });
    }

    /**
     * Gets the set id of a map
     * @param {Number} setId The id of the set
     * 
     * @returns {Map} Map (null if not exist)
     */
    getMapFromId(setId) {
        return new Promise((resolve, reject) => {
            let map = null;

            this.connection.query('SELECT * FROM osu_maps WHERE beatmapset_id = ?', [setId], (err, matchingMaps, fields) => {
                if (err) throw err;

                matchingMaps.forEach((mapToCheck) => {
                    map = new Map(mapToCheck);
                });

                resolve(map);
            });
        });
    }

    /**
     * Gets the amoung of SS's that a player has
     * @param {String} username The username 
     */
    getUserXCount(username) {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT count(*) FROM osu_scores WHERE (grade = \'X\' OR grade = \'XH\') AND username = ?', [username], (err, results, fields) => {
                if (err) throw err;

                let xCount = results[0]["count(*)"];

                resolve(xCount);
            });
        });
    }

    /**
     * Gets the amount of S's that a player has
     * @param {String} username The username
     */
    getUserSCount(username) {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT count(*) FROM osu_scores WHERE (grade = \'S\' OR grade = \'SH\') AND username = ?', [username], (err, results, fields) => {
                if (err) throw err;

                let sCount = results[0]["count(*)"];

                resolve(sCount);
            });
        });
    }

    /**
     * Gets the amount of A ranks that a player has
     * @param {String} username The username
     */
    getUserACount(username) {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT count(*) FROM osu_scores WHERE grade = \'A\' AND username = ?', [username], (err, results, fields) => {
                if (err) throw err;

                let aCount = results[0]["count(*)"];

                resolve(aCount);
            });
        });
    }

    /**
     * Gets the latest 11 messages from chat
     */
    getChat() {
        return new Promise((resolve, reject) => {
            let messages = [];

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
            let posts = [];

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
            let player = null;

            this.connection.query('SELECT * FROM osu_users ORDER BY rankedscore DESC', (err, allUsers, fields) => {
                this.connection.query('SELECT * FROM osu_scores WHERE username = ?', username, (err, usersScores, fields) => {
                    if (err) throw err;
                    let rank = 1;

                    allUsers.forEach(user => {
                        if (username == user.username) {
                            var totalHits = 0;
                            var maxCombo = 0;

                            usersScores.forEach(score => {
                                totalHits += Number(score.hit300) + Number(score.hit100) + Number(score.hit50) + Number(score.hitgeki) + Number(score.hitkatu);

                                if (score.combo > maxCombo)
                                    maxCombo = score.combo;
                            });

                            player = new Player(user.username, user.rankedscore, user.accuracy, user.totalscore, rank, user.playcount, user.registertime, user.lastlogintime, user.userid, totalHits, maxCombo);

                        }

                        rank++;
                    });

                    resolve(player);
                });
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
                let message = "";

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
                let userCount = results[0]["count(*)"];

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
                let userCount = results[0]["count(*)"];

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
                let scoreCount = results[0]["count(*)"];

                resolve(scoreCount);
            });
        });
    }

    /**
     * Gets all scores of a specific user
     * @param {string} username The username of the user to get all scores from
     * @returns {Score[]} An array of all scores in the users top 50 sorted by score 
     */
    getUserTop50(username) {
        return new Promise((resolve, reject) => {
            let scores = [];
            let maps = [];

            this.connection.query('SELECT * FROM osu_scores WHERE username = ? and pass = True ORDER BY score DESC LIMIT 50', username, (err, usersScores, fields) => {
                if (err) throw err;
                this.connection.query('SELECT * FROM osu_maps WHERE approved = 2;', (err, allRankedMaps, fields) => {
                    if (err) throw err;

                    allRankedMaps.forEach(map => {
                        maps.push(new Map(map));
                    });

                    usersScores.forEach(userScore => {
                        let hashIndex = maps.findIndex(function (map) {
                            return map.md5 == userScore.osuhash;
                        });

                        let scoreExist = scores.findIndex(function (score) {
                            return (score.md5 == userScore.osuhash);
                        });

                        if (scoreExist == -1) {
                            if (hashIndex != -1) {
                                scores.push(new Score(userScore.score, maps[hashIndex].artist, maps[hashIndex].title, maps[hashIndex].diff, maps[hashIndex].setId, maps[hashIndex].md5, userScore.submittime, userScore.grade, getSecondsFixedSinceToday(userScore.submittime)));
                            }
                        }
                    });

                    resolve(scores);
                });
            });
        });
    }

    /**
     * Gets all scores of a specific user
     * @param {string} username The username of the user to get all scores from
     * @returns {Score[]} An array of all scores from the users number ones 
     */
    getUserFirstPlaces(username) {
        return new Promise((resolve, reject) => {
            let scores = [];
            let maps = [];
            let mapsToSkip = [];

            this.connection.query('SELECT * FROM osu_scores WHERE pass = True ORDER BY score DESC', username, (err, allScores, fields) => {
                if (err) throw err;
                this.connection.query('SELECT * FROM osu_maps WHERE approved = 2;', (err, allRankedMaps, fields) => {
                    if (err) throw err;

                    allRankedMaps.forEach(map => {
                        maps.push(new Map(map));
                    });

                    allScores.forEach(currentScore => {
                        let hashIndex = maps.findIndex(function (map) {
                            return map.md5 == currentScore.osuhash;
                        });

                        let mapsToSkipHashIndex = mapsToSkip.findIndex(function (mapsToSkip) {
                            return mapsToSkip.md5 == currentScore.osuhash;
                        });

                        if (mapsToSkipHashIndex != -1) {
                            return;
                        }

                        if (username != currentScore.username && mapsToSkipHashIndex == -1) {
                            mapsToSkip.push(currentScore.osuhash);
                            return;
                        }

                        let scoreExist = scores.findIndex(function (score) {
                            return (score.md5 == currentScore.osuhash);
                        });

                        if (scoreExist == -1) {
                            if (hashIndex != -1) {
                                scores.push(new Score(currentScore.score, maps[hashIndex].artist, maps[hashIndex].title, maps[hashIndex].diff, maps[hashIndex].setId, maps[hashIndex].md5, currentScore.submittime, currentScore.grade, getSecondsFixedSinceToday(currentScore.submittime)));
                            }
                        }
                    });

                    resolve(scores);
                });
            });
        });
    }

    /**
     * Gets the most played beatmaps of a user
     * @param {string} username The username of the user to get all scores from
     * @returns An array of all the users most played 
     */
    getUsersMostPlayed(username) {
        return new Promise((resolve, reject) => {
            let scores = [];
            let maps = [];

            this.connection.query('SELECT * FROM osu_scores WHERE username = ?', username, (err, allScores, fields) => {
                if (err) throw err;
                this.connection.query('SELECT * FROM osu_maps WHERE approved = 2;', (err, allRankedMaps, fields) => {
                    if (err) throw err;

                    allRankedMaps.forEach(map => {
                        maps.push(new Map(map));
                    });

                    allScores.forEach(currentScore => {
                        let hashIndex = maps.findIndex(function (map) {
                            return map.md5 == currentScore.osuhash;
                        });

                        let scoreExist = scores.findIndex(function (score) {
                            return score.score.md5 == currentScore.osuhash;
                        });

                        if (hashIndex != -1) {
                            if (scoreExist == -1) {
                                let tempScore = new Score(currentScore.score, maps[hashIndex].artist, maps[hashIndex].title, maps[hashIndex].diff, maps[hashIndex].setId, maps[hashIndex].md5, currentScore.submittime, currentScore.grade, getSecondsFixedSinceToday(currentScore.submittime));
                                scores.push({ amount: 1, score: tempScore });
                            } else {
                                let tempScore = new Score(currentScore.score, maps[hashIndex].artist, maps[hashIndex].title, maps[hashIndex].diff, maps[hashIndex].setId, maps[hashIndex].md5, currentScore.submittime, currentScore.grade, getSecondsFixedSinceToday(currentScore.submittime));
                                scores[scoreExist] = { amount: (Number(scores[scoreExist].amount) + 1), score: tempScore }
                            }
                        }

                        /*
                        if (scoreExist != -1) {
                            if (hashIndex != -1) {
                                let tempScore = new Score(currentScore.score, maps[hashIndex].artist, maps[hashIndex].title, maps[hashIndex].diff, maps[hashIndex].setId, maps[hashIndex].md5, currentScore.submittime, currentScore.grade, getSecondsFixedSinceToday(currentScore.submittime));
                                scores.push({ amount: 2, score: tempScore });
                            }
                        }
                        */
                    });

                    scores = scores.sort(function (a, b) { return b.amount - a.amount });

                    resolve(scores);
                });
            });
        });
    }
}

exports.Sql = Sql;