class Email {
  constructor({ recipient, subject, body }) {
    this.recipient = recipient;
    this.subject = subject;
    this.body = body;
  }
  static async sendEmail(data) {
    try {
      const newEmail = new Email(data);
      const message =
        "To:" +
        newEmail.recipient +
        "\r\n" +
        "Subject:" +
        newEmail.subject +
        "\r\n" +
        "Content-Type: text/html; charset=utf-8\r\n\r\n" +
        newEmail.body;
      const encodedMessage = btoa(message);
      await gapi.client.gmail.users.messages.send({
        userId: "me",
        resource: {
          raw: encodedMessage,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
  static bodySendToapprov(data,typeApprov) {
    let body = `
      <h3>Solicitud de Revisión y Aprobación de Documento - ${typeApprov}</h3>
      <p>Estimado ${data.revisor}. 
      <br>
      Me dirijo a usted para solicitar su colaboración en la revisión y aprobación del siguiente documento como parte de nuestro proceso de control documental:</p>
      <ul>
          <li><strong>Coódigo:</strong> ${data.codigo}</li>
          <li><strong>Nombre:</strong> ${data.nombre}</li>
          <li><strong>Revisión:</strong> ${data.rev}</li>
          <li><strong>Responsable:</strong> ${data.responsable}</li>
          <li><strong>Enlace:</strong> <a href="${data.url}">URL del documento</a></li>
      </ul>
      <p>Agradezco de antemano su tiempo y colaboración en la revisión del documento.</p>`;
    return body;
  }
  static async sendEmailToApprov(data, typeApprov) {
    data.subject = `Solicitud de Revisión y Aprobación de Documento - ${typeApprov}`;
    data.body = this.bodySendToapprov(data, typeApprov);
    await this.sendEmail(data);
  }
  static async sendEmailToRev(data, coment, typeApprov, codigo) {
    data.subject = `Revisión de Documento - ${typeApprov}`;
    data.body = this.bodySendToRev(data, typeApprov, coment, codigo);
    await this.sendEmail(data);
  }
  static bodySendToRev(data,typeApprov, coment, codigo) {
    let body = `
      <h3>Revisión de Documento - ${typeApprov}</h3>
      <p>Estimado ${data.registrado_por}. 
      <br>
      Reciba la respuesta de la revisión del documento:</p>
      <p><strong>Código: </strong>${codigo}</p>
      <p><strong>Status: </strong>${data.status}</p>
      <p>${coment}</p>`;
    return body;
  }
  static async sendEmailToVers(data, codigo, coment) {
    data.subject = `Solicitud de actualización de documentos`;
    data.body = this.bodySendToVers(codigo, coment);
    await this.sendEmail(data);
  }
  static bodySendToVers(codigo, coment) {
    let body = `
      <h3>Solicitud de actualización de documentos</h3>
      Se solicita la actualización del siguiente documento:</p>
      <p><strong>Código: </strong>${codigo}</p>
      <p>${coment}</p>`;
    return body;
  }
  
  
}

