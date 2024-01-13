const router = require("express").Router();

const chatController = require("../controllers/chatController");
const authController = require("../controllers/authController");

router.get("/get-group-info", authController.protect, chatController.getGroupInfo);

module.exports = router;