// File: pages/admin/investment-plan.jsx
'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  MenuItem,
  Divider
} from '@mui/material'

import axios from 'axios'

export default function CreateInvestmentPlan () {
  const [categories, setCategories] = useState([
    'Cryptocurrency',
    'Real Estate',
    'Stocks'
  ])
  const [newCategory, setNewCategory] = useState('')
  const [plan, setPlan] = useState({
    category: '',
    name: '',
    profitRate: '',
    durationType: '',
    minAmount: '',
    maxAmount: '',
    payoutFrequency: '',
    capitalBack: true
  })

  const handleChange = e => {
    const { name, value } = e.target
    setPlan({ ...plan, [name]: value })
  }

  const handleSwitchChange = e => {
    setPlan({ ...plan, [e.target.name]: e.target.checked })
  }

  const handleDurationTypeChange = e => {
    setPlan({ ...plan, durationType: e.target.value })
  }

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory])
      setNewCategory('')
    }
  }

  const handleSubmit = async () => {
    //(plan)
    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/investments/create-plan`,
        plan,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setPlan(res.data)
      alert('Investment Plan Created:', res.data)
    } catch (error) {
      console.error('Error creating investment plan:', error)
    }
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
        <Typography
          variant='h6'
          gutterBottom
          fontWeight={600}
          textAlign='center'
        >
          Create Investment Plan
        </Typography>
        <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 700, mx: 'auto' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant='h6'>Add Category</Typography>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <TextField
                    label='New Category'
                    fullWidth
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Button
                    onClick={handleAddCategory}
                    variant='outlined'
                    fullWidth
                    sx={{ height: '100%' }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                label='Select Category'
                name='category'
                value={plan.category}
                onChange={handleChange}
                fullWidth
              >
                {categories.map((cat, index) => (
                  <MenuItem key={index} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label='Plan Name'
                name='name'
                fullWidth
                value={plan.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label='Profit (%)'
                name='profitRate'
                type='number'
                fullWidth
                value={plan.profitRate}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={plan.capitalBack}
                    onChange={handleSwitchChange}
                    name='capitalBack'
                  />
                }
                label='Capital Back on Completion'
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label='Min Amount'
                name='minAmount'
                type='number'
                fullWidth
                value={plan.minAmount}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label='Max Amount'
                name='maxAmount'
                type='number'
                fullWidth
                value={plan.maxAmount}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label='Duration'
                name='payoutFrequency'
                type='number'
                fullWidth
                value={plan.payoutFrequency}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label='Duration Type'
                name='durationType'
                value={plan.durationType}
                onChange={handleDurationTypeChange}
                fullWidth
              >
                <MenuItem value='days'>Days</MenuItem>
                <MenuItem value='weeks'>Weeks</MenuItem>
                <MenuItem value='months'>Months</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Button
                variant='contained'
                size='large'
                fullWidth
                onClick={handleSubmit}
              >
                Create Plan
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </>
  )
}
