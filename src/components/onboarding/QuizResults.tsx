import type { QuizResults } from '../../types'
import { PILLAR_CONFIGS } from '../../types'

interface QuizResultsProps {
  results: QuizResults
  onContinue: () => void
}

function QuizResults({ results, onContinue }: QuizResultsProps) {
  const pillarConfig = PILLAR_CONFIGS[results.leastFocusedPillar]

  const getTimeIcon = (time: string) => {
    switch (time) {
      case '5-10 minutes': return '⚡'
      case '15-30 minutes': return '🕐'
      case '45-60 minutes': return '🕑'
      case '60+ minutes': return '🕒'
      default: return '🕐'
    }
  }

  const getMotivationIcon = (motivation: string) => {
    switch (motivation) {
      case 'streaks': return '🔥'
      case 'tracking': return '📊'
      case 'achievements': return '🏆'
      case 'satisfaction': return '🧘'
      default: return '🔥'
    }
  }

  const getTimingIcon = (timing: string) => {
    switch (timing) {
      case 'morning': return '🌅'
      case 'evening': return '🌙'
      case 'flexible': return '⚡'
      case 'throughout-day': return '🌊'
      default: return '🌅'
    }
  }

  const getApproachText = (approach: string) => {
    switch (approach) {
      case 'gentle': return 'Start small and build gradually'
      case 'focused': return 'Focus on one thing at a time'
      case 'structured': return 'Create detailed plans and systems'
      case 'balanced': return 'Balance multiple areas together'
      default: return 'Take a balanced approach'
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        color: '#fff'
      }}>
        {/* Success Icon */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '1.5rem',
          background: 'linear-gradient(45deg, #10B981, #7DD3FC)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          ✨
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '1rem',
          background: 'linear-gradient(45deg, #fff, #e5e7eb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Your Personal Profile
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: '#9CA3AF',
          marginBottom: '2.5rem',
          lineHeight: '1.6'
        }}>
          Based on your answers, here's what we learned about you:
        </p>

        {/* Focus Area */}
        <div style={{
          backgroundColor: `${pillarConfig.color}20`,
          border: `2px solid ${pillarConfig.color}40`,
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '4px',
            backgroundColor: pillarConfig.color
          }} />
          
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: pillarConfig.color,
            marginBottom: '1rem'
          }}>
            Your Focus Area
          </h3>
          
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            {results.leastFocusedPillar === 'mental' ? '🧠' :
             results.leastFocusedPillar === 'physical' ? '💪' :
             results.leastFocusedPillar === 'social' ? '💜' : '🎯'}
          </div>
          
          <h4 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#fff',
            marginBottom: '0.5rem'
          }}>
            {pillarConfig.name}
          </h4>
          
          <p style={{
            color: '#D1D5DB',
            fontSize: '1rem',
            lineHeight: '1.5'
          }}>
            This is where we'll help you build your first meaningful habit to create positive momentum.
          </p>
        </div>

        {/* Personal Preferences Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Time Commitment */}
          <div style={{
            backgroundColor: '#2d2d2d',
            border: '1px solid #374151',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>
              {getTimeIcon(results.recommendedTimeCommitment)}
            </div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#10B981',
              marginBottom: '0.5rem'
            }}>
              Time Commitment
            </h4>
            <p style={{
              color: '#D1D5DB',
              fontSize: '0.9rem'
            }}>
              {results.recommendedTimeCommitment}
            </p>
          </div>

          {/* Motivation Style */}
          <div style={{
            backgroundColor: '#2d2d2d',
            border: '1px solid #374151',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>
              {getMotivationIcon(results.preferredMotivation)}
            </div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#10B981',
              marginBottom: '0.5rem'
            }}>
              Motivation Style
            </h4>
            <p style={{
              color: '#D1D5DB',
              fontSize: '0.9rem'
            }}>
              {results.preferredMotivation === 'streaks' ? 'Streaks & Momentum' :
               results.preferredMotivation === 'tracking' ? 'Progress Tracking' :
               results.preferredMotivation === 'achievements' ? 'Achievement Unlocks' :
               'Inner Satisfaction'}
            </p>
          </div>

          {/* Preferred Timing */}
          <div style={{
            backgroundColor: '#2d2d2d',
            border: '1px solid #374151',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>
              {getTimingIcon(results.preferredTiming)}
            </div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#10B981',
              marginBottom: '0.5rem'
            }}>
              Best Time
            </h4>
            <p style={{
              color: '#D1D5DB',
              fontSize: '0.9rem'
            }}>
              {results.preferredTiming === 'morning' ? 'Morning Person' :
               results.preferredTiming === 'evening' ? 'Night Owl' :
               results.preferredTiming === 'flexible' ? 'Burst Mode' :
               'Steady Flow'}
            </p>
          </div>

          {/* Approach */}
          <div style={{
            backgroundColor: '#2d2d2d',
            border: '1px solid #374151',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>
              🎯
            </div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#10B981',
              marginBottom: '0.5rem'
            }}>
              Your Approach
            </h4>
            <p style={{
              color: '#D1D5DB',
              fontSize: '0.9rem'
            }}>
              {getApproachText(results.approach)}
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div style={{
          backgroundColor: '#1F2937',
          border: '1px solid #374151',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2.5rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#10B981',
            marginBottom: '1rem'
          }}>
            What's Next?
          </h3>
          <p style={{
            color: '#D1D5DB',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            We'll help you create your first habit specifically designed for your {pillarConfig.name.toLowerCase()} goals, 
            taking just {results.recommendedTimeCommitment} of your day.
          </p>
          <p style={{
            color: '#9CA3AF',
            fontSize: '0.9rem',
            fontStyle: 'italic'
          }}>
            Remember: Small, consistent actions create lasting change. Let's start your journey!
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          style={{
            width: '100%',
            maxWidth: '300px',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#fff',
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
          Create My First Habit
        </button>
      </div>
    </div>
  )
}

export default QuizResults
