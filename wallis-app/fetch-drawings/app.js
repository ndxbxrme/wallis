let response;
const dynamodb = require('aws-sdk/clients/dynamodb');
const dbClient = new dynamodb.DocumentClient();
exports.lambdaHandler = async (event, context) => {
  try {
    //const currentUser = require('jwt-decode')(event.headers.Authorization.replace(/^Bearer /, ''));
    //event.body = JSON.parse(event.body or {});
    let more = true;
    let nextKey = '';
    let allItems = [];
    while(more) {
      const params = {
        TableName: process.env.CURRENT_TABLE
      };
      if(nextKey!=='') params.ExclusiveStartKey = nextKey;
      const rawItems = await dbClient.scan(params).promise();
      allItems = allItems.concat(rawItems.Items);
      if(rawItems.hasOwnProperty('LastEvaluatedKey')) nextKey = rawItems.LastEvaluatedKey;
      else more = false;
    }
    response = {
      'statusCode': 200,
      'headers': {
        "Access-Control-Allow-Headers" : "Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      },
      'body': JSON.stringify(allItems)
    }
  } catch (err) {
    console.log(err);
    return err;
  }

  return response
};
