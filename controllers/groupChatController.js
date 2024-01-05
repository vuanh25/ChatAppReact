const Group = require("../models/groupChat");
const catchAsync = require("../utils/catchAsync");
const filterObj = require("../utils/filterObj");

exports.createGroup = catchAsync(async (req, res, next) => {
  const { users, messages } = req.body;
  const group = await Group.create({
    users,
    messages,
  });
  res.status(200).json({
    status: "success",
    data: group,
    message: "Tạo nhóm thành công",
  });
});
