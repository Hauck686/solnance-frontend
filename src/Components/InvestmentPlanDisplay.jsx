'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function InvestmentPlansDisplay () {
  const [plans, setPlans] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/investments`
        )
        if (res.data.success) {
          setPlans(res.data.data)
          const uniqueCats = [
            'All',
            ...new Set(res.data.data.map(p => p.category))
          ]
          setCategories(uniqueCats)
        }
      } catch (err) {
        console.error('Error fetching plans:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const filteredPlans =
    activeCategory === 'All'
      ? plans
      : plans.filter(p => p.category === activeCategory)

  return (
    <div className='plansContainer'>
      <div className='plansHeader'>
        <h1>Investment Plans</h1>
        <p>Select a category to explore available plans.</p>
      </div>

      <div className='categoryTabs'>
        {categories.map((cat, i) => (
          <button
            key={i}
            className={cat === activeCategory ? 'tab active' : 'tab'}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className='loading'>Loading investment plans...</div>
      ) : (
        <div className='plansGrid'>
          {filteredPlans.map(plan => (
            <div className='planCard' key={plan._id}>
              <div className='planTop'>
                <h3>{plan.name}</h3>
                <div className='categoryTag'>{plan.category}</div>
              </div>

              <div className='planDetails'>
                <div className='detailItem'>
                  <span>Profit Rate:</span>
                  <strong>{plan.profitRate}%</strong>
                </div>
                <div className='detailItem'>
                  <span>Duration:</span>
                  <strong>Per {plan.durationType}</strong>
                </div>
                <div className='detailItem'>
                  <span>Min / Max:</span>
                  <strong>
                    ${plan.minAmount.toLocaleString()} - $
                    {plan.maxAmount.toLocaleString()}
                  </strong>
                </div>
                <div className='detailItem'>
                  <span>Capital Back:</span>
                  <strong>{plan.capitalBack ? 'Yes ' : 'No '}</strong>
                </div>
              </div>

              <button className='investBtn'>Invest Now</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
