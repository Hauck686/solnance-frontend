'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function LoansDisplay () {
  const [loans, setLoans] = useState([])
  const [groupedLoans, setGroupedLoans] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/loans/all`
        )
        const data = res.data?.data || []
        setLoans(data)

        const grouped = data.reduce((acc, loan) => {
          if (!acc[loan.category]) acc[loan.category] = []
          acc[loan.category].push(loan)
          return acc
        }, {})
        setGroupedLoans(grouped)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching loans:', err)
        setLoading(false)
      }
    }

    fetchLoans()
  }, [])

  const categories = ['All', ...Object.keys(groupedLoans)]

  return (
    <div className='loans-display'>
      <h2 className='title'>Available Loan Plans</h2>

      {loading ? (
        <div className='loading'>Loading loan plans...</div>
      ) : (
        <>
          <div className='loan-categories'>
            {categories.map((cat, i) => (
              <button
                key={i}
                className={activeCategory === cat ? 'active' : ''}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className='loan-grid'>
            {(activeCategory === 'All'
              ? loans
              : groupedLoans[activeCategory] || []
            ).map(loan => (
              <div className='loan-card' key={loan._id}>
                <div className='loan-header'>
                  <h3>{loan.name}</h3>
                  <span className='loan-category'>{loan.category}</span>
                </div>
                <div className='loan-details'>
                  <p>
                    <strong>Interest:</strong> {loan.interestRate}% (
                    {loan.interestType})
                  </p>
                  <p>
                    <strong>Range:</strong> ${loan.minAmount.toLocaleString()} -
                    ${loan.maxAmount.toLocaleString()}
                  </p>
                  <p>
                    <strong>Duration:</strong> {loan.duration}{' '}
                    {loan.durationType}
                  </p>
                  <p>
                    <strong>Repayment:</strong> {loan.repaymentFrequency}
                  </p>
                  <p>
                    <strong>Collateral:</strong>{' '}
                    {loan.collateralRequired ? 'Required' : 'Not Required'}
                  </p>
                  <p>
                    <strong>Capital Back:</strong>{' '}
                    {loan.capitalBack ? 'Yes' : 'No'}
                  </p>
                </div>

                <button className='apply-btn'>Apply Now</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
