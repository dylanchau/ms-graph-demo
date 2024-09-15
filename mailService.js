const nodemailer = require('nodemailer');

const sendMail = async (accessToken, to, subject, text) => {
  const testToken = Buffer.from("user=ailearning123@hotmail.com\x01auth=Bearer " + accessToken + "\x01\x01").toString('base64')
  // console.log(`testToken: ${testToken}`)
  const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    // service: "hotmail",
    auth: {
      type: 'OAuth2',
      user: process.env.SENDER_EMAIL,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      // refreshToken: accessToken,
      accessToken: accessToken
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: to,
    subject: subject,
    text: text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;