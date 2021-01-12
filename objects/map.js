/**
 * All the info related to a beatmap
 */
class Map {
    /**
     * Creates a new map
     * @param {} row A row of information from Sql
     */
    constructor(row) {
        this.submitDate = row.submit_date;
        this.approvedDate = row.approved_date;
        this.lastUpdate = row.last_update;
        this.artist = row.artist;
        this.beatmapId = row.beatmap_id;
        this.beatmapSetId = row.beatmapset_id;
        this.bpm = row.bpm;
        this.creator = row.creator;
        this.creatorId = row.creator_id;
        this.starRating = row.difficulty_rating_modern_osu;
        this.circleSize = row.diff_size;
        this.overallDifficulty = row.diff_overall;
        this.approachRate = row.diff_approach;
        this.hpDrain = row.diff_drain;
        this.drainTime = row.hit_length;
        this.source = row.source;
        this.genreId = row.genre_id;
        this.languageId = row.language_id;
        this.title = row.title;
        this.songLength = row.total_length;
        this.difficulty = row.version;
        this.md5 = row.file_md5;
        this.mode = row.mode;
        this.tags = row.tags;
        this.favouriteCount = row.favourite_count;
        this.rating = row.rating;
        this.playcount = row.playcount;
        this.passcount = row.passcount;
        this.countNormal = row.count_normal;
        this.countSlider = row.count_slider;
        this.countSpinner = row.count_spinner;
        this.maxCombo = row.max_combo;
        this.hasStoryboard = row.storyboard;
        this.hasVideo = row.video;
        this.downloadUnavailable = row.download_unavailable;
        this.audioUnavailable = row.audio_unavailable;
    }
}

exports.Map = Map;