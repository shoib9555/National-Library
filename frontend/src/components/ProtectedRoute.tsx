import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { getCurrentUser } from "../apis/authApi"

interface ProtectedRouteProps {
  allowedRole: "LIBRARIAN" | "STUDENT"
}

function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const verifyUser = async () => {
      const token = sessionStorage.getItem("token")

      if (!token) {
        setIsAuthenticated(false)
        return
      }

      try {
        const data = await getCurrentUser()

        if (data.user.role === allowedRole) {
          setIsAuthenticated(true)
          setIsAuthorized(true)
        } else {
          setIsAuthenticated(true)
          setIsAuthorized(false)
        }
      } catch (error) {
        console.error("Authentication verification failed:", error)

        sessionStorage.removeItem("token")
        sessionStorage.removeItem("role")

        setIsAuthenticated(false)
      }
    }

    verifyUser()
  }, [allowedRole])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Checking authentication...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute