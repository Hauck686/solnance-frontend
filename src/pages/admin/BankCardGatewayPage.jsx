'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Button,
  Switch,
  Stack,
  CircularProgress
} from '@mui/material'

import axios from 'axios'

const providers = ['Stripe', 'PayPal', 'Flutterwave', 'Paystack']
const countries = ['Nigeria', 'USA', 'UK', 'India', 'South Africa', 'Ghana']

export default function CardGatewaySetupPage () {
  const [gateways, setGateways] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    provider: 'Stripe',
    country: 'Nigeria',
    publicKey: '',
    secretKey: '',
    callbackUrl: '',
    isActive: true
  })

  // ✅ Fetch gateways from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        let token = null
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('authToken')
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/bankgateways
`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        setGateways(res.data)
      } catch (err) {
        console.error('Error fetching gateways', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // ✅ Toggle active state
  const handleToggle = async (id, index) => {
    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      const updated = {
        ...gateways[index],
        isActive: !gateways[index].isActive
      }
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/updatebankgateway/${id}`,
        updated,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      const newGateways = [...gateways]
      newGateways[index] = res.data
      setGateways(newGateways)
    } catch (err) {
      console.error('Error updating gateway', err)
    }
  }

  // ✅ Submit form
  const handleSubmit = async () => {
    const { publicKey, secretKey, callbackUrl } = form
    if (!publicKey || !secretKey || !callbackUrl) {
      alert('Please fill all required fields.')
      return
    }

    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/bankgateways
`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setGateways(prev => [res.data, ...prev])
      setForm({
        provider: 'Stripe',
        country: 'Nigeria',
        publicKey: '',
        secretKey: '',
        callbackUrl: '',
        isActive: true
      })
    } catch (err) {
      console.error('Error saving gateway', err)
    }
  }

  if (loading) {
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
    <>
      <Box
        sx={{
          px: { xs: 2, md: 6 },
          py: 4,
          background: '#f9f9f9',
          minHeight: '100vh'
        }}
      >
        <Typography variant='h5' fontWeight={700} textAlign='center' mb={4}>
          💳 Global Card Payment Gateway Setup
        </Typography>

        <Grid container spacing={4}>
          {/* Form */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant='subtitle1' fontWeight={600} mb={2}>
                Add Payment Gateway
              </Typography>

              <Stack spacing={2}>
                <TextField
                  select
                  label='Provider'
                  name='provider'
                  value={form.provider}
                  onChange={handleChange}
                  fullWidth
                >
                  {providers.map(p => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label='Country'
                  name='country'
                  value={form.country}
                  onChange={handleChange}
                  fullWidth
                >
                  {countries.map(c => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label='Public Key'
                  name='publicKey'
                  value={form.publicKey}
                  onChange={handleChange}
                  fullWidth
                />

                <TextField
                  label='Secret Key'
                  name='secretKey'
                  value={form.secretKey}
                  onChange={handleChange}
                  type='password'
                  fullWidth
                />

                <TextField
                  label='Callback URL'
                  name='callbackUrl'
                  value={form.callbackUrl}
                  onChange={handleChange}
                  fullWidth
                />

                <Button variant='contained' fullWidth onClick={handleSubmit}>
                  Save Gateway
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Gateway List */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant='subtitle1' fontWeight={600} mb={2}>
                Active Gateways
              </Typography>

              {gateways.length === 0 ? (
                <Typography color='text.secondary'>
                  No gateways configured yet.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {gateways.map((g, i) => (
                    <Paper key={g._id} sx={{ p: 2, borderRadius: 2 }}>
                      <Typography fontWeight={600}>
                        {g.provider} ({g.country})
                      </Typography>
                      <Typography variant='body2'>
                        🔑 Public Key: {g.publicKey}
                      </Typography>
                      <Typography variant='body2'>
                        🔒 Secret Key: ••••••••••••
                      </Typography>
                      <Typography variant='body2' mb={1}>
                        🔁 Callback: {g.callbackUrl}
                      </Typography>
                      <Stack direction='row' alignItems='center' spacing={1}>
                        <Typography variant='body2'>
                          {g.isActive ? 'Enabled' : 'Disabled'}
                        </Typography>
                        <Switch
                          checked={g.isActive}
                          onChange={() => handleToggle(g._id, i)}
                        />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}
