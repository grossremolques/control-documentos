window.addEventListener("load", async function () {
  await loadPage("./html/loaded.html");
});
const range = "Registro!A1:ZZZ";
const sheetTypeDoc = "Tipo documento!A1:ZZZ";
const sheetProcesos = "Procesos!A1:ZZZ";
const sheetStatus = "Status!A1:ZZZ";
const sheetResponsables = "Responsables!A1:ZZZ";
const sheetAuditorias = "Auditorías!A1:ZZZ";
const sheetUsuarios = "Usuarios!A1:ZZZ";
const interface = document.getElementById("interface");
let prevButton;
let nextButton;
let footPage;
let tableBody;
let dataTable;
const headerNames = ["Código", "Tipo", "Nombre", "Rev", "Estado", "Ubicaión"];
const titlePage = "Control de documentos";

async function loadedWindow() {
  let hasUser = await Usuario.hasUser();
  if(hasUser) {
    dataTable = await Documento.getDocuments();
    dataTable = dataTable.filter(item => item.status != 'Superado')
    await Table.load(headerNames, titlePage);
    Table.loadBodyTable(currentPage, dataTable);
  }
  else {
    loadDeniedPage()
  }
  
}
async function loadPage(srcPage, body = interface) {
  let response;
  try {
    response = await fetch(srcPage);
    response = await response.text();
    body.innerHTML = response;
  } catch (e) {
    console.log(e);
  }
}

function arrayToObject(arr) {
  // Obtenemos los encabezados del array
  var headers = arr[0];
  // Creamos un nuevo array para almacenar los objetos transformados
  var newData = [];
  // Iteramos desde 1 para evitar el primer elemento que son los encabezados
  for (var i = 1; i < arr.length; i++) {
    var obj = {};
    // Iteramos a través de cada elemento del array actual
    for (var j = 0; j < headers.length; j++) {
      // Usamos los encabezados como claves y asignamos los valores correspondientes
      obj[headers[j].toLowerCase()] = arr[i][j];
    }
    newData.push(obj); // Agregamos el objeto al nuevo array
  }
  return newData; // Devolvemos el nuevo array de objetos
}
function objectToArray(obj, arr) {
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (obj.hasOwnProperty(item)) {
      arr[i] = obj[item];
    } else {
      arr[i] = ""; // Cambia el contenido del array por un string vacío si el item no está presente
    }
  }
  return arr;
}

function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
function getColumnByKey(key, array) {
  let newArray = array[0];
  newArray = Object.keys(newArray)
  return newArray.indexOf(key) + 1
}
