const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailService = require("../services/mailer");
const crypto = require("crypto");
const filterObj = require("../utils/filterObj");

const User = require("../models/user");
const otp = require("../Templates/Mail/otp");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const { log } = require("console");

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const filteredBody = filterObj(req.body, "fullname", "email", "password");

  const existing_user = await User.findOne({ email: email });

  if (existing_user && existing_user.verified) {
    return res.status(400).json({
      status: "error",
      message: "Tài khoản đã tồn tại",
    });
  } else if (existing_user) {
    await User.findOneAndUpdate({ email: email }, filteredBody, {
      new: true,
      validateModifiedOnly: true,
    });

    req.userId = existing_user._id;
    next();
  } else {
    const new_user = await User.create(filteredBody);

    req.userId = new_user._id;
    next();
  }
});

exports.sendOTP = catchAsync(async (req, res, next) => {
  const { userId } = req;
  const new_otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  const otp_expiry_time = Date.now() + 10 * 60 * 1000; // 10 Mins after otp is sent

  const user = await User.findByIdAndUpdate(userId, {
    otp_expiry_time: otp_expiry_time,
  });

  user.otp = new_otp.toString();

  await user.save({ new: true, validateModifiedOnly: true });

  console.log(new_otp);

  mailService.sendEmail({
    from: "vuanhpham25@gmail.com",
    to: user.email,
    subject: "Verification OTP",
    html: otp(user.fullname, new_otp),
    attachments: [],
  });

  res.status(200).json({
    status: "success",
    message: "OTP Sent Successfully!",
  });
});

exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email: email,
    otp_expiry_time: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "Email không hợp lệ hoặc OTP đã hết hạn",
    });
  }
  if (user.verified) {
    return res.status(400).json({
      status: "error",
      message: "Email đã được xác minh",
    });
  }

  if (!(await user.correctOTP(otp, user.otp))) {
    return res.status(400).json({
      status: "error",
      message: "OTP không chính xác",
    });
  }

  // OTP is correct
  user.verified = true;
  user.otp = undefined;
  await user.save({ new: true, validateModifiedOnly: true });

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    message: "OTP được xác minh thành công!",
    token,
    user_id: user._id,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      status: "error",
      message: "Email và mật khẩu là bắt buộc",
    });
    return;
  }

  const user = await User.findOne({ email: email }).select("+password");

  console.log(user);
  if (!user || !user.password) {
    res.status(400).json({
      status: "error",
      message: "Mật khẩu không đúng",
    });
    return;
  }
  if (!user || !(await user.correctPassword(password, user.password))) {
    res.status(400).json({
      status: "error",
      message: "Email hoặc mật khẩu không đúng",
    });
    return;
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    message: "Đăng nhập thành công",
    token,
    user_id: user._id,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Bạn chưa đăng nhập",
    });
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  console.log(decoded);

  const this_user = await User.findById(decoded.userId);
  if (!this_user) {
    return res.status(401).json({
      status: "error",
      message: "Người dùng không tồn tại",
    });
  }

  req.user = this_user;
  next();
});
