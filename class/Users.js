class Usuario {
    static async getUsuarios() {
        try {
          let response = await ApiGoogleSheet.getResponse(sheetUsuarios);
          response = response.result.values;
          let usuarios = arrayToObject(response);
          return usuarios;
        } catch (e) {
          console.log(e);
        }
      }

    static async getSupervisores() {
        try {
          let supervisores = await this.getUsuarios()
          supervisores = supervisores.filter((item) => item.revisor == "Sí");
          return supervisores;
        } catch (e) {
          console.log(e);
        }
    }
    static async hasUser() {
        try {
            let email = await ApiGoogleSheet.getEmail();
            let usuarios = await this.getUsuarios();
            let hasUser = usuarios.some(item => item.email == email);
            return hasUser
        } catch(e) {
            console.log(e)
        }
    }
    static async getAliasByEmail() {
        try {
            let email = await ApiGoogleSheet.getEmail();
            let usuarios = await this.getUsuarios();
            let usuario = usuarios.find(item => item.email === email);
            let alias = usuario.alias
            return alias
        } catch(e) {
            console.log(e)
        }
    }
    static async getEmailByAlias(alias) {
        try {
            let usuarios = await this.getUsuarios();
            let usuario = usuarios.find(item => item.alias === alias);
            let email = usuario.email
            return email
        } catch(e) {
            console.log(e)
        }
    }
    static async getEncargadoCalidad() {
        try {
            let usuarios = await this.getUsuarios();
            let encargado = usuarios.find(item => item.cargo === 'Analista de calidad y sistemas');
            return encargado
        } catch(e) {
            console.log(e)
        }
    }
}