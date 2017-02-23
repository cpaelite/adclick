const nodemailer = require('nodemailer');
const _ =require('lodash');

let smtpConfig = {
    host: 'smtp.exmail.qq.com',
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: 'support@newbidder.com',
        pass: 'Newbidder1234'
    }
};

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport(smtpConfig);


async function sendMail(emails,tpl) {
    return await new Promise(function (resolve, reject) {
        // setup email data with unicode symbols
        let mailOptions = {
            from: 'support@newbidder.com', // sender address
            to: emails.join(",") // list of receivers
        };
        mailOptions=_.merge(mailOptions,tpl);
        transporter.sendMail(mailOptions, (error, info) => {
            
            if (error) {
                console.log(error)
                reject(error);
            }
            resolve(info);
        });
    })
}

exports.sendMail = sendMail;