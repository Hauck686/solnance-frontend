'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'

export default function InvestmentPlanList () {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(null)
  let token = null
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('authToken')
  }

  // Fetch investment plans
  const fetchPlans = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/investments/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      if (response.data.success) {
        setPlans(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching investment plans:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  // ✅ Delete from DB
  const handleDelete = async id => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/investments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setPlans(prev => prev.filter(plan => plan._id !== id)) // update UI
    } catch (error) {
      console.error('Error deleting plan:', error)
    }
  }

  // ✅ Open Edit Dialog
  const handleEdit = plan => {
    setCurrentPlan(plan)
    setEditOpen(true)
  }

  // ✅ Save Edited Plan
  const handleSaveEdit = async () => {
    try {
      const { _id, name, category, profitRate, minAmount, maxAmount } =
        currentPlan

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/investments/${_id}`,
        { name, category, profitRate, minAmount, maxAmount },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {
        setPlans(prev =>
          prev.map(p => (p._id === _id ? response.data.data : p))
        )
        setEditOpen(false)
        setCurrentPlan(null)
      }
    } catch (error) {
      console.error('Error updating plan:', error)
    }
  }

  return (
    <>
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          backgroundColor: '#f4f6f8',
          minHeight: '100vh'
        }}
      >
        <Typography
          variant='h5'
          fontWeight={700}
          textAlign='center'
          gutterBottom
        >
          Investment Plans Overview
        </Typography>

        <Typography
          variant='body1'
          textAlign='center'
          color='text.secondary'
          mb={4}
        >
          Review and manage all active investment plans
        </Typography>

        {loading ? (
          <Stack alignItems='center' justifyContent='center' mt={5}>
            <CircularProgress />
          </Stack>
        ) : (
          <Grid container spacing={4} justifyContent='center'>
            {plans.map(plan => (
              <Grid item xs={12} sm={6} md={4} key={plan._id}>
                <Card
                  elevation={4}
                  sx={{ borderRadius: 4, background: '#ffffff' }}
                >
                  <CardContent>
                    <Stack spacing={1.2}>
                      <Stack
                        direction='row'
                        justifyContent='space-between'
                        alignItems='center'
                      >
                        <Typography variant='h6' fontWeight={600}>
                          {plan.name}
                        </Typography>
                        <Chip label={plan.category} color='info' size='small' />
                      </Stack>

                      <Divider />

                      <Typography variant='body2' color='text.secondary'>
                        <strong>Profit:</strong> {plan.profitRate}%
                      </Typography>

                      <Typography variant='body2' color='text.secondary'>
                        <strong>Investment Range:</strong> $
                        {plan.minAmount.toLocaleString()} - $
                        {plan.maxAmount.toLocaleString()}
                      </Typography>

                      <Typography variant='body2' color='text.secondary'>
                        <strong>Duration:</strong> {plan.durationType}
                      </Typography>

                      <Typography variant='body2' color='text.secondary'>
                        <strong>Payout Frequency:</strong> Every{' '}
                        {plan.payoutFrequency} {plan.durationType}
                      </Typography>

                      <Typography variant='body2' color='text.secondary'>
                        <strong>Capital Back:</strong>{' '}
                        {plan.capitalBack ? 'Yes' : 'No'}
                      </Typography>

                      <Stack direction='row' spacing={2} mt={1}>
                        <Button
                          variant='outlined'
                          size='small'
                          color='primary'
                          onClick={() => handleEdit(plan)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant='outlined'
                          size='small'
                          color='error'
                          onClick={() => handleDelete(plan._id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ✅ Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>Edit Investment Plan</DialogTitle>
        <DialogContent>
          {currentPlan && (
            <Stack spacing={2} mt={2}>
              <TextField
                label='Name'
                value={currentPlan.name}
                onChange={e =>
                  setCurrentPlan({ ...currentPlan, name: e.target.value })
                }
              />
              <TextField
                label='Category'
                value={currentPlan.category}
                onChange={e =>
                  setCurrentPlan({ ...currentPlan, category: e.target.value })
                }
              />
              <TextField
                label='Profit Rate (%)'
                type='number'
                value={currentPlan.profitRate}
                onChange={e =>
                  setCurrentPlan({
                    ...currentPlan,
                    profitRate: Number(e.target.value)
                  })
                }
              />
              <TextField
                label='Minimum Amount'
                type='number'
                value={currentPlan.minAmount}
                onChange={e =>
                  setCurrentPlan({
                    ...currentPlan,
                    minAmount: Number(e.target.value)
                  })
                }
              />
              <TextField
                label='Maximum Amount'
                type='number'
                value={currentPlan.maxAmount}
                onChange={e =>
                  setCurrentPlan({
                    ...currentPlan,
                    maxAmount: Number(e.target.value)
                  })
                }
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} color='primary' variant='contained'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
