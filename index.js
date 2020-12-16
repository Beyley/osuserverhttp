var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
const md5 = require('crypto-js/md5.js');
const config = require("./config/default.json");
var { Sql } = require("./objects/sql.js");

const app = express();

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

const port = 999;

var sql = new Sql(config.host, config.name, config.password, config.database);

app.get('/u/:id', async (req, res) => {
    try {
        player = null;

        username = req.params.id;

        scores = [];

        player = await sql.getUser(username);
        scores = await sql.getAllUsersScores(username);

        res.render('pages/user.ejs', {
            player: player,
            scores: scores
        });
    } catch (err) {
        console.log(err);
    }
})

app.get('/ranking', async (req, res) => {
    try {
        var players = await sql.getAllUsers();

        res.render('pages/ranking.ejs', {
            players: players
        });
    } catch (err) { }
})

app.get('/register', (req, res) => {
    res.render('pages/register.ejs', {});
})

app.post('/registerauth', async (req, res) => {
    try {
        var username = req.body.username;
        var password = md5(req.body.password).toString();
        var passwordConfirm = md5(req.body.passwordConfirm).toString();
        var email = req.body.email;

        if (username && password && email && password == passwordConfirm) {
            res.send(await sql.addUser(email, username, password));
            res.end();
        } else {
            res.send('Please enter Username and Password and Email or ur passowrd didnt match with second password!');
            res.end();
        }
    } catch (err) {
        res.send("error happened"); res.end(); console.log(err);
    }
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
