const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const Joi = require('joi');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const referralSchema = Joi.object({
  referrerName: Joi.string().required(),
  referrerEmail: Joi.string().email().required(),
  referrerPhone: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
  refereeName: Joi.string().required(),
  refereeEmail: Joi.string().email().required(),
  refereePhone: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
});

async function sendMail(oAuth2Client, referral) {
    const accessToken = await oAuth2Client.getAccessToken();
  
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'mvjk443@gmail.com',
        clientId: oAuth2Client._clientId,
        clientSecret: oAuth2Client._clientSecret,
        refreshToken: oAuth2Client.credentials.refresh_token,
        accessToken: accessToken.token,
      },
    });
  
    const mailOptions = {
      from: 'mvjk443@gmail.com',
      to: referral.refereeEmail,
      subject: 'Referral Notification',
      text: `You have been referred by ${referral.referrerName}.`,
      html: `<p>You have been referred by ${referral.referrerName}.</p>`,
    };
  
    await transport.sendMail(mailOptions);
}

app.post('/api/referrals', async (req, res) => {
   console.log("route working successfully");
    try {
    const value = await referralSchema.validateAsync(req.body);

    const referral = await prisma.referral.create({
      data: value,
    });
    const oAuth2Client = await authorize();
    await sendMail(oAuth2Client, referral);
    res.json(referral);
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message });
    }
    res.status(500).json({ error: 'An error occurred while creating the referral.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


