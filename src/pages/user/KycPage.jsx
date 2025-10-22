'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { FaIdCard } from 'react-icons/fa'

import { uploadToCloudinary } from '../../context/uploadToCloudinary'
import { getVerifiedUserId } from '../../context/UnHashedUserId'

// ---------------- STEP 1 ----------------
const Step1 = ({ onNext }) => (
  <div className='kyc-step'>
    <div className='kyc__icon-container'>
      <FaIdCard size={60} color='#6f5fbf' />
    </div>
    <h2 className='kyc__title'>Let's verify your identity</h2>
    <p className='kyc__subtitle'>
      Please submit the following documents to verify your profile.
    </p>
    <div className='kyc__options'>
      <button className='kyc__option' onClick={onNext}>
        Start KYC Verification
      </button>
    </div>
    <p className='kyc__footer-link'>Why is this needed?</p>
  </div>
)

// ---------------- STEP 2 ----------------
const Step2 = ({ onNext, onBack, setKycData }) => {
  const [preview, setPreview] = useState(null)
  const [docFile, setDocFile] = useState(null)

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file) {
      setDocFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
      setKycData(prev => ({ ...prev, idDocument: file }))
    }
  }

  return (
    <div className='kyc-step'>
      <h2 className='kyc__title'>Upload proof of your identity</h2>
      <p className='kyc__subtitle'>Please submit a document below</p>
      <div className='kyc__options'>
        <label className='kyc__option'>
          Upload ID Card
          <input
            type='file'
            hidden
            accept='image/*,application/pdf'
            onChange={handleFileChange}
          />
        </label>
        <label className='kyc__option'>
          Upload Passport
          <input
            type='file'
            hidden
            accept='image/*,application/pdf'
            onChange={handleFileChange}
          />
        </label>
        <label className='kyc__option'>
          Upload Driving Licence
          <input
            type='file'
            hidden
            accept='image/*,application/pdf'
            onChange={handleFileChange}
          />
        </label>
      </div>
      {preview && (
        <div className='kyc__preview'>
          <p>Preview:</p>
          <img
            src={preview}
            alt='Document Preview'
            className='kyc__preview-img'
            style={{ maxWidth: '200px' }}
          />
        </div>
      )}
      <div className='kyc__buttons'>
        <button onClick={onBack}>Back</button>
        <button onClick={onNext} disabled={!docFile}>
          Continue
        </button>
      </div>
    </div>
  )
}

