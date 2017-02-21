const nodemailer = require('nodemailer');


let smtpConfig = {
    host: 'smtp.exmail.qq.com',
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: 'support@newbidder.com',
        pass: 'Newbidder123'
    }
};

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport(smtpConfig);

// setup email data with unicode symbols
let mailOptions = {
    from: 'support@newbidder.com', // sender address
    to: 'keepin.aedan@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ?', // plain text body
    html: '<b>Hello world ?</b>' // html body
};

// send mail with defined transport object



async function sendMail() {
   return  await new Promise(function (resolve, reject) {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                 reject(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
            resolve(info);
        });
    })
}

export default sendMail;