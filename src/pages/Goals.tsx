  import { useMemo, useState, useCallback } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Card } from '../components/ui/Card'
import { typography, components, radius } from '../styles/design-system'
  import type { Task, PillarType, Goal } from '../types'
  import { PILLAR_CONFIGS } from '../types'
  import AddGoalModal from '../components/AddGoalModal'
import { Clock, Coins } from 'lucide-react'
import { calculateHabitStreak, calculateHabitCoins } from '../utils/dateUtils'

  // --- Icon Definitions (Kept the same) ---
  const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      {...props} 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  )

// Removed unused CheckIcon

// Removed unused ClockIcon
  // ----------------------------------------

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

  // GoalCard Component (No change needed here for the layout fix, but kept for context)
const GoalCard: React.FC<{ goal: Goal, pillarColor: string, tasks: Task[], colors: any, shadows: any }> = 
  ({ goal, pillarColor, tasks, colors }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const goalHabits = useMemo(() => tasks.filter(task => task.goalId === goal.id), [tasks, goal.id])
    const habitsCount = goalHabits.length
    
    // Mocking status for demonstration
    const todayHabitsDone = goalHabits.slice(0, Math.min(2, habitsCount)).length
    const todayTotalHabits = habitsCount
    
    const toggleExpand = useCallback(() => setIsExpanded(prev => !prev), [])

  return (
    <Card
      variant="default"
      interactive
      onClick={toggleExpand}
      style={{ padding: 0 }}
    >
        {/* Goal Header (Always Visible) */}
        <div 
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: isExpanded ? `1px solid ${colors.borderSubtle}` : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {/* Pillar Color Dot */}
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: pillarColor,
                marginRight: '12px',
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              color: colors.text.primary,
              fontSize: '18px',
              fontWeight: 600,
              margin: 0,
              lineHeight: '22px'
            }}>
                {goal.title}
              </h3>
              <p style={{
                color: colors.text.tertiary,
                fontSize: '14px',
                margin: '4px 0 0 0',
              }}>
                Status: {goal.currentStatus} • {habitsCount} {habitsCount === 1 ? 'Habit' : 'Habits'} Added
              </p>
            </div>
          </div>
          
          {/* Toggle Icon */}
          <ChevronDownIcon 
            style={{
              marginLeft: '12px',
              color: colors.text.secondary,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        </div>

        {/* Habits List (Collapsible Content) */}
        <div 
          style={{
            maxHeight: isExpanded ? '500px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease-in-out',
          }}
        >
          <div style={{ padding: '0 16px 16px 16px' }}>
            <p style={{ 
              color: colors.text.secondary, 
              fontSize: '14px', 
              fontWeight: '600',
              margin: '8px 0'
            }}>
              Daily Focus: {todayHabitsDone}/{todayTotalHabits} Habits Done Today
            </p>

          {habitsCount > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {goalHabits.map((habit) => {
                const isHabit = Boolean(habit.challengeDuration || habit.repeatFrequency !== 'once')
                const streak = calculateHabitStreak(habit.completionDates || [], habit.challengeDuration)
                const coins = calculateHabitCoins(habit.completionDates || [])
                return (
                  <li key={habit.id} style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', borderRadius: '10px', minHeight: isHabit ? '36px' : '44px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <div style={{ 
                          color: colors.text.secondary,
                          fontSize: '14px',
                          fontWeight: 500
                        }}>
                          {habit.name}
                        </div>
                        {habit.startTime && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            fontSize: '10px', color: colors.text.tertiary,
                            backgroundColor: colors.surfaceVariant,
                            padding: '2px 5px', borderRadius: '4px'
                          }}>
                            <Clock size={9} /> {habit.startTime}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Coins size={10} color={coins > 0 ? '#F59E0B' : colors.text.quaternary} />
                          <span style={{ fontSize: '10px', color: coins > 0 ? colors.text.secondary : colors.text.quaternary, fontWeight: coins > 0 ? '500' : '400' }}>
                            {coins}
                          </span>
                        </div>
                        {streak.total > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {Array.from({ length: Math.min(7, streak.total) }).map((_, idx) => (
                                <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', background: idx < streak.current ? 'linear-gradient(135deg, #10B981, #34D399)' : colors.surfaceVariant, border: idx < streak.current ? '1px solid #059669' : `1px solid ${colors.borderSubtle}` }} />
                              ))}
                              {streak.total > 7 && (
                                <span style={{ fontSize: '8px', color: colors.text.secondary, marginLeft: '3px', fontWeight: '500' }}>+{streak.total - 7}</span>
                              )}
                            </div>
                            <span style={{ fontSize: '9px', color: colors.text.tertiary }}>{streak.current}/{streak.total}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
              <p style={{ color: colors.text.tertiary, fontSize: '14px', fontStyle: 'italic', paddingLeft: '12px' }}>
                Time to add some habits for this goal!
              </p>
            )}
          </div>
        </div>
    </Card>
    )
  }
  // End GoalCard

  // Main Goals Component
  function Goals({ 
    tasks, 
    goals = [], 
    onAddGoal = () => {} 
  }: GoalsProps) {
    const { colors, shadows } = useTheme()
    const [addGoalModalOpen, setAddGoalModalOpen] = useState(false)
    const [selectedPillarForAdd, setSelectedPillarForAdd] = useState<PillarType | null>(null)
    const [activePillar, setActivePillar] = useState<PillarType>('mental')
    
    const pillarsWithGoals = useMemo((): PillarWithGoals[] => {
      const pillars: PillarType[] = ['mental', 'physical', 'social', 'intellectual']
      
      return pillars.map(pillar => {
        const pillarGoals = goals.filter(goal => goal.pillar === pillar)
        return {
          pillar,
          name: PILLAR_CONFIGS[pillar].name,
          color: PILLAR_CONFIGS[pillar].color,
          goals: pillarGoals,
          goalCount: pillarGoals.length
        }
      })
    }, [goals])

    const activePillarData = useMemo(() => 
      pillarsWithGoals.find(p => p.pillar === activePillar) || pillarsWithGoals[0], 
      [activePillar, pillarsWithGoals]
    )

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
    
    return (
      <div style={{ height: '100%', width: '100%', position: 'relative', overflowY: 'auto' }}>
        
        {/* Fixed Header Content (Pillar Tabs) - FIX APPLIED HERE */}
        <div 
          style={{
            position: 'sticky',
            top: 0,
            width: '100%',
            paddingTop: '60px',
            backgroundColor: colors.background,
            zIndex: 10,
            boxShadow: shadows.sm
          }}
        >
        <div style={{ padding: '0 16px' }}> {/* Inner container for padding */}
            <h1 style={{
              color: colors.text.primary,
              fontSize: typography.scale.title1.fontSize,
              lineHeight: typography.scale.title1.lineHeight,
              fontWeight: typography.scale.title1.fontWeight,
              margin: '0 0 12px 0',
              letterSpacing: typography.scale.title1.letterSpacing
            }}>
                  Goals
              </h1>
          </div>
          
        {/* Pillar Filter Tabs (2x2 Grid on small screens, 4 columns on md+) */}
        <div id="pillars-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          rowGap: '8px',
          padding: '0 16px 12px 16px'
        }}>
          {pillarsWithGoals.map((pillarData) => {
              const isActive = pillarData.pillar === activePillar
              return (
              <button
                  key={pillarData.pillar}
                  onClick={() => setActivePillar(pillarData.pillar)}
                  style={{
                  whiteSpace: 'normal',
                  padding: components.button.padding.sm,
                  borderRadius: radius.md,
                  border: isActive ? `1px solid ${colors.border}` : `1px solid ${colors.borderSubtle}`,
                  backgroundColor: isActive ? colors.selected : colors.surface,
                  color: isActive ? colors.text.primary : colors.text.secondary,
                  fontSize: '14px',
                  lineHeight: '20px',
                  fontWeight: 600,
                  letterSpacing: '0px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  width: '100%',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: isActive ? shadows.sm : 'none',
                  outline: 'none'
                  }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isActive ? colors.selected : colors.hover }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isActive ? colors.selected : colors.surface }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.boxShadow = shadows.md }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = isActive ? shadows.sm : 'none' }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = `${isActive ? shadows.sm : 'none'}, 0 0 0 3px ${colors.text.accent}33` as any }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = isActive ? shadows.sm : 'none' }}
              >
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '999px',
                  backgroundColor: pillarData.color,
                  flexShrink: 0
                }} />
                <span style={{ fontWeight: 600 }}>{pillarData.name}</span>
                <span style={{
                  fontSize: '12px',
                  color: isActive ? colors.text.secondary : colors.text.tertiary,
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.borderSubtle}`,
                  padding: '2px 6px',
                  borderRadius: '999px'
                }}>{pillarData.goalCount}</span>
                </button>
              )
            })}
        </div>
        <style>
          {`
            @media (min-width: 768px) {
              #pillars-grid { grid-template-columns: repeat(4, 1fr); }
            }
          `}
        </style>
        </div>

        {/* Main Content - Scrollable Goal List */}
        <div 
          style={{ 
            padding: '16px',
            paddingBottom: '80px', 
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {activePillarData.goalCount === 0 ? (
            /* Empty State for Selected Pillar */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 16px',
              textAlign: 'center',
              backgroundColor: colors.surface,
              borderRadius: '16px',
              border: `1px solid ${colors.borderSubtle}`,
            }}>
              <h2 style={{ color: colors.text.primary, fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                No goals in {activePillarData.name} yet.
              </h2>
              <p style={{ color: colors.text.tertiary, fontSize: '14px', margin: 0 }}>
                Tap the '+' button to add your first goal for this pillar.
              </p>
            </div>
          ) : (
            /* Goals List for Selected Pillar */
            activePillarData.goals.map((goal) => (
              <GoalCard 
                key={goal.id}
                goal={goal}
                pillarColor={activePillarData.color}
                tasks={tasks}
                colors={colors}
                shadows={shadows}
              />
            ))
          )}
        </div>

        {/* Floating Action Button (FAB) */}
        <button
          onClick={() => handleAddGoal(activePillar)}
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '100px', 
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: colors.accent.primary,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            boxShadow: shadows.lg,
            zIndex: 20,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = shadows.xl
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = shadows.lg
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

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