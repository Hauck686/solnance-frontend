'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Box,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Button,
  Typography,
  Stack
} from '@mui/material'

const countries = ['Nigeria', 'Ghana', 'USA', 'UK', 'Germany']

export default function TransferConfigPage () {
  const [bankConfigs, setBankConfigs] = useState([])
  const [form, setForm] = useState({
    country: 'Nigeria',
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    swiftCode: '',
    iban: ''
  })

  // fetch existing configs
  useEffect(() => {
    let token = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken')
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/admin/getBantTransferdetails`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => setBankConfigs(res.data))
      .catch(err => console.error(err))
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/updateBankTransferdetails
`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // update state with saved config
      setBankConfigs(prev => {
        const filtered = prev.filter(b => b.country !== data.country)
        return [...filtered, data]
      })

      alert(`✅ Bank details for ${form.country} saved`)
    } catch (err) {
      console.error(err)
      alert('❌ Failed to save bank details')
    }
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
        <Typography variant='h5' fontWeight='bold' mb={4} textAlign='center'>
          🌍 Bank Transfer Setup
        </Typography>

        <Grid container spacing={4}>
          {/* Config Form */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant='subtitle1' fontWeight={600} mb={2}>
                Set Bank Transfer Details
              </Typography>

              <Stack spacing={2}>
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
                  label='Bank Name'
                  name='bankName'
                  value={form.bankName}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label='Account Name'
                  name='accountName'
                  value={form.accountName}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label='Account Number'
                  name='accountNumber'
                  value={form.accountNumber}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                {['USA', 'UK'].includes(form.country) && (
                  <TextField
                    label='Routing Number'
                    name='routingNumber'
                    value={form.routingNumber}
                    onChange={handleChange}
                    fullWidth
                  />
                )}
                {['UK', 'Germany'].includes(form.country) && (
                  <TextField
                    label='IBAN'
                    name='iban'
                    value={form.iban}
                    onChange={handleChange}
                    fullWidth
                  />
                )}
                {['UK', 'Germany', 'USA'].includes(form.country) && (
                  <TextField
                    label='SWIFT Code'
                    name='swiftCode'
                    value={form.swiftCode}
                    onChange={handleChange}
                    fullWidth
                  />
                )}

                <Button
                  variant='contained'
                  color='primary'
                  size='large'
                  fullWidth
                  onClick={handleSave}
                >
                  Save Transfer Details
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Preview Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant='subtitle1' fontWeight={600} mb={2}>
                Configured Bank Details
              </Typography>

              {bankConfigs.length === 0 && (
                <Typography color='text.secondary'>
                  No bank configs added yet.
                </Typography>
              )}

              <Stack spacing={2}>
                {bankConfigs.map(config => (
                  <Paper
                    key={config.country}
                    sx={{ p: 2, background: '#f1f1f1', borderRadius: 2 }}
                  >
                    <Typography fontWeight='bold'>{config.country}</Typography>
                    <Typography>🏦 {config.bankName}</Typography>
                    <Typography>👤 {config.accountName}</Typography>
                    <Typography>🔢 {config.accountNumber}</Typography>
                    {config.routingNumber && (
                      <Typography>
                        📬 Routing: {config.routingNumber}
                      </Typography>
                    )}
                    {config.iban && (
                      <Typography>🌐 IBAN: {config.iban}</Typography>
                    )}
                    {config.swiftCode && (
                      <Typography>✈️ SWIFT: {config.swiftCode}</Typography>
                    )}
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}
