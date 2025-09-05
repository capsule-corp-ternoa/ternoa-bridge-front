import React, { useState, useEffect } from 'react'
import styles from './PasswordProtection.module.scss'

interface PasswordProtectionProps {
  children: React.ReactNode
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated (stored in sessionStorage)
    const authStatus = sessionStorage.getItem('app_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const correctPassword = process.env.NEXT_PUBLIC_APP_PASSWORD

    if (!correctPassword) {
      setError('Password protection not configured')
      return
    }

    if (password === correctPassword) {
      setIsAuthenticated(true)
      sessionStorage.setItem('app_authenticated', 'true')
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('app_authenticated')
    setPassword('')
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.passwordForm}>
          <div className={styles.logo}>
            <h1>Ternoa Bridge</h1>
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Enter Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="Enter access password"
                autoFocus
              />
              {error && <div className={styles.error}>{error}</div>}
            </div>
            <button type="submit" className={styles.submitButton}>
              Access App
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      <button onClick={handleLogout} className={styles.logoutButton} title="Logout">
        🔒
      </button>
    </>
  )
}

export default PasswordProtection
