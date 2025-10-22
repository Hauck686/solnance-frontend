'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { uploadToCloudinary } from '../../context/uploadToCloudinary'
import { getVerifiedUserId } from '../../context/UnHashedUserId'
import { toast } from 'react-toastify'
import { Button } from '@mui/material'

const Popup = ({ message, type, onClose }) => (
  <div className='popup-overlay'>
    <div className={`popup-box ${type}`}>
      <div className='popup-title'>
        {type === 'success' ? '✅ Success' : '❌ Error'}
      </div>
      <div className='popup-message'>{message}</div>
      <button className='popup-close' onClick={onClose}>
        Close
      </button>
    </div>
  </div>
)

export default function LoanApplicationPage () {
  const [wallets, setWallets] = useState([])
  const [loans, setLoans] = useState([])
  const [selectedLoanId, setSelectedLoanId] = useState('')
  const [selectedWalletId, setSelectedWalletId] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [proof, setProof] = useState(null)
  const [userId, setUserId] = useState(null)
  const [token, setToken] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [popup, setPopup] = useState({ show: false, message: '', type: '' })

  // For plan tab selection (first 3 loans as tabs)
  const [activePlanTab, setActivePlanTab] = useState(0)

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const uid = await getVerifiedUserId()
        setUserId(uid)
        const tkn = localStorage.getItem('authToken')
        setToken(tkn)
        if (!uid || !tkn) return

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/${uid}`,
          { headers: { Authorization: `Bearer ${tkn}` } }
        )
        setWallets(res.data?.wallets || [])
      } catch (err) {
        toast.error('Failed to load wallets')
      }
    }
    fetchWallets()
  }, [])

  useEffect(() => {
    if (!token) return
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/loans/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setLoans(res.data.data || []))
      .catch(() => toast.error('Failed to load loans'))
  }, [token])

  // Update form when tab plan selected
  useEffect(() => {
    if (loans[activePlanTab]) setSelectedLoanId(loans[activePlanTab]._id)
  }, [activePlanTab, loans])

  const handleFileUpload = async () => {
    if (!proof) return null
    try {
      return await uploadToCloudinary(proof)
    } catch {
      setPopup({
        show: true,
        message: 'Failed to upload document',
        type: 'error'
      })
      return null
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const selectedWallet = wallets.find(w => w._id === selectedWalletId)
      const selectedLoan = loans.find(l => l._id === selectedLoanId)
      if (!selectedWallet || !selectedLoan) {
        toast.error('Please select a wallet and a loan plan')
        setIsSubmitting(false)
        return
      }
      if (
        loanAmount < selectedLoan.minAmount ||
        loanAmount > selectedLoan.maxAmount
      ) {
        toast.error(
          `Loan amount must be between $${selectedLoan.minAmount} and $${selectedLoan.maxAmount}`
        )
        setIsSubmitting(false)
        return
      }
      const maxLoan = selectedWallet.balance * 0.6
      if (loanAmount > maxLoan) {
        toast.error('Loan amount exceeds your eligible wallet collateral.')
        setIsSubmitting(false)
        return
      }
      const documentUrl = await handleFileUpload()
      if (!documentUrl) {
        toast.error('Please upload a valid document before submitting.')
        setIsSubmitting(false)
        return
      }
      const data = {
        userId,
        walletId: selectedWalletId,
        amount: Number(loanAmount),
        term: selectedLoan.term,
        loanId: selectedLoan._id,
        documentUrl,
        coin: selectedWallet.symbol
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/applyforloan`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Loan application submitted successfully!')
      setLoanAmount('')
      setSelectedLoanId('')
      setSelectedWalletId('')
      setProof(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply for loan')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get current selected loan plan
  const selectedLoan = loans.find(l => l._id === selectedLoanId)
  // Compute summary
  let summary = null
  if (selectedLoan && loanAmount) {
    const rate = selectedLoan.interestRate / 100
    const amount = Number(loanAmount || 0)
    const interest = amount * rate
    const totalRepayment = amount + interest
    let periods = 1
    if (selectedLoan.repaymentFrequency === 'Weekly') {
      periods =
        selectedLoan.durationType === 'months'
          ? selectedLoan.duration * 4
          : Math.ceil(selectedLoan.duration / 7)
    } else if (selectedLoan.repaymentFrequency === 'Bi-weekly') {
      periods =
        selectedLoan.durationType === 'months'
          ? selectedLoan.duration * 2
          : Math.ceil(selectedLoan.duration / 14)
    } else if (selectedLoan.repaymentFrequency === 'Monthly') {
      periods =
        selectedLoan.durationType === 'months'
          ? selectedLoan.duration
          : selectedLoan.duration / 30
    }
    const installment = totalRepayment / (periods || 1)
    summary = { amount, interest, totalRepayment, periods, installment }
  }

  return (
    <div className='loanapp-root'>
      <div className='loanapp-card'>
        <div className='loanapp-form-column'>
          <div className='loanapp-title'>Borrow</div>
          {/* Plan tabs */}
          <div className='loanapp-tabs'>
            {loans.slice(0, 3).map((loan, idx) => (
              <div
                key={loan._id}
                className={`loanapp-tab${
                  activePlanTab === idx ? ' active' : ''
                }`}
                onClick={() => {
                  setActivePlanTab(idx)
                  setSelectedLoanId(loan._id)
                }}
              >
                <div className='tab-term'>{loan.term || loan.name}</div>
                <div className='tab-rate'>
                  {loan.interestRate?.toFixed(2)}% Min
                </div>
              </div>
            ))}
          </div>
          <form className='loanapp-form' onSubmit={handleSubmit}>
            <div className='loanapp-field-group'>
              <label className='loanapp-label'>Loan amount</label>
              <div className='loanapp-input-group'>
                <input
                  className='loanapp-input'
                  type='number'
                  placeholder={`Min. ${
                    selectedLoan ? selectedLoan.minAmount : '1000'
                  }`}
                  value={loanAmount}
                  onChange={e => setLoanAmount(e.target.value)}
                  min={selectedLoan?.minAmount || 1}
                  max={selectedLoan?.maxAmount}
                />
                <button
                  type='button'
                  className='loanapp-max-btn'
                  onClick={() => {
                    const maxLoan =
                      wallets.find(w => w._id === selectedWalletId)?.balance *
                      0.6
                    if (maxLoan) setLoanAmount(Math.floor(maxLoan))
                  }}
                >
                  Max
                </button>
                <select
                  className='loanapp-selectcoin'
                  value={selectedWalletId}
                  onChange={e => setSelectedWalletId(e.target.value)}
                >
                  <option value=''>Select</option>
                  {wallets.map(wallet => (
                    <option key={wallet._id} value={wallet._id}>
                      {wallet.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Interest Rate (read only but styled) */}
            <div className='loanapp-field-group'>
              <label className='loanapp-label'>
                Interest rate (customizable)
              </label>
              <div className='loanapp-input-group'>
                <input
                  className='loanapp-input loanapp-readonly'
                  value={selectedLoan ? selectedLoan.interestRate : ''}
                  readOnly
                />
                <span className='loanapp-input-suffix'>%</span>
              </div>
            </div>
            {/* Collateral */}
            <div className='loanapp-field-group'>
              <label className='loanapp-label'>Collateral amount</label>
              <div className='loanapp-input-group'>
                <select
                  className='loanapp-select'
                  value={selectedWalletId}
                  onChange={e => setSelectedWalletId(e.target.value)}
                >
                  <option value=''>Add Collateral</option>
                  {wallets.map(wallet => (
                    <option key={wallet._id} value={wallet._id}>
                      {wallet.symbol} - $
                      {Number(wallet.balance).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Upload Proof */}
            <div className='loanapp-field-group'>
              <label className='loanapp-label'>
                Upload Verified ID (eg Passport)
              </label>
              <div className='loanapp-input-group'>
                <input
                  className='loanapp-upload'
                  type='file'
                  accept='image/*,application/pdf'
                  onChange={e => setProof(e.target.files[0])}
                />
                {proof && (
                  <span className='loanapp-filename'>{proof.name}</span>
                )}
              </div>
            </div>
            {/* Repayment method */}
            <div className='loanapp-field-group'>
              <label className='loanapp-label'>Repayment method</label>
              <div className='loanapp-repay-row'>
                <button
                  type='button'
                  className='loanapp-btn loanapp-btn-active'
                >
                  Auto-Repay
                </button>
                <button type='button' className='loanapp-btn'>
                  Convert to flexible rate
                </button>
              </div>
            </div>
            {/* TOS */}
            <div className='loanapp-tos-row'>
              <input type='checkbox' required id='loan-tos' />
              <label htmlFor='loan-tos'>
                I have read and agree to{' '}
                <a href='#' className='loanapp-link'>
                  Fixed Rate Loan Terms
                </a>
              </label>
            </div>
            <Button
              type='submit'
              className={`loanapp-borrow-btn${isSubmitting ? ' loading' : ''}`}
              disabled={isSubmitting}
              fullWidth
              sx={{ mt: 2 }}
            >
              {isSubmitting ? 'Submitting…' : 'Borrow'}
            </Button>
          </form>
        </div>
        {/* Right summary */}
        <div className='loanapp-summary-column'>
          <div className='loanapp-summary-card'>
            <div className='loanapp-summary-title'>Summary</div>
            <div className='loanapp-summary-row'>
              <span>Remaining Limit</span>
              <span>16,000,000 USDT | 100.00%</span>
            </div>
            <div className='loanapp-summary-row'>
              <span>Est. Interest Amount</span>
              <span>--</span>
            </div>
            <div className='loanapp-summary-row'>
              <span>Market Avail | Pending</span>
              <span>--</span>
            </div>
            <div className='loanapp-summary-row'>
              <span>LTV After Borrowing</span>
              <span>--</span>
            </div>
            <hr style={{ border: '1px solid #232323' }} />
            <div className='loanapp-summary-section'>
              <b>Summary</b>
              {summary && (
                <div style={{ marginTop: 6 }}>
                  <div>
                    Loan Amount: <b>${summary.amount.toLocaleString()}</b>
                  </div>
                  <div>
                    Interest: <b>${summary.interest.toFixed(2)}</b>
                  </div>
                  <div>
                    Total Repayment: <b>${summary.totalRepayment.toFixed(2)}</b>
                  </div>
                  <div>
                    Installment: <b>${summary.installment.toFixed(2)}</b>{' '}
                    <span style={{ color: '#aaa' }}>
                      x {summary.periods} ({selectedLoan.repaymentFrequency})
                    </span>
                  </div>
                  <div>
                    Duration:{' '}
                    <b>
                      {selectedLoan.duration} {selectedLoan.durationType}
                    </b>
                  </div>
                </div>
              )}
            </div>
            <hr style={{ border: '1px solid #232323' }} />
            <div className='loanapp-faq-section'>
              <div className='loanapp-faq-title'>FAQ</div>
              {[
                'Can crypto loans be used for other strategies such as arbitrage?',
                'How can crypto loans be used?',
                'What is Crypto Loans?',
                'Which rates apply to loans? How is interest calculated?',
                'What happens if your loan is liquidated?'
              ].map((q, idx) => (
                <div key={q} className='loanapp-faq-q'>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {popup.show && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ show: false, message: '', type: '' })}
        />
      )}
    </div>
  )
}
