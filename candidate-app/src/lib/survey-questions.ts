export type QuestionType = 'likert' | 'multi-select' | 'free-text'

export interface LikertQuestion {
  id: string
  type: 'likert'
  prompt: string
  /** Always 5 — strongly disagree → strongly agree */
  scale: 5
}

export interface MultiSelectQuestion {
  id: string
  type: 'multi-select'
  prompt: string
  options: readonly string[]
  /** If set, the form enforces a selection cap */
  maxSelect?: number
}

export interface FreeTextQuestion {
  id: string
  type: 'free-text'
  prompt: string
  placeholder?: string
}

export type SurveyQuestion = LikertQuestion | MultiSelectQuestion | FreeTextQuestion

export const SURVEY_QUESTIONS = [
  {
    id: 'work-style',
    type: 'likert',
    prompt: 'I prefer working independently over collaborating in a team.',
    scale: 5,
  },
  {
    id: 'ambiguity',
    type: 'likert',
    prompt: 'I am comfortable working in ambiguous or fast-changing environments.',
    scale: 5,
  },
  {
    id: 'leadership',
    type: 'likert',
    prompt: 'I naturally take on a leadership role when working in a group.',
    scale: 5,
  },
  {
    id: 'learning-style',
    type: 'multi-select',
    prompt: 'How do you prefer to learn new technical skills? (Select all that apply)',
    options: [
      'Reading documentation',
      'Watching video tutorials',
      'Building side projects',
      'Pair programming with others',
      'Formal courses or certifications',
      'Experimenting and trial/error',
    ],
  },
  {
    id: 'work-environment',
    type: 'multi-select',
    prompt: 'What work environments do you thrive in? (Select up to 3)',
    options: [
      'Early-stage startup',
      'Growth-stage company',
      'Large enterprise',
      'Research/academic setting',
      'Non-profit or mission-driven org',
      'Remote-first',
    ],
    maxSelect: 3,
  },
  {
    id: 'interests',
    type: 'multi-select',
    prompt: 'Which areas excite you most professionally? (Select all that apply)',
    options: [
      'Machine learning / AI',
      'Systems / infrastructure',
      'Product development',
      'Data engineering',
      'Security',
      'Developer tooling',
      'Design / UX',
      'Business / strategy',
    ],
  },
  {
    id: 'proudest-project',
    type: 'free-text',
    prompt: 'Describe a project you are most proud of. What was your role and what did you learn?',
    placeholder: 'Tell us about a project...',
  },
  {
    id: 'biggest-challenge',
    type: 'free-text',
    prompt:
      'Describe a time you faced a significant technical or team challenge. How did you handle it?',
    placeholder: 'Describe the challenge and your approach...',
  },
  {
    id: 'motivation',
    type: 'free-text',
    prompt: 'What kind of problem do you most want to be working on in the next 2–3 years?',
    placeholder: 'What drives you?',
  },
  {
    id: 'strengths',
    type: 'free-text',
    prompt: "What would a former teammate or manager say is your greatest professional strength?",
    placeholder: 'How others describe you...',
  },
] as const satisfies readonly SurveyQuestion[]

export type SurveyAnswers = Record<string, string | string[]>
