const router = require("express").Router();

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Thư mục lưu trữ tệp
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tên tệp sau khi lưu trữ
  },
});

const upload = multer({ storage: storage });

router.post(
  "/generate-zego-token",
  authController.protect,
  userController.generateZegoToken
);

router.get("/get-me", authController.protect, userController.getMe);
router.patch("/update-me", authController.protect, userController.updateMe);

router.post(
  "/update-avatar",
  authController.protect,
  userController.uploadAvatar,
  userController.updateAvatar
);

router.get("/get-users", authController.protect, userController.getUsers);

module.exports = router;
