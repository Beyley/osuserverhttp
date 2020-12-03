var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var ejs = require('ejs');
const md5 = require('crypto-js/md5.js');
const config = require("./config/default.json");

const app = express()
// Render static files
app.use(express.static('public'));
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
var connection = mysql.createConnection({
    host: config.host,
    user: config.name,
    password: config.password,
    database: config.database,
    insecureAuth: true
});

app.get('/u/:id', (req, res) => {
    try {
        hashes = [];
        scores = [];
        maps = [];
        text = "";

        connection.query('SELECT * FROM osu_users ORDER BY rankedscore DESC;', req.params.id, (err, results, fields) => {
            rank = 1
            results.forEach(r => {
                if (req.params.id.toLowerCase() == r.username.toLowerCase()) {
                    text += r.username + " (#" + rank + ")\nranked score: " + r.rankedscore + " | total score: " + r.totalscore + "\naccuracy: " + r.accuracy + "%\nplaycount: " + r.playcount
                }
                rank++
            })
        });

        connection.query('SELECT * FROM osu_scores WHERE username = ? and pass = True ORDER BY score DESC', req.params.id, (err, results, fields) => {
            if (err) throw err;
            connection.query('SELECT * FROM osu_maps WHERE ranking = 2;', (err, results2, fields) => {
                results.forEach(r2 => {
                    results2.forEach(r => {
                        if (r2.osuhash == r.md5) {
                            if (hashes.indexOf(r2.osuhash) == -1) {
                                scores.push("score: " + r2.score + " | | " + r.name.split("|").join(" ") + "\n");
                                maps.push(r.setid);
                                hashes.push(r2.osuhash);
                            }
                        }

                    });
                });
                // Render index page
                res.render('pages/user.ejs', {
                    // EJS variable and server-side variable
                    maps: maps,
                    scores: scores
                });
            });
        });
    } catch (err) { }
})

app.get('/ranking', (req, res) => {
    try {
        hashes = [];
        scores = [];
        maps = [];
        text = "";

        connection.query('SELECT * FROM osu_users ORDER BY rankedscore DESC;', req.params.id, (err, results, fields) => {
            rank = 1
            results.forEach(r => {
                if (req.params.id.toLowerCase() == r.username.toLowerCase()) {
                    text += r.username + " (#" + rank + ")\nranked score: " + r.rankedscore + " | total score: " + r.totalscore + "\naccuracy: " + r.accuracy + "%\nplaycount: " + r.playcount
                }
                rank++
            })
        });

        connection.query('SELECT * FROM osu_scores WHERE username = ? and pass = True ORDER BY score DESC', req.params.id, (err, results, fields) => {
            if (err) throw err;
            connection.query('SELECT * FROM osu_maps WHERE ranking = 2;', (err, results2, fields) => {
                results.forEach(r2 => {
                    results2.forEach(r => {
                        if (r2.osuhash == r.md5) {
                            if (hashes.indexOf(r2.osuhash) == -1) {
                                scores.push("score: " + r2.score + " | | " + r.name.split("|").join(" ") + "\n");
                                maps.push(r.setid);
                                hashes.push(r2.osuhash);
                            }
                        }

                    });
                });
                // Render index page
                res.render('pages/user.ejs', {
                    // EJS variable and server-side variable
                    maps: maps,
                    scores: scores
                });
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
        var email = req.body.email;
        if (username && password && email) {
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
            res.send('Please enter Username and Password and Email!');
            res.end();
        }
    } catch { res.send("error happened"); res.end(); }
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})