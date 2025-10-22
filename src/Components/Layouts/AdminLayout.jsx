import AdminHeader from '../Admin/AdminHeader'

export default function AdminLayout ({ children }) {
  return (
    <div className='admin-layout'>
      <AdminHeader />
      <div className='content'>
        <main>{children}</main>
      </div>
    </div>
  )
}
