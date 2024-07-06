const fs = require('fs');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

async function authorize() {
  let credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  let token;
  try {
    token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  } catch (error) {
    token = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
  }
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

module.exports = authorize;
