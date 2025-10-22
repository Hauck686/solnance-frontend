import MainHeader from '../User/MainHeader'
import UserTab from '../User/UserTab'

export default function UserLayout ({ children }) {
  return (
    <div>
      <MainHeader />
      <div className='content'>
        <main>{children}</main>
      </div>
      <UserTab />
    </div>
  )
}
