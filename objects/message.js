/**
 * All the info for a chat message
 */
class Message {
    /**
     * Creates a new message object
     * @param {String} sender The sender of the message
     * @param {String} content The message contents
     * @param {String} target The target channel of the message
     * @param {Date} time The time the message was sent
     */
    constructor(sender, content, target, time) {
        this.sender = sender;
        this.content = content;
        this.target = target;
        this.time = time;
    }
}

exports.Message = Message;