const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const {body} = require("express-validator")
// These id's and secrets should come from .env file.
const CLIENT_ID = '228734126079-nvk923am6f08mrp9ickro07vfkqb6i9a.apps.googleusercontent.com';
const CLEINT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/home';
const REFRESH_TOKEN = '1//04apBy8mUTaDzCgYIARAAGAQSNgF-L9Irg8GFymgFNgLTSA8Vx8HFHR8ujHEt85fj-YekahVUGbEGBacBVzh62IO6c_Ffe8eIWA';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendMail = async (req, res) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
    
        const transport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: 'jansoniusjur@gmail.com', // Your email remains as the authenticated user
            clientId: CLIENT_ID,
            clientSecret: CLEINT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken,
          },
        });
    
        const mailOptions = {
          from: req.body.email, // Sender's address provided in the request body
          to: req.body.toEmail || 'jansoniusjur@gmail.com', // Recipient's address, defaults to your email if not provided
          subject: req.body.subject,
          text: req.body.message,
          html: `<h1>${req.body.message}</h1>`,
        };
    
        const result = await transport.sendMail(mailOptions);
        console.log(req.body.email)
        //console.log(result);
        return result;
        
      } catch (error) {
        return error;
      }
}

module.exports = {sendMail}