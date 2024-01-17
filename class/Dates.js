class FormatsDate {
    static AmericanFormat(date) {
        let newDate;
        if(date!=''){
            if(date.indexOf(' ')>=0) {
               let index = date.indexOf(' '); 
               date = date.substr(0,index)
            }
            date = date.split('/');
            newDate = `${date[2]}-${date[1]}-${date[0]}`
        }
        else { newDate=''}
        return newDate  
    }
    static latinFormat(date, withHours) {
        if (date) {
          date = date.includes('/') ? date.split('/') : date.split('-')
          date = new Date(date[0], date[1] - 1, date[2])
        }
        else {
          date = new Date()
        }
        let time = ''
        let month = date.getMonth() + 1; //obteniendo mes
        let day = date.getDate(); //obteniendo dia
        let year = date.getFullYear(); //obteniendo año
        if (day < 10)
          day = '0' + day; //agrega cero si el menor de 10
        if (month < 10)
          month = '0' + month //agrega cero si el menor de 10
        let newDate = `${day}/${month}/${year}`
        if (withHours) {
          let hours = date.getHours() //obteniendo hora
          let minutes = date.getMinutes(); //obteniendo minutes
          let seconds = date.getSeconds();
          time = ` ${hours}:${minutes}:${seconds}`
        }
        return newDate + time
      }
}