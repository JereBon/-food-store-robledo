import type { PropsWithChildren } from 'react'

import { Navigate, useLocation } from 'react-router-dom'

import type { RoleCode } from '@/shared/stores/authStore'
import { useAuthStore } from '@/shared/stores/authStore'

type Props = PropsWithChildren<{
  roles?: RoleCode[]
}>

export function ProtectedRoute({ children, roles }: Props) {
  const location = useLocation()
  const accessToken = useAuthStore((s) => s.accessToken)
  const userRoles = useAuthStore((s) => s.roles)

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && roles.length > 0) {
    const ok = roles.some((r) => userRoles.includes(r))
    if (!ok) {
      return <Navigate to="/403" replace />
    }
  }

  return <>{children}</>
}
