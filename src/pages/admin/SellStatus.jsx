// File: pages/admin/=Sell-status.jsx
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
  Button
} from '@mui/material'
import dayjs from 'dayjs'

const sampleSellers = [
  {
    id: 1,
    user: 'John Doe',
    coin: 'BitCoin',
    amount: 5000,
    status: 'pending',
    date: '2025-07-10T12:30:00Z'
  },
  {
    id: 2,
    user: 'Jane Smith',
    coin: 'Ethereum',
    amount: 2500,
    status: 'pending',
    date: '2025-07-09T16:00:00Z'
  },
  {
    id: 3,
    user: 'Jane Williams',
    coin: 'Ethereum',
    amount: 2500,
    status: 'pending',
    date: '2025-07-09T16:00:00Z'
  },
  {
    id: 4,
    user: 'Caesar Smith',
    coin: 'Ethereum',
    amount: 2500,
    status: 'pending',
    date: '2025-07-09T16:00:00Z'
  }
]

export default function SellStatus () {
  const [sellRequests, setSellRequests] = useState(sampleSellers)

  const updateStatus = (id, newStatus) => {
    const updated = sellRequests.map(item =>
      item.id === id ? { ...item, status: newStatus } : item
    )
    setSellRequests(updated)
  }

  return (
    <>
      <Box className='buyStatusPage'>
        <h4>Sellers Requests</h4>

        <Paper className='tableWrapper'>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Coin</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sellRequests.map(request => (
                <TableRow key={request.id}>
                  <TableCell>{request.user}</TableCell>
                  <TableCell>{request.coin}</TableCell>
                  <TableCell>${request.amount}</TableCell>
                  <TableCell>
                    {dayjs(request.date).format('YYYY-MM-DD HH:mm')}
                  </TableCell>
                  {/* <TableCell>{new Date(request.date).toLocaleString()}</TableCell> */}
                  <TableCell>{request.status}</TableCell>
                  <TableCell>
                    {request.status === 'pending' ? (
                      <>
                        <Button
                          size='small'
                          color='success'
                          onClick={() => updateStatus(request.id, 'confirmed')}
                        >
                          Confirm
                        </Button>
                        <Button
                          size='small'
                          color='error'
                          onClick={() => updateStatus(request.id, 'declined')}
                        >
                          Decline
                        </Button>
                      </>
                    ) : (
                      <Typography
                        variant='body2'
                        color={request.status === 'confirmed' ? 'green' : 'red'}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </Typography>
                    )}
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
