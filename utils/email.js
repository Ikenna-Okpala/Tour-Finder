const nodemailer = require("nodemailer")
const pug = require("pug")

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email
        this.firstName = user.name.split(" ")[0]
        this.url = this.url
        this.from = `Jesse Okpala <${process.env.EMAIL_FROM}>`
    }

    createTransport() {

        if (process.env.NODE_ENV === "production") {

            return 1
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
            // Activate in gmail "less secure app" option
        })
    }

    send(template, subject) {
        // render htlm based on pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`)
        // email options
        const mailOptions = {
            from: "Jesse Okpala <ikennajesse77@gmail.com>",
            to: options.email,
            subject: options.subject,
            text: options.message
        }
        //create transport then send email
    }

    sendWelcome() {
        this.send("welcome", "Welcome to the Natours Family!")
    }
}


const sendEmail = async options => {

    const mailOptions = {
        from: "Jesse Okpala <ikennajesse77@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    // 3) Actually send the email with nodemailer

    await transporter.sendMail(mailOptions)
}