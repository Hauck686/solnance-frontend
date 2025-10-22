import React, { useEffect, useState } from 'react'
import { FaCopy, FaUserPlus } from 'react-icons/fa'

import axios from 'axios'
import { getVerifiedUserId } from '../../context/UnHashedUserId'

export default function ReferralPage () {
  const [referralCode, setReferralCode] = useState('')
  const [user, setUser] = useState(null)
  const [referralLink, setReferralLink] = useState('')
  const [referrals, setReferrals] = useState([])
  const [copied, setCopied] = useState(false)
  const [totalEarnings, setTotalEarnings] = useState(0)

  useEffect(() => {
    const fetchReferrals = async () => {
      const userId = await getVerifiedUserId()
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      try {
        // 1. Get user and refCode
        const userRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        const fetchedUser = userRes.data.user
        setUser(fetchedUser)

        const code = fetchedUser.refCode
        setReferralCode(code)
        setReferralLink(
          `${process.env.NEXT_PUBLIC_SITE_URL}/auth/RegistrationPage/?ref=${code}`
        )

        // 2. Get referrals
        const referralsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/referrals/${code}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        setReferrals(referralsRes.data.referrals || [])
        setTotalEarnings(referralsRes.data.totalEarnings || 0)
      } catch (err) {
        console.error('Referral fetch error:', err)
      }
    }

    fetchReferrals()
  }, [])

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        // Modern API
        await navigator.clipboard.writeText(referralLink)
      } else {
        // Fallback: create a temporary textarea
        const textArea = document.createElement('textarea')
        textArea.value = referralLink
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  return (
    <>
      <div className='referral-page'>
        <div className='referral-card'>
          <h2>
            <FaUserPlus /> Invite & Earn
          </h2>
          <p className='referral-desc'>Earn rewards for each referral</p>

          <div className='referral-link-row'>
            <input
              type='text'
              readOnly
              value={referralLink}
              className='referral-link-input'
            />
            <button className='copy-btn' onClick={handleCopy}>
              <FaCopy />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className='referral-tip'>
            You earn a bonus of{' '}
            <span className='reward-amount'>${user?.referralBonus || 10} </span>
            from referrals.
          </div>
        </div>

        <div className='referral-list-card'>
          <h3>Referred Users</h3>
          <div className='referral-list-header'>
            <span>Name</span>
            <span>Date Joined</span>
            <span>Earnings</span>
          </div>

          <div className='referral-list'>
            {referrals.length === 0 ? (
              <div className='no-referrals'>
                No referrals yet. Start sharing your link!
              </div>
            ) : (
              referrals.map((ref, idx) => (
                <div className='referral-list-item' key={ref.email + idx}>
                  <span>
                    <span className='ref-icon'>{ref.firstname?.[0]}</span>
                    <span className='ref-name'>{ref.firstname}</span>
                  </span>
                  <span>{new Date(ref.joined).toLocaleDateString()}</span>
                  <span className='ref-earning'>
                    ${ref.earnings.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
