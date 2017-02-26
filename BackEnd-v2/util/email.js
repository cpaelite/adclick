const nodemailer = require('nodemailer');
const _ =require('lodash');
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

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport(smtpConfig);


 function sendMail(emails,tpl) {
        // setup email data with unicode symbols
        let emailString= emails.join(",");
        let mailOptions = {
            from: 'support@newbidder.com', // sender address
            to: emailString// list of receivers
        };
        mailOptions=_.merge(mailOptions,tpl);
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
               log.error(error.message)
            }
            log.info("[Success][TO]",emailString,"[context]:",JSON.stringify(tpl));
        });
   
}

exports.sendMail = sendMail;