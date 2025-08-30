// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require("nodemailer");
const asyncErrorCatch = require("./asyncErrorCatch");

const sendEmail = asyncErrorCatch(async (options) => {
  // create a trasnporter...
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // define the email options...
  const mailOptions = {
    from: "Owovickky <MainAdmin@natours.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // actually send the email...
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
