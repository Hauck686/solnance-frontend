import { ToastContainer } from 'react-toastify'
import { ThemeProvider } from '../context/ThemeContext'
import '../scss/index.scss'
import 'react-toastify/dist/ReactToastify.css'
import PrivateRoute from '../context/PrivateRoute'
import { useRouter } from 'next/router'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  mainnet,
  polygon,
  arbitrum,
  bsc,
  avalanche,
  optimism,
  fantom,
  base
} from 'wagmi/chains'

// Layouts
import UserLayout from '../Components/Layouts/UserLayout'
import AdminLayout from '../Components/Layouts/AdminLayout'
import AuthLayout from '../Components/Layouts/AuthLayout'

const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECTID,
  chains: [mainnet, polygon, arbitrum, bsc, avalanche, optimism, fantom, base]
})

const queryClient = new QueryClient()

// Route groups
const authRoutes = [
  '/auth/Login',
  '/auth/RegistrationPage',
  '/auth/ForgotPasswordPage',
  '/'
]

const userPrefix = '/user'
const adminPrefix = '/admin'

export default function MyApp ({ Component, pageProps }) {
  const router = useRouter()
  const path = router.pathname

  let Layout = ({ children }) => <>{children}</>

  if (authRoutes.includes(path)) {
    Layout = AuthLayout
  } else if (path.startsWith(userPrefix)) {
    const UserProtectedLayout = props => (
      <PrivateRoute>
        <UserLayout {...props} />
      </PrivateRoute>
    )
    UserProtectedLayout.displayName = 'UserProtectedLayout'
    Layout = UserProtectedLayout
  } else if (path.startsWith(adminPrefix)) {
    const AdminProtectedLayout = props => (
      <PrivateRoute>
        <AdminLayout {...props} />
      </PrivateRoute>
    )
    AdminProtectedLayout.displayName = 'AdminProtectedLayout'
    Layout = AdminProtectedLayout
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize='compact' showRecentTransactions={true}>
          <ThemeProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <ToastContainer />
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
