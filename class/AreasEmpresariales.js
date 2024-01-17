const SS_AreasEmpresareales = '1ZRS3AzBMFfyzBdlZdslw1E_cVlab-lmg5dD5bn3yrNc' //https://docs.google.com/spreadsheets/d/1ZRS3AzBMFfyzBdlZdslw1E_cVlab-lmg5dD5bn3yrNc/edit#gid=152798628
/* Hojas -- Spreadsheets */
const SheetAreas = "Áreas!A1:ZZZ";
const SheetSectores = "Sectores!A1:ZZZ";
const SheetSubsectores = "Subsectores!A1:ZZZ";

class Area { //Tambien Procesos
  static async getAllData() {
    try {
        let response = await ApiGoogleSheet.getResponse(SheetAreas, SS_AreasEmpresareales);
        if (response.status === 200) {
            let data = response.result.values;
            data = arrayToObject(data);
            return data
        }
    } catch (e) {
      console.log(e);
    }
  }
}
class Sector {
  static async getAllData() {
    try {
        let response = await ApiGoogleSheet.getResponse(SheetSectores, SS_AreasEmpresareales);
        if (response.status === 200) {
            let data = response.result.values;
            data = arrayToObject(data);
            return data
        }
    } catch (e) {
      console.log(e);
    }
  }
  static async getSectoreByArea(area) {
    try {
      let sectores = await this.getAllData();
      sectores = sectores.filter(item => item.area == area);
      return sectores
    } catch (e) {
      console.log(e);
    }
  }
}
class Subsector {
  static async getAllData() {
    try {
        let response = await ApiGoogleSheet.getResponse(SheetSubsectores, SS_AreasEmpresareales);
        if (response.status === 200) {
            let data = response.result.values;
            data = arrayToObject(data);
            return data
        }
    } catch (e) {
      console.log(e);
    }
  }
  static async getSubsectoreBySector(sector) {
    try {
      let subsectores = await this.getAllData();
      subsectores = subsectores.filter(item => item.sector == sector);
      return subsectores
    } catch (e) {
      console.log(e);
    }
  }
}
