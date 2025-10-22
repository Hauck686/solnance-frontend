'use client'
import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../Header'

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,binancecoin,xrp,dogecoin&vs_currencies=usd&include_24hr_change=true'

function useLivePrices (intervalMs = 10000) {
  const [prices, setPrices] = useState({
    btc: null,
    eth: null,
    sol: null,
    ada: null,
    bnb: null,
    xrp: null,
    doge: null,
    fetchedAt: null,
    error: null
  })

  useEffect(() => {
    let mounted = true

    async function fetchPrices () {
      try {
        const res = await fetch(COINGECKO_URL)
        const json = await res.json()
        if (!mounted) return

        setPrices({
          btc: {
            usd: json.bitcoin?.usd ?? null,
            change24h: json.bitcoin?.usd_24h_change ?? null
          },
          eth: {
            usd: json.ethereum?.usd ?? null,
            change24h: json.ethereum?.usd_24h_change ?? null
          },
          sol: {
            usd: json.solana?.usd ?? null,
            change24h: json.solana?.usd_24h_change ?? null
          },
          ada: {
            usd: json.cardano?.usd ?? null,
            change24h: json.cardano?.usd_24h_change ?? null
          },
          bnb: {
            usd: json.binancecoin?.usd ?? null,
            change24h: json.binancecoin?.usd_24h_change ?? null
          },
          xrp: {
            usd: json.xrp?.usd ?? null,
            change24h: json.xrp?.usd_24h_change ?? null
          },
          doge: {
            usd: json.dogecoin?.usd ?? null,
            change24h: json.dogecoin?.usd_24h_change ?? null
          },
          fetchedAt: Date.now(),
          error: null
        })
      } catch (err) {
        if (!mounted) return
        setPrices(prev => ({ ...prev, error: err.message }))
      }
    }

    fetchPrices()
    const t = setInterval(fetchPrices, intervalMs)
    return () => {
      mounted = false
      clearInterval(t)
    }
  }, [intervalMs])

  return prices
}

