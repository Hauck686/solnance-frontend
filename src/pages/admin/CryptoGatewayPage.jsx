'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Grid
} from '@mui/material'

const gatewayOptions = [
  { value: 'coinbase', label: 'Coinbase Commerce' },
  { value: 'binance', label: 'Binance Pay' },
  { value: 'custom', label: 'Custom Wallet' }
]

export default function CryptoGatewayPage () {
  const [gateway, setGateway] = useState('coinbase')
  const [config, setConfig] = useState({
    apiKey: '',
    secret: '',
    walletAddress: ''
  })

  const handleChange = e => {
    setConfig({ ...config, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    //({ gateway, ...config })
    alert('Crypto Gateway settings saved!')
  }

  return (
    <>
      <Box className='cryptoGateway'>
        <Typography variant='h5' className='title'>
          Crypto Payment Gateway Settings
        </Typography>

        <Paper className='form'>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label='Select Gateway'
                value={gateway}
                onChange={e => setGateway(e.target.value)}
              >
                {gatewayOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {(gateway === 'coinbase' || gateway === 'binance') && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label='API Key'
                    name='apiKey'
                    value={config.apiKey}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label='API Secret'
                    name='secret'
                    value={config.secret}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </>
            )}

            {gateway === 'custom' && (
              <Grid item xs={12}>
                <TextField
                  label='Wallet Address'
                  name='walletAddress'
                  value={config.walletAddress}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                variant='contained'
                color='primary'
                onClick={handleSubmit}
              >
                Save Settings
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </>
  )
}
