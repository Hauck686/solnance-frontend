// File: pages/admin/sms-settings.jsx
'use client'

import React, { useState } from 'react'

import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert
} from '@mui/material'

const smsProviders = [
  { label: 'Twilio', value: 'twilio' },
  { label: 'Nexmo', value: 'nexmo' },
  { label: 'Custom Gateway', value: 'custom' }
]

export default function SmsSettingsPage () {
  const [form, setForm] = useState({
    provider: 'twilio',
    apiKey: '',
    apiSecret: '',
    senderId: '',
    phoneNumber: ''
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    setSnackbar({
      open: true,
      message: 'SMS settings saved!',
      severity: 'success'
    })
    // Send form to backend
  }

  const handleSendTestSMS = () => {
    // Ideally send a test SMS using API
    setSnackbar({ open: true, message: 'Test SMS sent!', severity: 'info' })
  }

  return (
    <>
      <Box
        sx={{ p: { xs: 2, md: 4 }, background: '#f5f7fb', minHeight: '100vh' }}
      >
        <Typography variant='h5' fontWeight={700} mb={3}>
          📲 SMS Gateway Configuration
        </Typography>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label='SMS Provider'
                name='provider'
                value={form.provider}
                onChange={handleChange}
                fullWidth
              >
                {smsProviders.map(p => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='API Key'
                name='apiKey'
                value={form.apiKey}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='API Secret'
                name='apiSecret'
                type='password'
                value={form.apiSecret}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Sender ID'
                name='senderId'
                value={form.senderId}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Test Phone Number'
                name='phoneNumber'
                value={form.phoneNumber}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              display='flex'
              alignItems='center'
              justifyContent='space-between'
            >
              <Button
                variant='outlined'
                color='secondary'
                onClick={handleSendTestSMS}
              >
                Send Test SMS
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button variant='contained' onClick={handleSave}>
                Save Settings
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant='filled'>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}
