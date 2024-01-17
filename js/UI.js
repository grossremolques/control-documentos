const DataForm = {};
let typeApprov;
async function loadDeniedPage() {
  await loadPage("./html/deniedPage.html");
}

function hadleNextPage() {
  Table.nextPage();
}
function hadlePrevPage() {
  Table.prevPage();
}
function hadleSimpleFilter(event) {
  Table.simpleFilter(event);
}
function hadleAdvanceFilter(event) {
  Table.filter(event);
}
async function handleOpenCard(event) {
  let codigo = event.target.id;
  let documento = dataTable.find((item) => item.codigo == codigo);
  await Documento.loadCard(documento);
  let items = document.getElementById("formCardDocument");
  let disabledItems = items.querySelectorAll("input, select, textarea");
  disabledItems.forEach((elm) => elm.setAttribute("disabled", ""));
}
function hadleEditCard() {
  let items = document.getElementById("formCardDocument");
  let disabledItems = items.querySelectorAll("input, select, textarea");
  disabledItems.forEach((elm) => elm.removeAttribute("disabled", ""));
}
/* Alta de documento */
async function handleAddDocument() {
  await loadPage("./html/alta.html");
  await loadTypesOfDocuments();
  await loadResponsables();
  await loadProcesos();
  await loadSupervisores();
}
async function handleSaveDocument(event) {
  let form = document.getElementById("altaDocument");
  if (isValidForm(event, form)) {
    let inputs = form.querySelectorAll(".save-alta-document");
    inputs.forEach((item) => {
      DataForm[item.id] = item.value;
    });
    inputs.forEach((item) => item.setAttribute("disabled", ""));
    modalShowLoad();
    let codigo = await Documento.saveDocument(DataForm);
    modalHide("myModalMessageloaded");
    modalShow(
      "¡✔️ Registro existoso!",
      "Se ha cargado la información. Nro. de documento " + codigo
    );
  }
}
function isValidForm(event, form) {
  if (form.checkValidity()) {
    event.preventDefault();
  }
  form.classList.add("was-validated");
  return form.checkValidity();
}
/* Enviar a aprobación */
async function handleOpensendApprov() {
  await loadPage("./html/sendApprov.html");
  await loadTypesOfDocuments();
  await loadResponsables();
  await loadProcesos();
  await loadSectores();
  await loadSubsectores();
  await loadSupervisores();
  let form = document.getElementById("formSendApprov");
  let inputs = form.querySelectorAll(".send-approv-document");
  inputs.forEach((item) => item.setAttribute("disabled", ""));
}
async function handleLoadDocument(event) {
  let form = document.getElementById("formSendApprov");
  let inputs = form.querySelectorAll(".send-approv-document");
  let buttonSendApprov = document.getElementById("buttonSendApprov");
  let ApprovInfo = document.getElementById("ApprovInfo");
  let statusInfo = document.getElementById("statusInfo");
  /* Buscar el documento */
  let codigo = event.target.value;
  let documento = await Documento.getDocument(codigo);
  /* Evaluar si el status aplica */
  let status = documento.status;
  if (
    status == "Pendiente" ||
    status == "En revisión" ||
    status == "Rechazado formato" ||
    status == "Contenido Aprobado"
  ) {
    typeApprov =
      status == "Pendiente" || status == "En revisión"
        ? "Contenido"
        : "Formato";
    if (documento.revisado_por) {
      ApprovInfo.innerText = `${documento.revisado_por} aprobará el ${typeApprov}`;
    }
    statusInfo.innerText = documento.status;
    loadDataDocument(documento, inputs);
  } else {
    inputs.forEach((item) => item.setAttribute("disabled", ""));
    buttonSendApprov.setAttribute("disabled", "");
    modalShow(
      "El documento no esta en el flujo de trabajo",
      "El documento se encuentra en: " + documento.status + "."
    );
  }
}
function loadDataDocument(documento, inputs) {
  loadInputsById(documento, true);
  inputs.forEach((item) => item.removeAttribute("disabled", ""));
  buttonSendApprov.removeAttribute("disabled");
}
async function handleSendToApprov(event) {
  DataForm.codigo = document.getElementById("input_codigo").value;
  let form = document.getElementById("formSendApprov");
  let buttonSendApprov = document.getElementById("buttonSendApprov");
  if (isValidForm(event, form)) {
    let inputs = form.querySelectorAll(".send-approv-document");
    inputs.forEach((item) => {
      DataForm[item.id] = item.value;
    });

    let encargadoCalidad = await Usuario.getEncargadoCalidad();
    encargadoCalidad = encargadoCalidad.email;
    DataForm.status =
      typeApprov == "Contenido"
        ? "Enviado Aprob. contenido"
        : "Enviado a Aprob. formato";
    modalShowLoad();

    inputs.forEach((item) => item.setAttribute("disabled", ""));
    buttonSendApprov.setAttribute("disabled", "");
    await Documento.update(DataForm.codigo, DataForm);
    DataForm.revisor =
      typeApprov == "Contenido"
        ? await Usuario.getEmailByAlias(DataForm.revisado_por)
        : encargadoCalidad;
    DataForm.recipient = DataForm.revisor;
    await Email.sendEmailToApprov(DataForm, typeApprov);
    modalHide("myModalMessageloaded");
    modalShow(
      "¡✉️ Enviado para su aprobación!",
      "Se ha cargado la información y se ha notificado a " +
        DataForm.revisado_por
    );
  }
}
function handleSetWhoApprov(event) {
  let ApprovInfo = document.getElementById("ApprovInfo");
  let revisado_por = event.target.value;
  ApprovInfo.innerText = `${revisado_por} aprobará el contenido`;
}
/* Revisión */
async function handleOpenRevision() {
  await loadPage("./html/revision.html");
  let form = document.getElementById("formRevision");
  let inputs = form.querySelectorAll(".save-revision");
  inputs.forEach((item) => item.setAttribute("disabled", ""));
}
async function handleCanApprov(event) {
  let codigo = event.target.value;
  let form = document.getElementById("formRevision");
  let inputs = form.querySelectorAll(".save-revision");
  let documento = await Documento.getDocument(codigo);
  let statusInfo = document.getElementById("statusInfo");
  let typeRev = document.getElementById('typeRev');
  let buttonSendRev = document.getElementById('buttonSendRev')
  statusInfo.innerText = documento.status;
  let status = documento.status

  if (status === "Enviado Aprob. contenido") {
    let alias = await Usuario.getAliasByEmail();
    typeRev.innerText = 'Contenido'
    if (documento.revisado_por === alias) {
      inputs.forEach((item) => item.removeAttribute("disabled", ""));
    } else {
      modalShow(
        "No puede aprobar/rechazar el documento",
        "Usted no es el responsable de la revisión"
      );
      inputs.forEach((item) => item.setAttribute("disabled", "")); 
    }
    buttonSendRev.removeAttribute("disabled", "");
    typeApprov = 'Contenido'
  }  
  else if (status === "Enviado a Aprob. formato" || status === 'Contenido Aprobado') {
    let alias = await Usuario.getAliasByEmail();
    let encargadoCalidad = await Usuario.getEncargadoCalidad();
    encargadoCalidad = encargadoCalidad.alias; 
    if (encargadoCalidad === alias) {
      typeRev.innerText = 'Formato'
      inputs.forEach((item) => item.removeAttribute("disabled", ""));
    } else {
      modalShow(
        "No puede aprobar/rechazar el documento",
        "Usted no es el responsable de la revisión del formato"
      );
      inputs.forEach((item) => item.setAttribute("disabled", ""));
      console.log("Usted no puede revisar ete documento");
    }
    buttonSendRev.removeAttribute("disabled", "");
    typeApprov = 'Formato'
  } 
  else {
    buttonSendRev.setAttribute("disabled", "");
    modalShow(
      "El documento no esta en el flujo de trabajo",
      "El documento se encuentra en: " + status + "."
    );
  }
}
async function handleSendRev(event) {
  modalShowLoad();
  let codigo = document.getElementById("input_codigo").value;
  let documento = await Documento.getDocument(codigo)
  let form = document.getElementById("formRevision");
  let inputs = form.querySelectorAll(".save-revision");
  let isApprov = document.getElementById('aprobar').checked;
  if (isValidForm(event, form)) {
    if(isApprov && typeApprov === 'Contenido') {
      DataForm.status = 'Contenido Aprobado'
    }
    else if(isApprov && typeApprov === 'Formato') {
      DataForm.status = 'Aprobado'
      DataForm.fecha_alta = FormatsDate.latinFormat()
    }
    else if(!isApprov && typeApprov === 'Contenido') {
      DataForm.status = 'Rechazado contenido'
    }
    else if (!isApprov && typeApprov === 'Formato') {
      DataForm.status = 'Rechazado formato'
    }
    await Documento.update(codigo, DataForm);
    let coment = document.getElementById('coment').value;
    let recipient = documento.registrado_por;
    DataForm.recipient = await Usuario.getEmailByAlias(recipient)
    DataForm.registrado_por = recipient
    await Email.sendEmailToRev(DataForm, coment, typeApprov, codigo);
    inputs.forEach((item) => item.setAttribute("disabled", ""));
    buttonSendRev.setAttribute("disabled", "");
    modalHide("myModalMessageloaded");
    modalShow(
      "¡✉️ Revisión enviada!",
      "Se ha cargado la información y se ha notificado a " +
        DataForm.registrado_por
    );
}}
/* Versiones */
async function handleOpenVersion() {
  try {
    await loadPage("./html/loaded.html")
    let supervisores = await Usuario.getSupervisores();
    let userEmail = await ApiGoogleSheet.getEmail();
    let isSupervisor = supervisores.some(item => item.email === userEmail)
    if(isSupervisor) {
      await loadPage("./html/actualizacion.html");
      await loadTypesOfDocuments()
      await loadResponsables()
      await loadUsuarios()
    }
    else {
      await loadPage("./html/deniedPermission.html");
    }
  } catch (e) {
    console.log(e)
  }
}
async function handleCanVers(event) {
  try {
    let recipient = document.getElementById('recipient')
    let buttonSendVers = document.getElementById('buttonSendVers')
    let codigo = event.target.value;
    let documento = await Documento.getDocument(codigo);
    let status = documento.status;
    if(status === 'Aprobado') {
      loadInputsById(documento, true);
      buttonSendVers.removeAttribute("disabled");
      recipient.removeAttribute("disabled")
    }
    else {
      let form = document.getElementById("formReqVers");
      let inputs = form.querySelectorAll(".save-vers");
      inputs.forEach((item) => item.setAttribute("disabled", ""));
      buttonSendVers.setAttribute("disabled","");
      modalShow("El documento no esta en el flujo de trabajo",
      "El documento se encuentra en: " + documento.status + ".")
    }
  } catch (e) {
    console.log(e)
  }
}
async function handleSendToVers(event) {
  let form = document.getElementById("formReqVers");
  if (isValidForm(event, form)) {
    modalShowLoad();
    let codigo = document.getElementById("input_codigo").value;
    DataForm.recipient = document.getElementById('recipient').value;
    DataForm.status = 'En revisión'
    let coment = document.getElementById("coment").value;
    await Documento.update(codigo, DataForm);
    await Email.sendEmailToVers(DataForm, codigo, coment);
    modalHide("myModalMessageloaded");
    modalShow(
      "¡✉️ Solicitud de actualización enviada!",
      "Se ha cargado la información y se ha notificado a " +
        DataForm.recipient
    );
    form.reset()
  }
}
/* Modal */
function modalShow(titulo, body) {
  var myModalShow = new bootstrap.Modal(
    document.getElementById("myModalMessage")
  );
  var titleModal = document.querySelector(`#myModalMessage .modal-title`);
  titleModal.innerText = titulo;
  var bodyModal = document.querySelector(`#myModalMessage .modal-body`);
  bodyModal.innerText = body;
  myModalShow.show();
}
function modalShowLoad() {
  var myModalShow = new bootstrap.Modal(
    document.getElementById("myModalMessageloaded")
  );
  myModalShow.show();
}
function modalHide(input = "myModalMessage") {
  var modalElement = document.getElementById(input);
  var modal = bootstrap.Modal.getInstance(modalElement); // Obtener la instancia del modal
  if (modal) {
    modal.hide(); // Ocultar el modal si existe una instancia
  }
}
//myModalMessageloaded

