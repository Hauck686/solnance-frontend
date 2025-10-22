// File: pages/admin/email-settings.jsx
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

const providers = [
  { label: 'Gmail (SMTP)', value: 'gmail' },
  { label: 'Custom SMTP', value: 'smtp' },
  { label: 'POP3 Provider', value: 'pop' }
]

export default function EmailSettingsPage () {
  const [form, setForm] = useState({
    provider: 'gmail',
    host: '',
    port: '',
    email: '',
    password: ''
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
    setSnackbar({ open: true, message: 'Settings saved!', severity: 'success' })
    // Save to backend here
  }

  const handleSendTestEmail = () => {
    // Ideally call API to send a test email
    setSnackbar({ open: true, message: 'Test email sent!', severity: 'info' })
  }

  return (
    <>
      <Box
        sx={{ p: { xs: 2, md: 4 }, background: '#f5f7fb', minHeight: '100vh' }}
      >
        <Typography variant='h5' fontWeight={700} mb={3}>
          ✉️ Email Configuration
        </Typography>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label='Email Provider'
                name='provider'
                value={form.provider}
                onChange={handleChange}
                fullWidth
              >
                {providers.map(p => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='SMTP/POP Host'
                name='host'
                value={form.host}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Port'
                name='port'
                type='number'
                value={form.port}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Email Address'
                name='email'
                value={form.email}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Password'
                name='password'
                type='password'
                value={form.password}
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
                onClick={handleSendTestEmail}
              >
                Send Test Email
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
