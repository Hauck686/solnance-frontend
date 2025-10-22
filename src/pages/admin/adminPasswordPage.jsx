'use client'

import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  Divider
} from '@mui/material'

export default function AdminProfilePage () {
  const [form, setForm] = useState({
    username: 'adminuser',
    email: 'admin@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (
      !form.username ||
      !form.email ||
      !form.currentPassword ||
      !form.newPassword ||
      !form.confirmPassword
    ) {
      return setError('All fields are required.')
    }

    if (form.newPassword !== form.confirmPassword) {
      return setError('New passwords do not match.')
    }

    // Simulate backend update
    //('Updated profile:', form)
    setSuccess('Profile updated successfully.')

    // Reset password fields only
    setForm(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }))
  }

  return (
    <Box sx={{ bgcolor: '#f4f4f4', minHeight: '100vh' }}>
      <Container maxWidth='lg' sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant='h5' fontWeight='bold' gutterBottom>
            Admin Profile Settings
          </Typography>

          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity='success' sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Username'
                  name='username'
                  fullWidth
                  value={form.username}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Email'
                  name='email'
                  type='email'
                  fullWidth
                  value={form.email}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>Change Password</Divider>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label='Current Password'
                  name='currentPassword'
                  type='password'
                  fullWidth
                  value={form.currentPassword}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='New Password'
                  name='newPassword'
                  type='password'
                  fullWidth
                  value={form.newPassword}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Confirm New Password'
                  name='confirmPassword'
                  type='password'
                  fullWidth
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Button type='submit' variant='contained' fullWidth>
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}
