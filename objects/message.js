class Message {
    constructor(sender, content, target, time) {
        this.sender = sender;
        this.content = content;
        this.target = target;
        this.time = time;
    }
}

exports.Message = Message;