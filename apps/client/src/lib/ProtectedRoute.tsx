import { useAuthData } from '../context/AuthContext'
import Loading from '../components/Loading'
import type { Role } from '@dispatchx/shared'
import { Navigate } from 'react-router-dom'
import type React from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode,
  allowedRoles: Role[]
}

const ProtectedRoute = ({children, allowedRoles}: ProtectedRouteProps) => {

  const {user, loading} = useAuthData()
  
  
  if (loading) {
   return <Loading/>
  }

  if (!loading && !user) {
   return <Navigate to="/login" /> 
  }
  
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />  
  }
  return (
    <>
      {children}
    </>
  )
}

export default ProtectedRoute