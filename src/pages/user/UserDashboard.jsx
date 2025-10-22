import UserAmount from '../../Components/User/UserAmount'
import InvestmentHistory from '../../Components/User/InvestmentHistory'

import ChatBot from '../../Components/User/ChatBot'
import CoinPriceWidget from '../../Components/User/CoinPriceWidget'
import { Alert, Snackbar } from '@mui/material'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function UserDashboard () {
  const [notif, setNotif] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchNotif = async () => {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/popup-notification`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      if (data) {
        setNotif(data)
        setOpen(true)
      }
    }
    fetchNotif()
  }, [])

  return (
    <div className='dashboard-container'>
      {/* {notif && (
        <Snackbar
          open={open}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={6000}
        >
          <Alert severity={notif.type} variant='filled'>
            <strong>{notif.title}</strong> — {notif.message}
          </Alert>
        </Snackbar>
      )} */}

      {/* <UserNotificationPopup
          message='Welcome back!'
          type='success'
          openInitially={true}
        /> */}
      {/* TOP CARD from Image 2 */}
      <UserAmount />

      {/* Coin Price Widget */}
      <CoinPriceWidget />

      {/* Investment History */}
      <InvestmentHistory limit={7} title={'Recent Transactions'} />
      <ChatBot />
    </div>
  )
}
