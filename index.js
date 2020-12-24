var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
const md5 = require('crypto-js/md5.js');
const config = require("./config/default.json");
var { Sql } = require("./objects/sql.js");
var { StringBuilder } = require("./objects/stringbuilder");

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

const port = config.port;

var sql = new Sql(config.host, config.name, config.password, config.database);

var totalUsers = 0;
var onlineUsers = 0;
var amountOfRankedPlays = 0;

async function updateHeaderValues() {
    totalUsers = await sql.getNumberOfUsers();
    onlineUsers = await sql.getNumberOfOnlinePlayers();
    amountOfRankedPlays = await sql.getNumberOfScores();
}

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

app.get('/', async (req, res) => {
    try {
        await updateHeaderValues();
        var posts = await sql.getLatestPosts();

        res.render('pages/index.ejs', {
            totalUsers: totalUsers,
            onlineUsers: onlineUsers,
            amountOfRankedPlays: amountOfRankedPlays,
            posts: posts
        });
    } catch (err) {
        console.log(err);
    }
})

app.post('/p/chat', async (req, res) => {
    try {
        var finalString = new StringBuilder();

        finalString.append('<table style="font - size: 8pt" width="100%" cellspacing="1">');

        var messages = [];
        messages = await sql.getChat();
        messages = messages.reverse();

        var isEven = 1;
        messages.forEach(message => {
            if (isEven % 2 == 0) {
                finalString.append(`<tr class="row1"><td class="chattime">${message.time.getHours()}:${message.time.getMinutes()}</td > <td>&lt;${message.sender}&gt; ${message.content}</td></tr > `);
            } else {
                finalString.append(`<tr class= "row2" ><td class="chattime">${message.time.getHours()}:${message.time.getMinutes()}</td><td>&lt;${message.sender}&gt; ${message.content}</td></tr > `);
            }

            isEven++;
        })

        finalString.append("</table>");

        // joins the string
        res.send(finalString.toString());
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
