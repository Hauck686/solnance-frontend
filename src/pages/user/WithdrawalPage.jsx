'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Copy } from 'lucide-react'
import { toast } from 'react-toastify'
import { getVerifiedUserId } from '../../context/UnHashedUserId'

export default function WithdrawPage () {
  const [userId, setUserId] = useState(null)
  const [token, setToken] = useState(null)
  const [wallets, setWallets] = useState([])
  const [method, setMethod] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('')
  const [amount, setAmount] = useState('')
  const [cryptoAddress, setCryptoAddress] = useState('')
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    bankCountry: '',
    bankSwiftCode: ''
  })
  const [cashAppTag, setCashAppTag] = useState('')
  const [applePayNumber, setApplePayNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getVerifiedUserId()
      setUserId(userId)
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }
      setToken(token)

      if (userId) {
        axios
          .get(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(res => setWallets(res.data.wallets || []))
          .catch(() => toast.error('Failed to load wallets'))
      }
    }
    fetchUserId()
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()

    if (!selectedWallet || !amount || !method)
      return toast.error('Fill all required fields')

    const payload = {
      userId,
      amount,
      method,
      walletSymbol: selectedWallet,
      ...(method === 'crypto' && { cryptoAddress }),
      ...(method === 'bank' && {
        bankName: bankInfo.bankName,
        accountNumber: bankInfo.accountNumber,
        accountName: bankInfo.accountName,
        bankCountry: bankInfo.bankCountry,
        bankSwiftCode: bankInfo.bankSwiftCode
      }),
      ...(method === 'cashapp' && { cashAppTag }),
      ...(method === 'applepay' && { applePayNumber })
    }

    try {
      setSubmitting(true)
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/withdrawFunds`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      toast.success('Withdrawal request sent successfully!')
      setAmount('')
      setCryptoAddress('')
      setBankInfo({
        bankName: '',
        accountNumber: '',
        accountName: '',
        bankCountry: '',
        bankSwiftCode: ''
      })
      setCashAppTag('')
      setApplePayNumber('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='page'>
      <div className='deposit-container'>
        {/* Sponsor bar (same as DepositPage) */}
        <div className='sponsor-bar'>
          <p>
            ⚡ Withdrawals processed securely by <b>Solnance</b>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label>Choose Wallet</label>
            <select
              value={selectedWallet}
              onChange={e => setSelectedWallet(e.target.value)}
            >
              <option value=''>-- Select Wallet --</option>
              {wallets.map(wallet => (
                <option key={wallet._id} value={wallet.symbol}>
                  {wallet.symbol} (Balance: ${wallet.balance})
                </option>
              ))}
            </select>
          </div>

          <div className='form-group'>
            <label>Amount</label>
            <input
              type='number'
              placeholder='Enter amount'
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className='form-group'>
            <label>Withdrawal Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)}>
              <option value=''>-- Select Method --</option>
              <option value='crypto'>Crypto Wallet</option>
              <option value='bank'>Bank Transfer</option>
              <option value='cashapp'>Cash App</option>
              <option value='applepay'>Apple Pay</option>
            </select>
          </div>

          {/* Conditional Fields */}
          {method === 'crypto' && (
            <div className='form-group'>
              <label>Crypto Wallet Address</label>
              <div className='copy-box'>
                <input
                  type='text'
                  placeholder='Enter your crypto wallet address'
                  value={cryptoAddress}
                  onChange={e => setCryptoAddress(e.target.value)}
                />
                {cryptoAddress && (
                  <Copy
                    size={18}
                    onClick={() =>
                      navigator.clipboard.writeText(cryptoAddress) &&
                      toast.info('Address copied!')
                    }
                  />
                )}
              </div>
            </div>
          )}

          {method === 'bank' && (
            <>
              <div className='form-group'>
                <label>Bank Name</label>
                <input
                  type='text'
                  value={bankInfo.bankName}
                  onChange={e =>
                    setBankInfo({ ...bankInfo, bankName: e.target.value })
                  }
                />
              </div>

              <div className='form-group'>
                <label>Account Number</label>
                <input
                  type='text'
                  value={bankInfo.accountNumber}
                  onChange={e =>
                    setBankInfo({ ...bankInfo, accountNumber: e.target.value })
                  }
                />
              </div>

              <div className='form-group'>
                <label>Account Name</label>
                <input
                  type='text'
                  value={bankInfo.accountName}
                  onChange={e =>
                    setBankInfo({ ...bankInfo, accountName: e.target.value })
                  }
                />
              </div>

              <div className='form-group'>
                <label>Country</label>
                <input
                  type='text'
                  value={bankInfo.bankCountry}
                  onChange={e =>
                    setBankInfo({ ...bankInfo, bankCountry: e.target.value })
                  }
                />
              </div>

              <div className='form-group'>
                <label>SWIFT Code (optional)</label>
                <input
                  type='text'
                  value={bankInfo.bankSwiftCode}
                  onChange={e =>
                    setBankInfo({ ...bankInfo, bankSwiftCode: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {method === 'cashapp' && (
            <div className='form-group'>
              <label>Cash App Tag</label>
              <input
                type='text'
                placeholder='$yourcashtag'
                value={cashAppTag}
                onChange={e => setCashAppTag(e.target.value)}
              />
            </div>
          )}

          {method === 'applepay' && (
            <div className='form-group'>
              <label>Apple Pay Number</label>
              <input
                type='text'
                placeholder='Phone number linked to Apple Pay'
                value={applePayNumber}
                onChange={e => setApplePayNumber(e.target.value)}
              />
            </div>
          )}

          <button type='submit' className='deposit-btn' disabled={submitting}>
            {submitting ? 'Submitting...' : 'Request Withdrawal'}
          </button>
        </form>
      </div>
    </div>
  )
}
