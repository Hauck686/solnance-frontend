'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import { uploadToCloudinary } from '../../context/uploadToCloudinary'
import { getVerifiedUserId } from '../../context/UnHashedUserId'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontSize: '16px',
      '::placeholder': { color: '#aab7c4' }
    },
    invalid: { color: '#fa755a' }
  }
}

// =======================
// Stripe Card Payment Form
// =======================
function CardPaymentForm ({
  amount,
  userId,
  token,
  selectedWallet,
  selectedSymbol,
  coinRate,
  setSnackbar,
  setIsSubmitting,
  onSuccess
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleCardPayment = async () => {
    if (!stripe || !elements || loading) return
    if (!amount || parseFloat(amount) <= 0) {
      setSnackbar({
        open: true,
        message: 'Enter a valid amount',
        severity: 'error'
      })
      return
    }

    try {
      setLoading(true)
      setIsSubmitting(true)
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      // 1. Ask backend to create PaymentIntent
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/create-payment-intent`,
        {
          userId,
          walletId: selectedWallet,
          walletsymbol: selectedSymbol,
          amount: parseFloat(amount),
          coinRate,
          convertedAmount: parseFloat(amount) / coinRate,
          method: 'card'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      const { clientSecret } = res.data

      // 2. Confirm card payment
      const card = elements.getElement(CardElement)
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card }
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      if (result.paymentIntent.status === 'succeeded') {
        // 3. Register deposit in your system (receipt: Stripe paymentIntent.id)
        const payload = {
          userId,
          walletId: selectedWallet,
          walletsymbol: selectedSymbol,
          method: 'card',
          amount: parseFloat(amount),
          coinRate,
          convertedAmount: parseFloat(amount) / coinRate,
          receipt: result.paymentIntent.id
        }

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions/deposit`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        setSnackbar({
          open: true,
          message: 'Card payment successful! ✅ Deposit pending approval.',
          severity: 'success'
        })
        if (onSuccess) onSuccess()
      }
    } catch (err) {
      console.error('Card payment failed:', err)
      setSnackbar({
        open: true,
        message: 'Card payment failed. ' + err.message,
        severity: 'error'
      })
    } finally {
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className='card-payment-box'>
      <div style={{ marginBottom: '1rem' }}>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      <button
        className='deposit-btn'
        onClick={handleCardPayment}
        disabled={!stripe || loading}
      >
        {loading ? 'Processing...' : `Pay $${amount} with Card`}
      </button>
    </div>
  )
}

// =======================
// Main Deposit Content
// =======================
function DepositPageContent () {
  const [userId, setUserId] = useState(null)
  const [token, setToken] = useState(null)
  const [wallets, setWallets] = useState([])
  const [selectedWallet, setSelectedWallet] = useState('')
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [method, setMethod] = useState('crypto')
  const [amount, setAmount] = useState('')
  const [coinRate, setCoinRate] = useState(1)
  const [convertedAmount, setConvertedAmount] = useState(0)
  const [receipt, setReceipt] = useState(null)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  // Fetch user and wallets
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const id = await getVerifiedUserId()
        setUserId(id)
        const localToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('authToken')
            : null
        setToken(localToken)

        if (!id || !localToken) return

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/${id}`,
          { headers: { Authorization: `Bearer ${localToken}` } }
        )
        setWallets(res.data.wallets || [])
      } catch (err) {
        console.error('Error fetching user:', err)
      }
    }
    fetchUser()
  }, [])

  // Fetch live coin rate
  useEffect(() => {
    const fetchRate = async () => {
      if (!selectedWallet) return
      const wallet = wallets.find(w => w._id === selectedWallet)
      if (!wallet) return
      setSelectedSymbol(wallet.symbol)
      try {
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${wallet.symbol.toLowerCase()}&vs_currencies=usd`
        )
        setCoinRate(res.data[wallet.symbol.toLowerCase()]?.usd || 1)
      } catch (err) {
        console.error('Error fetching coin rate:', err)
      }
    }
    fetchRate()
  }, [selectedWallet, wallets])

  // Update converted amount
  useEffect(() => {
    if (!amount || isNaN(amount)) {
      setConvertedAmount(0)
    } else {
      const conv = parseFloat(amount) / coinRate
      setConvertedAmount(Number.isFinite(conv) ? conv : 0)
    }
  }, [amount, coinRate])

  // Upload receipt
  const handleFileUpload = async () => {
    if (!receipt) return null
    try {
      return await uploadToCloudinary(receipt)
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to upload document',
        severity: 'error'
      })
      return null
    }
  }

  // Handle deposit for non-card methods
  const handleDeposit = async () => {
    if (method === 'card') return // handled separately

    if (!isConfirmed) {
      setSnackbar({
        open: true,
        message: 'Please confirm your payment details before proceeding.',
        severity: 'error'
      })
      return
    }

    if (!receipt) {
      setSnackbar({
        open: true,
        message: 'Please upload a payment receipt before proceeding.',
        severity: 'error'
      })
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid deposit amount.',
        severity: 'error'
      })
      return
    }

    setIsSubmitting(true)
    const documentUrl = await handleFileUpload()
    if (!documentUrl) {
      setIsSubmitting(false)
      return
    }

    try {
      const payload = {
        userId,
        walletsymbol: selectedSymbol,
        walletId: selectedWallet,
        method,
        amount: parseFloat(amount),
        coinRate,
        convertedAmount,
        receipt: documentUrl
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/deposit`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSnackbar({
        open: true,
        message: 'Deposit submitted. Awaiting admin approval.',
        severity: 'success'
      })
      setAmount('')
      setReceipt(null)
      setIsConfirmed(false)
    } catch (err) {
      console.error(err)
      setSnackbar({
        open: true,
        message:
          err?.response?.data?.message ||
          'Failed to create deposit. Try again later.',
        severity: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render payment instructions for each method
  const renderInstructions = () => {
    const wallet = wallets.find(w => w._id === selectedWallet)
    const shorten = a =>
      !a ? '' : a.length > 12 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a

    switch (method) {
      case 'crypto':
        return (
          wallet && (
            <div className='instruction-card'>
              <p className='label'>Send {wallet.symbol} to:</p>
              <div className='copy-box'>
                <span>{shorten(wallet.walletAddress)}</span>
              </div>
            </div>
          )
        )
      case 'bank':
        return (
          <div className='instruction-card'>
            <p className='label'>Bank Transfer Details:</p>
            <p>Bank: Example Bank</p>
            <span>Acc No: 2006448310</span>
            <p>Name: Solnance Ltd</p>
          </div>
        )
      case 'cashapp':
        return (
          <div className='instruction-card'>
            <p className='label'>CashApp Tag:</p>
            <span>$Solnance</span>
          </div>
        )
      case 'googlepay':
        return (
          <div className='instruction-card'>
            <p className='label'>Google Pay ID:</p>
            <span>Solnance@bank.com</span>
          </div>
        )
      case 'applepay':
        return (
          <div className='instruction-card'>
            <p className='label'>Apple Pay ID:</p>
            <span>Solnance@icloud.com</span>
          </div>
        )
      case 'card':
        return (
          <div className='instruction-card'>
            <p className='label'>Card Payment:</p>
            <span>Enter card details below</span>
          </div>
        )
      default:
        return null
    }
  }

  // Reset all fields after success
  const resetAll = () => {
    setAmount('')
    setReceipt(null)
    setIsConfirmed(false)
  }

  // Snackbar close
  const handleSnackbarClose = () =>
    setSnackbar(prev => ({ ...prev, open: false }))

  return (
    <div className='page'>
      <div className='deposit-container'>
        <div className='sponsor-bar'>
          <p>
            ⚡ Deposits processed securely by <b>Solnance</b>
          </p>
        </div>

        {/* Wallet selection */}
        <div className='form-group'>
          <label>Select Wallet</label>
          <select
            value={selectedWallet}
            onChange={e => setSelectedWallet(e.target.value)}
          >
            <option value=''>-- Select Wallet --</option>
            {wallets.map(w => (
              <option key={w._id} value={w._id}>
                {w.symbol} ({w.network})
              </option>
            ))}
          </select>
        </div>

        {/* Method */}
        <div className='form-group'>
          <label>Deposit Method</label>
          <select value={method} onChange={e => setMethod(e.target.value)}>
            <option value='crypto'>Crypto</option>
            <option value='bank'>Bank Transfer</option>
            <option value='cashapp'>CashApp</option>
            <option value='googlepay'>Google Pay</option>
            <option value='applepay'>Apple Pay</option>
            <option value='card'>Card</option>
          </select>
        </div>

        {/* Amount */}
        <div className='form-group'>
          <label>Amount (USD)</label>
          <input
            type='number'
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder='Enter amount in USD'
          />
        </div>

        {/* Conversion */}
        {convertedAmount > 0 && method !== 'card' && (
          <div className='conversion-box'>
            <p>
              You’ll receive approx{' '}
              <b>
                {convertedAmount.toFixed(6)} {selectedSymbol}
              </b>
            </p>
          </div>
        )}

        {/* Instructions */}
        {renderInstructions()}

        {/* Card form */}
        {method === 'card' && (
          <CardPaymentForm
            amount={amount}
            userId={userId}
            token={token}
            selectedWallet={selectedWallet}
            selectedSymbol={selectedSymbol}
            coinRate={coinRate}
            setSnackbar={setSnackbar}
            setIsSubmitting={setIsSubmitting}
            onSuccess={resetAll}
          />
        )}

        {/* Upload receipt for non-card */}
        {method !== 'card' && (
          <div className='form-group'>
            <label>Upload Receipt</label>
            <div className='upload-box'>
              <input
                type='file'
                accept='image/*'
                onChange={e => setReceipt(e.target.files[0])}
              />
              {receipt && <span>{receipt.name}</span>}
            </div>
          </div>
        )}

        {/* Confirm button */}
        {method !== 'card' && !isConfirmed && (
          <button
            className='deposit-btn'
            onClick={() => setIsConfirmed(true)}
            disabled={!amount || !receipt}
          >
            Confirm Payment Details
          </button>
        )}

        {/* Submit button */}
        {method !== 'card' && isConfirmed && (
          <button
            className='deposit-btn'
            onClick={handleDeposit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Deposit'}
          </button>
        )}
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          elevation={6}
          variant='filled'
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </div>
  )
}

// =======================
// Main Export with Stripe Elements wrapper
// =======================
export default function DepositPage () {
  return (
    <Elements stripe={stripePromise}>
      <DepositPageContent />
    </Elements>
  )
}
