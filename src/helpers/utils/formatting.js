
export function getFormattedDate(date) {
    var year = date.getFullYear();
  
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
  
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    
    return (date.getHours() % 12 == 0 ? 12 : date.getHours() % 12 ) + ":" + date.getMinutes()  + (date.getHours() / 12 == 0 ? "am" : "pm") +  " " + month + '/' + day + '/' + year;
  
  }
  