import nodemailer from "nodemailer";

// Initialize the Authentication of Gmail Options
const sendEmail = async (email, subject, text) => {
  try {
    const transportar = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email, // Your Gmail ID
        pass: process.env.pass, // Your Gmail Password
      },
    });

    var mailOptions = {
      from: process.env.email, // Sender ID
      to: email, // Reciever ID
      subject: subject, // Mail Subject
      text: text, // Reset Key
    };
    // Send an Email
    transportar.sendMail(mailOptions, (error, info) => {
      if (error) console.log(error);
      console.log(info);
    });
  } catch (error) {}
};
export default sendEmail;
