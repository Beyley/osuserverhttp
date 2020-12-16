class Player {
    constructor(username, rankedScore, accuracy, totalScore, rank, playCount) {
        this.username = username;
        this.rankedScore = rankedScore;
        this.accuracy = accuracy;
        this.totalScore = totalScore;
        this.rank = rank;

        this.playCount = playCount;
    }
}

exports.Player = Player;