import configData from './config.json'
import todayData from '../../today.json'
import tomorrowData from '../../tomorrow.json'

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

// export const getTomorrowsPrices = () => {
//   const today = new Date()
//   const tomorrow = new Date()
//   const dayaftertomorrow = new Date()
//   tomorrow.setDate(today.getDate() + 1)
//   dayaftertomorrow.setDate(today.getDate() + 2)
//   const tomorrowDate = tomorrow.toISOString().slice(0, 10)
//   const dayAfterTomorrowDate = dayaftertomorrow.toISOString().slice(0, 10)
//   return fetch(createFilterUrl(tomorrowDate, dayAfterTomorrowDate))
//     .then(data => data.json())
//     .then(data => updateCharges(data))
// }

// Original function
// export const getTodaysPrices = () => {
//   const todayDate = new Date().toISOString().slice(0, 10)
//   return fetch(createFilterUrl(todayDate))
//     .then(data => data.json())
//     .then(data => updateCharges(data))
// }

// Test version using local data
export const getTodaysPrices = () => {
  console.log(todayData)
  return Promise.resolve(updateCharges(todayData))
}

export const getTomorrowsPrices = () => {
  return Promise.resolve(updateCharges(tomorrowData))
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


const updateCharges = (data) => {
  const elafgift = getElAfgift();
  const eurToDkkRate = 7.45;
  data.records = data.records.reverse();
  
  // Group by hour and calculate hourly averages
  const hourlyAverages = {};
  data.records.forEach(record => {
    const dt = new Date(record.TimeDK);
    console.log(record)
    // Create key in format "YYYY-MM-DD-HH" to group by hour
    const hourKey = dt.toISOString().slice(0, 13);
    
    if (!hourlyAverages[hourKey]) {
      hourlyAverages[hourKey] = {
        sum: 0,
        count: 0,
        hour: dt.getHours(),
        day: dt.getDay(),
        timestamp: new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), 0, 0)
      };
    }
    
    hourlyAverages[hourKey].sum += record.SpotPriceDKK;
    hourlyAverages[hourKey].count++;
  });

  // Convert hourly averages to records
  data.records = Object.values(hourlyAverages).map(hourData => {
    const avgPriceEUR = hourData.sum / hourData.count;
    const spotPriceDKK = avgPriceEUR * 1;
    return {
      TimeDK: hourData.timestamp.toISOString(),
      DayAheadPriceEUR: avgPriceEUR,
      SpotPriceDKK: spotPriceDKK,
      SpotPriceOre: spotPriceDKK,
      elafgift: elafgift,
      RadiusTarrif: radiustarrif[hourData.hour],
      dow: weekdays[hourData.day],
      hod: hourData.hour,
      label: weekdays[hourData.day] + ' ' + hourData.hour + ':00',
      TotalPrice: elafgift + (spotPriceDKK ) + radiustarrif[hourData.hour]
    };
  });

  // Sort records by time
  data.records.sort((a, b) => new Date(a.TimeDK) - new Date(b.TimeDK));
  console.log(data.records);
  
  return data;
}
