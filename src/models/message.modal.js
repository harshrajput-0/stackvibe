import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now(),
    },
}, {
    id: false,
})


const Message =
  mongoose.models.Message ||
  mongoose.model("Message", messageSchema);

export default Message;