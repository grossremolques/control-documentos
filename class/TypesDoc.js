class TypeDocument {
    constructor({id, nombre}) {
        this.id = id;
        this.nombre = nombre
    }
    static async getTypesDocuments() {
        let data
        try {
            let response = await ApiGoogleSheet.getResponse(sheetTypeDoc)
            if(response.status === 200) {data = response.result.values}
            let newData = arrayToObject(data)
            return newData
        } catch (e) {

        }
    }
}