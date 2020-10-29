


let date = () =>{
    let today = new Date();
    return today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
}

let time = ()=>{
    let today = new Date();
    return today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
}

module.exports = {
//    today: today,
    date: date,
    time:time
}