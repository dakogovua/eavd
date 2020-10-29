var nodemailer = require('nodemailer');

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'youremail@gmail.com',
//       pass: 'yourpassword'
//     }
//   });

const transporter = nodemailer.createTransport({
    host: 'smtp-RELAY2.EADR.COM.UA',
    port: 10035,
    secure: false,
    auth: {
       user: '',
       pass: ''
    }
 });
  

  
  

  const getMail = (mailOptions) => {
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
  };

  module.exports = getMail;