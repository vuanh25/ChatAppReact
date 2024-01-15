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
  const group = await GroupChat.findOne({ groupId });
  if (!group) {
    return res.status(404).json({
      status: "fail",
      message: "Không tìm thấy phòng",
    });
  }
  
  // Update
  if (group.public) {
    const _id = group._id;
    const userId = req.user.id;
    const updatedGroup = await GroupChat.findByIdAndUpdate(
      { _id },
      { $addToSet: { members: userId } }, 
      { new: true }
    );
    res.status(200).json({
      status: "success",
      data: updatedGroup,
    });
  } else {
    res.status(200).json({
      status: "success",
      data: group,
    });
  }
});