// ---------------- STEP 3 ----------------
// ---------------- STEP 3 ----------------
const Step3 = ({ onBack, onSubmit, kycData, setKycData }) => {
  const [form, setForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    dateOfBirth: '',
    nextOfKin: '',
    maidenName: '',
    nationality: '',
    phone: '',
    email: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setKycData(prev => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.street) newErrors.street = 'Street address required'
    if (!form.city) newErrors.city = 'City required'
    if (!form.state) newErrors.state = 'State/Province required'
    if (!form.zipCode) newErrors.zipCode = 'Zip/Postal code required'
    if (!form.country) newErrors.country = 'Country required'
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of birth required'
    if (!form.nextOfKin) newErrors.nextOfKin = 'Next of kin required'
    if (!form.maidenName) newErrors.maidenName = "Mother's maiden name required"
    if (!form.nationality) newErrors.nationality = 'Nationality required'
    if (!form.phone) newErrors.phone = 'Phone number required'
    if (!form.email) newErrors.email = 'Email required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (validate()) {
      // format full address string
      const fullAddress = `${form.street}, ${form.city}, ${form.state}, ${form.zipCode}, ${form.country}`
      setKycData(prev => ({ ...prev, address: fullAddress }))
      onSubmit()
    }
  }

  return (
    <div className='kyc-step'>
      <h2 className='kyc__title'>Personal Details</h2>
      <form className='kyc__form' onSubmit={handleSubmit} autoComplete='off'>
        <label>
          Street Address
          <input
            type='text'
            name='street'
            value={form.street}
            onChange={handleChange}
            required
          />
          {errors.street && <span className='kyc__error'>{errors.street}</span>}
        </label>
        <label>
          City
          <input
            type='text'
            name='city'
            value={form.city}
            onChange={handleChange}
            required
          />
          {errors.city && <span className='kyc__error'>{errors.city}</span>}
        </label>
        <label>
          State / Province
          <input
            type='text'
            name='state'
            value={form.state}
            onChange={handleChange}
            required
          />
          {errors.state && <span className='kyc__error'>{errors.state}</span>}
        </label>
        <label>
          Zip / Postal Code
          <input
            type='text'
            name='zipCode'
            value={form.zipCode}
            onChange={handleChange}
            required
          />
          {errors.zipCode && (
            <span className='kyc__error'>{errors.zipCode}</span>
          )}
        </label>
        <label>
          Country
          <input
            type='text'
            name='country'
            value={form.country}
            onChange={handleChange}
            required
          />
          {errors.country && (
            <span className='kyc__error'>{errors.country}</span>
          )}
        </label>

        <label>
          Date of Birth
          <input
            type='date'
            name='dateOfBirth'
            value={form.dateOfBirth}
            onChange={handleChange}
            required
          />
          {errors.dateOfBirth && (
            <span className='kyc__error'>{errors.dateOfBirth}</span>
          )}
        </label>

        <label>
          Next of Kin
          <input
            type='text'
            name='nextOfKin'
            value={form.nextOfKin}
            onChange={handleChange}
            required
          />
          {errors.nextOfKin && (
            <span className='kyc__error'>{errors.nextOfKin}</span>
          )}
        </label>

        <label>
          Mother's Maiden Name
          <input
            type='text'
            name='maidenName'
            value={form.maidenName}
            onChange={handleChange}
            required
          />
          {errors.maidenName && (
            <span className='kyc__error'>{errors.maidenName}</span>
          )}
        </label>

        <label>
          Nationality
          <input
            type='text'
            name='nationality'
            value={form.nationality}
            onChange={handleChange}
            required
          />
          {errors.nationality && (
            <span className='kyc__error'>{errors.nationality}</span>
          )}
        </label>

        <label>
          Next Of Kin Phone Number
          <input
            type='tel'
            name='phone'
            value={form.phone}
            onChange={handleChange}
            required
          />
          {errors.phone && <span className='kyc__error'>{errors.phone}</span>}
        </label>

        <label>
          Next Of Kin Email Address
          <input
            type='email'
            name='email'
            value={form.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className='kyc__error'>{errors.email}</span>}
        </label>

        <div className='kyc__buttons'>
          <button type='button' onClick={onBack}>
            Back
          </button>
          <button type='submit'>Submit KYC</button>
        </div>
      </form>
    </div>
  )
}

// ---------------- STEP 4 ----------------
const Step4 = ({ status }) => (
  <div className='kyc-step'>
    {status === 'pending' && (
      <>
        <h2 className='kyc__title'>✅ Submitted!</h2>
        <p className='kyc__subtitle'>Your KYC info is being reviewed...</p>
        <div className='kyc__confirmation-icon'>⏳</div>
      </>
    )}
    {status === 'approved' && (
      <>
        <h2 className='kyc__title'>🎉 All Set!</h2>
        <p className='kyc__subtitle'>
          Your KYC was verified. You may now invest securely.
        </p>
        <div className='kyc__confirmation-icon'>✅</div>
      </>
    )}
    {status === 'rejected' && (
      <>
        <h2 className='kyc__title'>❌ KYC Rejected</h2>
        <p className='kyc__subtitle'>
          Your KYC was rejected. Please try again.
        </p>
        <div className='kyc__confirmation-icon'>🚫</div>
      </>
    )}
  </div>
)

