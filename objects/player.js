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
     */
    constructor(username, rankedScore, accuracy, totalScore, rank, playCount, registerTime, lastLoginTime) {
        this.username = username;
        this.rankedScore = rankedScore;
        this.accuracy = accuracy;
        this.totalScore = totalScore;
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