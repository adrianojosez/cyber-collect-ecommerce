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
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; background-color: #f4f7fb; padding: 20px; color: #1b1f3a;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #0d47a1; padding: 20px 30px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 24px; line-height: 28px;">Cyber-Collect - Novo Contato</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom: 12px;"><strong>Nome:</strong> ${name || 'Não informado'}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px;"><strong>E-mail:</strong> ${email || 'Não informado'}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px;"><strong>Assunto:</strong> ${subject || 'Não informado'}</td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f3f6; border-radius: 8px; padding: 16px; margin-top: 18px;">
                      <tr>
                        <td style="font-size: 15px; line-height: 22px; color: #2b3a5d;">
                          <strong>Mensagem:</strong>
                          <p style="margin: 12px 0 0; white-space: pre-line;">${message || 'Não informado'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #0d47a1; padding: 16px 30px; text-align: center; color: #ffffff; font-size: 13px;">
                    Este é um e-mail automático do portal de TCC.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
