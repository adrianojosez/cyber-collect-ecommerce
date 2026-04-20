const nodemailer = require('nodemailer')

module.exports = {
  async send(req, res) {
    const { name, email, subject, message } = req.body

    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '0e49a87b8a904e',
        pass: 'a58792c7289f51'
      }
    })

    const mailOptions = {
      from: 'Cyber-Collect <suporte@cybercollect.com>',
      to: 'adrianojosedasilvaajs@gmail.com',
      subject: `Fale Conosco: ${subject}`,
      text: `Nome: ${name || 'Não informado'} | Assunto: ${subject || 'Não informado'} | Mensagem: ${message || 'Não informado'}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <p><strong>Nome:</strong> ${name || 'Não informado'}</p>
          <p><strong>Email:</strong> ${email || 'Não informado'}</p>
          <p><strong>Assunto:</strong> ${subject || 'Não informado'}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${message || 'Não informado'}</p>
        </div>
      `,
      replyTo: email || 'suporte@cybercollect.com'
    }

    try {
      await transporter.sendMail(mailOptions)
      req.session.flash = {
        type: 'success',
        message: 'Mensagem enviada com sucesso!'
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail de contato:', error)
      req.session.flash = {
        type: 'error',
        message: 'Não foi possível enviar a mensagem. Tente novamente mais tarde.'
      }
    }

    return res.redirect('/')
  }
}
