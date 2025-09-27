import type { QuizQuestion as QuizQuestionType, QuizOption } from '../../types'
import { PILLAR_CONFIGS } from '../../types'
import { useTheme } from '../../contexts/ThemeContext'

interface QuizQuestionProps {
  question: QuizQuestionType
  selectedOption: string | null
  onSelectOption: (optionId: string) => void
  onNext: () => void
  onBack: () => void
  currentQuestion: number
  totalQuestions: number
  canGoNext: boolean
  canGoBack: boolean
}

function QuizQuestion({
  question,
  selectedOption,
  onSelectOption,
  onNext,
  onBack,
  currentQuestion,
  totalQuestions,
  canGoNext,
  canGoBack
}: QuizQuestionProps) {
  const { colors } = useTheme()
  
  const getOptionColor = (option: QuizOption) => {
    if (option.pillar) {
      return PILLAR_CONFIGS[option.pillar].color
    }
    return '#10B981' // Default green
  }

  const getOptionBackground = (option: QuizOption, isSelected: boolean) => {
    const color = getOptionColor(option)
    return isSelected ? `${color}20` : colors.surface
  }

  const getOptionBorder = (option: QuizOption, isSelected: boolean) => {
    const color = getOptionColor(option)
    return isSelected ? `2px solid ${color}` : `1px solid ${colors.border}`
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundColor: colors.background,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      overflow: 'auto'
    }}>
      {/* Progress Bar */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto 2rem auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <span style={{
            color: colors.text.secondary,
            fontSize: '0.9rem'
          }}>
            Question {currentQuestion} of {totalQuestions}
          </span>
          <span style={{
            color: '#10B981',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            {Math.round((currentQuestion / totalQuestions) * 100)}% Complete
          </span>
        </div>
        
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: colors.surfaceVariant,
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(currentQuestion / totalQuestions) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #10B981, #059669)',
            borderRadius: '3px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%'
        }}>
          {/* Question Text */}
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: '3rem',
            lineHeight: '1.4'
          }}>
            {question.text}
          </h2>

          {/* Options */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '3rem'
          }}>
            {question.options.map((option) => {
              const isSelected = selectedOption === option.id
              
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    onSelectOption(option.id)
                    // Auto-advance to next question after a brief delay for visual feedback
                    setTimeout(() => {
                      onNext()
                    }, 600)
                  }}
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    backgroundColor: getOptionBackground(option, isSelected),
                    border: getOptionBorder(option, isSelected),
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = `${getOptionColor(option)}10`
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = `0 4px 12px ${getOptionColor(option)}20`
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = getOptionBackground(option, false)
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '4px',
                      height: '100%',
                      backgroundColor: getOptionColor(option)
                    }} />
                  )}

                  {/* Icon */}
                  <div style={{
                    fontSize: '1.5rem',
                    minWidth: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {option.icon}
                  </div>

                  {/* Text Content */}
                  <div style={{
                    flex: 1
                  }}>
                    <div style={{
                      color: colors.text.primary,
                      fontSize: '1rem',
                      fontWeight: '400',
                      lineHeight: '1.5'
                    }}>
                      {option.text}
                    </div>
                  </div>

                  {/* Selected Check */}
                  {isSelected && (
                    <div style={{
                      minWidth: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: getOptionColor(option),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem'
                    }}>
                      ✓
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={onBack}
              disabled={!canGoBack}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: canGoBack ? colors.text.secondary : colors.text.quaternary,
                backgroundColor: 'transparent',
                border: canGoBack ? `1px solid ${colors.border}` : `1px solid ${colors.borderSubtle}`,
                borderRadius: '8px',
                cursor: canGoBack ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (canGoBack) {
                  e.currentTarget.style.backgroundColor = colors.hover
                  e.currentTarget.style.color = colors.text.primary
                }
              }}
              onMouseLeave={(e) => {
                if (canGoBack) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = colors.text.secondary
                }
              }}
            >
              ← Back
            </button>

            <button
              onClick={onNext}
              disabled={!canGoNext}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#fff',
                background: canGoNext 
                  ? 'linear-gradient(135deg, #10B981, #059669)' 
                  : colors.surfaceVariant,
                border: 'none',
                borderRadius: '8px',
                cursor: canGoNext ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                boxShadow: canGoNext ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (canGoNext) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (canGoNext) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)'
                }
              }}
            >
              {currentQuestion === totalQuestions ? 'Finish' : 'Next'} →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizQuestion
