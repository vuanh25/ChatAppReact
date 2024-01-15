const GroupChat = require("../models/groupChat");
const catchAsync = require("../utils/catchAsync");
const filterObj = require("../utils/filterObj");

exports.getGroupInfo = catchAsync(async (req, res, next) => {
  const { groupId } = req.params; 
  const groupInfo = await GroupChat.findOne({ groupId });

  if (!groupInfo) {
    return res.status(404).json({
      status: "failed",
      message: "Không tìm thấy nhóm.",
    });
  }
  res.status(200).json({
    status: "success",
    data: groupInfo,
  });
});
  

exports.findById = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  console.log(req.params);
  console.log({ groupId });
  const group = await GroupChat.findOne({ groupId });
  console.log(group);
  if (!group) {
    return res.status(404).json({
      status: "fail",
      message: "Không tìm thấy phòng",
    });
  }

  res.status(200).json({
    status: "success",
    data: group,
  });
});