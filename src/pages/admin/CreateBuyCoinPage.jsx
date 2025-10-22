'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  MenuItem
} from '@mui/material'

import axios from 'axios'

export default function CreateBuyCoinPage () {
  const [coins, setCoins] = useState([])
  const [form, setForm] = useState({ name: '', symbol: '', rate: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await axios.get('/api/coins', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setCoins(res.data)
      } catch (err) {
        console.error('Failed to fetch coins:', err.message)
      }
    }
    fetchCoins()
  }, [])

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCreate = async () => {
    if (form.name && form.symbol && form.rate) {
      setLoading(true)
      try {
        let token = null
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('authToken')
        }

        const res = await axios.post(
          `/${process.env.NEXT_PUBLIC_API_URL}/admin/create-coin`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          {
            ...form,
            rate: parseFloat(form.rate)
          }
        )
        setCoins([res.data, ...coins])
        setForm({ name: '', symbol: '', rate: '' })
      } catch (err) {
        console.error(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <>
      <Box className='createBuyCoinPage' sx={{ p: { xs: 1, sm: 3 } }}>
        {/* FORM */}
        <Paper className='form' sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label='Select Coin'
                name='symbol'
                fullWidth
                value={form.symbol}
                onChange={handleChange}
              >
                <MenuItem value='BTC'>Bitcoin (BTC)</MenuItem>
                <MenuItem value='ETH'>Ethereum (ETH)</MenuItem>
                <MenuItem value='USDT'>Tether (USDT)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label='Coin Name'
                name='name'
                fullWidth
                value={form.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label='Rate (USDT)'
                name='rate'
                fullWidth
                value={form.rate}
                onChange={handleChange}
                type='number'
                inputProps={{ min: 0, step: 0.0001 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant='contained'
                color='primary'
                onClick={handleCreate}
                disabled={loading}
                fullWidth
                sx={{ py: 1.2, fontWeight: 700, fontSize: '1rem' }}
              >
                {loading ? 'Creating...' : 'Create Coin'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* DISPLAY COINS */}
        <Box className='coinList'>
          <Typography variant='h6' sx={{ mb: 1 }}>
            Available Coins
          </Typography>
          <Grid container spacing={2}>
            {coins.map(coin => (
              <Grid item xs={12} sm={6} md={4} key={coin._id}>
                <Card className='coinCard'>
                  <CardContent>
                    <Typography variant='subtitle1'>
                      <strong>{coin.name}</strong> ({coin.symbol})
                    </Typography>
                    <Typography variant='body2'>
                      Current Rate: ${coin.rate} USDT
                    </Typography>
                    <Button
                      onClick={() =>
                        alert(`User will buy ${coin.name} at $${coin.rate}`)
                      }
                      variant='outlined'
                      size='small'
                      sx={{ mt: 1 }}
                    >
                      Buy Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </>
  )
}
