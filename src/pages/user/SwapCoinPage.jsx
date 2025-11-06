import { useEffect, useState } from 'react'
import axios from 'axios'
import { getVerifiedUserId } from '../../context/UnHashedUserId'
import SwapVertIcon from '@mui/icons-material/SwapVert'

const symbolToId = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  SOL: 'solana',
  TRX: 'tron',
  MATIC: 'polygon'
}

export default function SwapCoinPage () {
  const [wallets, setWallets] = useState([])
  const [coinRates, setCoinRates] = useState({})
  const [availableCoins, setAvailableCoins] = useState([])
  const [fromCoin, setFromCoin] = useState('BTC')
  const [toCoin, setToCoin] = useState('SOL')
  const [amount, setAmount] = useState('')
  const [receiveAmount, setReceiveAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swapping, setSwapping] = useState(false)

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  // ✅ Fetch user wallets & live coin rates
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await getVerifiedUserId()
        if (!userId || !token) {
          window.location.href = '/auth/Login'
          return
        }

        // Get user wallets
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const userWallets = res.data.wallets || []

        // Normalize symbols and network names
        const normalizedWallets = userWallets.map(w => ({
          ...w,
          symbol: w.symbol?.toUpperCase().trim(),
          network: w.network?.trim() || ''
        }))

        setWallets(normalizedWallets)

        const walletSymbols = normalizedWallets
          .map(w => w.symbol)
          .filter(s => symbolToId[s])

        setAvailableCoins(walletSymbols)

        if (walletSymbols.length > 0) {
          const ids = walletSymbols.map(s => symbolToId[s]).join(',')
          const coinRes = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price`,
            { params: { ids, vs_currencies: 'usd' } }
          )

          const rates = {}
          walletSymbols.forEach(symbol => {
            const id = symbolToId[symbol]
            rates[symbol] = coinRes.data[id]?.usd || 0
          })
          setCoinRates(rates)
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  // ✅ Recalculate conversion when inputs or rates change
  useEffect(() => {
    const fromRate = coinRates[fromCoin]
    const toRate = coinRates[toCoin]

    if (fromRate && toRate && amount && fromCoin !== toCoin) {
      const usdValue = parseFloat(amount) * fromRate
      const toCoinAmount = usdValue / toRate
      setReceiveAmount(toCoinAmount)
    } else {
      setReceiveAmount(0)
    }
  }, [amount, fromCoin, toCoin, coinRates])

  // ✅ Helper: get balance for a symbol
  const getBalance = symbol => {
    const wallet = wallets.find(w => w.symbol === symbol)
    return wallet ? parseFloat(wallet.balance || 0) : 0
  }

  const handleSetMax = () => {
    setAmount(getBalance(fromCoin).toString())
  }

  const handleSwitchCoins = () => {
    setFromCoin(toCoin)
    setToCoin(fromCoin)
    setAmount('')
    setReceiveAmount(0)
  }

  // ✅ Handle swap
  const handleSwap = async () => {
    const tokenAmount = parseFloat(amount)
    if (!tokenAmount || tokenAmount <= 0) return alert('Enter a valid amount')
    if (fromCoin === toCoin) return alert('Cannot swap the same coin')

    const fromWallet = wallets.find(w => w.symbol === fromCoin)
    if (!fromWallet || tokenAmount > fromWallet.balance)
      return alert('Insufficient balance')

    try {
      setSwapping(true)
      const userId = await getVerifiedUserId()

      // Make swap request
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/swap`,
        {
          userId,
          fromCoin,
          toCoin,
          amount: tokenAmount,
          receiveAmount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      alert(
        `✅ Swapped ${tokenAmount} ${fromCoin} → ${receiveAmount.toFixed(
          8
        )} ${toCoin}`
      )

      // ✅ Refresh wallet balances after swap
      const updated = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const refreshedWallets = updated.data.wallets.map(w => ({
        ...w,
        symbol: w.symbol?.toUpperCase().trim(),
        network: w.network?.trim() || ''
      }))

      setWallets(refreshedWallets)
      setAmount('')
      setReceiveAmount(0)
    } catch (err) {
      console.error('Swap failed:', err)
      alert('❌ Swap failed. Try again later.')
    } finally {
      setSwapping(false)
    }
  }

  if (loading) {
    return (
      <div className='swap-page__loader'>
        <div className='spinner'></div>
      </div>
    )
  }

  return (
    <div className='swap-page'>
      <div className='swap-account-row'>
        <span className='swap-account-label'>Account</span>
        <span className='swap-account-value'>Funding Account ▼</span>
      </div>

      {/* FROM CARD */}
      <div className='swap-card'>
        <div className='swap-card__row'>
          <div className='swap-card__icon'>
            <img
              src={`/coins/${fromCoin}.svg`}
              alt={fromCoin}
              onError={e => (e.target.style.display = 'none')}
            />
          </div>
          <select
            value={fromCoin}
            onChange={e => setFromCoin(e.target.value)}
            disabled={swapping}
          >
            {availableCoins.map(symbol => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
          <div className='swap-card__right'>
            <span className='swap-card__balance'>
              Available: {getBalance(fromCoin)}
            </span>
            <button
              className='swap-card__max'
              onClick={handleSetMax}
              disabled={swapping}
            >
              Max
            </button>
          </div>
        </div>
        <input
          className='swap-card__amount'
          type='number'
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder='0.00'
          disabled={swapping}
        />
      </div>

      <div className='swap-icon-wrap' onClick={handleSwitchCoins}>
        <div className='swap-icon'>
          <SwapVertIcon fontSize='large' />
        </div>
      </div>

      {/* TO CARD */}
      <div className='swap-card'>
        <div className='swap-card__row'>
          <div className='swap-card__icon'>
            <img
              src={`/coins/${toCoin}.svg`}
              alt={toCoin}
              onError={e => (e.target.style.display = 'none')}
            />
          </div>
          <select
            value={toCoin}
            onChange={e => setToCoin(e.target.value)}
            disabled={swapping}
          >
            {availableCoins.map(symbol => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
        </div>
        <input
          className='swap-card__amount'
          disabled
          value={receiveAmount > 0 ? receiveAmount.toFixed(8) : ''}
          placeholder='0.00'
        />
      </div>

      {/* RATES & DETAILS */}
      <div className='swap-rates'>
        1 {fromCoin} ≈{' '}
        {coinRates[fromCoin] && coinRates[toCoin]
          ? (coinRates[fromCoin] / coinRates[toCoin]).toFixed(8)
          : '--'}{' '}
        {toCoin}
      </div>

      <div className='swap-details-row'>
        <span>Fee</span>
        <span className='swap-fee'>0 fee</span>
      </div>

      <div className='swap-details-row'>
        <span>Receive</span>
        <span className='swap-receive'>
          {receiveAmount > 0 ? receiveAmount.toFixed(8) : '0.00'} {toCoin}
        </span>
      </div>

      <button
        className='swap-quote-btn'
        onClick={handleSwap}
        disabled={!amount || fromCoin === toCoin || swapping}
      >
        {swapping ? 'Swapping...' : 'Swap'}
      </button>
    </div>
  )
}
