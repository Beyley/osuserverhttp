class Score {
    constructor(score, artist, title, diff, setId, md5) {
        this.score = score;
        this.title = title;
        this.artist = artist;
        this.diff = diff;
        this.setId = setId;
        this.md5 = md5;
    }
}

exports.Score = Score;