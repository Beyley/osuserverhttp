class Player {
    constructor(username, rankedScore, accuracy, totalScore, rank) {
        this.username = username;
        this.rankedScore = rankedScore;
        this.accuracy = accuracy;
        this.totalScore = totalScore;
        this.rank = rank;

        this.playCount = 0;
    }
};

class Score {
    constructor(score, artist, title, diff) {
        this.score = score;
        this.title = title;
        this.artist = artist;
        this.diff = diff;
    }
}