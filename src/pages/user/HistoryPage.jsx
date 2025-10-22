import React from 'react'

import InvestmentHistory from '../../Components/User/InvestmentHistory'

export default function HistoryPage () {
  return (
    <div>
      <>
        <div className='history-container'></div>
        <InvestmentHistory title={'All Transactions'} />
      </>
    </div>
  )
}
