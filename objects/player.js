function getRequiredScoreForLevel(level) {
    if (level <= 100) {
        if (level > 1) {
            return Math.floor(5000 / 3 * (4 * Math.pow(level, 3) - 3 * Math.pow(level, 2) - level) + Math.floor(1.25 * Math.pow(1.8, level - 60)));
        }
        return 1;
    }
    return 26931190829 + 100000000000 * (level - 100);
}


function calcLevel(score) {
    var i = 1;
    for (; ;) {
        var lScore = getRequiredScoreForLevel(i);
        if (score < lScore) {
            return i - 1;
        }
        i++;
    }
}

// GetLevelPrecise gets a precise level, meaning that decimal digits are
// included. There isn't any maximum level.
function calcLevelPrecise(score) {
    var baseLevel = calcLevel(score);
    var baseLevelScore = getRequiredScoreForLevel(baseLevel);
    var scoreProgress = score - baseLevelScore;
    var scoreLevelDifference = getRequiredScoreForLevel(baseLevel + 1) - baseLevelScore;
    var res = scoreProgress / scoreLevelDifference + baseLevel;
    if (!isFinite(res)) {
        return 0;
    }

    return res;
}


/**
 * An object containing info about a player
 */
class Player {
    /**
     * Creates a new player object
     * @param {String} username The player's username
     * @param {Number} rankedScore The player's ranked score
     * @param {Number} accuracy The player's accuracy
     * @param {Number} totalScore The player's total score
     * @param {Number} rank The player's rank
     * @param {Number} playCount The player's play count
     * @param {Date} registerTime The player's register time
     * @param {Date} lastLoginTime The player's last login time
     * @param {Numebr} userId The users id
     */
    constructor(username, rankedScore, accuracy, totalScore, rank, playCount, registerTime, lastLoginTime, userId) {
        this.userId = userId;
        this.username = username;
        this.rankedScore = rankedScore;

        /**
        * Rounds a number to x digits
        * @param {Number} num The number to round
        * @param {Number} n The amount of digits to round to
        */
        function roundN(num, n) {
            return parseFloat(Math.round(num * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n);
        }

        this.accuracy = roundN(accuracy, 2);
        this.totalScore = totalScore;

        this.level = calcLevel(this.totalScore);
        this.levelPercentage = (calcLevelPrecise(this.totalScore) - calcLevel(this.totalScore)) * 100;

        this.rank = rank;

        this.playCount = playCount;

        this.registerTime = registerTime;
        this.lastLoginTime = lastLoginTime;

        /**
         * The amount of SS and Silver SS ranks the player has
         */
        this.gradeXCount = 0;
        /**
         * The amount of S and Silver S ranks the player has
         */
        this.gradeSCount = 0;
        /**
         * The amount of A ranks the player has
         */
        this.gradeACount = 0;
    }
}

exports.Player = Player;