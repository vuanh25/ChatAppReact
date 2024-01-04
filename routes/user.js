const router = require("express").Router();

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const multer = require("multer");

const upload = multer();
router.post(
  "/generate-zego-token",
  authController.protect,
  userController.generateZegoToken
);

router.get("/get-me", authController.protect, userController.getMe);
router.patch(
  "/update-me",
  authController.protect,
  upload.none(),
  userController.updateMe
);

router.get("/get-users", authController.protect, userController.getUsers);

module.exports = router;
