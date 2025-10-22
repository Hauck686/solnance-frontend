'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  ArrowBigDownDash,
  ChartGantt,
  LayoutDashboard,
  UserPen,
  Zap
} from 'lucide-react'

export default function UserTab () {
  const router = useRouter()
  const pathname = usePathname()

  const tabs = [
    {
      key: '/user/UserDashboard',
      label: 'Home',
      icon: <LayoutDashboard strokeWidth={1} />
    },
    {
      key: '/user/DepositPage',
      label: 'Deposit',
      icon: <ArrowBigDownDash strokeWidth={1} />
    },
    { key: '#', label: 'Actions', icon: <Zap />, center: true },
    {
      key: '/user/InvestmentPlan',
      label: 'Invest',
      icon: <ChartGantt strokeWidth={1} />
    },
    {
      key: '/user/Profilepage',
      label: 'Profile',
      icon: <UserPen strokeWidth={1} />
    }
  ]

  return (
    <div className='user-tab'>
      {tabs.map(tab => {
        const isActive = pathname === tab.key

        return (
          <button
            key={tab.key}
            className={`tab-btn ${isActive ? 'active' : ''} ${
              tab.center ? 'center-btn' : ''
            }`}
            onClick={() => router.push(tab.key)}
          >
            <span className='tab-icon'>{tab.icon}</span>
            {!tab.center && <span className='tab-label'>{tab.label}</span>}
          </button>
        )
      })}
    </div>
  )
}
