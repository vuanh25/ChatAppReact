const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMail = async ({ to, sender, subject, html, attachments, text }) => {
  try {
    const from = "vuanhpham25@gmail.com";
    const msg = {
      to: to,
      from: from,
      subject: subject,
      html: html,
      attachments,
    };

    return transporter.sendMail(msg);
  } catch (error) {
    console.log(error);
  }
};

exports.sendEmail = async (args) => {
  if (process.env.NODE_ENV === "development") {
    return Promise.resolve();
  } else {
    return sendMail(args);
  }
};
