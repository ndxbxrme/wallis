const AWS = require('aws-sdk');
const s3 = new AWS.S3();
let response = null;
exports.lambdaHandler = async (event, context) => {
  try {
    const {key,data,contentType} = JSON.parse(event.body);
    const buffer = Buffer.from(data.split(/,/)[1], 'base64');
    const s3Params = {
      Bucket: 'wallis-app-dev',
      Key: key,
      Body: buffer,
      ContentType: contentType
    }
    await s3.putObject(s3Params).promise();
    response = {
      'statusCode': 200,
      'headers': {
        "Access-Control-Allow-Headers" : "Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      },
      'body': JSON.stringify('done')
    }
  } catch (err) {
    console.log(err);
    return err;
  }

  return response
};