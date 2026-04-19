import { addWeeks, addMonths, addYears, startOfDay } from 'date-fns'

export type TimeframeOption = '1_week' | '2_weeks' | '1_month' | '3_months' | '6_months' | '1_year' | 'custom'

export function calculateDeadline(timeframe: TimeframeOption, customDate?: Date): string | null {
  const now = new Date()
  let targetDate = now

  switch (timeframe) {
    case '1_week':
      targetDate = addWeeks(now, 1)
      break
    case '2_weeks':
      targetDate = addWeeks(now, 2)
      break
    case '1_month':
      targetDate = addMonths(now, 1)
      break
    case '3_months':
      targetDate = addMonths(now, 3)
      break
    case '6_months':
      targetDate = addMonths(now, 6)
      break
    case '1_year':
      targetDate = addYears(now, 1)
      break
    case 'custom':
      if (customDate) return customDate.toISOString()
      return null
    default:
      return null
  }

  // Set to end of the day or start of day depending on preference
  // End of day is typically better for deadlines
  targetDate.setHours(23, 59, 59, 999)
  return targetDate.toISOString()
}

export interface SmartAnswers {
  specific: string
  measurable: string
  achievable: string
  relevant: string
  timebound: string 
}

export function generateSmartMarkdown(answers: SmartAnswers): string {
  return `### 🎯 S.M.A.R.T. Protocol

**Specific:**
${answers.specific || '*Not defined*'}

**Measurable:**
${answers.measurable || '*Not defined*'}

**Achievable:**
${answers.achievable || '*Not defined*'}

**Relevant:**
${answers.relevant || '*Not defined*'}

**Time-bound:**
${answers.timebound || '*Not defined*'}
`
}
