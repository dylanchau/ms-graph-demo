require('dotenv').config();
const express = require('express');
const msal = require('./msalConfig');
const sendMail = require('./mailService');
const graph = require('./graph');

const app = express();
app.use(express.json());

app.get('/login', async (req, res) => {
  const scopes = process.env.OAUTH_SCOPES
  const authUrl = await msal.getAuthCodeUrl({
    // scopes: ['https://graph.microsoft.com/.default'],
    scopes: scopes.split(','),
    redirectUri: process.env.REDIRECT_URI,
  });

  console.log(JSON.stringify(authUrl))

  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  // console.log(req.query.code)
  const scopes = process.env.OAUTH_SCOPES
  const tokenRequest = {
    code: req.query.code,
    // scopes: ['https://graph.microsoft.com/.default'],
    scopes: scopes.split(','),
    redirectUri: process.env.REDIRECT_URI,
  };

  try {
    const response = await msal.acquireTokenByCode(tokenRequest);
    // console.log(JSON.stringify(response))
    const accessToken = response.accessToken;

    // const user = await graph.getUserDetails(
    //   msal,
    //   response.account.homeAccountId
    // );
    await graph.sendMail(msal, response.account.homeAccountId)

    // console.log(JSON.stringify(user))

    // res.send(user)

    // Send email after acquiring token
    // await sendMail(access, 'nguyen.van.a.911a@gmail.com', 'Test Subject', 'Test email body');

    res.send('Email sent successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending email.');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});