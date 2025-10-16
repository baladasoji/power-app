import React from 'react';
import { Alert, useTheme, useMediaQuery, Box, Grid } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { Paper, Typography } from '@mui/material';

const PriceStats = ({ prices }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const stats = React.useMemo(() => {
    if (!prices?.length) return {};
    
    const totalPrices = prices.map(p => p.TotalPrice);
    return {
      min: Math.min(...totalPrices).toFixed(2),
      max: Math.max(...totalPrices).toFixed(2),
      cheapestHour: prices.reduce((min, p) => p.TotalPrice < min.TotalPrice ? p : min, prices[0]),
      peakHours: prices.filter(p => p.isPeakHour).length
    };
  }, [prices]);

  return (
    <Paper elevation={1} sx={{ p: isMobile ? 1 : 2, mb: 1, bgcolor: 'rgba(255,255,255,0.05)' }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'row' : 'column',
        gap: isMobile ? 2 : 1,
        alignItems: isMobile ? 'center' : 'flex-start',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" color="#888">Price Range:</Typography>
          <Typography variant="body2" color="#ccc">
            {stats.min} - {stats.max} øre
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" color="#888">Best Time:</Typography>
          <Typography variant="body2" color="#ccc">
            {stats.cheapestHour?.label || 'N/A'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const CustomBarLabel = (props) => {
  const { x, y, width, height, value } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <text
      x={x + width + 5}
      y={y + height / 2}
      fill="#fff"
      fontSize={isMobile ? 10 : 12}
      textAnchor="start"
      dominantBaseline="middle"
    >
      {value.toFixed(0)}
    </text>
  );
};

export const PriceCardGraph = ({prices}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (prices.length > 0) {
    return (
      <Box sx={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        {/* <PriceStats prices={prices} /> */}
        <Box sx={{ 
          width: '100%', 
          height: isMobile ? '700px' : '900px',
          position: 'relative'
        }}>
          <ResponsiveContainer>
            <BarChart
              layout="vertical"
              data={prices}
              margin={isMobile ? 
                { top: 20, right: 60, left: 30, bottom: 5 } : 
                { top: 20, right: 80, left: 50, bottom: 5 }
              }
              barSize={isMobile ? 28 : 38}
              barGap={0}
            >
              <XAxis 
                type="number" 
                domain={[0, 'auto']}
                tickCount={isMobile ? 4 : 8}
                fontSize={isMobile ? 11 : 13}
                tick={{ fill: '#fff' }}
                axisLine={{ stroke: '#333' }}
                tickLine={{ stroke: '#333' }}
              />
              <YAxis 
                dataKey="label" 
                type="category" 
                width={isMobile ? 60 : 85}
                scale="band"
                tickMargin={2}
                fontSize={isMobile ? 11 : 14}
                axisLine={{ stroke: '#333' }}
                tickLine={{ stroke: '#333' }}
                tick={({ x, y, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text 
                      x={0} 
                      y={0} 
                      dy={4} 
                      fill="#fff"
                      fontSize={isMobile ? 11 : 14}
                      fontWeight="500"
                      textAnchor="end"
                    >
                      {payload.value}
                    </text>
                  </g>
                )}
              />
              <Legend 
                verticalAlign="top" 
                height={isMobile ? 25 : 30}
                fontSize={isMobile ? 11 : 14}
                formatter={(value) => (
                  <span style={{ 
                    color: '#fff', 
                    fontSize: isMobile ? 11 : 14,
                    paddingLeft: isMobile ? 0 : 10
                  }}>
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="TotalPrice"
                name="Total Price"
                fill="rgba(130, 202, 157, 0.9)"
                radius={[0, 4, 4, 0]}
              >
                <LabelList content={<CustomBarLabel />} position="right" />
              </Bar>
              <Bar
                dataKey="SpotPriceOre"
                name="Raw Price"
                fill="rgba(136, 132, 216, 0.9)"
                radius={[0, 4, 4, 0]}
              >
                <LabelList content={<CustomBarLabel />} position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    );
  } else {
    return (
      <Alert severity="warning">Next day prices are only available after 13:00!</Alert>
    );
  }
}
