const mongoose = require("mongoose");

const groupChatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tên nhóm không được để trống"],
  },
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      sender: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      type: {
        type: String,
        enum: ["Text", "Media", "Document", "Link"],
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
    },
  ],
});

const groupChat = new mongoose.model("groupChat", groupChatSchema);
module.exports = groupChat;