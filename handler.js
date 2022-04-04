const AWS = require('aws-sdk');
const SES = new AWS.SES();

const response = ({ code, message }) => {
  return {
    statusCode: code,
    body: JSON.stringify({
      message,
    }),
  };
};

const EMAIL_CUSTOMER_SERVICE = 'servicioalcliente@nuestrodiario.com.gt';
const SOURCE_EMAIL = 'noreply@nuestrodiario.com';

exports.sendEmail = async (event) => {
  const { to, subject, message } = event.body;

  if (!to || !subject || !message)
    return response({
      code: 400,
      message: 'To, Subject and Message params are all required in the body.',
    });

  const serviceEmailParams = {
    Destination: {
      ToAddresses: [EMAIL_CUSTOMER_SERVICE],
    },
    Message: {
      Body: {
        Text: { Data: message },
      },
      Subject: { Data: subject },
    },
    Source: SOURCE_EMAIL,
    ReplyToAddresses: [to],
  };

  const customerEmailParams = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Data: `<div style='display: flex; justify-content: center; background: green;'><h1 style='color: purple;'>${message}</h1></div>`,
        },
        Text: { Data: message },
      },
      Subject: { Data: subject },
    },
    Source: SOURCE_EMAIL,
  };

  try {
    await SES.sendEmail(serviceEmailParams).promise();
    await SES.sendEmail(customerEmailParams).promise();
    return response({
      code: 200,
      message: 'Email successfuly sended',
    });
  } catch (error) {
    console.log('Error sending email ', error);
    return response({
      code: 400,
      message: 'The email failed to send',
    });
  }
};
