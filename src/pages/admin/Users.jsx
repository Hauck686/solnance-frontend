import React from 'react'

import UserTable from '../../Components/Admin/Table'

export default function Users () {
  return (
    <div className={'admin-users'}>
      <div className={'admin-users-header'}>
        <UserTable />
      </div>
    </div>
  )
}
