'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent
} from '@mui/material'

export default function CreateSellCoinPage () {
  const [coins, setCoins] = useState([])
  const [form, setForm] = useState({ name: '', symbol: '', rate: '' })

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCreate = () => {
    if (form.name && form.symbol && form.rate) {
      const newCoin = { ...form, id: Date.now() }
      setCoins([newCoin, ...coins])
      setForm({ name: '', symbol: '', rate: '' })
    }
  }

  const handleSell = coin => {
    alert(`You selected to Sell ${coin.name} at ₦${coin.rate}`)
  }

  return (
    <>
      <Box className='createBuyCoinPage'>
        <h5>Create Coin to Sell</h5>

        <Paper className='form'>
          <Grid container spacing={2}>
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
                label='Symbol'
                name='symbol'
                fullWidth
                value={form.symbol}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label='Rate (₦)'
                name='rate'
                fullWidth
                value={form.rate}
                onChange={handleChange}
                type='number'
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant='contained'
                color='primary'
                onClick={handleCreate}
              >
                Create Coin
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Box className='coinList'>
          <Typography variant='h6'>Available Coins</Typography>
          <Grid container spacing={2}>
            {coins.map(coin => (
              <Grid item xs={12} sm={6} md={4} key={coin.id}>
                <Card className='coinCard'>
                  <CardContent>
                    <Typography variant='subtitle1'>
                      <strong>{coin.name}</strong> ({coin.symbol})
                    </Typography>
                    <Typography variant='body2'>
                      Current Rate: ₦{coin.rate}
                    </Typography>
                    <Button
                      onClick={() => handleSell(coin)}
                      variant='outlined'
                      size='small'
                    >
                      Sell Now
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
