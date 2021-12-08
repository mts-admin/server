const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const config = require('../../config');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `Private Management App <${config.emailFrom}>`;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
  }

  _newTransport() {
    if (config.nodeEnv !== 'development') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: config.sendGrid.userName,
          pass: config.sendGrid.password,
        },
      });
    }

    return nodemailer.createTransport({
      host: config.mailtrap.host,
      port: config.mailtrap.port,
      auth: {
        user: config.mailtrap.userName,
        pass: config.mailtrap.password,
      },
    });
  }

  async _send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../templates/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    await this._newTransport().sendMail(mailOptions);
  }

  async sendPasswordReset() {
    await this._send(
      'password-reset',
      'Your password reset link (valid for only 10 minutes)'
    );
  }

  async sendInvitation() {
    await this._send(
      'invite-user',
      'You has been invited to Private Management App'
    );
  }
}

module.exports = Email;
