const jsforce = require('jsforce');
require('dotenv').config();

const SF_USERNAME = process.env.SF_USERNAME;
const SF_PASSWORD = process.env.SF_PASSWORD;
const SF_LOGIN_URL = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';

const conn = new jsforce.Connection({
  loginUrl: SF_LOGIN_URL
});

module.exports = {
  conn,
  SF_USERNAME,
  SF_PASSWORD
};
