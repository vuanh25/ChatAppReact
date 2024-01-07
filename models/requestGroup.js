const mongoose = require("mongoose");

const requestGroupSchema = new mongoose.Schema({
  groupId: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
  },
});

const requestGroup = new mongoose.model("requestGroup", requestGroupSchema);
module.exports = requestGroup;
