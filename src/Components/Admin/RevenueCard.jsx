import React from 'react'
import { BarChart, Bar, ResponsiveContainer } from 'recharts'

const data = [
  { value: 5 },
  { value: 3 },
  { value: 4 },
  { value: 2 },
  { value: 6 }
]

export default function RevenueCard ({ title, value, date }) {
  return (
    <div className='revenue-card pink'>
      <div className='top'>
        <div className='icon'>
          <p>{title}</p>
          <div className='mini-chart'>
            <ResponsiveContainer width={50} height={40}>
              <BarChart data={data}>
                <Bar dataKey='value' fill='#fff' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <h2>{value}</h2>
      <span>{date}</span>
    </div>
  )
}
