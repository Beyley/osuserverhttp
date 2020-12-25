class Player {
    constructor(username, rankedScore, accuracy, totalScore, rank, playCount) {
        this.username = username;
        this.rankedScore = rankedScore;
        this.accuracy = accuracy;
        this.totalScore = totalScore;
        this.rank = rank;

        this.playCount = playCount;

        this.gradeXCount = 0;
        this.gradeSCount = 0;
        this.gradeACount = 0;
    }
}

exports.Player = Player;