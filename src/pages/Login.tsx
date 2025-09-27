import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

function Login() {
  const { signInWithGoogle } = useAuth()
  const { colors } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in failed:', error)
      // You could add error toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`,
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'linear-gradient(45deg, #10B981, #059669)',
        opacity: '0.1',
        filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '30%',
        right: '15%',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(45deg, #C4B5FD, #8B5CF6)',
        opacity: '0.1',
        filter: 'blur(30px)'
      }} />

      {/* Main content */}
      <div style={{
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%',
        zIndex: 1
      }}>
        {/* Logo/Icon area */}
        <div style={{
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            padding: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}>
            <img 
              src="/ikigai-logo.png" 
              alt="Ikigai Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>

        {/* App name */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: colors.text.primary,
          margin: '0 0 16px 0',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Ikigai
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: '18px',
          color: '#10B981',
          margin: '0 0 48px 0',
          fontWeight: '500',
          letterSpacing: '0.5px',
          lineHeight: '1.4'
        }}>
          Plan, Track, Control your Life
        </p>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: colors.text.secondary,
          margin: '0 0 40px 0',
          lineHeight: '1.5',
          maxWidth: '320px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Build better habits across the four pillars of well-being: Mental, Physical, Social, and Intellectual growth.
        </p>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          style={{
            width: '100%',
            maxWidth: '300px',
            padding: '16px 24px',
            backgroundColor: '#fff',
            color: '#333',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            margin: '0 auto'
          }}
          onMouseOver={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)'
            }
          }}
          onMouseOut={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          {isLoading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #ddd',
                borderTop: '2px solid #333',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Signing in...
            </>
          ) : (
            <>
              {/* Google Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Footer text */}
        <p style={{
          fontSize: '12px',
          color: colors.text.tertiary,
          margin: '24px 0 0 0',
          lineHeight: '1.4'
        }}>
          By signing in, you agree to our terms of service and privacy policy
        </p>
      </div>

      {/* CSS Animation for loading spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default Login
