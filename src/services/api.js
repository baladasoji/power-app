import configData from './config.json'

const baseurl = "https://api.energidataservice.dk/dataset/DayAheadPrices"
const radius_sommer_tariff = configData.radius_sommer_tariff
const radius_vinter_tariff = configData.radius_vinter_tariff

const createFilterUrl = (startDate, endDate = null) => {
  const filter = encodeURIComponent(JSON.stringify({
    PriceArea: ["DK2"]
  }))
  let url = `${baseurl}?offset=0&limit=100&filter=${filter}&columns=TimeDK,DayAheadPriceDKK&start=${startDate}&sort=TimeUTC%20desc`
  if (endDate) {
    url += `&end=${endDate}`
  }
  return url
}

export const getFuturePrices = () => {
  const todayDate = new Date().toISOString().slice(0, 10)
  return fetch(createFilterUrl(todayDate))
    .then(data => data.json())
    .then(data => updateCharges(data))
}

export const getTomorrowsPrices = () => {
  const today = new Date()
  const tomorrow = new Date()
  const dayaftertomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  dayaftertomorrow.setDate(today.getDate() + 2)
  const tomorrowDate = tomorrow.toISOString().slice(0, 10)
  const dayAfterTomorrowDate = dayaftertomorrow.toISOString().slice(0, 10)
  return fetch(createFilterUrl(tomorrowDate, dayAfterTomorrowDate))
    .then(data => data.json())
    .then(data => updateCharges(data))
}

// Original function
export const getTodaysPrices = () => {
  const todayDate = new Date().toISOString().slice(0, 10)
  return fetch(createFilterUrl(todayDate))
    .then(data => data.json())
    .then(data => updateCharges(data))
}

// Test version using local data

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
  data.recs = data.records.reverse();
  data.recs.forEach ( e=> { 
    console.log(e)
    e.elafgift=elafgift 
    e.SpotPriceOre=e.DayAheadPriceDKK/10;
    const dt = new Date(e.TimeDK);
    const hourKey = dt.toISOString().slice(0, 13);
    e.RadiusTarrif = radiustarrif[dt.getHours()]
    e.dow =weekdays[dt.getDay()]
    e.hod = dt.getHours()
    e.mins = dt.getMinutes().toString().padStart(2, '0')
    e.label = `${e.dow} ${e.hod}:${e.mins}`
    e.TotalPrice = e.elafgift + e.SpotPriceOre + e.RadiusTarrif
  })
  return data;
}

