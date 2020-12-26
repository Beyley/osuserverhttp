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

var headerCounts = [];

async function updateHeaderValues() {
    headerCounts.totalUsers = await sql.getNumberOfUsers();
    headerCounts.onlineUsers = await sql.getNumberOfOnlinePlayers();
    headerCounts.amountOfRankedPlays = await sql.getNumberOfScores();
}

app.get('/u/:id', async (req, res) => {
    try {
        await updateHeaderValues();

        player = null;

        username = req.params.id;

        scores = [];

        player = await sql.getUser(username);

        player.gradeXCount = await sql.getUserXCount(username);
        player.gradeSCount = await sql.getUserSCount(username);
        player.gradeACount = await sql.getUserACount(username);

        scores = await sql.getAllUsersScores(username);

        res.render('pages/user.ejs', {
            headerCounts: headerCounts,
            pageName: username,
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
            headerCounts: headerCounts,
            pageName: "rhythm is just a click away",
            posts: posts
        });
    } catch (err) {
        console.log(err);
    }
})

app.get('/p/playerranking', async (req, res) => {
    await updateHeaderValues();

    try {
        var players = await sql.getAllUsers();

        var leaderboard = new StringBuilder();

        var rank = 1;
        for (const player of players) {
            if ((rank - 1) % 2 == 0) {
                leaderboard.append(`<tr class="row1p" onclick="setDocumentLocation(/u/${player.username});">`);
            } else {
                leaderboard.append(`<tr class="row2p" onclick="setDocumentLocation(/u/${player.username});">`);
            }

            leaderboard.append(`<td><b>#${rank}</b></td>`);
            leaderboard.append(`<td><a href="/u/${player.username}">${player.username}</a></td>`);
            leaderboard.append(`<td>${player.accuracy}%</td>`);
            leaderboard.append(`<td><span>${player.playCount}</span></td>`);
            leaderboard.append(`<td><span>${player.totalScore}</span></td>`);
            leaderboard.append(`<td><span style="font-weight:bold">${player.rankedScore}</span></td>`);
            leaderboard.append(`<td><span>${await sql.getUserXCount(player.username)}</span></td>`);
            leaderboard.append(`<td><span>${await sql.getUserSCount(player.username)}</span></td>`);
            leaderboard.append(`<td><span>${await sql.getUserACount(player.username)}</span></td>`);

            leaderboard.append("</tr>");

            rank++;
        }

        res.render('pages/ranking.ejs', {
            headerCounts: headerCounts,
            pageName: "Player Ranking",
            leaderboard: leaderboard.toString(),
            players: players
        });
    } catch (err) { }
})

app.post('/p/onlineusercount', async (req, res) => {
    try {
        var userCount = 0;
        userCount = await sql.getNumberOfOnlinePlayers();

        res.send(userCount.toString());
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

        var messageIndex = 1;
        messages.forEach(message => {
            var timestamp = new StringBuilder();

            timestamp.append(message.time.getHours().toString());
            timestamp.append(':');
            timestamp.append(message.time.getMinutes().toString());

            if (messageIndex % 2 == 0) {
                finalString.append(`<tr class="row1"><td class="chattime">${timestamp.toString()}</td > <td>&lt;${message.sender}&gt; ${message.content}</td></tr > `);
            } else {
                finalString.append(`<tr class= "row2" ><td class="chattime">${timestamp.toString()}</td><td>&lt;${message.sender}&gt; ${message.content}</td></tr > `);
            }

            messageIndex++;
        })

        finalString.append("</table>");

        // joins the string
        res.send(finalString.toString());
    } catch (err) {
        console.log(err);
    }
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
