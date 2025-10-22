'use client'

import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

export default function DonutChart () {
  const chartRef = useRef(null)

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d')
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Investments', 'Buyers', 'Sellers'],
        datasets: [
          {
            data: [33, 55, 12],
            backgroundColor: ['#8e44ad', '#e74c3c', '#f1c40f'],
            borderWidth: 0
          }
        ]
      },
      options: {
        cutout: '75%',
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    })

    return () => chart.destroy()
  }, [])

  return (
    <div className='chartContainer'>
      <h3 className='title'>App Overview</h3>
      <canvas ref={chartRef} />
      <div className='labels'>
        <div>
          <span className='fbDot'></span> 33% <strong>Investments</strong>
        </div>
        <div>
          <span className='ytDot'></span> 55% <strong>Buyers</strong>
        </div>
        <div>
          <span className='dsDot'></span> 12% <strong>Sellers</strong>
        </div>
      </div>
    </div>
  )
}
