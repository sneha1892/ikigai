import { useMemo, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import type { Task, PillarType, Goal } from '../types'
import { PILLAR_CONFIGS } from '../types'
import AddGoalModal from '../components/AddGoalModal'

interface GoalsProps {
  tasks: Task[]
  goals?: Goal[]
  onAddGoal?: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
}

interface PillarWithGoals {
  pillar: PillarType
  name: string
  color: string
  goals: Goal[]
  goalCount: number
}

function Goals({ 
  tasks, 
  goals = [], 
  onAddGoal = () => {} 
}: GoalsProps) {
  const { colors } = useTheme()
  const [addGoalModalOpen, setAddGoalModalOpen] = useState(false)
  const [selectedPillarForAdd, setSelectedPillarForAdd] = useState<PillarType | null>(null)
  
  // Group goals by pillar and sort by goal count (fewest to most)
  const pillarsWithGoals = useMemo((): PillarWithGoals[] => {
    const pillars: PillarType[] = ['mental', 'physical', 'social', 'intellectual']
    
    return pillars
      .map(pillar => {
        const pillarGoals = goals.filter(goal => goal.pillar === pillar)
        return {
          pillar,
          name: PILLAR_CONFIGS[pillar].name,
          color: PILLAR_CONFIGS[pillar].color,
          goals: pillarGoals,
          goalCount: pillarGoals.length
        }
      })
      .sort((a, b) => a.goalCount - b.goalCount) // Sort by goal count (fewest first)
  }, [goals])

  const handleAddGoal = (pillar: PillarType) => {
    setSelectedPillarForAdd(pillar)
    setAddGoalModalOpen(true)
  }

  const handleGoalSubmit = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    onAddGoal(goalData)
    setAddGoalModalOpen(false)
    setSelectedPillarForAdd(null)
  }

  const handleCloseModal = () => {
    setAddGoalModalOpen(false)
    setSelectedPillarForAdd(null)
  }

  // Calculate habits count for a goal
  const getHabitsCountForGoal = (goalId: string) => {
    return tasks.filter(task => task.goalId === goalId).length
  }

  // Get strength indicator dots based on goal count
  const getStrengthDots = (goalCount: number) => {
    const maxDots = 4
    const filledDots = Math.min(goalCount, maxDots)
    const emptyDots = maxDots - filledDots
    
    return {
      filled: filledDots,
      empty: emptyDots
    }
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {/* Main Content - Single vertical scrollable list */}
      <div style={{ 
        height: '100%',
        overflow: 'auto',
        paddingTop: '84px', // Space for top header
        paddingBottom: '40px' // Space for bottom navigation
      }}>
        <div style={{ 
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '100%'
        }}>
          {/* Pillar Cards */}
          {pillarsWithGoals.map((pillarData) => (
            <div
              key={pillarData.pillar}
              className="md-card elevation-2"
              style={{
                backgroundColor: colors.surface,
                borderRadius: '16px',
                border: `1px solid ${colors.borderSubtle}`,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Pillar Header */}
              <div style={{
                padding: '16px 16px 12px 16px',
                borderBottom: pillarData.goalCount > 0 ? `1px solid ${colors.borderSubtle}` : 'none'
              }}>
                {/* Pillar Name and Goal Count */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <h2 style={{
                    color: colors.text.primary,
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: 0,
                    letterSpacing: '-0.2px'
                  }}>
                    {pillarData.name}
                  </h2>
                  <span style={{
                    color: colors.text.tertiary,
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    ({pillarData.goalCount} {pillarData.goalCount === 1 ? 'Goal' : 'Goals'})
                  </span>
                </div>

                {/* Strength Indicator */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center'
                }}>
                  {Array.from({ length: 4 }, (_, index) => {
                    const dots = getStrengthDots(pillarData.goalCount)
                    const isFilled = index < dots.filled
                    return (
                      <div
                        key={index}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: isFilled 
                            ? (pillarData.goalCount === 0 ? '#EF4444' : 
                               pillarData.goalCount <= 2 ? '#F59E0B' : '#10B981')
                            : colors.surfaceVariant,
                          transition: 'all 0.2s ease'
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Pillar Content */}
              <div style={{ padding: '0 16px 16px 16px' }}>
                {pillarData.goalCount === 0 ? (
                  /* Empty State */
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 0'
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        color: colors.text.primary,
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 4px 0'
                      }}>
                        No goals here yet?
                      </p>
                      <p style={{
                        color: colors.text.tertiary,
                        fontSize: '14px',
                        margin: 0
                      }}>
                        Add one to start improving this area of your life.
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddGoal(pillarData.pillar)}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: colors.accent.primary,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                ) : (
                  /* Goals List */
                  <div style={{ paddingTop: '12px' }}>
                    {pillarData.goals.map((goal) => (
                      <div
                        key={goal.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: `1px solid ${colors.borderSubtle}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.hover
                          e.currentTarget.style.marginLeft = '-16px'
                          e.currentTarget.style.marginRight = '-16px'
                          e.currentTarget.style.paddingLeft = '16px'
                          e.currentTarget.style.paddingRight = '16px'
                          e.currentTarget.style.borderRadius = '12px'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.marginLeft = '0'
                          e.currentTarget.style.marginRight = '0'
                          e.currentTarget.style.paddingLeft = '12px'
                          e.currentTarget.style.paddingRight = '12px'
                          e.currentTarget.style.borderRadius = '0'
                        }}
                      >
                        {/* Left Marker */}
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: pillarData.color,
                            marginRight: '16px',
                            flexShrink: 0
                          }}
                        />
                        
                        {/* Goal Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{
                            color: colors.text.primary,
                            fontSize: '16px',
                            fontWeight: '600',
                            margin: '0 0 4px 0',
                            lineHeight: '1.3'
                          }}>
                            {goal.title}
                          </h3>
                          <p style={{
                            color: colors.text.secondary,
                            fontSize: '14px',
                            margin: '0 0 2px 0'
                          }}>
                            Status: {goal.currentStatus}
                          </p>
                          <p style={{
                            color: colors.text.tertiary,
                            fontSize: '12px',
                            margin: 0
                          }}>
                            {getHabitsCountForGoal(goal.id)} {getHabitsCountForGoal(goal.id) === 1 ? 'habit' : 'habits'} added
                          </p>
                        </div>
                        
                        {/* Action Arrow */}
                        <div style={{
                          color: colors.text.quaternary,
                          fontSize: '16px',
                          marginLeft: '12px',
                          flexShrink: 0
                        }}>
                          ›
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Goal Modal */}
      {selectedPillarForAdd && (
        <AddGoalModal
          isOpen={addGoalModalOpen}
          onClose={handleCloseModal}
          onAddGoal={handleGoalSubmit}
          pillar={selectedPillarForAdd}
        />
      )}
    </div>
  )
}

export default Goals
