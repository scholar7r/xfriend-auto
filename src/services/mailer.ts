import { createTransport } from 'nodemailer'

const transporter = createTransport({
    host: '',
    port: 0,
    secure: false,
    auth: {
        user: '',
        pass: '',
    },
})

const sendMail = async () => {
    const mail = transporter.sendMail({
        from: '',
        to: '',
        subject: '',
        text: '',
        html: '',
    })
}
