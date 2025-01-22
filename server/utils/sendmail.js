const env = require("dotenv");
env.config({ path: "./.env" });
const nodemailer = require("nodemailer");
const errorHandler = require("./errorHandler");
const ejs = require("ejs");
const path = require("path");

let sendmail = async (res, next, email, subject, template, data) => {

    const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        auth: {
            user: process.env.MAIL_EMAIL_ADDRESS,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    const templatePath = path.join(__dirname, "../mails", template);
    const html = await ejs.renderFile(templatePath, data);

    const mailOption = {
        from: `"ID Card Pro" <${process.env.MAIL_EMAIL_ADDRESS}>`, // Updated from field
        to: email,
        subject,
        html
    };

    transport.sendMail(mailOption, (err, info) => {
        if (err) return next(new errorHandler(err, 500));

        console.log("Email sent successfully:", info.response);

        // Optionally, you can send a response here if needed
        // res.status(200).json({
        //     success: true,
        //     message: "Successfully sent mail, please check your inbox."
        // });
    });
};

module.exports = sendmail;