export default function AdvancedCryptoHero () {
  const prices = useLivePrices(15000)
  const [account, setAccount] = useState(null)
  const [network, setNetwork] = useState(null)
  const [connected, setConnected] = useState(false)

  // MetaMask connect (simple)
  async function connectWallet () {
    try {
      if (!window.ethereum) {
        alert('MetaMask not found. Install MetaMask or use a Web3 wallet.')
        return
      }
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      setAccount(accounts[0])
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      setNetwork(chainId)
      setConnected(true)
      // basic listener
      window.ethereum.on &&
        window.ethereum.on('accountsChanged', accts => {
          setAccount(accts[0] || null)
          setConnected(!!accts.length)
        })
      window.ethereum.on &&
        window.ethereum.on('chainChanged', chain => setNetwork(chain))
    } catch (err) {
      console.error('Wallet connect error', err)
    }
  }

  function disconnectWallet () {
    // For MetaMask there's no programmatic disconnect — we simply clear state
    setConnected(false)
    setAccount(null)
    setNetwork(null)
  }

  // animated counters helper (simple)
  function AnimatedNumber ({
    value,
    decimals = 0,
    prefix = '',
    className = ''
  }) {
    const [display, setDisplay] = useState(0)
    useEffect(() => {
      let raf = null
      const start = performance.now()
      const from = display
      const to = Number(value) || 0
      const duration = 700
      function step (t) {
        const d = Math.min(1, (t - start) / duration)
        const eased = 1 - Math.pow(1 - d, 3)
        const cur = from + (to - from) * eased
        setDisplay(cur)
        if (d < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
      return () => cancelAnimationFrame(raf)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])
    return (
      <span className={className}>
        {prefix}
        {Number(display).toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        })}
      </span>
    )
  }

  return (
    <div className='root'>
      {/* particles canvas */}

      <video autoPlay loop muted playsInline className='bg-video'>
        <source
          src='https://cdn.pixabay.com/video/2025/06/27/288182_large.mp4'
          type='video/mp4'
        />
      </video>
      {/* Header nav */}
      <Header />
      {/* hero content */}
      <main className='hero'>
        <section className='left'>
          <motion.h1
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className='title'
          >
            Solnance
            {/* <br /> */}
            {/* <span className='gradient'>Crypto Platform</span> */}
          </motion.h1>
          <motion.p
            className='lead'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Trade, stake, and manage your portfolio — <strong>securely</strong>{' '}
            and lightning fast. Built with zero trust on-chain integrations and
            privacy-first architecture.
          </motion.p>

          <motion.form
            className='earlyaccessform'
            onSubmit={e => e.preventDefault()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <input
              aria-label='email'
              type='email'
              placeholder='Enter email for early access'
            />
            <button className='cta'>Join Early Access</button>
          </motion.form>

          <motion.div
            className='featureGrid'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className='feature'>
              <div className='fIcon'>🔒</div>
              <div>
                <div className='fTitle'>On-Chain Security</div>
                <div className='fDesc'>Multi-sig & hardware support.</div>
              </div>
            </div>
            <div className='feature'>
              <div className='fIcon'>⚡</div>
              <div>
                <div className='fTitle'>Immediate Settlement</div>
                <div className='fDesc'>Layer-2 support & MEV protection.</div>
              </div>
            </div>
            <div className='feature'>
              <div className='fIcon'>🌐</div>
              <div>
                <div className='fTitle'>Cross-Chain</div>
                <div className='fDesc'>Bridges with fraud proofs.</div>
              </div>
            </div>
          </motion.div>
          <motion.div
            className='featureGrid'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className='feature'>
              <div className='fIcon'>🔒</div>
              <div>
                <div className='fTitle'>Profitable Trading Bot</div>
                <div className='fDesc'>Multi-sig & hardware support.</div>
              </div>
            </div>
            <div className='feature'>
              <div className='fIcon'>⚡</div>
              <div>
                <div className='fTitle'>Investment</div>
                <div className='fDesc'>Layer-2 support & MEV protection.</div>
              </div>
            </div>
            <div className='feature'>
              <div className='fIcon'>🌐</div>
              <div>
                <div className='fTitle'>Crypto Loans</div>
                <div className='fDesc'>Bridges with fraud proofs.</div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className='right'>
          <motion.div
            className='card'
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div className='cardHeader'>
              <div>
                <div className='cardTitle'>Portfolio Overview</div>
                <div className='cardSub'>
                  Real-time balances & account health
                </div>
              </div>
              <div className='cardKPI'>
                <AnimatedNumber
                  value={7488223}
                  decimals={0}
                  className='kpiNum'
                  prefix=''
                />
                <div className='kpiLabel'>Users</div>
              </div>
            </div>

            <div className='liveChart'>
              {/* placeholder animated mini chart: CSS gradient + moving overlay */}
              <div className='miniChart' aria-hidden>
                <div className='miniChartShimmer' />
              </div>

              <div className='marketRow'>
                <div>
                  <div className='sym'>BTC / USDT</div>
                  <div className='priceWrap'>
                    <AnimatedNumber
                      value={prices.btc?.usd ?? 67800}
                      decimals={0}
                      prefix='$'
                      className='priceBig'
                    />
                    <small
                      className='pct'
                      style={{
                        color:
                          (prices.btc?.change24h ?? 0) >= 0
                            ? '#16c784'
                            : '#ff6b6b'
                      }}
                    >
                      {(prices.btc?.change24h ?? 0).toFixed(2)}%
                    </small>
                  </div>
                </div>
                <div>
                  <a href='/auth/Login' className='ghost'>
                    Trade
                  </a>
                </div>
              </div>

              <div className='marketRow'>
                <div>
                  <div className='sym'>ETH / USDT</div>
                  <div className='priceWrap'>
                    <AnimatedNumber
                      value={prices.eth?.usd ?? 1700}
                      decimals={0}
                      prefix='$'
                      className='priceBig'
                    />
                    <small
                      className='pct'
                      style={{
                        color:
                          (prices.eth?.change24h ?? 0) >= 0
                            ? '#16c784'
                            : '#ff6b6b'
                      }}
                    >
                      {(prices.eth?.change24h ?? 0).toFixed(2)}%
                    </small>
                  </div>
                </div>
                <div>
                  <a href='/auth/Login' className='ghost'>
                    Trade
                  </a>
                </div>
              </div>
              <div className='marketRow'>
                <div>
                  <div className='sym'>SOL / USDT</div>
                  <div className='priceWrap'>
                    <AnimatedNumber
                      value={prices.sol?.usd ?? 1700}
                      decimals={0}
                      prefix='$'
                      className='priceBig'
                    />
                    <small
                      className='pct'
                      style={{
                        color:
                          (prices.sol?.change24h ?? 0) >= 0
                            ? '#16c784'
                            : '#ff6b6b'
                      }}
                    >
                      {(prices.sol?.change24h ?? 0).toFixed(2)}%
                    </small>
                  </div>
                </div>
                <div>
                  <a href='/auth/Login' className='ghost'>
                    Trade
                  </a>
                </div>
              </div>
              <div className='marketRow'>
                <div>
                  <div className='sym'>ADA / USDT</div>
                  <div className='priceWrap'>
                    <AnimatedNumber
                      value={prices.ada?.usd ?? 1700}
                      decimals={0}
                      prefix='$'
                      className='priceBig'
                    />
                    <small
                      className='pct'
                      style={{
                        color:
                          (prices.ada?.change24h ?? 0) >= 0
                            ? '#16c784'
                            : '#ff6b6b'
                      }}
                    >
                      {(prices.ada?.change24h ?? 0).toFixed(2)}%
                    </small>
                  </div>
                </div>
                <div>
                  <a href='/auth/Login' className='ghost'>
                    Trade
                  </a>
                </div>
              </div>
              <div className='marketRow'>
                <div>
                  <div className='sym'>BNB/ USDT</div>
                  <div className='priceWrap'>
                    <AnimatedNumber
                      value={prices.bnb?.usd ?? 1700}
                      decimals={0}
                      prefix='$'
                      className='priceBig'
                    />
                    <small
                      className='pct'
                      style={{
                        color:
                          (prices.bnb?.change24h ?? 0) >= 0
                            ? '#16c784'
                            : '#ff6b6b'
                      }}
                    >
                      {(prices.bnb?.change24h ?? 0).toFixed(2)}%
                    </small>
                  </div>
                </div>
                <div>
                  <a href='/auth/Login' className='ghost'>
                    Trade
                  </a>
                </div>
              </div>
              <div className='marketRow'>
                <div>
                  <div className='sym'>THXM / USDT</div>
                  <div className='priceWrap'>
                    <AnimatedNumber
                      value={prices.xrp?.usd ?? 1.05}
                      decimals={0}
                      prefix='$'
                      className='priceBig'
                    />
                    <small
                      className='pct'
                      style={{
                        color:
                          (prices.xrp?.change24h ?? 0) >= 0
                            ? '#16c784'
                            : '#ff6b6b'
                      }}
                    >
                      {(prices.doge?.change24h ?? 0).toFixed(2)}%
                    </small>
                  </div>
                </div>
                <div>
                  <a href='/auth/Login' className='ghost'>
                    Trade
                  </a>
                </div>
              </div>
            </div>

            <div className='cardFooter'>
              <div className='smallText'>
                Connect your wallet to see balances
              </div>
              <div className='footerActions'>
                <button className='primary' onClick={connectWallet}>
                  {connected ? 'Open Wallet' : 'Connect '}
                </button>
                <button
                  className='ghost'
                  onClick={() => window.open('/learn', '_blank')}
                >
                  Learn
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      {/* optional CTAs / footer micro */}
    </div>
  )
}
