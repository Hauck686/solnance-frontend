// File: pages/admin/user-referred.jsx
'use client'

import React, { useState } from 'react'

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
  Stack
} from '@mui/material'

const mockUsers = [
  {
    id: 1,
    name: 'Alice Johnson',
    bank: 'Western Bank',
    date: '12th jan 2024',
    time: '10:30 AM',
    transfer: 12000
  },
  {
    id: 2,
    name: 'David Brown',
    bank: 'Cash App',
    date: '15th jan 2024',
    time: '11:00 AM',
    transfer: 7000
  },
  {
    id: 3,
    name: 'Sarah Miller',
    bank: 'Litebank',
    date: '20th jan 2024',
    time: '12:00 PM',
    transfer: 10000
  }
]

export default function TransferStatus () {
  const [users] = useState(mockUsers)

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
          🧾 Transfer Status
        </Typography>

        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#fff' }}>
              <TableRow
                sx={{
                  color: '#fff',
                  fontWeight: 600,
                  backgroundColor: '#fff'
                }}
              >
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>
                  User
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>
                  Bank
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>
                  Date of transfer
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>
                  Transfered Amount ($)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Stack direction='row' spacing={2} alignItems='center'>
                      <Avatar>{user.name.charAt(0)}</Avatar>
                      <Typography>{user.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{user.bank}</TableCell>
                  <TableCell>
                    {user.date} {user.time}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 900,
                      color: '#236d3eff',
                      fontSize: '1rem'
                    }}
                  >
                    ${user.transfer.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </>
  )
}
