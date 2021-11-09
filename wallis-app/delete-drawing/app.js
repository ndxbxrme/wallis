let response;
const dynamodb = require('aws-sdk/clients/dynamodb');
const dbClient = new dynamodb.DocumentClient();
exports.lambdaHandler = async (event, context) => {
  try {
    const currentUser = require('jwt-decode')(event.headers.Authorization.replace(/^Bearer /, ''));
    event.body = JSON.parse(event.body || {});
    const {id} = event.body;
    const params = {
      TableName: process.env.CURRENT_TABLE,
      Key: {id}
    };
    await dbClient.delete(params).promise();
    response = {
      'statusCode': 200,
      'headers': {
        "Access-Control-Allow-Headers" : "Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      },
      'body': 'OK'
    }
  } catch (err) {
    console.log(err);
    return err;
  }

  return response
};
