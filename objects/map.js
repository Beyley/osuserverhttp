/**
 * All the info related to a beatmap
 */
class Map {
    /**
     * Creates a map
     * @param {string} md5 The md5 of the map
     * @param {string} artist The artist of the map
     * @param {string} title The title of the map
     * @param {string} diff The difficulty name
     * @param {number} setId The setId
     */
    constructor(md5, artist, title, diff, setId) {
        this.md5 = md5;
        this.title = title;
        this.artist = artist;
        this.diff = diff;
        this.setId = setId;
    }
}

exports.Map = Map;