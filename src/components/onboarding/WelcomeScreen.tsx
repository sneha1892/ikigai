
import { useTheme } from '../../contexts/ThemeContext'

interface WelcomeScreenProps {
  onStartQuiz: () => void
  onSkip: () => void
}

function WelcomeScreen({ onStartQuiz, onSkip }: WelcomeScreenProps) {
  const { colors } = useTheme()
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundColor: colors.background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'auto'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        color: colors.text.primary
      }}>
        {/* Logo/Icon */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '2rem',
          background: 'linear-gradient(45deg, #10B981, #7DD3FC)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🌸
        </div>

        {/* Welcome Title */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: colors.text.primary
        }}>
          Welcome to Ikigai
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.125rem',
          color: colors.text.secondary,
          marginBottom: '4rem',
          lineHeight: '1.6',
          fontWeight: '400',
          maxWidth: '400px',
          margin: '0 auto 4rem auto'
        }}>
          Before we help you build better habits, let's understand where you are in your journey.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <button
            onClick={onStartQuiz}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: colors.text.primary,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            Start Your Journey
          </button>

          <button
            onClick={onSkip}
            style={{
              background: 'none',
              border: 'none',
              color: colors.text.tertiary,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.text.secondary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.text.tertiary
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen
