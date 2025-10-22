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
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material'

const mockUsers = [
  {
    id: 1,
    name: 'Alice Johnson',
    referredBy: 'Bob Smith',
    date: '12th Jan 2024',
    time: '10:30 AM',
    deposit: 12000
  },
  {
    id: 2,
    name: 'David Brown',
    referredBy: 'Alice Johnson',
    date: '15th Jan 2024',
    time: '11:00 AM',
    deposit: 7000
  },
  {
    id: 3,
    name: 'Sarah Miller',
    referredBy: 'Bob Smith',
    date: '20th Jan 2024',
    time: '12:00 PM',
    deposit: 10000
  }
]

export default function UserReferredPage () {
  const [users] = useState(mockUsers)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <>
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 5 },
          backgroundColor: '#f9f9f9',
          minHeight: '100vh',
          color: '#000'
        }}
      >
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          fontWeight={700}
          mb={4}
          textAlign='center'
        >
          🧾 Referred Users Insight
        </Typography>

        <Paper elevation={3} sx={{ borderRadius: 3, overflowX: 'auto' }}>
          <Box sx={{ minWidth: 600 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#d67a49' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                    User
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                    Referred By
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                    Date of Registration
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                    Deposit Balance ($)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <Avatar sx={{ bgcolor: '#d67a49' }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Typography fontWeight={500}>{user.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.referredBy}</TableCell>
                    <TableCell>
                      {user.date}, {user.time}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 900,
                        color: '#236d3eff',
                        fontSize: '1rem'
                      }}
                    >
                      ${user.deposit.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Box>
    </>
  )
}
