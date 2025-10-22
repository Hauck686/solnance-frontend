'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useChainId
} from 'wagmi'
import { parseUnits } from 'viem'
import { toast } from 'react-toastify'
import { getVerifiedUserId } from '../../context/UnHashedUserId'

// Chain map (replace with only what you support)
const chainMap = {
  1: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  56: { name: 'BNB Chain', symbol: 'BNB', decimals: 18 },
  137: { name: 'Polygon', symbol: 'MATIC', decimals: 18 },
  43114: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  42161: { name: 'Arbitrum', symbol: 'ETH', decimals: 18 },
  10: { name: 'Optimism', symbol: 'ETH', decimals: 18 },
  250: { name: 'Fantom', symbol: 'FTM', decimals: 18 },
  8453: { name: 'Base', symbol: 'ETH', decimals: 18 }
}

export default function UserAmount () {
  const [user, setUser] = useState(null)
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')

  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const { sendTransaction, data: txData, error: txError } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txData?.hash })

  // Platform wallets (set in .env)
  const platformWallets = {
    1: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ETH,
    56: process.env.NEXT_PUBLIC_PLATFORM_WALLET_BSC,
    137: process.env.NEXT_PUBLIC_PLATFORM_WALLET_POLYGON,
    43114: process.env.NEXT_PUBLIC_PLATFORM_WALLET_AVALANCHE,
    42161: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ARBITRUM,
    10: process.env.NEXT_PUBLIC_PLATFORM_WALLET_OPTIMISM,
    250: process.env.NEXT_PUBLIC_PLATFORM_WALLET_FANTOM,
    8453: process.env.NEXT_PUBLIC_PLATFORM_WALLET_BASE
  }

  const getPlatformWallet = () => platformWallets[chainId] || null
  const chainInfo = chainMap[chainId] || { symbol: 'ETH', decimals: 18 }

  useEffect(() => {
    const fetchUserData = async () => {
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
        //(res.data)
        const fetchedUser = res.data.user
        const wallets = res.data.wallets || []

        setUser(fetchedUser)

        // Sum wallet balances
        const walletSum = wallets.reduce(
          (acc, wallet) => acc + Number(wallet.balance || 0),
          0
        )

        // Add referralBonus + userBalance
        const total =
          walletSum +
          Number(fetchedUser?.referralBonus || 0) +
          Number(fetchedUser?.userBalance || 0)

        setTotalBalance(total)
      } catch (err) {
        console.error(err)
      }
    }
    fetchUserData()
  }, [])

  // Handle deposit
  const handleDeposit = async () => {
    if (!isConnected) return toast.error('Please connect your wallet first')
    if (!amount || Number(amount) <= 0)
      return toast.error('Enter a valid amount')

    try {
      setLoading(true)
      const platformWallet = getPlatformWallet()
      if (!platformWallet) {
        setLoading(false)
        return toast.error('Unsupported chain')
      }

      sendTransaction({
        to: platformWallet,
        value: parseUnits(amount, chainInfo.decimals)
      })
    } catch (err) {
      console.error(err)
      toast.error('Transaction failed')
      setLoading(false)
    }
  }

  // Show tx status
  useEffect(() => {
    if (txData?.hash) {
      toast.info('Transaction sent, awaiting confirmation...')
    }
  }, [txData])

  // Save confirmed tx
  useEffect(() => {
    const saveDeposit = async () => {
      if (!isConfirmed || !txData?.hash) return

      try {
        let token = null
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('authToken')
        }

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions/deposit`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          {
            userId: localStorage.getItem('userId'),
            walletId: address,
            method: 'wallet',
            amount,
            coinRate: 1,
            convertedAmount: amount,
            walletsymbol: chainInfo.symbol,
            receipt: txData.hash,
            status: 'pending'
          }
        )

        toast.success('Deposit recorded! Awaiting admin approval.')
        setAmount('')
      } catch (err) {
        console.error(err)
        toast.error('Error saving deposit to backend')
      } finally {
        setLoading(false)
      }
    }

    saveDeposit()
  }, [isConfirmed, txData, address, amount, chainInfo])

  // Handle rejected tx
  useEffect(() => {
    if (txError) {
      console.error(txError)
      toast.error('Transaction rejected or failed')
      setLoading(false)
    }
  }, [txError])

  return (
    <section className='user-card'>
      {/* Header */}
      <div className='user-header'>
        <div className='user-left'>
          <img
            src='https://cdn-icons-png.flaticon.com/128/1144/1144760.png'
            alt='Profile'
            className='user-img'
          />
          <div>
            <h3>Hi, {user?.lastname || 'Investor'}</h3>
            <p className='sub-text'>
              {address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : 'No wallet connected'}
            </p>
          </div>
        </div>
        <div className='user-right'>
          <ConnectButton chainStatus='icon' showBalance={false} />
        </div>
      </div>

      {/* Balance */}
      <div className='balance-section'>
        <span className='balance-label'>Total Assets</span>
        <h2 className='balance-amount'>
          $
          {totalBalance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </h2>
      </div>

      {/* Deposit */}
      {isConnected && (
        <div className='deposit-box'>
          <input
            type='number'
            placeholder={`Amount in ${chainInfo.symbol}`}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className='deposit-input'
          />
          <button
            onClick={handleDeposit}
            disabled={loading || isConfirming}
            className='deposit-btn'
          >
            {loading || isConfirming
              ? 'Processing...'
              : `Deposit ${chainInfo.symbol}`}
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div className='user-tabs'>
        <Link href='/user/DepositPage' className='tab'>
          Deposit
        </Link>
        <Link href='/user/InvestmentPlan' className='tab'>
          Invest
        </Link>
      </div>
    </section>
  )
}
