import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {getTodaysPrices, getTomorrowsPrices} from '../services/api';
import {PriceCardGraph} from '../components/Graphs';
import {WaitForData} from '../components/RenderUtils';

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '@mui/material/Tooltip';
import { useTheme, useMediaQuery } from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          p: isMobile ? 0.5 : 1,
          height: '100%',
          width: '100%'
        }}>
          {children}
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

const ElPricesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [today, setToday] = useState({ records: [] });
  const [tomorrow, setTomorrow] = useState({ records: [] });
  const [value, setValue] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [todayPrices, tomorrowPrices] = await Promise.all([
        getTodaysPrices(),
        getTomorrowsPrices()
      ]);
      setToday(todayPrices);
      setTomorrow(tomorrowPrices);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    // Auto-refresh every 5 minutes
    const intervalId = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchPrices]);

  const handleRefresh = () => {
    fetchPrices();
  };

  if (loading && !today.records.length) {
    return <WaitForData show={loading}/>;
  }

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1, 
        borderColor: 'divider',
        flexWrap: 'nowrap'
      }}>
        <Tabs value={value} onChange={handleChange} aria-label="price period tabs">
          <Tab 
            sx={{color: '#888'}} 
            label="Today" 
            {...a11yProps(0)}
          />
          <Tab 
            sx={{color: '#888'}} 
            label="Tomorrow" 
            {...a11yProps(1)}
          />
        </Tabs>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mr: 1,
          minWidth: 'fit-content',
          gap: 0.5
        }}>
          <Tooltip title="Refresh prices">
            <IconButton 
              onClick={handleRefresh} 
              disabled={loading}
              size="small"
              sx={{ color: '#888' }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ position: 'absolute', top: 0, right: 0, m: 2 }}>
          <WaitForData show={true}/>
        </Box>
      )}

      <TabPanel value={value} index={0}>
        <PriceCardGraph prices={today.records} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <PriceCardGraph prices={tomorrow.records} />
      </TabPanel>
    </>
  );
};

export default ElPricesPage;
