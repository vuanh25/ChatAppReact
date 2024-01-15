const router = require("express").Router();

const authRoute = require("./auth");
const userRoute = require("./user");
const chatRoute = require("./chat");


router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/chat", chatRoute);


module.exports = router;