/* Loaded inputs and select */
async function loadTypesOfDocuments(inputId = "tipo") {
  try {
    let typesOfDocuments = await TypeDocument.getTypesDocuments();
    let input = document.getElementById(inputId);
    input.innerHTML =
      '<option selected value="">Seleccione una opción</option>';
    typesOfDocuments.map((item) => {
      let option = document.createElement("option");
      let textNode = document.createTextNode(item.nombre);
      option.appendChild(textNode);
      option.value = item.nombre;
      input.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function loadStatus(inputId = "status") {
  try {
    let response = await ApiGoogleSheet.getResponse(sheetStatus);
    response = response.result.values;
    let status = arrayToObject(response);

    let input = document.getElementById(inputId);
    input.innerHTML =
      '<option selected value="">Seleccione una opción</option>';
    status.map((item) => {
      let option = document.createElement("option");
      let textNode = document.createTextNode(item.nombre);
      option.appendChild(textNode);
      option.value = item.nombre;
      input.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function loadProcesos(inputId = "proceso") {
  try {
    let procesos = await Area.getAllData();
    let input = document.getElementById(inputId);
    input.innerHTML =
      '<option selected value="">Seleccione una opción</option>';
    procesos.map((item) => {
      let option = document.createElement("option");
      let textNode = document.createTextNode(item.nombre);
      option.appendChild(textNode);
      option.value = item.nombre;
      input.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function loadSectores(inputId = "sector") {
  try {
    let sectores = await Sector.getAllData();
    let input = document.getElementById(inputId);
    input.innerHTML =
      '<option selected value="">Seleccione una opción</option>';
    sectores.map((item) => {
      let option = document.createElement("option");
      let textNode = document.createTextNode(item.nombre_sector);
      option.appendChild(textNode);
      option.value = item.nombre_sector;
      input.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function loadSubsectores(inputId = "subsector") {
  try {
    let subsectores = await Subsector.getAllData();
    let input = document.getElementById(inputId);
    input.innerHTML =
      '<option selected value="">Seleccione una opción</option>';
    subsectores.map((item) => {
      let option = document.createElement("option");
      let textNode = document.createTextNode(item.nombre_subsector);
      option.appendChild(textNode);
      option.value = item.nombre_subsector;
      input.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function handleLoadSubsBySector(inputId = "subsector", event) {
  let sector = event.target.value;
  try {
    let subsectores = await Subsector.getSubsectoreBySector(sector);
    let input = document.getElementById(inputId);
    input.innerHTML =
      '<option selected value="">Seleccione una opción</option>';
    subsectores.map((item) => {
      let option = document.createElement("option");
      let textNode = document.createTextNode(item.nombre_subsector);
      option.appendChild(textNode);
      option.value = item.nombre_subsector;
      input.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function handleLoadSectorByArea(inputId = "sector", event) {
  let area = event.target.value;
  try {
    let subsectores = await Sector.getSectoreByArea(area);
    let input = document.getElementById(inputId);
    input.innerHTML =
      '<option selected value="">Seleccione una opción</option>';
    subsectores.map((item) => {
      let option = document.createElement("option");
      let textNode = document.createTextNode(item.nombre_sector);
      option.appendChild(textNode);
      option.value = item.nombre_sector;
      input.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
//handleLoadSectorByArea('sector', event)
async function loadResponsables(inputId = "responsable") {
  try {
    let response = await ApiGoogleSheet.getResponse(sheetResponsables);
    response = response.result.values;
    let responsables = arrayToObject(response);

    let input = document.getElementById(inputId);
    input.innerHTML =
      '<option selected value="">Seleccione una opción</option>';
    responsables.map((item) => {
      let option = document.createElement("option");
      let textNode = document.createTextNode(item.nombre_de_cargo);
      option.appendChild(textNode);
      option.value = item.nombre_de_cargo;
      input.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function loadAuditorias(inputId = "auditoria") {
  try {
    let response = await ApiGoogleSheet.getResponse(sheetAuditorias);
    response = response.result.values;
    let auditorias = arrayToObject(response);

    let input = document.getElementById(inputId);
    input.innerHTML =
      '<option selected value="">Seleccione una opción</option>';
    auditorias.map((item) => {
      let option = document.createElement("option");
      let textNode = document.createTextNode(item.frecuencia);
      option.appendChild(textNode);
      option.value = item.frecuencia;
      input.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function loadSupervisores(inputId = "revisado_por") {
  try {
    let supervisores = await Usuario.getSupervisores();
    let input = document.getElementById(inputId);
    input.innerHTML =
      '<option selected value="">Seleccione una opción</option>';
    supervisores.map((item) => {
      let option = document.createElement("option");
      let textNode = document.createTextNode(`${item.nombre} ${item.apellido}`);
      option.appendChild(textNode);
      option.value = item.alias;
      input.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
function loadInputsById(data, isDisabled) {
  for (item in data) {
    const input = document.getElementById(item);
    let testData = !!input;
    if (testData && data[item] != "") {
      input.value = data[item];
      if (isDisabled) {
        input.setAttribute("disabled", "");
      } else {
        input.removeAttribute("disabled", "");
      }
    }
  }
}
async function loadUsuarios(inputId = "recipient") {
  try {
    let supervisores = await Usuario.getUsuarios();
    let input = document.getElementById(inputId);
    input.innerHTML =
      '<option selected value="">Seleccione una opción</option>';
    supervisores.map((item) => {
      let option = document.createElement("option");
      let textNode = document.createTextNode(`${item.nombre} ${item.apellido}`);
      option.appendChild(textNode);
      option.value = item.email;
      input.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
