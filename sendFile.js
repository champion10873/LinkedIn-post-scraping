const { SMTP_USERNAME, SMTP_PASSWORD, TARGET_EMAIL } = require("./config.js");
const nodeMailer = require("nodemailer");
const path = require("path");

const sendFile = async (currentDate) => {
  const transporter = nodeMailer.createTransport({
    port: 587,
    secure: false, // Use SSL
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD,
    },
    service: "gmail",
  });

  const mailOptions = {
    from: SMTP_USERNAME,
    to: TARGET_EMAIL,
    subject: currentDate,
    // html: message,
    attachments: [
      {
        filename: `result_${currentDate}.csv`,
        path: path.join(__dirname, `result_${currentDate}.csv`),
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendFile;
