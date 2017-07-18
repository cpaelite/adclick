const postmark = require('postmark');
const _ = require('lodash');
var log4js = require('log4js');
var log = log4js.getLogger('email');

let smtpConfig = {
    host: 'hwsmtp.exmail.qq.com',
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: 'support@newbidder.com',
        pass: 'Newbidder1234'
    }
};

let client = new postmark.Client("ddff2ef7-590d-447c-a3f9-e221c0221bbe");

function sendMail(emails, tpl) {
    // setup email data with unicode symbols
    let emailString = emails.join(",");
    let mailOptions = {
        From: 'support@newbidder.com', // sender address
        To: emailString// list of receivers
    };
    mailOptions = _.merge(mailOptions, tpl);

    client.sendEmailWithTemplate(mailOptions, function(error, info) {
      if (error) {
          log.info(error.message)
      }
      log.info("[Success][TO]", emailString, "[context]:", JSON.stringify(tpl));
    });

}

exports.sendMail = sendMail;
