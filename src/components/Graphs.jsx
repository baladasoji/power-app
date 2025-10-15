import React from 'react';
import {Alert } from '@mui/material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export const PriceCardGraph = ({prices}) => {
      if (prices.length >0) 
      {
        return ( <PriceChart rows={prices}/>  );
      }
      else
      {
        return (
        <Alert severity="warning" onClose={() => {}}>Next day prices are only available after 13:00 !</Alert>
        );
      }
}


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartDataLabels,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio:0.25,
  indexAxis: 'y',
   scales: {
            x: {
                stacked: false,
                suggestedMin: 10,
                suggestedMax: 300
            },
            y: {
                stacked: true,
            }
        },
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Øre/KWH',
    },
    datalabels: {
      anchor: 'end',
      offset:-20,
      align: 'end',
      color: 'azure',
      formatter: Math.round,
      font: {
          size: 9,
      }
    }
  }
};

function PriceChart({rows}) {
  const labels = rows.map(r => r.label) 

  const data = {
    labels,
    datasets: [
      {
        label: 'Raw',
        data: rows.map( r => r.SpotPriceOre ),
        backgroundColor: 'rgba(250, 250, 1, 0.7)',
        borderRadius : 15
      },
      {
        label: 'Total',
        data: rows.map( r => r.TotalPrice ),
        backgroundColor: 'rgba(250, 100, 1, 0.7)',
        borderRadius : 15
      },
    ],
  };
  return <Bar options={options} data={data}/>;
}
