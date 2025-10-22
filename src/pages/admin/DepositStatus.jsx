// File: pages/admin/deposits.jsx
'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'

import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material'

export default function AdminDeposits () {
  const [deposits, setDeposits] = useState([])
  const [selectedDeposit, setSelectedDeposit] = useState(null)
  const [open, setOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success'
  })

  let token = null
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('authToken')
  }
  const fetchDeposits = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/deposit/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setDeposits(res.data)
    } catch (err) {
      console.error('Error fetching deposits:', err)
    }
  }

  useEffect(() => {
    fetchDeposits()
  }, [])

  const handleView = deposit => {
    setSelectedDeposit(deposit)
    setOpen(true)
  }

  const handleStatusUpdate = async status => {
    console.log('Updating deposit status:', status)
    console.log('Selected Deposit:', selectedDeposit._id)
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/deposit/${selectedDeposit._id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      // ✅ update frontend immediately
      setDeposits(prev =>
        prev.map(d => (d._id === res.data._id ? res.data : d))
      )
      setSnackbar({
        open: true,
        message: `Deposit ${status} successfully`,
        type: status === 'approved' ? 'success' : 'warning'
      })
      setOpen(false)
    } catch (err) {
      console.error('Error updating status:', err)
      setSnackbar({
        open: true,
        message: 'Failed to update deposit',
        type: 'error'
      })
    }
  }

  return (
    <>
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          background: '#fff',
          minHeight: '100vh',
          color: '#000'
        }}
      >
        <Typography variant='h6' fontWeight={700} mb={4} textAlign='center'>
          🧾 Deposit Status
        </Typography>

        <Paper className='tableWrapper'>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Coin</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount ($)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Wallet Balance</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deposits.map(dep => (
                <TableRow key={dep._id}>
                  <TableCell>
                    <Stack direction='row' spacing={2} alignItems='center'>
                      <Avatar>{dep.userId?.firstname?.charAt(0)}</Avatar>
                      <Typography>
                        {dep.userId?.firstname} {dep.userId?.lastname}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{dep.walletId?.symbol}</TableCell>
                  <TableCell>{dep.method}</TableCell>
                  <TableCell>
                    {new Date(dep.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#236d3e' }}>
                    ${Number(dep.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>{dep.status}</TableCell>
                  <TableCell>
                    {Number(dep.walletId?.balance)?.toLocaleString()}{' '}
                    {dep.walletId?.symbol}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => handleView(dep)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Receipt Modal */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Deposit Receipt</DialogTitle>
          <DialogContent>
            {selectedDeposit && (
              <>
                <Typography variant='subtitle1' gutterBottom>
                  Name: {selectedDeposit.userId?.firstname}{' '}
                  {selectedDeposit.userId?.lastname}
                </Typography>
                <Typography variant='subtitle2' gutterBottom>
                  Amount: ${Number(selectedDeposit.amount).toLocaleString()}
                </Typography>
                <Typography variant='body2' gutterBottom>
                  Method: {selectedDeposit.method}
                </Typography>
                <Typography variant='body2' gutterBottom>
                  Coin: {selectedDeposit.walletId?.symbol}
                </Typography>
                {selectedDeposit.receipt && (
                  <img
                    src={selectedDeposit.receipt}
                    alt='Receipt'
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      marginTop: '1rem'
                    }}
                  />
                )}
              </>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpen(false)} color='secondary'>
              Close
            </Button>
            <Button
              onClick={() => handleStatusUpdate('success')}
              color='success'
              variant='contained'
            >
              Approve
            </Button>
            <Button
              onClick={() => handleStatusUpdate('rejected')}
              color='error'
              variant='outlined'
            >
              Reject
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.type}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </>
  )
}
