
/**
 * A post object
 */
class Post {
    /**
     * Creates a new Post 
     * @param {String} title 
     * @param {String} creator 
     * @param {String} content 
     * @param {Date} posttime 
     */
    constructor(title, creator, content, posttime) {
        this.title = title;
        this.creator = creator;
        this.content = content;
        this.posttime = posttime;
    }
}

exports.Post = Post;