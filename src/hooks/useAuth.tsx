import { useState } from 'react'
import { authService } from '@/API/auth'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const login = async (credentials: { phoneNumber: string; password: string }) => {
    setIsLoading(true)
    setError('')
    
    try {
      await authService.login(credentials)
      navigate('/Admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    navigate('/login')
  }

  return {
    login,
    logout,
    isAuthenticated: authService.isAuthenticated(),
    isLoading,
    error
  }
}