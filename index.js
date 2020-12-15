var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var ejs = require('ejs');
var vm = require('vm');
var fs = require("fs");
const md5 = require('crypto-js/md5.js');
const config = require("./config/default.json");

const app = express()

// Render static files
app.use(express.static('statichtml/'));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Set the view engine to ejs
app.set('view engine', 'ejs');

const port = 999

var mysql = require('mysql');
const { response } = require('express');
var connection = mysql.createPool({
    host: config.host,
    user: config.name,
    password: config.password,
    database: config.database,
    insecureAuth: true
});

vm.runInThisContext(fs.readFileSync("objects.js"));

app.get('/u/:id', (req, res) => {
    try {
        player = new Player("", 0, 0, 0, 0);

        hashes = [];
        scores = [];
        maps = [];

        connection.query('SELECT * FROM osu_users ORDER BY rankedscore DESC;', req.params.id, (err, results, fields) => {
            rank = 1;

            results.forEach(r => {
                if (req.params.id.toLowerCase() == r.username.toLowerCase()) {
                    player.username = r.username;
                    player.rankedScore = r.rankedscore;
                    player.totalScore = r.totalscore;
                    player.accuracy = r.accuracy;
                    player.rank = rank;

                    player.playcount = r.playcount;
                    //text += r.username + " (#" + rank + ")\nranked score: " + r.rankedscore + " | total score: " + r.totalscore + "\naccuracy: " + r.accuracy + "%\nplaycount: " + r.playcount
                }

                rank++;
            })
        });

        connection.query('SELECT * FROM osu_scores WHERE username = ? and pass = True ORDER BY score DESC', req.params.id, (err, usersScores, fields) => {
            if (err) throw err;
            connection.query('SELECT * FROM osu_maps WHERE ranking = 2;', (err, allRankedMaps, fields) => {
                usersScores.forEach(userScore => {
                    allRankedMaps.forEach(map => {
                        if (userScore.osuhash == map.md5) {
                            if (hashes.indexOf(userScore.osuhash) == -1) {
                                var mapName = map.name.split("|");

                                scores.push(new Score(userScore.score, mapName[0], mapName[1], mapName[2]));
                                maps.push(map.setid);
                                hashes.push(userScore.osuhash);
                            }
                        }

                    });
                });
                // Render index page
                res.render('pages/user.ejs', {
                    // EJS variable and server-side variable
                    maps: maps,
                    scores: scores,
                    player: player
                });
            });
        });
    } catch (err) { }
})

app.get('/ranking', (req, res) => {
    try {
        players = [];

        connection.query('SELECT * FROM users ORDER BY rankedscore DESC', (err, allUsers, fields) => {
            if (err) throw err;
            allUsers.forEach(user => {
                var rank = 1;
                players.push(new Player(user.username, user.rankedscore, user.accuracy, user.totalscore, rank));
                rank++;
            });
            // Render index page
            res.render('pages/ranking.ejs', {
                // EJS variable and server-side variable
                players: players
            });
        });
    } catch (err) { }
})

app.get('/register', (req, res) => {
    res.render('pages/register.ejs', {});
})

app.post('/registerauth', (req, res) => {
    try {
        var username = req.body.username;
        var password = md5(req.body.password).toString();
        var passwordConfirm = md5(req.body.passwordConfirm).toString();
        var email = req.body.email;
        if (username && password && email && password == passwordConfrim) {
            connection.query('INSERT INTO osu_users (email, username, password, playcount, totalscore, rankedscore, accuracy, s300, s100, s50, s0) VALUES (?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0)', [email, username, password], function (err, results, fields) {
                if (err) {
                    if (err.code == 'ER_DUP_ENTRY' || err.errno == 1062) {
                        res.send("error happened, username already in use");
                        res.end();
                    } else {
                        console.log(err);
                        res.send("error happened, unknown one");
                        res.end();
                    }
                } else {
                    res.send("user is created go play")
                    res.end();
                }
            });
        } else {
            res.send('Please enter Username and Password and Email or ur passowrd didnt match with second password!');
            res.end();
        }
    } catch { res.send("error happened"); res.end(); }
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
