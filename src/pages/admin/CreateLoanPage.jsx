// File: pages/admin/create-loan.jsx
'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Paper,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material'

import axios from 'axios'

export default function CreateLoanPage () {
  const [form, setForm] = useState({
    name: '',
    category: '',
    interestRate: '',
    interestType: 'Fixed',
    minAmount: '',
    maxAmount: '',
    duration: '',
    durationType: 'days',
    capitalBack: true,
    collateralRequired: false,
    repaymentFrequency: 'Weekly'
  })

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async () => {
    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/create`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      if (res.data.status === 'ok') {
        alert('✅ Loan Created Successfully')
        setForm({
          name: '',
          category: '',
          interestRate: '',
          interestType: 'Fixed',
          minAmount: '',
          maxAmount: '',
          duration: '',
          durationType: 'days',
          capitalBack: true,
          collateralRequired: false,
          repaymentFrequency: 'Weekly'
        })
      }
    } catch (error) {
      console.error('Error creating loan:', error)
      alert('❌ Failed to create loan')
    }
  }

  return (
    <>
      <Box
        sx={{ p: { xs: 2, md: 4 }, background: '#f4f6f8', minHeight: '100vh' }}
      >
        <Typography variant='h6' fontWeight={700} mb={3}>
          Create New Loan Plan
        </Typography>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label='Plan Name'
                name='name'
                fullWidth
                value={form.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Category'
                name='category'
                fullWidth
                value={form.category}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label='Interest Rate (%)'
                name='interestRate'
                type='number'
                fullWidth
                value={form.interestRate}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                label='Interest Type'
                name='interestType'
                fullWidth
                value={form.interestType}
                onChange={handleChange}
              >
                <MenuItem value='Fixed'>Fixed</MenuItem>
                <MenuItem value='Variable'>Variable</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                label='Repayment Frequency'
                name='repaymentFrequency'
                fullWidth
                value={form.repaymentFrequency}
                onChange={handleChange}
              >
                <MenuItem value='Weekly'>Weekly</MenuItem>
                <MenuItem value='Bi-weekly'>Bi-weekly</MenuItem>
                <MenuItem value='Monthly'>Monthly</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Minimum Amount ($)'
                name='minAmount'
                type='number'
                fullWidth
                value={form.minAmount}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Maximum Amount ($)'
                name='maxAmount'
                type='number'
                fullWidth
                value={form.maxAmount}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label='Duration'
                name='duration'
                type='number'
                fullWidth
                value={form.duration}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                label='Duration Type'
                name='durationType'
                fullWidth
                value={form.durationType}
                onChange={handleChange}
              >
                <MenuItem value='days'>Days</MenuItem>
                <MenuItem value='months'>Months</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    name='capitalBack'
                    checked={form.capitalBack}
                    onChange={handleChange}
                  />
                }
                label='Capital Back'
              />
              <FormControlLabel
                control={
                  <Switch
                    name='collateralRequired'
                    checked={form.collateralRequired}
                    onChange={handleChange}
                  />
                }
                label='Collateral Required'
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant='contained'
                color='primary'
                onClick={handleSubmit}
              >
                Create Loan Plan
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </>
  )
}
