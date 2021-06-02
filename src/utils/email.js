const nodemailer = require('nodemailer');
// const pug = require('pug');
// const { htmlToText } = require('html-to-text');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `MTS Admin <${process.env.EMAIL_FROM}>`;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
  }

  _newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async _send(template, subject) {
    // TODO: add templates
    // const html = pug.renderFile(`${__dirname}/../templates/${template}.pug`, {
    //   firstName: this.firstName,
    //   url: this.url,
    //   subject,
    // });
    // const mailOptions = {
    //   from: this.from,
    //   to: this.to,
    //   subject,
    //   html,
    //   text: htmlToText(html),
    // };
    // await this._newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this._send('welcome', 'Welcome to the MTS Family!');
  }

  async sendPasswordReset() {
    await this._send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }

  async sendInvitation() {
    await this._send('inviteUser', 'You has been invited to MTS Admin site');
  }
}

module.exports = Email;
