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

/**
 * The port to host the server on
 */
const port = config.port;

/**
 * The MySQL handler used for communicating with the database
 */
var sql = new Sql(config.host, config.name, config.password, config.database);

/**
 * Variable that stores the values to display on the header 
 * (Total user count, online user count, total ranked player count)
 */
var headerCounts = [];

/**
 * Updates the values on the header 
 * (Total user count, online user count, total ranked player count)
 */
async function updateHeaderValues() {
    headerCounts.totalUsers = await sql.getNumberOfUsers();
    headerCounts.onlineUsers = await sql.getNumberOfOnlinePlayers();
    headerCounts.amountOfRankedPlays = await sql.getNumberOfScores();
}

function addTrailZero(num, digits) {
    // addTrailZero() : add trailing zeroes to given number
    // PARAM num : original number
    //       digits : total number of decimal places required

    var cString = num.toString(), // Convert to string
        cLength = cString.indexOf("."); // Position of decimal point

    // Is a whole number
    if (cLength == -1) {
        cLength = 0;
        cString += ".";
    }
    // Is a decimal nummber 
    else {
        cLength = cString.substr(cLength + 1).length;
    }

    // Pad with zeroes
    if (cLength < digits) {
        for (let i = cLength; i < digits; i++) {
            cString += "0";
        }
    }

    // Return result
    return cString;
}

function addLeadZero(num, digits) {
    // addLeadZero() : add leading zeroes to given number
    // PARAM num : original number
    //       digits : total number of digits required

    var cString = num.toString(), // Convert to string
        cLength = cString.indexOf("."); // Position of decimal point

    // Is a whole number
    if (cLength == -1) {
        cLength = cString.length;
    }

    // Pad with zeroes
    if (cLength < digits) {
        for (let i = cLength; i < digits; i++) {
            cString = "0" + cString;
        }
    }

    // Return result
    return cString;
}

app.get('/u/:id', async (req, res) => {
    try {
        updateHeaderValues();

        player = null;

        username = req.params.id;

        let scores = [];
        let firstPlaces = [];
        let mostPlayed = [];

        player = await sql.getUser(username);

        if (!player) {
            res.send("USER NOT FOUND");
            return;
        }

        player.gradeXCount = await sql.getUserXCount(username);
        player.gradeSCount = await sql.getUserSCount(username);
        player.gradeACount = await sql.getUserACount(username);

        scores = await sql.getUserTop50(username);
        firstPlaces = await sql.getUserFirstPlaces(username);
        mostPlayed = await sql.getUsersMostPlayed(username);

        let mostPlayedToDisplay = new StringBuilder();

        let rank = 0;
        for (const played of mostPlayed) {
            let mapInMostPlayed = played.score;
            let playedAmount = played.amount;

            if (playedAmount == 0) continue;

            mostPlayedToDisplay.append(`<div style="font-size:${180 - (rank * 6)}%">`);

            mostPlayedToDisplay.append(`${playedAmount} plays - <a target="_top" href="https://osu.ppy.sh/beatmapsets/${mapInMostPlayed.setId}">${mapInMostPlayed.artist} - ${mapInMostPlayed.title} [${mapInMostPlayed.diff}]</a>`);

            mostPlayedToDisplay.append("</div>");

            rank++;

            if (rank >= 15) break;
        }

        res.render('pages/user.ejs', {
            headerCounts: headerCounts,
            pageName: username,
            player: player,
            scores: scores,
            firstPlaces: firstPlaces,
            mostPlayed: mostPlayedToDisplay.toString(),
        });
    } catch (err) {
        console.log(err);
    }
})

app.get('/', async (req, res) => {
    try {
        updateHeaderValues();
        let posts = await sql.getLatestPosts();

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
    updateHeaderValues();

    try {
        let players = await sql.getTop50();

        let leaderboard = new StringBuilder();

        let rank = 1;
        for (const player of players) {
            if ((rank - 1) % 2 == 0) {
                leaderboard.append(`<tr class="row1p" onclick="setDocumentLocation(/u/${player.username});">`);
            } else {
                leaderboard.append(`<tr class="row2p" onclick="setDocumentLocation(/u/${player.username});">`);
            }

            leaderboard.append(`<td><b>#${rank.toLocaleString('en')}</b></td>`);
            leaderboard.append(`<td><a href="/u/${player.username}">${player.username}</a></td>`);
            leaderboard.append(`<td>${player.accuracy}%</td>`);
            leaderboard.append(`<td><span>${player.playCount.toLocaleString('en')}</span></td>`);
            leaderboard.append(`<td><span>${player.totalScore.toLocaleString('en')}</span></td>`);
            leaderboard.append(`<td><span style="font-weight:bold">${player.rankedScore.toLocaleString('en')}</span></td>`);
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
        let userCount = 0;
        userCount = await sql.getNumberOfOnlinePlayers();

        res.send(userCount.toString());
    } catch (err) {
        console.log(err);
    }
})

app.post('/p/chat', async (req, res) => {
    try {
        let finalString = new StringBuilder();

        finalString.append('<table style="font - size: 8pt" width="100%" cellspacing="1">');

        let messages = [];
        messages = await sql.getChat();
        messages = messages.reverse();

        let messageIndex = 1;
        messages.forEach(message => {
            let timestamp = new StringBuilder();

            timestamp.append(addLeadZero(message.time.getHours(), 2));
            timestamp.append(':');
            timestamp.append(addLeadZero(message.time.getMinutes(), 2));

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
        let username = req.body.username;
        let password = md5(req.body.password).toString();
        let passwordConfirm = md5(req.body.passwordConfirm).toString();
        let email = req.body.email;

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
