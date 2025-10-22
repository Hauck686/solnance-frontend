'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { getVerifiedUserId } from '../../context/UnHashedUserId'
import { toast } from 'react-toastify'
import { Loader2, ShieldCheck, ArrowRight } from 'lucide-react'

export default function InvestmentProcess () {
  const [plans, setPlans] = useState([])
  const [step, setStep] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [wallets, setWallets] = useState([])
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchPlans () {
      try {
        let token = null
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('authToken')
        }
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/investments/`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        if (res.data.success) {
          const mapped = res.data.data.map(plan => ({
            ...plan,
            name: plan.name || plan.title,
            category: plan.category,
            profitRate: plan.profitRate,
            durationDays: plan.payoutFrequency,
            durationType: plan.durationType,
            minDeposit: plan.minAmount,
            maxDeposit: plan.maxAmount
          }))
          setPlans(mapped)
        }
      } catch {
        toast.error('Failed to fetch investment plans')
      }
    }
    async function fetchWallets () {
      const uid = await getVerifiedUserId()
      setUserId(uid)
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/${uid}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        if (res.data.wallets) setWallets(res.data.wallets)
      } catch {
        toast.error('Failed to fetch wallets')
      }
    }
    fetchPlans()
    fetchWallets()
  }, [])

  const categories = Array.from(new Set(plans.map(p => p.category)))
  const groupedPlans = categories.map(category => ({
    name: category,
    plans: plans.filter(p => p.category === category)
  }))

  // Stepper logic
  const goNext = () => setStep(s => Math.min(s + 1, 3))
  const goBack = () => setStep(s => Math.max(s - 1, 0))

  const handleCategory = cat => {
    setSelectedCategory(cat)
    setStep(1)
  }
  const handlePlan = plan => {
    setSelectedPlan(plan)
    setStep(2)
  }
  const handleWallet = wallet => {
    setSelectedWallet(wallet)
    setStep(3)
  }

  const shortenAddress = address => {
    if (!address) return ''
    return address.length > 12
      ? `${address.slice(0, 9)}...${address.slice(-4)}`
      : address
  }

  const handleInvest = async () => {
    const numericAmount = parseFloat(amount)
    if (!selectedWallet) return toast.error('Please select a wallet')
    if (!numericAmount || numericAmount < selectedPlan.minDeposit)
      return toast.error('Amount too low')
    if (numericAmount > selectedPlan.maxDeposit)
      return toast.error('Amount exceeds plan max limit')
    if (numericAmount > selectedWallet.balance)
      return toast.error('Insufficient wallet balance')
    setLoading(true)
    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }
      const payload = {
        userId,
        planId: selectedPlan._id,
        amount: numericAmount,
        walletSymbol: selectedWallet.symbol,
        walletAddress: selectedWallet.walletAddress
      }
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/investments/user-investments`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        toast.success('Investment started successfully!')
        router.push('/user/ActivePlanPage')
        setStep(0)
        setSelectedCategory(null)
        setSelectedPlan(null)
        setSelectedWallet(null)
        setAmount('')
      } else {
        toast.error(res.data.msg || 'Investment failed.')
      }
    } catch {
      toast.error('An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  // Stepper UI
  const steps = [
    { label: 'Category', icon: <ShieldCheck size={20} /> },
    { label: 'Plan', icon: <ArrowRight size={20} /> },
    { label: 'Wallet', icon: <ArrowRight size={20} /> },
    { label: 'Confirm', icon: <ArrowRight size={20} /> }
  ]

  return (
    <section className='investment-process'>
      <div className='investment-card'>
        <div className='stepper'>
          {steps.map((s, i) => (
            <div
              key={s.label}
              className={`step ${step === i ? 'active' : ''} ${
                step > i ? 'done' : ''
              }`}
            >
              <div className='step-icon'>{s.icon}</div>
              <div className='step-label'>{s.label}</div>
              {i < steps.length - 1 && <div className='step-line' />}
            </div>
          ))}
        </div>

        {/* Step 0: Category */}
        {step === 0 && (
          <div className='category-select'>
            <h2 className='title'>Select Investment Category</h2>
            <div className='category-list'>
              {groupedPlans.map(cat => (
                <button
                  key={cat.name}
                  className='category-item'
                  onClick={() => handleCategory(cat)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Plan */}
        {step === 1 && selectedCategory && (
          <div className='plan-select'>
            <h2 className='title'>Choose a Plan</h2>
            <div className='plan-grid'>
              {selectedCategory.plans.map(plan => (
                <div key={plan._id} className='plan-card'>
                  <div className='plan-header'>
                    <h3>{plan.name}</h3>
                    <p className='rate'>
                      {plan.profitRate}% <span>per {plan.durationType}</span>
                    </p>
                  </div>
                  <div className='plan-body'>
                    <p>Min: ${plan.minAmount.toFixed(2)}</p>
                    <p>Max: ${plan.maxAmount.toFixed(2)}</p>
                    <p>
                      Duration: {plan.durationDays} {plan.durationType}
                    </p>
                  </div>
                  <p className='affiliate'>✨ Affiliate bonus included</p>
                  <button
                    className='invest-btn'
                    onClick={() => handlePlan(plan)}
                  >
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
            <button className='back-btn' onClick={goBack}>
              Back
            </button>
          </div>
        )}

        {/* Step 2: Wallet */}
        {step === 2 && selectedPlan && (
          <div className='wallet-select'>
            <h2 className='title'>Select Wallet</h2>
            <ul className='wallet-list'>
              {wallets.map(wallet => (
                <li
                  key={wallet.walletAddress}
                  className={`wallet-card ${
                    selectedWallet?.walletAddress === wallet.walletAddress
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => handleWallet(wallet)}
                >
                  <div className='wallet-info'>
                    <span className='wallet-symbol'>{wallet.symbol}</span>
                    <span className='wallet-address'>
                      {shortenAddress(wallet.walletAddress)}
                    </span>
                    <span className='wallet-balance'>
                      Balance: {wallet.balance}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <button className='back-btn' onClick={goBack}>
              Back
            </button>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedWallet && (
          <div className='confirm-section'>
            <h2 className='title'>Investment Details</h2>
            <div className='summary-card'>
              <div>
                <strong>Category:</strong> {selectedCategory.name}
              </div>
              <div>
                <strong>Plan:</strong> {selectedPlan.name}
              </div>
              <div>
                <strong>Wallet:</strong> {selectedWallet.symbol} (
                {shortenAddress(selectedWallet.walletAddress)})
              </div>
              <div>
                <strong>Available Balance:</strong> {selectedWallet.balance}
              </div>
              <div className='amount-input'>
                <input
                  type='number'
                  min={selectedPlan.minDeposit}
                  max={selectedPlan.maxDeposit}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder='Enter amount to invest'
                />
              </div>
            </div>
            <button
              className='invest-button'
              onClick={handleInvest}
              disabled={loading}
            >
              {loading ? <Loader2 className='spin' /> : 'Confirm & Invest'}
            </button>
            <button className='back-btn' onClick={goBack}>
              Back
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
