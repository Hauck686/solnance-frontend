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
  Switch,
  FormControlLabel,
  Modal,
  TextField
} from '@mui/material'

export default function LoanListPage () {
  const [loans, setLoans] = useState([])
  const [open, setOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState(null)

  // ✅ Fetch loans from backend
  const fetchLoans = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setLoans(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [])

  // ✅ Delete loan
  const handleDelete = async id => {
    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/loans/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setLoans(prev => prev.filter(loan => loan._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  // ✅ Toggle enabled
  const handleToggle = async (id, enabled) => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/${id}`,
        {
          enabled: !enabled
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setLoans(prev =>
        prev.map(loan => (loan._id === id ? res.data.data : loan))
      )
    } catch (err) {
      console.error(err)
    }
  }

  // ✅ Open edit modal
  const handleEdit = loan => {
    setEditingLoan(loan)
    setOpen(true)
  }

  // ✅ Save changes
  const handleSave = async () => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/${editingLoan._id}`,
        editingLoan,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setLoans(prev =>
        prev.map(loan => (loan._id === editingLoan._id ? res.data.data : loan))
      )
      setOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  // ✅ Handle input changes
  const handleChange = (field, value) => {
    setEditingLoan(prev => ({ ...prev, [field]: value }))
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
          variant='h6'
          fontWeight={700}
          textAlign='center'
          gutterBottom
        >
          Investment Loans Overview
        </Typography>
        <Typography
          variant='body1'
          textAlign='center'
          color='text.secondary'
          mb={4}
        >
          Review and manage all active loan investment plans
        </Typography>

        <Grid container spacing={4} justifyContent='center'>
          {loans.map(loan => (
            <Grid item xs={12} sm={6} md={4} key={loan._id}>
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
                        {loan.name}
                      </Typography>
                      <Chip label={loan.category} color='info' size='small' />
                    </Stack>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={loan.enabled}
                          onChange={() => handleToggle(loan._id, loan.enabled)}
                          color='primary'
                        />
                      }
                      label={loan.enabled ? 'Enabled' : 'Disabled'}
                    />

                    <Divider />

                    <Typography variant='body2' color='text.secondary'>
                      <strong>Interest:</strong> {loan.interestRate}% (
                      {loan.interestType})
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>Loan Range:</strong> $
                      {loan.minAmount?.toLocaleString()} - $
                      {loan.maxAmount?.toLocaleString()}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>Duration:</strong> {loan.duration}{' '}
                      {loan.durationType}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>Capital Back:</strong>{' '}
                      {loan.capitalBack ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>Collateral Required:</strong>{' '}
                      {loan.collateralRequired ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>Repayment:</strong> {loan.repaymentFrequency}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>Status:</strong> {loan.approvalStatus}
                    </Typography>

                    <Stack direction='row' spacing={2} mt={1}>
                      <Button
                        variant='outlined'
                        size='small'
                        color='primary'
                        onClick={() => handleEdit(loan)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant='outlined'
                        size='small'
                        color='error'
                        onClick={() => handleDelete(loan._id)}
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
      </Box>

      {/* ✅ Edit Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            p: 4,
            background: '#fff',
            borderRadius: 3,
            maxWidth: 500,
            mx: 'auto',
            mt: '10%',
            boxShadow: 24
          }}
        >
          <Typography variant='h6' fontWeight={600} mb={2}>
            Edit Loan
          </Typography>
          {editingLoan && (
            <Stack spacing={2}>
              <TextField
                label='Name'
                value={editingLoan.name}
                onChange={e => handleChange('name', e.target.value)}
                fullWidth
              />
              <TextField
                label='Category'
                value={editingLoan.category}
                onChange={e => handleChange('category', e.target.value)}
                fullWidth
              />
              <TextField
                label='Interest Rate (%)'
                type='number'
                value={editingLoan.interestRate}
                onChange={e => handleChange('interestRate', e.target.value)}
                fullWidth
              />
              <TextField
                label='Min Amount'
                type='number'
                value={editingLoan.minAmount}
                onChange={e => handleChange('minAmount', e.target.value)}
                fullWidth
              />
              <TextField
                label='Max Amount'
                type='number'
                value={editingLoan.maxAmount}
                onChange={e => handleChange('maxAmount', e.target.value)}
                fullWidth
              />
              <Stack direction='row' spacing={2} justifyContent='flex-end'>
                <Button onClick={() => setOpen(false)} color='secondary'>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant='contained'
                  color='primary'
                >
                  Save
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Modal>
    </>
  )
}
