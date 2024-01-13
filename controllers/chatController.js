const User = require("../models/user");
const GroupChat = require("../models/groupChat");
const catchAsync = require("../utils/catchAsync");
const filterObj = require("../utils/filterObj");
const multer = require("multer");

exports.getGroupInfo = catchAsync(async (req, res, next) => {
    const { groupId } = req.params; // Giả sử groupId là một tham số trong URL

  // Tìm nhóm dựa vào groupId
  const groupInfo = await GroupChat.findOne({ groupId })
    .populate("host", "username email") // Populate thông tin người tạo nhóm
    .populate("members", "username email") // Populate thông tin thành viên nhóm
    .populate("request", "username email") // Populate thông tin yêu cầu tham gia nhóm
    .exec();

  if (!groupInfo) {
    return res.status(404).json({
      status: "fail",
      message: "Không tìm thấy nhóm.",
    });
  }
  const filteredGroupInfo = filterObj(groupInfo, ["name", "groupId", "public", "host", "members", "messages"]);

  res.status(200).json({
    status: "success",
    data: filteredGroupInfo,
  });
});
  