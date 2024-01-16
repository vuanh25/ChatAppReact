const router = require("express").Router();

const chatController = require("../controllers/chatController");
const authController = require("../controllers/authController");
router.get("/get-group-info/:groupId", authController.protect, chatController.getGroupInfo);
router.get("/find-group/:groupId", authController.protect, chatController.findById);
router.get("/get-group-users/:groupId", authController.protect, chatController.getGroupUsers);

module.exports = router;