// ---------------- DETAILS ----------------
const KycDetails = ({ kyc }) => (
  <div className='kyc-step'>
    <h2 className='kyc__title'>KYC Details</h2>
    <p className='kyc__subtitle'>Your KYC has been submitted.</p>
    <div className='kyc__details'>
      <p>
        <strong>Status:</strong> {kyc.status}
      </p>
      <p>
        <strong>Address:</strong> {kyc.address}
      </p>
      <p>
        <strong>Date of Birth:</strong> {kyc.dateOfBirth}
      </p>
      <p>
        <strong>Next of Kin:</strong> {kyc.nextOfKin}
      </p>
      <p>
        <strong>Mother's Maiden Name:</strong> {kyc.maidenName}
      </p>
      <p>
        <strong>Nationality:</strong> {kyc.nationality}
      </p>
      <p>
        <strong>Next Of Kin Phone:</strong> {kyc.phone}
      </p>
      <p>
        <strong>Next Of Kin Email:</strong> {kyc.email}
      </p>
      <p>
        <strong>ID Document:</strong>
        <br />
        {kyc.idDocumentUrl && (
          <a href={kyc.idDocumentUrl} target='_blank' rel='noopener noreferrer'>
            View Document
          </a>
        )}
      </p>
      <p>
        <strong>Submitted At:</strong>{' '}
        {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleString() : ''}
      </p>
    </div>
  </div>
)

// ---------------- MAIN PAGE ----------------
export default function KycPage () {
  const [step, setStep] = useState(1)
  const [kycData, setKycData] = useState({})
  const [kycStatus, setKycStatus] = useState(null)
  const [userId, setUserId] = useState(null)
  const [token, setToken] = useState(null)

  const [existingKyc, setExistingKyc] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUserKyc = async () => {
    const id = await getVerifiedUserId()
    setUserId(id)
    let token = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken')
    }
    setToken(token)

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/kyc/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      if (res.data.success && res.data.kyc) {
        setExistingKyc(res.data.kyc)
        setKycStatus(res.data.kyc.status)
      } else {
        setExistingKyc(null)
        setKycStatus(null)
      }
    } catch (err) {
      setExistingKyc(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserKyc()
  }, [])

  const handleKycSubmit = async () => {
    try {
      let idDocumentUrl = ''
      if (kycData.idDocument) {
        idDocumentUrl = await uploadToCloudinary(kycData.idDocument)
      }

      const submitRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/kyc/submit`,
        {
          userId,
          idDocumentUrl,
          address: kycData.address,
          dateOfBirth: kycData.dateOfBirth,
          nextOfKin: kycData.nextOfKin,
          maidenName: kycData.maidenName,
          nationality: kycData.nationality,
          phone: kycData.phone,
          email: kycData.email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (submitRes.data.success) {
        await fetchUserKyc() // ✅ refresh state
        setStep(4)
      } else {
        alert('KYC submission failed')
      }
    } catch (err) {
      alert('KYC submission error')
    }
  }

  // ---------------- UI LOGIC ----------------
  if (loading) {
    return (
      <div className='kyc-wrapper'>
        <div className='kyc-container'>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Existing KYC
  if (existingKyc) {
    if (existingKyc.status === 'unverified') {
      return (
        <div className='kyc-wrapper'>
          <div className='kyc-container'>
            {step === 1 && <Step1 onNext={() => setStep(2)} />}
            {step === 2 && (
              <Step2
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
                setKycData={setKycData}
              />
            )}
            {step === 3 && (
              <Step3
                onBack={() => setStep(2)}
                setKycData={setKycData}
                kycData={kycData}
                onSubmit={handleKycSubmit}
              />
            )}
            {step === 4 && <Step4 status={kycStatus} />}
          </div>
        </div>
      )
    }

    return (
      <div className='kyc-wrapper'>
        <div className='kyc-container'>
          <KycDetails kyc={existingKyc} />
        </div>
      </div>
    )
  }

  // No KYC yet
  return (
    <div className='kyc-wrapper'>
      <div className='kyc-container'>
        {step === 1 && <Step1 onNext={() => setStep(2)} />}
        {step === 2 && (
          <Step2
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
            setKycData={setKycData}
          />
        )}
        {step === 3 && (
          <Step3
            onBack={() => setStep(2)}
            setKycData={setKycData}
            kycData={kycData}
            onSubmit={handleKycSubmit}
          />
        )}
        {step === 4 && <Step4 status={kycStatus} />}
      </div>
    </div>
  )
}
