'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
  Stack
} from '@mui/material'
import { ContentCopy, Delete } from '@mui/icons-material'

import axios from 'axios'

export default function WalletManager () {
  const [wallets, setWallets] = useState([])
  const [form, setForm] = useState({
    symbol: '',
    name: '',
    network: '',
    defaultWalletAddress: ''
  })

  // ✅ Load wallets on mount
  useEffect(() => {
    fetchWallets()
  }, [])

  const fetchWallets = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/get-coinwallet`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setWallets(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAdd = async () => {
    if (!form.symbol || !form.defaultWalletAddress) return
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/create-coinwallet`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setWallets(prev => [data, ...prev])
      setForm({ symbol: '', name: '', network: '', defaultWalletAddress: '' })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async id => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/delete-coinwallet/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setWallets(prev => prev.filter(w => w._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleCopy = text => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <>
      <Box sx={{ p: 4 }}>
        <Typography variant='h6' mb={2} fontWeight={600}>
          Wallet Address Manager
        </Typography>

        {/* Form */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label='Symbol (BTC)'
                name='symbol'
                value={form.symbol}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label='Name (Bitcoin)'
                name='name'
                value={form.name}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label='Network (Ethereum, BSC...)'
                name='network'
                value={form.network}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label='Wallet Address'
                name='defaultWalletAddress'
                value={form.defaultWalletAddress}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant='contained' color='primary' onClick={handleAdd}>
                Add Wallet
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Wallets List */}
        <Box>
          {wallets.map(wallet => (
            <Paper key={wallet._id} sx={{ p: 2, mb: 2, overflowX: 'auto' }}>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
              >
                <Typography sx={{ maxWidth: '70%', overflow: 'hidden' }}>
                  <strong>{wallet.symbol}:</strong>{' '}
                  {wallet.defaultWalletAddress}
                </Typography>
                <Stack direction='row' spacing={1}>
                  <IconButton
                    onClick={() => handleCopy(wallet.defaultWalletAddress)}
                    size='small'
                  >
                    <ContentCopy fontSize='small' />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(wallet._id)}
                    size='small'
                  >
                    <Delete fontSize='small' color='error' />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Box>
    </>
  )
}
