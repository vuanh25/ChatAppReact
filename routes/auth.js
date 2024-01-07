const router = require("express").Router();

const authController = require("../controllers/authController");

router.post("/login", authController.login);

router.post("/register", authController.register, authController.sendOTP);

router.post("/verify", authController.verifyOTP);

router.post("/send-otp", authController.sendOTP);

router.get("/logout", authController.logout);

module.exports = router;
