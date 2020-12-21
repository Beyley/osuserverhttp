class Map {
    constructor(md5, artist, title, diff, setId) {
        this.md5 = md5;
        this.title = title;
        this.artist = artist;
        this.diff = diff;
        this.setId = setId;
    }
}

exports.Map = Map;