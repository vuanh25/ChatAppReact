const mongoose = require("mongoose");

const groupChatSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.ObjectId,
    ref: "groupchats"
  },
  name: {
    type: String,
    required: [true, "Tên nhóm không được để trống"],
  },
  groupId: {
    type: String,
  },
  host: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  public: {
    type: Boolean,
    default: true,
  },
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  request: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      _id: {
        type: mongoose.Schema.ObjectId,
        ref: "messages"
      },
      sender: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      type: {
        type: String,
        enum: ["string", "media", "document", "link"],
      },
      created_at: {
        type: Date,
        default: Date.now(),
      },
      text: {
        type: String,
      },
      file: {
        type: String,
      },
      fullname: {
        type: String,
      },
      avatar: {
        type: String,
      },
      pubDate: {
        type: String, 
      },
    },
  ],
});

const groupChat = new mongoose.model("groupChat", groupChatSchema);
module.exports = groupChat;
