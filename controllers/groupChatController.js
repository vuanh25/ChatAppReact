const Group = require("../models/groupChat");
const catchAsync = require("../utils/catchAsync");
const shortid = require("shortid");
const filterObj = require("../utils/filterObj");

exports.createGroup = catchAsync(async (req, res, next) => {
  const { users, messages } = req.body;
  const shortGroupId = shortid.generate();
  const group = await Group.create({
    groupId: shortGroupId,
    users,
    messages,
  });
  res.status(200).json({
    status: "success",
    data: group,
    message: "Tạo nhóm thành công",
  });
});

exports.findGroupById = catchAsync(async (req, res, next) => {
  const groupId = req.params.id; // Lấy ID phòng từ request params
  const group = await Group.findById(groupId);

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

exports.findGroupByName = catchAsync(async (req, res, next) => {
  const groupName = req.params.name; // Lấy tên phòng từ request params
  const group = await Group.findOne({ name: groupName });

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
