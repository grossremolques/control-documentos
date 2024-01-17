let newDocumento;
class Documento {
  constructor({
    codigo,
    tipo,
    nombre,
    rev,
    fecha_alta,
    fecha_baja,
    url,
    responsable,
    partes_interesadas,
    proceso,
    auditoria,
    status,
    registrado_por,
    revisado_por,
  }) {
    /* if (!codigo) {
        throw new Error('El campo "codigo" es obligatorio.');
      } */
    (this.codigo = codigo),
      (this.tipo = tipo),
      (this.nombre = nombre),
      (this.rev = rev),
      (this.fecha_alta = fecha_alta),
      (this.fecha_baja = fecha_baja),
      (this.url = url),
      (this.responsable = responsable),
      (this.partes_interesadas = partes_interesadas),
      (this.proceso = proceso),
      (this.auditoria = auditoria),
      (this.status = status),
      (this.registrado_por = registrado_por),
      (this.revisado_por = revisado_por);
  }
  static async getDocuments() {
    let data;
    try {
      let response = await ApiGoogleSheet.getResponse(range);
      if (response.status === 200) {
        data = response.result.values;
        data = arrayToObject(data);
      }
      return data;
    } catch (e) {
      console.log(e);
    }
  }
  static async loadCard(documento) {
    const offcanvasCardBody = document.getElementById("offcanvasCardBody");
    await loadPage("./html/cardDocument.html", offcanvasCardBody);

    const loadedSeccion = document.getElementById("loaded");
    await loadPage("./html/loaded.html", loadedSeccion);
    await loadTypesOfDocuments();
    await loadProcesos();
    await loadSectores();
    await loadSubsectores();
    await loadStatus();
    await loadAuditorias();
    await loadResponsables();
    documento.fecha_alta = FormatsDate.AmericanFormat(documento.fecha_alta);
    if (documento.status !== "Aprobado" || documento.status !== "En revisión") {
      documento.url = "No disponible";
    }
    loadInputsById(documento);
    const formCardDocument = document.getElementById("formCardDocument");
    formCardDocument.classList.remove("hidden");
    loadedSeccion.classList.add("hidden");
  }
  static async saveDocument(data) {
    data.status = "Pendiente";
    data.registrado_por = await Usuario.getAliasByEmail();
    data.codigo = await this.createCodigo(data);
    newDocumento = new Documento(data);
    let headers = await ApiGoogleSheet.getHeaders(range);
    newDocumento = objectToArray(data, headers);
    await ApiGoogleSheet.postData(range, newDocumento);
    return newDocumento.codigo;
  }
  static async createCodigo(data) {
    let alias;
    let iniciales;
    try {
      //Obtiene el Alias del tipo de docuemento
      let response = await TypeDocument.getTypesDocuments();
      let typeDocument = response.find((item) => item.nombre == data.tipo);
      alias = typeDocument.nomenclatura;
    } catch (e) {
      console.log(e);
    }
    try {
      //Obtiene las iniciales del proceso
      let response = await ApiGoogleSheet.getResponse(sheetProcesos);
      let procesos = arrayToObject(response.result.values);
      procesos = procesos.find((item) => item.nombre == data.proceso);
      iniciales = procesos.iniciales;
    } catch (e) {
      console.log(e);
    }
    try {
      let registro = await ApiGoogleSheet.getResponse(range);
      registro = arrayToObject(registro.result.values);
      let listCodigos = registro.map((item) => item.codigo);

      let onlyTypeCodigos = listCodigos.filter((item) => {
        if (item) {
          return item.startsWith(alias);
        }
      });

      let ids = onlyTypeCodigos.map((item) => Number(item.substring(7, 11)));
      let maxId = Math.max(...ids);
      let id = maxId + 1;

      if (id < 10) {
        id = `000${id}`;
      } else if (id < 100) {
        id = `00${id}`;
      } else if (id < 1000) {
        id = `0${id}`;
      } else {
        id = `${id}`;
      }

      let codigo = `${alias}-${iniciales}-${id}`;
      return codigo;
    } catch (e) {
      console.log(e);
    }
  }
  static async getDocument(codigo) {
    try {
      let registerDocumentos = await this.getDocuments();
      let isDocument = registerDocumentos.some((item) => item.codigo === codigo);
      if (!isDocument) {
        modalShow('404 Not Found',`Documento con el código ${codigo} no encontrado.`);
        document.querySelector('form').reset()
        throw new Error(`Documento con el código ${codigo} no encontrado.`);
      }
      let documento = registerDocumentos.find((item) => item.codigo === codigo);
      return documento;
    } catch (e) {
      console.log(e);
    }
  }
  static async update(codigo, values) {
    let dataToUpdate = [];
    try {
      let dataBase = await this.getDocuments();
      let isCodigo = dataBase.some((item) => item.codigo === codigo);
      if (isCodigo) {
        let row = dataBase.findIndex((item) => item.codigo === codigo) + 2;
        for (let item in values) {
          dataToUpdate.push({
            row: row,
            column: getColumnByKey(item, dataBase),
            value: values[item],
          });
        }
        dataToUpdate = dataToUpdate.filter(item => item.column!=0);
        let data = ApiGoogleSheet.createdDataToUpdate(dataToUpdate, "Registro");
        let response = await ApiGoogleSheet.updateData(data);
        return response.status;
      } else {
        throw new Error("Codigo no encontrado");
      }
    } catch (e) {
      console.log(e);
    }
  }
  
}
