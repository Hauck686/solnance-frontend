import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Activity,
  AlignJustify,
  ArrowRightLeft,
  CalendarArrowUp,
  ChartCandlestick,
  ChartNoAxesCombined,
  ChartNoAxesGantt,
  Cog,
  CreditCard,
  FileInput,
  FileOutput,
  FolderSync,
  LayoutDashboard,
  LogOut,
  MailCheck,
  MailPlus,
  Menu,
  MessagesSquare,
  PartyPopper,
  PersonStanding,
  Plus,
  ShieldCheck,
  SquaresExclude,
  Sun,
  SunMoon,
  User,
  Users,
  X
} from 'lucide-react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'

export default function AdminHeader () {
  const [isMobile, setIsMobile] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const router = useRouter()

  // Sidebar structure with headers and sub-links
  const sidebarSections = [
    {
      header: null,
      links: [
        {
          icon: <LayoutDashboard />,
          label: 'Dashboard',
          path: '/admin/AdminDashboard'
        }
      ]
    },
    {
      header: 'User Management',
      links: [
        {
          icon: <Users />,
          label: 'Users',
          path: '/admin/Users'
        },
        {
          icon: <ShieldCheck />,
          label: 'KYC control',
          path: '/admin/KycManagement'
        }
      ]
    },
    // {
    //   header: 'Trade',
    //   links: [
    //     {
    //       icon: <ChartCandlestick />,
    //       label: 'Create Buy Coin',
    //       path: '/admin/CreateBuyCoinPage'
    //     },
    //     {
    //       icon: <ChartCandlestick />,
    //       label: 'Buyers',
    //       path: '/admin/BuyStatus'
    //     },
    //     {
    //       icon: <Plus />,
    //       label: 'Create Sell Coin',
    //       path: '/admin/CreateSellCoinPage'
    //     },
    //     {
    //       icon: <Plus />,
    //       label: 'Sellers',
    //       path: '/admin/SellStatus'
    //     },
    //     {
    //       icon: <ArrowRightLeft />,
    //       label: 'Swap Coin',
    //       path: '/admin/SwappedCoinPage'
    //     }
    //   ]
    // },
    {
      header: 'Transactions',
      links: [
        {
          icon: <PersonStanding />,
          label: 'Referrals',
          path: '/admin/UserReferredPage'
        },
        {
          icon: <FileInput />,
          label: 'Deposits',
          path: '/admin/DepositStatus'
        },
        {
          icon: <FileOutput />,
          label: 'Withdrawals',
          path: '/admin/WithdrawalStatus'
        }
      ]
    },
    {
      header: 'Investment Plans',
      links: [
        {
          icon: <Plus />,
          label: 'Create Plans',
          path: '/admin/CreateInvestmentPlan'
        },
        {
          icon: <Activity />,
          label: 'Plans',
          path: '/admin/InvestmentPlanList'
        },
        {
          icon: <SquaresExclude />,
          label: 'Active Investors',
          path: '/admin/ActiveInvestors'
        }
      ]
    },
    {
      header: 'Loans',
      links: [
        {
          icon: <Plus />,
          label: 'Create Loan',
          path: '/admin/CreateLoanPage'
        },
        {
          icon: <CalendarArrowUp />,
          label: 'Loans',
          path: '/admin/LoanListPage'
        },
        {
          icon: <ChartNoAxesCombined />,
          label: 'Loans Status',
          path: '/admin/LoanStatusPage'
        }
      ]
    },

    {
      header: 'Notifications',
      links: [
        {
          icon: <MailPlus />,
          label: 'Email Settings',
          path: '/admin/EmailSettingsPage'
        },
        {
          icon: <MailCheck />,
          label: 'Email Templates',
          path: '/admin/EmailTemplatesPage'
        },
        {
          icon: <MessagesSquare />,
          label: 'Send SMS',
          path: '/admin/SendSMSPage'
        },
        {
          icon: <PartyPopper />,
          label: 'Pop up',
          path: '/admin/PopUpPage'
        }
      ]
    },
    {
      header: 'Payment Gateway',
      links: [
        {
          icon: <CreditCard />,
          label: 'Wallet Manager',
          path: '/admin/WalletManager'
        },
        {
          icon: <FolderSync />,
          label: 'Transfers',
          path: '/admin/TransferGatewayPage'
        },
        {
          icon: <CreditCard />,
          label: 'Bank Card',
          path: '/admin/BankCardGatewayPage'
        }
      ]
    },
    {
      header: 'General App Settings',
      links: [
        {
          icon: <Cog />,
          label: 'App Settings',
          path: '/admin/GeneralSetting'
        },
        {
          icon: <ChartNoAxesGantt />,
          label: 'Admin Management',
          path: '/admin/RoleManagement'
        },
        // { icon: <FaIdBadge />, label: 'KYC', path: '/admin/KycManagement' },
        // { icon: <FaCreditCard />, label: 'Card', path: '/admin/UsersCardPage' },
        {
          icon: <User />,
          label: 'Profile Settings',
          path: '/admin/adminPasswordPage'
        }
      ]
    },
    {
      header: 'Account Settings',
      links: [
        {
          icon: <LogOut />,
          label: 'Logout',
          path: '/logout',
          action: 'logout'
        }
      ]
    }
  ]

  // Responsive handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 600)
      const handleResize = () => {
        const mobile = window.innerWidth <= 600
        setIsMobile(mobile)
        if (!mobile) setDrawerOpen(false)
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleLogout = async () => {
    try {
      // Remove local session
      localStorage.removeItem('authToken')
      localStorage.removeItem('userIdHash')

      // Notify backend (optional)
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // Redirect
      window.location.href = '/auth/Login'
    } catch (err) {
      console.error('Logout error:', err)
      window.location.href = '/auth/Login' // still force redirect
    }
  }

  // Theme toggle
  const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme()

    return (
      <div onClick={toggleTheme}>
        {theme === 'light' ? (
          <Sun className='icon-btn' strokeWidth={1} />
        ) : (
          <SunMoon className='icon-btn' strokeWidth={1} />
        )}
      </div>
    )
  }

  return (
    <div>
      <header className='dashboard-header'>
        <div className='logo-section'>
          <img
            src='https://i.postimg.cc/V6f00jhs/Crypt-Logo-Retina.webp'
            alt='company logo'
            className='brand-name'
          />
        </div>
        <div className='header-actions'>
          <>
            <ThemeToggle />
          </>

          <AlignJustify
            className='icon-btn'
            aria-label='Menu'
            onClick={() => setDrawerOpen(true)}
            strokeWidth={1}
          />
        </div>
      </header>

      {drawerOpen && (
        <div className='drawer-overlay' onClick={() => setDrawerOpen(false)} />
      )}

      <nav
        className={`drawer${drawerOpen ? ' open' : ''}${
          isMobile ? ' mobile' : ''
        }`}
      >
        <button
          className='drawer-close-btn'
          onClick={() => setDrawerOpen(false)}
        >
          <X />
        </button>
        <ul className='drawer-list'>
          {sidebarSections.map((section, i) => (
            <React.Fragment key={i}>
              {section.header && (
                <li className='drawer-category-header'>{section.header}</li>
              )}
              {section.links.map((link, idx) => (
                <li key={link.path + idx} onClick={() => setDrawerOpen(false)}>
                  {link.action === 'logout' ? (
                    <button
                      className='drawer-link'
                      onClick={handleLogout}
                      style={{
                        color:
                          router.pathname === link.path ? '#d67a49' : undefined,
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <span className='drawer-icon'>{link.icon}</span>
                      <span>{link.label}</span>
                    </button>
                  ) : (
                    <Link
                      href={link.path}
                      className='drawer-link'
                      style={{
                        color:
                          router.pathname === link.path ? '#d67a49' : undefined
                      }}
                    >
                      <span className='drawer-icon'>{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  )}
                </li>
              ))}
            </React.Fragment>
          ))}
        </ul>
      </nav>
    </div>
  )
}
