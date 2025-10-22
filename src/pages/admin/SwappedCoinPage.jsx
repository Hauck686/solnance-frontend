'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  IconButton,
  Divider
} from '@mui/material'
import { Delete } from '@mui/icons-material'

export default function SwapSettings () {
  const [coins, setCoins] = useState([
    { symbol: 'ETH', name: 'Ethereum', rate: 3000 },
    { symbol: 'BNB', name: 'Binance Coin', rate: 200 },
    { symbol: 'USDT', name: 'Tether', rate: 1 },
    { symbol: 'BTC', name: 'Bitcoin', rate: 60000 }
  ])
  const [fee, setFee] = useState(0)
  const [newCoin, setNewCoin] = useState({ name: '', symbol: '', rate: '' })

  const updateRate = (index, newRate) => {
    const updated = [...coins]
    updated[index].rate = parseFloat(newRate)
    setCoins(updated)
  }

  const handleAddCoin = () => {
    if (!newCoin.name || !newCoin.symbol || !newCoin.rate) return
    setCoins([...coins, { ...newCoin, rate: parseFloat(newCoin.rate) }])
    setNewCoin({ name: '', symbol: '', rate: '' })
  }

  const handleDelete = index => {
    const updated = [...coins]
    updated.splice(index, 1)
    setCoins(updated)
  }

  const handleSave = () => {
    alert('Swap settings saved successfully.')
  }

  return (
    <>
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          backgroundColor: '#f9fafe',
          minHeight: '100vh'
        }}
      >
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom fontWeight={500}>
                Manage Coin swap Rates
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {coins.map((coin, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 2,
                    background: '#f4f6f8'
                  }}
                >
                  <TextField
                    label={`${coin.name} (${coin.symbol}) Rate (USD)`}
                    type='number'
                    fullWidth
                    value={coin.rate}
                    onChange={e => updateRate(index, e.target.value)}
                    sx={{ mr: 2 }}
                  />
                  <IconButton onClick={() => handleDelete(index)} color='error'>
                    <Delete />
                  </IconButton>
                </Paper>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom fontWeight={500} mt={4}>
                Add New Coin
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label='Coin Name'
                value={newCoin.name}
                onChange={e => setNewCoin({ ...newCoin, name: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label='Symbol'
                value={newCoin.symbol}
                onChange={e =>
                  setNewCoin({
                    ...newCoin,
                    symbol: e.target.value.toUpperCase()
                  })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label='Rate (USD)'
                type='number'
                value={newCoin.rate}
                onChange={e => setNewCoin({ ...newCoin, rate: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Button onClick={handleAddCoin} variant='outlined' size='large'>
                Add Coin
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom fontWeight={500} mt={4}>
                Global Swap Fee
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label='Swap Fee (%)'
                type='number'
                fullWidth
                value={fee}
                onChange={e => setFee(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant='contained'
                onClick={handleSave}
                size='large'
                sx={{ mt: 2, borderRadius: 2 }}
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
