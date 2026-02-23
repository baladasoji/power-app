import configData from './config.json'

const baseurl = "https://api.energidataservice.dk/dataset/DayAheadPrices"
const radius_sommer_tariff = configData.radius_sommer_tariff
const radius_vinter_tariff = configData.radius_vinter_tariff

// Cache for price data
const priceCache = {
  today: { data: null, timestamp: null },
  tomorrow: { data: null, timestamp: null }
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

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

const fetchWithTimeout = async (url, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

const isCacheValid = (cacheEntry) => {
  return cacheEntry?.data && cacheEntry?.timestamp && 
         (Date.now() - cacheEntry.timestamp < CACHE_DURATION);
};

export const getFuturePrices = () => {
  const todayDate = new Date().toISOString().slice(0, 10)
  return fetch(createFilterUrl(todayDate))
    .then(data => data.json())
    .then(data => updateCharges(data))
}

export const getTomorrowsPrices = async () => {
  if (isCacheValid(priceCache.tomorrow)) {
    return priceCache.tomorrow.data;
  }

  try {
    const today = new Date();
    const tomorrow = new Date(today);
    const dayaftertomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    dayaftertomorrow.setDate(today.getDate() + 2);
    const tomorrowDate = tomorrow.toISOString().slice(0, 10);
    const dayAfterTomorrowDate = dayaftertomorrow.toISOString().slice(0, 10);
    
    const data = await fetchWithTimeout(createFilterUrl(tomorrowDate, dayAfterTomorrowDate));
    const processedData = updateCharges(data);
    priceCache.tomorrow = { data: processedData, timestamp: Date.now() };
    return processedData;
  } catch (error) {
    console.error('Error fetching tomorrow\'s prices:', error);
    throw new Error('Failed to fetch tomorrow\'s prices. Please try again later.');
  }
};

export const getTodaysPrices = async () => {
  if (isCacheValid(priceCache.today)) {
    return priceCache.today.data;
  }

  try {
    const todayDate = new Date().toISOString().slice(0, 10);
    const data = await fetchWithTimeout(createFilterUrl(todayDate));
    const processedData = updateCharges(data);
    priceCache.today = { data: processedData, timestamp: Date.now() };
    return processedData;
  } catch (error) {
    console.error('Error fetching today\'s prices:', error);
    throw new Error('Failed to fetch today\'s prices. Please try again later.');
  }
};

// Utility functions
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
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// A method to get electricity tariff
// The tariff is 80 after 1 July 2023 and 1 before that date
const getElAfgift= ()=>{
  return 0.8; // WEF 1 January 2026
  // const today = new Date();
  // if(today.getFullYear() > 2023 || (today.getFullYear() === 2023 && today.getMonth() >= 6)){
  //   return 80;
  // }else{
  //   return 1;
  // }
}

const formatTime = (hours) => {
  // Convert 24h to 12h format with AM/PM
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for midnight
  return `${displayHours} ${period}`;
};

const aggregateByHour = (records) => {
  const hourlyData = {};
  
  records.forEach(record => {
    const dt = new Date(record.TimeDK);
    const hour = dt.getHours();
    const day = dt.getDay();
    
    const key = `${day}-${hour}`;
    if (!hourlyData[key]) {
      hourlyData[key] = {
        TimeDK: record.TimeDK,
        DayAheadPriceDKK: record.DayAheadPriceDKK,
        count: 1
      };
    } else {
      hourlyData[key].DayAheadPriceDKK += record.DayAheadPriceDKK;
      hourlyData[key].count += 1;
    }
  });

  return Object.values(hourlyData).map(data => ({
    ...data,
    DayAheadPriceDKK: data.DayAheadPriceDKK / data.count
  }));
};

const updateCharges = (data) => {
  const elafgift = getElAfgift();
  const records = [...data.records].reverse();
  const hourlyRecords = aggregateByHour(records);
  
  return {
    ...data,
    records: hourlyRecords.map(record => {
      const dt = new Date(record.TimeDK);
      const hours = dt.getHours();
      
      return {
        ...record,
        elafgift,
        SpotPriceOre: record.DayAheadPriceDKK / 10,
        RadiusTarrif: radiustarrif[hours],
        dow: weekdays[dt.getDay()],
        hod: hours,
        label: `${weekdays[dt.getDay()].slice(0,3)} ${formatTime(hours)}`,
        TotalPrice: elafgift + (record.DayAheadPriceDKK / 10) + radiustarrif[hours],
        isPeakHour: hours >= 17 && hours < 21
      };
    })
  };
};

