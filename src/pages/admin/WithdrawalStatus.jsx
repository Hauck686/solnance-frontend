// File: pages/admin/user-referred.jsx
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
  Chip
} from '@mui/material'

export default function WithdrawalStatus () {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [open, setOpen] = useState(false)

  let token = null
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('authToken')
  }
  // Fetch withdrawals from backend
  useEffect(() => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/withdraw/withdrawal`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(res => {
        setUsers(res.data)
      })
  }, [])

  const handleView = user => {
    setSelectedUser(user)
    setOpen(true)
  }

  const handleStatusChange = async status => {
    if (!selectedUser) return
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/withdrawal/${selectedUser._id}/status`,
        {
          status
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      // update local state
      setUsers(prev => prev.map(u => (u._id === res.data._id ? res.data : u)))
      setOpen(false)
    } catch (err) {
      console.error(err)
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
          🧾 Withdrawal Status
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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Stack direction='row' spacing={2} alignItems='center'>
                      <Avatar>
                        {user?.userId?.firstname
                          ? user.userId.firstname[0]
                          : 'U'}
                      </Avatar>
                      <Typography>
                        {user?.userId?.firstname || 'Unknown'}{' '}
                        {user?.userId?.lastname || ''}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>{user.coin}</TableCell>
                  <TableCell>{user.method}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 900, color: '#236d3e', fontSize: '1rem' }}
                  >
                    ${user.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={
                        user.status === 'approved'
                          ? 'success'
                          : user.status === 'rejected'
                          ? 'error'
                          : 'warning'
                      }
                      size='small'
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='outlined'
                      color='primary'
                      size='small'
                      onClick={() => handleView(user)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Withdrawal Receipt</DialogTitle>
          <DialogContent>
            {selectedUser && (
              <>
                <Typography>
                  Name: {selectedUser.userId.firstname}{' '}
                  {selectedUser.userId.lastname}
                </Typography>
                <Typography>
                  Amount: ${selectedUser.amount.toLocaleString()}
                </Typography>
                <Typography>Method: {selectedUser.method}</Typography>
                <Typography>Coin: {selectedUser.coin}</Typography>

                {/* Details */}
                {selectedUser.details && (
                  <>
                    {selectedUser.details.bankName && (
                      <Typography>
                        Bank: {selectedUser.details.bankName}
                      </Typography>
                    )}
                    {selectedUser.details.accountNumber && (
                      <Typography>
                        Account: {selectedUser.details.accountNumber}
                      </Typography>
                    )}
                  </>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} color='secondary'>
              Close
            </Button>
            <Button
              onClick={() => handleStatusChange('rejected')}
              color='error'
              variant='outlined'
            >
              Decline
            </Button>
            <Button
              onClick={() => handleStatusChange('success')}
              color='success'
              variant='contained'
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  )
}
