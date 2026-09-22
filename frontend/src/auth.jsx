import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { get, post, setToken } from './api.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // lister profile or null
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setUser(await get('/api/lister/me/'))
    } catch {
      setUser(null) // 401 / 403: not a logged-in lister
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = async (username, password) => {
    const fd = new FormData()
    fd.append('username', username)
    fd.append('password', password)
    const profile = await post('/api/lister/login/', fd)
    setToken(profile.token)
    setUser(profile)
    return profile
  }

  const logout = async () => {
    try {
      await post('/api/lister/logout/')
    } finally {
      setToken(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}
