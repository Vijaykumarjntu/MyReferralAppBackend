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


app.post('/api/referrals', async (req, res) => {
   console.log("route working successfully");
    try {
    const value = await referralSchema.validateAsync(req.body);

    const referral = await prisma.referral.create({
      data: value,
    });
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


