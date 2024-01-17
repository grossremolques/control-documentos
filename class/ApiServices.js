class ApiGoogleSheet {
  constructor({}) {}
  static async getResponse(range, sheetId = spreadsheetId) {
    let response;
    try {
      response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }
  static async postData(range, data) {
    try {
      let response = await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: range,
        includeValuesInResponse: true,
        insertDataOption: "INSERT_ROWS",
        responseDateTimeRenderOption: "FORMATTED_STRING",
        responseValueRenderOption: "FORMATTED_VALUE",
        valueInputOption: "USER_ENTERED",
        resource: {
          majorDimension: "ROWS",
          range: "",
          values: [data],
        },
      });
      return response;
    } catch (e) {}
  }
  static async getHeaders(range) {
    let response = await this.getResponse(range);
    response = response.result.values;
    let headers = response[0];
    headers = headers.map(item => item.toLocaleLowerCase())
    return headers
  }
  static async updateData(data) {
    try {
      let response = await gapi.client.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          data: data,
          includeValuesInResponse: false,
          responseDateTimeRenderOption: "FORMATTED_STRING",
          responseValueRenderOption: "FORMATTED_VALUE",
          valueInputOption: "USER_ENTERED"
        }
      })
      return response
    } catch (e) {
      console.log(e)
    }
  }
  static createdDataToUpdate(arr, sheet) {
    /* arr = [{row, colum, value}] */
    let data = new Array()
    for (let item of arr) {
      data.push({
        majorDimension: "ROWS",
        range: `${sheet}!R${item.row}C${item.column}`,
        values: [
          [item.value]
        ]
      })
    }
    return data
  }
  static async getEmail() {
    try {
      let response = await gapi.client.gmail.users.getProfile({
        "userId": "me"
      })
      return response.result.emailAddress
    } catch (e) {
      console.log(e)
    }
  }
}
