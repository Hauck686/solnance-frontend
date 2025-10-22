'use client'

import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  CircularProgress,
  TextField,
  InputAdornment,
  Paper
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

export default function ActiveInvestors () {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        let token = null
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('authToken')
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/investments/all/investments`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        if (res.data.status === 'ok') {
          setInvestments(res.data.data)
        }
      } catch (error) {
        console.error('Error fetching active investors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvestments()
  }, [])

  // ✅ Filtered investments by search query (name/email/plan)
  const filteredInvestments = useMemo(() => {
    return investments.filter(inv => {
      const userName = `${inv.userId?.firstname ?? ''} ${
        inv.userId?.lastname ?? ''
      }`.toLowerCase()
      const email = inv.userId?.email?.toLowerCase() ?? ''
      const plan = inv.planId?.name?.toLowerCase() ?? ''
      const query = searchQuery.toLowerCase()
      return (
        userName.includes(query) ||
        email.includes(query) ||
        plan.includes(query)
      )
    })
  }, [investments, searchQuery])

  // ✅ Summary calculations
  const totalInvestors = new Set(investments.map(inv => inv.userId?._id)).size
  const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalExpectedReturn = investments.reduce(
    (sum, inv) => sum + inv.expectedReturn,
    0
  )

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
          Active Investors
        </Typography>

        {/* ✅ Dashboard Summary */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant='subtitle2' color='text.secondary'>
                Total Investors
              </Typography>
              <Typography variant='h6' fontWeight={700}>
                {totalInvestors.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant='subtitle2' color='text.secondary'>
                Total Investment
              </Typography>
              <Typography variant='h6' fontWeight={700}>
                ${totalInvestment.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant='subtitle2' color='text.secondary'>
                Expected Return
              </Typography>
              <Typography variant='h6' fontWeight={700}>
                ${totalExpectedReturn.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ✅ Search bar */}
        <Box mb={3}>
          <TextField
            fullWidth
            variant='outlined'
            placeholder='Search by name, email, or plan...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon color='action' />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* ✅ Investors List */}
        {loading ? (
          <Stack alignItems='center' justifyContent='center' mt={5}>
            <CircularProgress />
          </Stack>
        ) : (
          <Grid container spacing={3}>
            {filteredInvestments.map(inv => (
              <Grid item xs={12} md={6} lg={4} key={inv._id}>
                <Card elevation={3} sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack spacing={1}>
                      {/* User */}
                      <Typography variant='h6' fontWeight={600}>
                        {inv.userId
                          ? `${inv.userId.firstname} ${inv.userId.lastname}`
                          : 'Unknown User'}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {inv.userId?.email}
                      </Typography>

                      <Divider />

                      {/* Plan */}
                      <Typography variant='body2'>
                        <strong>Plan:</strong> {inv.planId?.name} (
                        {inv.planId?.category})
                      </Typography>
                      <Typography variant='body2'>
                        <strong>Profit Rate:</strong> {inv.planId?.profitRate}%
                      </Typography>

                      {/* Investment */}
                      <Typography variant='body2'>
                        <strong>Amount:</strong> ${inv.amount.toLocaleString()}
                      </Typography>
                      <Typography variant='body2'>
                        <strong>Status:</strong> {inv.status}
                      </Typography>
                      <Typography variant='body2'>
                        <strong>Expected Return:</strong> $
                        {inv.expectedReturn.toLocaleString()}
                      </Typography>
                      <Typography variant='body2'>
                        <strong>Joined On:</strong>{' '}
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  )
}
