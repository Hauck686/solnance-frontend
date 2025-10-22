// components/GradientLineChart.jsx
'use client'

import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

export default function GradientLineChart () {
  const chartRef = useRef(null)

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d')
    const gradientA = ctx.createLinearGradient(0, 0, 0, 200)
    gradientA.addColorStop(0, 'rgba(255, 99, 132, 0.5)')
    gradientA.addColorStop(1, 'rgba(255, 99, 132, 0.05)')

    const gradientB = ctx.createLinearGradient(0, 0, 0, 200)
    gradientB.addColorStop(0, 'rgba(153, 102, 255, 0.3)')
    gradientB.addColorStop(1, 'rgba(153, 102, 255, 0.05)')

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Marketing Reach',
            data: [3, 15, 10, 20, 13, 35],
            fill: true,
            backgroundColor: gradientA,
            borderColor: '#ff6384',
            tension: 0.4,
            pointBackgroundColor: [
              'transparent',
              'transparent',
              'transparent',
              '#ff9f40',
              'transparent',
              'transparent'
            ],
            pointRadius: [0, 0, 0, 6, 0, 0]
          },
          {
            label: 'User Engagement',
            data: [2, 9, 12, 10, 15, 30],
            fill: true,
            backgroundColor: gradientB,
            borderColor: '#9966ff',
            tension: 0.4,
            pointBackgroundColor: [
              'transparent',
              'transparent',
              'transparent',
              '#9966ff',
              'transparent',
              'transparent'
            ],
            pointRadius: [0, 0, 0, 6, 0, 0]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 5 }
          }
        }
      }
    })

    return () => chart.destroy()
  }, [])

  return (
    <div className='chartWrapper'>
      <h2>Performance Over Time</h2>
      <p className='description'>
        Tracking key metrics across the first half of the year.
      </p>
      <canvas ref={chartRef} />
    </div>
  )
}
