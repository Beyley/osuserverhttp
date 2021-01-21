var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
const formidableMiddleware = require('express-formidable');
const md5 = require('crypto-js/md5.js');
const config = require("./config/default.json");
const fs = require('fs');
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

app.use(formidableMiddleware());
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

headerCounts.totalUsers = "?";
headerCounts.onlineUsers = "?";
headerCounts.amountOfRankedPlays = "?";

/**
 * Updates the values on the header 
 * (Total user count, online user count, total ranked player count)
 */
async function updateHeaderValues() {
    headerCounts.totalUsers = await sql.getNumberOfUsers();
    headerCounts.onlineUsers = await sql.getNumberOfOnlinePlayers();
    headerCounts.amountOfRankedPlays = await sql.getNumberOfScores();
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

        let grades = await sql.getUserGradeCounts(username);

        player.gradeXCount = grades.xCount;
        player.gradeSCount = grades.sCount;
        player.gradeACount = grades.aCount;

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

app.get('/s/:setid/:id*?', async (req, res) => {
    updateHeaderValues();

    let mapId = req.params.id;
    let setId = req.params.setid;

    let map = [];
    let set = [];

    let successRate = [];

    let leaderboard = [];

    //Get the map set
    set = await sql.getSetFromId(setId);

    set = set.sort(function (b, a) { return b.starRating - a.starRating });

    if (set.length == 0) {
        res.send('MAP NOT FOUND!');
        return;
    }

    if (!mapId) {
        res.redirect(`/s/${setId}/${set[0].beatmapId}`);
        return;
    }

    map = await sql.getMapFromId(mapId);

    successRate = await sql.getMapSuccessRate(map.md5);

    leaderboard = await sql.getMapLeaderboard(map.md5);

    map.passcount = successRate[0];
    map.playcount = successRate[1];

    res.render('pages/mappage.ejs', {
        headerCounts: headerCounts,
        pageName: `${map.artist} - ${map.title}`,
        map: map,
        set: set,
        leaderboard: leaderboard,
    });
});

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

app.get('/forum/ucp.php', async (req, res) => {
    if (req.query.mode == "avatar") {
        res.redirect('/p/avatar');
    }
});

app.get('/p/avatar', async (req, res) => {
    updateHeaderValues();

    res.render('pages/avatar.ejs', {
        headerCounts: headerCounts,
        pageName: "avatar change",
    });
});

app.get('/p/about', async (req, res) => {
    updateHeaderValues();

    res.render('pages/about.ejs', {
        headerCounts: headerCounts,
        pageName: "About",
    });
});

app.get('/p/history', async (req, res) => {
    updateHeaderValues();

    res.render('pages/history.ejs', {
        headerCounts: headerCounts,
        pageName: "History",
    });
});

app.get('/p/download', async (req, res) => {
    updateHeaderValues();

    res.render('pages/download.ejs', {
        headerCounts: headerCounts,
        pageName: "Download",
    });
});

app.get('/p/beatmaplist', async (req, res) => {
    updateHeaderValues();

    res.render('pages/beatmaplist.ejs', {
        headerCounts: headerCounts,
        pageName: "Beatmap List",
    });
});

app.post('/p/changeavatar', async (req, res) => {
    let avatarFile = req.files.file;

    let username = req.fields.user;
    let password = req.fields.pass.toString().toLowerCase();

    let userId = await sql.getUserId(username, password);

    if (userId != -1) {
        if ((avatarFile.type.toString() == "image/png" || avatarFile.type.toString() == "image/jpg") && avatarFile.size < 5000000) {
            fs.copyFile(avatarFile.path, config.avatarlocation + userId + "_000.png", (err) => {
                if (err) throw err;
            });
        }
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
            leaderboard.append(`<td><span>${await sql.getUserGradeCounts(player.username)}</span></td>`);
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

app.all('/p/onlineusercount', async (req, res) => {
    try {
        let userCount = 0;
        userCount = await sql.getNumberOfOnlinePlayers();

        res.send(userCount.toString());
    } catch (err) {
        console.log(err);
    }
})

app.all('/p/chat', async (req, res) => {
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

app.get('/p/register', (req, res) => {
    updateHeaderValues();

    res.render('pages/register.ejs', {
        headerCounts: headerCounts,
        pageName: "Register",
    });
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

updateHeaderValues();

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
