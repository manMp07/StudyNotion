const nodeMailer = require('nodemailer');

const mailSender = async (email, subject, body) => {
    try {
        const transporter = nodeMailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        const info = await transporter.sendMail({
            from: "StudyNotion | CodeHelp - by MAN",
            to: `${email}`,
            subject: `${subject}`,
            html: `${body}`
        });

        //console.log(info);
        return info;

    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

module.exports = mailSender;