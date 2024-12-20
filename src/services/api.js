
import configData from './config.json'

const baseurl= configData.BASE_URL
const radius_sommer_tariff = configData.radius_sommer_tariff
const radius_vinter_tariff = configData.radius_vinter_tariff

export const getFuturePrices = () => {
  var todayDate = new Date().toISOString().slice(0, 10);
  return fetch (baseurl+"?filter={%22PriceArea%22:[%22DK2%22]}&columns=HourDK,SpotPriceDKK&start="+todayDate)
        .then (data=>data.json())
        .then (data=>updateCharges(data))
}

export const getTomorrowsPrices = () => {
  const today = new Date();
  const tomorrow  = new Date();
  const dayaftertomorrow = new Date();
  tomorrow.setDate(today.getDate()+1);
  dayaftertomorrow.setDate(today.getDate()+2);
  //var todayDate = today.toISOString().slice(0, 10);
  var tomorrowDate = tomorrow.toISOString().slice(0, 10);
  var dayAfterTomorrowDate = dayaftertomorrow.toISOString().slice(0, 10);
  return fetch (baseurl+"?filter={%22PriceArea%22:[%22DK2%22]}&columns=HourDK,SpotPriceDKK&start="+tomorrowDate+"&end="+dayAfterTomorrowDate)
        .then (data=>data.json())
        .then (data=>updateCharges(data))
}
export const getTodaysPrices = () => {
  const today = new Date();
  const tomorrow  = new Date();
  const dayaftertomorrow = new Date();
  tomorrow.setDate(today.getDate()+1);
  dayaftertomorrow.setDate(today.getDate()+2);
  var todayDate = today.toISOString().slice(0, 10);
  var tomorrowDate = tomorrow.toISOString().slice(0, 10);
  return fetch ("https://api.energidataservice.dk/dataset/Elspotprices?filter={%22PriceArea%22:[%22DK2%22]}&columns=HourDK,SpotPriceDKK&start="+todayDate+"&end="+tomorrowDate)
        .then (data=>data.json())
        .then (data=>updateCharges(data))
}


const get_radius_tariff = (dt) => {
  
  if (dt.getMonth()>=3 && dt.getMonth()<=9) {
    return radius_sommer_tariff
  } else {
    return radius_vinter_tariff
  }
}

const get_tariff_array = (dt) => {
  const tariff = get_radius_tariff(dt)
  const tariff_array = []
  for (let i=0; i<24; i++) {
    if (i>=0 && i<6) {
      tariff_array.push(tariff.lavlast)
    } else if (i>=6 && i<17) {
      tariff_array.push(tariff.hojlast)
    } else if (i>=17 && i<21)  {
      tariff_array.push(tariff.spidslast)
    } else{
      tariff_array.push(tariff.hojlast)
    }
  }
  return tariff_array
}
const radiustarrif =  get_tariff_array(new Date() ) 
const weekdays = ['Sun','Mon','Tue', 'Wed','Thu', 'Fri', 'Sat']

// A method to get electricity tariff
// The tariff is 80 after 1 July 2023 and 1 before that date
const getElAfgift= ()=>{
  return 90; // WEF 1 January 2025
  // const today = new Date();
  // if(today.getFullYear() > 2023 || (today.getFullYear() === 2023 && today.getMonth() >= 6)){
  //   return 80;
  // }else{
  //   return 1;
  // }
}


const updateCharges =(data) => {
  const elafgift = getElAfgift();
  data.records = data.records.reverse();
  data.records.forEach ( e=> { 
    e.elafgift=elafgift 
    e.SpotPriceOre=e.SpotPriceDKK/10;
    const dt = new Date(e.HourDK)
    e.RadiusTarrif = radiustarrif[dt.getHours()]
    e.dow =weekdays[dt.getDay()]
    e.hod = dt.getHours()
    e.label = e.dow+ ' '+e.hod+':00'
    e.TotalPrice = e.elafgift + e.SpotPriceOre + e.RadiusTarrif
  })
  return data;
}
