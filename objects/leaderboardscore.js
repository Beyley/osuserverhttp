var { StringBuilder } = require("./stringbuilder.js");
var { Mods, getFullModsString, getShortModsString } = require("./modhelper.js");

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

class LeaderboardScore {
    constructor(row) {
        this.scoreId = row.scoreid;
        this.replay = row.replay; //UNUSED?
        this.osuHash = row.osuhash;
        this.username = row.username;
        this.replayHash = row.submithash;
        this.hit300 = row.hit300;
        this.hit100 = row.hit100;
        this.hit50 = row.hit50;
        this.hitGeki = row.hitgeki;
        this.hitKatu = row.hitkatu;
        this.hitMiss = row.hitmiss;
        this.score = row.score;
        this.combo = row.combo;
        this.perfect = Boolean(Number(row.perfect));
        this.grade = row.grade;
        this.mods = row.mods;

        this.fancyMods = getFullModsString(this.mods);

        this.pass = Boolean(Number(row.pass));
        this.mode = row.mode;
        this.submitTime = row.submittime;

        this.accuracy = ((((300 * Number(this.hit300)) + (100 * Number(this.hit100)) + (50 * Number(this.hit50)))
            /
            (300 * (Number(this.hitMiss) + Number(this.hit50) + Number(this.hit100) + Number(this.hit300)))) * 100).toFixed(2);

        this.fancySubmitTime = getSecondsFixedSinceToday(this.submitTime);
    }
}

exports.LeaderboardScore = LeaderboardScore;