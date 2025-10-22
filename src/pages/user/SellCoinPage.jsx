import React, { useState, useEffect } from 'react'

const WALLET_TOKENS = [
  {
    symbol: 'BTC',
    balance: 0.125,
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
  },
  {
    symbol: 'ETH',
    balance: 2.5,
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  },
  { symbol: 'LTC', balance: 10, address: 'LcHK2vUozbV8agUWyDuV8W8XvYtWbdApF3' },
  { symbol: 'XRP', balance: 500, address: 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh' }
]

const PAYOUT_METHODS = ['Bank Transfer', 'PayPal', 'Internal Wallet']

export default function SellCoinPage () {
  const [step, setStep] = useState(1)
  const [token, setToken] = useState(WALLET_TOKENS[0].symbol)
  const [balance, setBalance] = useState(WALLET_TOKENS[0].balance)
  const [address, setAddress] = useState(WALLET_TOKENS[0].address)
  const [amount, setAmount] = useState('')
  const [payout, setPayout] = useState(PAYOUT_METHODS[0])
  const [fee, setFee] = useState(0)
  const [net, setNet] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [txId, setTxId] = useState('')

  useEffect(() => {
    const sel = WALLET_TOKENS.find(t => t.symbol === token)
    setBalance(sel?.balance || 0)
    setAddress(sel?.address || '')
    setAmount('')
    setFee(0)
    setNet(0)
  }, [token])

  useEffect(() => {
    const val = parseFloat(amount) || 0
    const f = parseFloat((val * 0.01).toFixed(6))
    const n = parseFloat((val - f).toFixed(6))
    setFee(f)
    setNet(n)
  }, [amount])

  const next = () => setStep(s => Math.min(s + 1, 4))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const confirmSell = () => {
    setProcessing(true)
    setTimeout(() => {
      const mockId = Math.random().toString(36).substr(2, 10).toUpperCase()
      setTxId(mockId)
      setProcessing(false)
      setStep(4)
    }, 2000)
  }

  return (
    <>
      <div className='sell-container'>
        <div className='sell-panel'>
          <h1 className='sell-title'>Sell Cryptocurrency</h1>

          <div className='steps'>
            {['Token', 'Amount', 'Review', 'Receipt'].map((label, i) => (
              <div key={i} className={`step ${step === i + 1 ? 'active' : ''}`}>
                {i + 1}. {label}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className='form-section'>
              <label>Select Token</label>
              <div className='coin-tabs'>
                {WALLET_TOKENS.map(t => (
                  <button
                    key={t.symbol}
                    className={`tab ${token === t.symbol ? 'active' : ''}`}
                    onClick={() => setToken(t.symbol)}
                  >
                    {t.symbol}
                  </button>
                ))}
              </div>
              <p className='info-note'>Wallet: {address}</p>
              <button className='btn primary' onClick={next}>
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className='form-section'>
              <label>Amount to Sell</label>
              <input
                type='number'
                placeholder='0.00'
                value={amount}
                onChange={e => setAmount(e.target.value)}
                max={balance}
              />
              <div className='info-row'>
                <span>Fee (1%):</span>
                <span>{fee}</span>
              </div>
              <div className='info-row'>
                <span>Net Proceeds:</span>
                <span>{net}</span>
              </div>
              <label>Payout Method</label>
              <select value={payout} onChange={e => setPayout(e.target.value)}>
                {PAYOUT_METHODS.map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <div className='actions'>
                <button className='btn secondary' onClick={back}>
                  Back
                </button>
                <button
                  className='btn primary'
                  onClick={next}
                  disabled={!amount || parseFloat(amount) <= 0}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className='form-section'>
              <h3>Review Your Sale</h3>
              <p>
                <strong>
                  {amount} {token}
                </strong>
              </p>
              <p>Fee: {fee}</p>
              <p>Net: {net}</p>
              <p>Payout: {payout}</p>
              <div className='actions'>
                <button
                  className='btn secondary'
                  onClick={back}
                  disabled={processing}
                >
                  Back
                </button>
                <button
                  className='btn primary'
                  onClick={confirmSell}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Confirm Sale'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className='receipt-section'>
              <h3>Transaction Complete</h3>
              <p>
                Tx ID: <strong>{txId}</strong>
              </p>
              <p>
                Sold:{' '}
                <strong>
                  {amount} {token}
                </strong>
              </p>
              <p>Fee: {fee}</p>
              <p>Received: {net}</p>
              <p>Payout: {payout}</p>
              <button className='btn success' onClick={() => setStep(1)}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
