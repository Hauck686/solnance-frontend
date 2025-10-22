'use client'

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { getVerifiedUserId } from '../../context/UnHashedUserId'

function DepositModal ({ isOpen, onClose, onSubmit, selectedCoin, prices }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setAmount('')
    setError('')
  }, [isOpen, selectedCoin])

  const handleDeposit = async () => {
    setError('')
    const num = parseFloat(amount)
    if (!num || num <= 0) {
      setError('Enter a valid deposit amount')
      return
    }
    setLoading(true)
    try {
      await onSubmit(num)
      setAmount('')
    } catch {
      setError('Failed to create deposit')
    }
    setLoading(false)
  }

  if (!isOpen || !selectedCoin) return null

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <button className='close-modal' onClick={onClose}>
          ×
        </button>
        <h3>Deposit {selectedCoin.symbol}</h3>
        <label>
          Amount Of ({selectedCoin.symbol})
          <input
            type='number'
            step='any'
            min='0'
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder='e.g. 0.01'
            disabled={loading}
          />
        </label>
        {selectedCoin && prices[selectedCoin.symbol] && (
          <div className='converted'>
            Total(USDT) ≈ $
            {(
              parseFloat(amount) * prices[selectedCoin.symbol] || 0
            ).toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
            USD
          </div>
        )}
        {error && <div className='modal-error'>{error}</div>}
        <button onClick={handleDeposit} disabled={loading}>
          {loading ? 'Processing...' : 'Confirm Deposit'}
        </button>
      </div>
    </div>
  )
}

export default function CoinPriceWidget () {
  const [wallets, setWallets] = useState([])
  const [prices, setPrices] = useState({})
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depositSuccess, setDepositSuccess] = useState(null)

  // Fetch user wallets from your backend
  useEffect(() => {
    const fetchWallets = async () => {
      const userId = await getVerifiedUserId()
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        setWallets(res.data.wallets || [])
      } catch (err) {
        console.error('Failed to fetch wallets:', err.message)
      }
    }

    fetchWallets()
  }, [])

  // Fetch crypto prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=usd'
        )
        if (!res.ok) throw new Error('API response not ok')
        const data = await res.json()
        setPrices({
          BTC: data.bitcoin.usd,
          ETH: data.ethereum.usd,
          USDT: data.tether.usd,
          sol: data.solana.usd || 0,
          BNB: data.binancecoin?.usd || 0
        })
      } catch (err) {
        console.error('Price fetch failed:', err.message)
      }
    }
    fetchPrices()
    const interval = setInterval(fetchPrices, 10000) // refresh every 10s
    return () => clearInterval(interval)
  }, [])

  const openDepositModal = () => setShowDepositModal(true)
  const closeDepositModal = () => setShowDepositModal(false)

  const handleDepositSubmit = async amount => {
    if (!selectedCoin) return
    setDepositSuccess(null)

    const payload = {
      userId: selectedCoin.userId,
      walletId: selectedCoin._id,
      method: 'crypto',
      amount: amount * (prices[selectedCoin.symbol] || 0),
      coinRate: prices[selectedCoin.symbol] || 0,
      convertedAmount: amount * (prices[selectedCoin.symbol] || 0),
      walletsymbol: selectedCoin.symbol,
      receipt: 'deposit_init'
    }
    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/deposit`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setDepositSuccess('Deposit created! Check your transactions.')
      closeDepositModal()
      showDepositModal(false)
    } catch (err) {
      console.error(err)
      showDepositModal(false)
      setDepositSuccess('Deposit creation failed')
    }
  }

  const copyToClipboardAndPromptDeposit = async () => {
    if (!selectedCoin) return
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(selectedCoin.walletAddress)
      } else {
        // fallback for unsupported browsers
        const textarea = document.createElement('textarea')
        textarea.value = selectedCoin.walletAddress
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      openDepositModal()
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  return (
    <div className='coin-widget'>
      <h3>Click on a coin pair to see details & deposit</h3>

      <div className='coin-grid'>
        {wallets.map(wallet => (
          <div
            key={wallet._id}
            className='coin-card'
            onClick={() => setSelectedCoin(wallet)}
          >
            <div className='left'>
              <span className='symbol'>{wallet.symbol.toUpperCase()}</span>
              <span className='name'>/ USDT</span>
            </div>
            <div className='right'>
              <span className='price'>
                ${prices[wallet.symbol]?.toLocaleString() ?? '...'}
              </span>
              <span className='tag'>${wallet.balance.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {depositSuccess && (
        <div className='deposit-success'>
          {depositSuccess}
          <button onClick={() => setDepositSuccess(null)}>Dismiss</button>
        </div>
      )}

      {selectedCoin && (
        <div className='wallet-popup'>
          <div className='popup-content'>
            <div className='wallet-balance'>
              <p>Available {selectedCoin.symbol}</p>
              <span>
                ≈ $
                {(
                  selectedCoin.balance * (prices[selectedCoin.symbol] || 0)
                ).toLocaleString()}
              </span>
            </div>

            <div className='wallet-stats'>
              <div>
                <p>Available assets</p>
                <h4>
                  {selectedCoin.balance.toLocaleString()} {selectedCoin.symbol}
                </h4>
              </div>
              <div>
                <p>Frozen assets</p>
                <h4>0.00000000 {selectedCoin.symbol}</h4>
              </div>
            </div>

            <div className='tabs'>
              <button className='active' onClick={openDepositModal}>
                Deposit
              </button>
              <Link href='/user/WithdrawalPage'>
                <button className='active'>Withdraw</button>
              </Link>
              <Link href='/user/InvestmentPlan'>
                <button className='active'>Invest</button>
              </Link>
            </div>

            <div className='wallet-address-section'>
              <h5>{selectedCoin.symbol} Deposit Address</h5>
              <img
                src={`https://i.postimg.cc/FHjM3T4q/Whats-App-Image-2025-07-25-at-18-03-06-e7de4220.jpg`}
                alt='QR Code'
                className='qr-code'
              />
              <p className='wallet-address'>{selectedCoin.walletAddress}</p>
              <button onClick={copyToClipboardAndPromptDeposit}>
                {copied ? 'Copied!' : 'Copy address & Deposit'}
              </button>
              <div className='tips'>
                <p>• Only deposit {selectedCoin.symbol} to this address.</p>
              </div>
            </div>

            <button className='close' onClick={() => setSelectedCoin(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      <DepositModal
        isOpen={showDepositModal}
        onClose={closeDepositModal}
        onSubmit={handleDepositSubmit}
        selectedCoin={selectedCoin}
        prices={prices}
      />
    </div>
  )
}
