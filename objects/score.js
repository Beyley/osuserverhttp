
class Score {
    constructor(score, artist, title, diff, setId, md5, submitTime, grade, fancySubmitTime) {
        this.score = score;
        this.title = title;
        this.artist = artist;
        this.diff = diff;
        this.setId = setId;
        this.md5 = md5;
        this.submitTime = submitTime;
        this.grade = grade;
        this.fancySubmitTime = fancySubmitTime;
    }
}

exports.Score = Score;