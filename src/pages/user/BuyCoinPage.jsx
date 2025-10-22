import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { uploadToCloudinary } from '../../context/uploadToCloudinary'
import { getVerifiedUserId } from '../../context/UnHashedUserId'

const COINS = [
  { name: 'Bitcoin', symbol: 'BTC', rate: 117161 },
  { name: 'Ethereum', symbol: 'ETH', rate: 3200 },
  { name: 'Litecoin', symbol: 'LTC', rate: 90 },
  { name: 'Ripple', symbol: 'XRP', rate: 0.6 }
]

const PAYMENTS = ['Stripe', 'PayPal', 'Cash App', 'Wallet']

export default function BuyCoinPage () {
  const [step, setStep] = useState(1)
  const [selectedCoin, setSelectedCoin] = useState(COINS[0])
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState(PAYMENTS[0])
  const [processing, setProcessing] = useState(false)
  const [userId, setUserId] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [cashTag, setCashTag] = useState('')
  const [wallets, setWallets] = useState([])
  const [selectedWalletId, setSelectedWalletId] = useState('')

  // Fetch user wallets
  useEffect(() => {
    const fetchWallets = async () => {
      const userId = await getVerifiedUserId()
      setUserId(userId)
      if (!userId) {
        console.error('Token or UserId missing')
        return
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`
        )

        const data = await res.json()
        setWallets(data.wallets || [])
      } catch (err) {
        console.error('Failed to fetch user wallets:', err.message)
      }
    }

    fetchWallets()
  }, [])

  // Fetch Cash App tag
  useEffect(() => {
    const fetchCashAppTag = async () => {
      if (paymentMethod === 'Cash App') {
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/payment/cashapp/tag`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
          setCashTag(res.data.tag)
        } catch (err) {
          console.error('Failed to fetch Cash App tag:', err)
          setCashTag('N/A')
        }
      }
    }

    fetchCashAppTag()
  }, [paymentMethod])

  const uploadReceiptToCloudinary = async file => {
    if (!file) return null
    const uploadedReceipt = await uploadToCloudinary(file)
    return uploadedReceipt
  }

  const handleConfirm = async () => {
    setProcessing(true)
    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      if (paymentMethod === 'Stripe') {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/payment/stripe`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          {
            amount,
            coin: selectedCoin.name,
            userId
          }
        )
        if (res.data.url) window.location.href = res.data.url
      } else if (paymentMethod === 'PayPal') {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/payment/paypal`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          {
            amount,
            coin: selectedCoin.name,
            userId
          }
        )
        if (res.data.url) window.location.href = res.data.url
      } else if (paymentMethod === 'Cash App') {
        let uploadedReceiptUrl = null
        if (receipt) {
          uploadedReceiptUrl = await uploadReceiptToCloudinary(receipt)
        }

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/payment/cashapp`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          {
            amount,
            coin: selectedCoin.name,
            userId,
            receipt: uploadedReceiptUrl
          }
        )

        setCashTag(res.data.tag)
      } else if (paymentMethod === 'Wallet') {
        // Wallet-based payment
        if (!selectedWalletId) {
          alert('Please select a wallet to use for payment.')
          setProcessing(false)
          return
        }
        // Check if wallet has enough balance
        const wallet = wallets.find(w => w._id === selectedWalletId)
        if (!wallet) {
          alert('Selected wallet not found.')
          setProcessing(false)
          return
        }
        if (Number(wallet.balance) < Number(amount)) {
          alert('Insufficient wallet balance.')
          setProcessing(false)
          return
        }

        // Call backend to process wallet payment
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/payment/wallet`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          {
            amount,
            coin: selectedCoin.name,
            userId,
            walletId: selectedWalletId
          }
        )
        if (res.data.success) {
          alert('Payment successful! Your coin purchase is being processed.')
          // Optionally, move to a success page or reset form
        } else {
          alert('Wallet payment failed.')
        }
      }
    } catch (err) {
      console.error(err)
      alert('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const coinQty = ((parseFloat(amount) || 0) / selectedCoin.rate).toFixed(6)

  // Build payment options, including wallet if any user wallets exist
  const paymentOptions =
    wallets.length > 0 ? PAYMENTS : PAYMENTS.filter(pm => pm !== 'Wallet')

  return (
    <div className='buycoin-container'>
      <div className='buycoin-card'>
        <h2 className='heading'>Buy {selectedCoin.name}</h2>

        {step === 1 && (
          <div className='step'>
            <p className='coin-rate'>
              ${selectedCoin.rate.toLocaleString()} per {selectedCoin.symbol}
            </p>

            <input
              type='number'
              className='amount-input'
              placeholder='Enter amount in USD'
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />

            {amount && (
              <p className='coin-output'>
                You'll receive:{' '}
                <strong>
                  {coinQty} {selectedCoin.symbol}
                </strong>
              </p>
            )}

            <div className='coin-tabs'>
              {COINS.map(c => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCoin(c)}
                  className={selectedCoin.name === c.name ? 'active' : ''}
                >
                  {c.symbol}
                </button>
              ))}
            </div>

            <button className='btn-primary' onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className='step'>
            <h3>Select Payment Method</h3>
            <div className='payment-options'>
              {paymentOptions.map(pm => (
                <label key={pm} className='payment-option'>
                  <input
                    type='radio'
                    name='payment'
                    value={pm}
                    checked={paymentMethod === pm}
                    onChange={() => setPaymentMethod(pm)}
                  />
                  {pm}
                </label>
              ))}
            </div>
            {/* Wallet select only if payment method is Wallet */}
            {paymentMethod === 'Wallet' && (
              <div className='wallet-select'>
                <label htmlFor='wallet-select'>Choose Wallet:</label>
                <select
                  id='wallet-select'
                  value={selectedWalletId}
                  onChange={e => setSelectedWalletId(e.target.value)}
                  required
                >
                  <option value=''>-- Select Wallet --</option>
                  {wallets.map(wallet => (
                    <option value={wallet._id} key={wallet._id}>
                      {wallet.symbol} - Balance: $
                      {Number(wallet.balance).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className='navigation'>
              <button className='btn-primary' onClick={() => setStep(1)}>
                Back
              </button>
              <button className='btn-primary' onClick={() => setStep(3)}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className='step'>
            <h3>Confirm Order</h3>
            <ul className='summary'>
              <li>
                Buying:{' '}
                <strong>
                  {coinQty} {selectedCoin.symbol}
                </strong>
              </li>
              <li>
                Payment Method: <strong>{paymentMethod}</strong>
              </li>
              <li>
                Total:{' '}
                <strong>${parseFloat(amount || 0).toLocaleString()}</strong>
              </li>
              {paymentMethod === 'Wallet' && (
                <li>
                  Wallet:{' '}
                  <strong>
                    {wallets.find(w => w._id === selectedWalletId)?.symbol ||
                      'N/A'}
                  </strong>
                </li>
              )}
            </ul>

            {paymentMethod === 'Cash App' && (
              <>
                {cashTag && (
                  <p className='cashapp'>
                    Send payment to{' '}
                    <span className='cashapp_tag'>${cashTag}</span>
                  </p>
                )}
                <div className='receipt-upload'>
                  <label>Upload Receipt:</label>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={e => setReceipt(e.target.files[0])}
                  />
                </div>
              </>
            )}

            <div className='navigation'>
              <button
                className='btn-primary'
                onClick={() => setStep(2)}
                disabled={processing}
              >
                Back
              </button>
              <button
                className='btn-primary'
                onClick={handleConfirm}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
