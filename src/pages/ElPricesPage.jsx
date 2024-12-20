import React from 'react';
import { useState, useEffect } from 'react';
import {getTodaysPrices, getTomorrowsPrices} from '../services/api';
import {PriceCardGraph} from '../components/Graphs';
import {WaitForData } from '../components/RenderUtils';

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ElPricesPage=() =>{
  const [loading,setLoading] = useState(true);
  const [today,setToday] = useState([]);
  const [tomorrow,setTomorrow] = useState([]);
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  useEffect(() => {
    setLoading(true);
    Promise.all([getTodaysPrices(), getTomorrowsPrices()])
      .then(([todayPrices, tomorrowPrices]) => {
        setToday(todayPrices);
        // setResult(todayPrices);
        setTomorrow(tomorrowPrices);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  // useEffect( () => {
  //   getTodaysPrices()
  //       .then (t=> {setToday(t); setResult(t); setLoading(false)});
  //   getTomorrowsPrices()
  //       .then (t=> {setTomorrow(t); setLoading(false)});
    
  // },[]);
    if (loading) {
      return (
        <>
        <WaitForData show={loading}/>
        </>
      );
    }
    else {
    console.log(today);
      return (
        <>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab sx={{color: '#888'}} label="Today" {...a11yProps(0)} />
              <Tab sx={{color: '#888'}} label="Tomorrow" {...a11yProps(1)} />
        </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <PriceCardGraph prices={today.records} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <PriceCardGraph prices={tomorrow.records} />
        </TabPanel>
        </>
      );
    }
}

export default ElPricesPage;
