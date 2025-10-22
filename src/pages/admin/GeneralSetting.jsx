'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material'

import axios from 'axios'

// ✅ Default values (for empty DB case)
const defaultSettings = {
  smsVerification: false,
  emailVerification: false,
  twoFactorAuth: false,
  allowDeposits: false,
  allowWithdrawals: false,
  maintenanceMode: false,
  smsSenderName: '',
  emailSender: '',
  supportEmail: '',
  companyName: '',
  termsUrl: ''
}

export default function GeneralSetting () {
  const [settings, setSettings] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        let token = null
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('authToken')
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/settings`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (res.data && Object.keys(res.data).length > 0) {
          setSettings(res.data) // ✅ use DB values if exist
        } else {
          setSettings(defaultSettings) // ✅ fallback to defaults
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load settings')
        setSettings(defaultSettings) // ✅ still show form
      } finally {
        setFetching(false)
      }
    }
    fetchSettings()
  }, [])

  const handleToggle = field => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    //(settings)
    setLoading(true)
    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/settings`,
        settings,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setSettings(res.data)
      setSuccess('Settings saved successfully.')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      console.error(err)
      setError('Failed to save settings.')
      setTimeout(() => setError(''), 4000)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Show loader only while fetching
  if (fetching) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: '#f4f4f4', minHeight: '100vh' }}>
      <Container maxWidth='lg' sx={{ py: 6 }}>
        <Typography variant='h6' fontWeight='bold' mb={3}>
          General Application Settings
        </Typography>

        {success && <Alert severity='success'>{success}</Alert>}
        {error && <Alert severity='error'>{error}</Alert>}

        {/* 🔐 Security Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant='h6' gutterBottom>
            🔐 Security & Verification
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.smsVerification}
                onChange={() => handleToggle('smsVerification')}
              />
            }
            label='Enable SMS Verification'
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailVerification}
                onChange={() => handleToggle('emailVerification')}
              />
            }
            label='Enable Email Verification'
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.twoFactorAuth}
                onChange={() => handleToggle('twoFactorAuth')}
              />
            }
            label='Enable Two-Factor Authentication (2FA)'
          />
        </Paper>

        {/* 💬 Communication Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant='h6' gutterBottom>
            💬 Communication Settings
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label='SMS Sender Name'
                name='smsSenderName'
                fullWidth
                value={settings.smsSenderName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label='Email Sender Address'
                name='emailSender'
                fullWidth
                value={settings.emailSender}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label='Support Email'
                name='supportEmail'
                fullWidth
                value={settings.supportEmail}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* ⚙️ Permissions Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant='h6' gutterBottom>
            ⚙️ User Permissions
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.allowDeposits}
                onChange={() => handleToggle('allowDeposits')}
              />
            }
            label='Allow User Deposits'
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.allowWithdrawals}
                onChange={() => handleToggle('allowWithdrawals')}
              />
            }
            label='Allow User Withdrawals'
          />
        </Paper>

        {/* 🏢 Platform Info */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant='h6' gutterBottom>
            🏢 Platform Info
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label='Company Name'
                name='companyName'
                fullWidth
                value={settings.companyName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label='Terms & Conditions URL'
                name='termsUrl'
                fullWidth
                value={settings.termsUrl}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* 🚧 Maintenance Mode */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant='h6' gutterBottom>
            🚧 Maintenance Mode
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.maintenanceMode}
                onChange={() => handleToggle('maintenanceMode')}
              />
            }
            label='Enable Maintenance Mode (Disables user access)'
          />
        </Paper>

        {/* Save Button */}
        <Button variant='contained' fullWidth size='large' onClick={handleSave}>
          {loading ? 'Saving...' : 'Save All Settings'}
        </Button>
      </Container>
    </Box>
  )
}
