
require('dotenv').config()
const AWS = require('aws-sdk')


const { REGION, KEY_ID, SECRET_KEY } = process.env;
AWS.config.update({
    region: REGION,
    accessKeyId: KEY_ID,
    secretAccessKey: SECRET_KEY
})

const dynamoClient = new AWS.DynamoDB.DocumentClient();




module.exports = dynamoClient;


