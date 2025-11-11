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
  const [receiveUSD, setReceiveUSD] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swapping, setSwapping] = useState(false)

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  // ✅ Fetch wallets & coin prices
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await getVerifiedUserId()
        if (!userId || !token) {
          window.location.href = '/auth/Login'
          return
        }

        // User wallets
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const userWallets = res.data.wallets || []
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

  // ✅ Recalculate receive amount (USD display)
  useEffect(() => {
    if (amount && fromCoin !== toCoin) {
      const usdAmount = parseFloat(amount)
      setReceiveUSD(usdAmount) // Show as USD equivalent
    } else {
      setReceiveUSD(0)
    }
  }, [amount, fromCoin, toCoin, coinRates])

  // ✅ Get wallet balance
  const getBalance = symbol => {
    const wallet = wallets.find(w => w.symbol === symbol)
    return wallet ? parseFloat(wallet.balance || 0) : 0
  }

  const handleSetMax = () => setAmount(getBalance(fromCoin).toString())

  const handleSwitchCoins = () => {
    setFromCoin(toCoin)
    setToCoin(fromCoin)
    setAmount('')
    setReceiveUSD(0)
  }

  // ✅ Swap
  const handleSwap = async () => {
    const usdAmount = parseFloat(amount)
    if (!usdAmount || usdAmount <= 0) return alert('Enter a valid amount')
    if (fromCoin === toCoin) return alert('Cannot swap the same coin')

    const fromWallet = wallets.find(w => w.symbol === fromCoin)
    if (!fromWallet || usdAmount > fromWallet.balance)
      return alert('Insufficient USD balance')

    try {
      setSwapping(true)
      const userId = await getVerifiedUserId()

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/swap`,
        {
          userId,
          fromCoin,
          toCoin,
          amountUSD: parseFloat(amount), // ✅ Make sure this key name matches backend
          receiveAmount: parseFloat(receiveUSD)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      alert(`✅ Swapped $${usdAmount.toFixed(2)} from ${fromCoin} → ${toCoin}`)

      // Refresh balances
      const updated = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const refreshed = updated.data.wallets.map(w => ({
        ...w,
        symbol: w.symbol?.toUpperCase().trim(),
        network: w.network?.trim() || ''
      }))
      setWallets(refreshed)
      setAmount('')
      setReceiveUSD(0)
    } catch (err) {
      console.error('Swap failed:', err)
      alert('❌ Swap failed. Try again later.')
    } finally {
      setSwapping(false)
    }
  }

  if (loading)
    return (
      <div className='swap-page__loader'>
        <div className='spinner'></div>
      </div>
    )

  return (
    <div className='swap-page'>
      <div className='swap-account-row'>
        <span className='swap-account-label'>Account</span>
        <span className='swap-account-value'>Funding Account ▼</span>
      </div>

      {/* FROM */}
      <div className='swap-card'>
        <div className='swap-card__row'>
          <div className='swap-card__icon'>
            <img src={`/${fromCoin}.png`} alt={fromCoin} />
          </div>
          <select
            value={fromCoin}
            onChange={e => setFromCoin(e.target.value)}
            disabled={swapping}
          >
            {availableCoins.map(symbol => (
              <option key={symbol}>{symbol}</option>
            ))}
          </select>
          <div className='swap-card__right'>
            <span className='swap-card__balance'>
              Available: ${getBalance(fromCoin).toFixed(2)}
            </span>
            <button onClick={handleSetMax} disabled={swapping}>
              Max
            </button>
          </div>
        </div>
        <input
          className='swap-card__amount'
          type='number'
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder='Enter USD amount'
        />
      </div>

      <div className='swap-icon-wrap' onClick={handleSwitchCoins}>
        <SwapVertIcon fontSize='large' />
      </div>

      {/* TO */}
      <div className='swap-card'>
        <div className='swap-card__row'>
          <div className='swap-card__icon'>
            <img src={`/${toCoin}.png`} alt={toCoin} />
          </div>
          <select
            value={toCoin}
            onChange={e => setToCoin(e.target.value)}
            disabled={swapping}
          >
            {availableCoins.map(symbol => (
              <option key={symbol}>{symbol}</option>
            ))}
          </select>
        </div>
        <input
          className='swap-card__amount'
          disabled
          value={receiveUSD > 0 ? `$${receiveUSD.toFixed(2)}` : ''}
          placeholder='$0.00'
        />
      </div>

      {/* RATES */}
      <div className='swap-rates'>
        1 {toCoin} ≈ ${coinRates[toCoin] ? coinRates[toCoin].toFixed(2) : '--'}
      </div>

      {/* DETAILS */}
      <div className='swap-details-row'>
        <span>Fee</span>
        <span className='swap-fee'>0 fee</span>
      </div>

      <div className='swap-details-row'>
        <span>Receive</span>
        <span className='swap-receive'>
          {receiveUSD > 0 ? `$${receiveUSD.toFixed(2)}` : '$0.00'}
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
