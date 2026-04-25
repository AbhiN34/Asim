import { SURVEY_QUESTIONS } from '@/lib/survey-questions'
import type { SurveyAnswers, MultiSelectQuestion } from '@/lib/survey-questions'

const LIKERT_LABELS = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']

interface Props {
  answers: SurveyAnswers
  onChange: (answers: SurveyAnswers) => void
  onBack: () => void
  onSubmit: () => void
}

export function Step3Survey({ answers, onChange, onBack, onSubmit }: Props) {
  function setAnswer(id: string, value: string | string[]) {
    onChange({ ...answers, [id]: value })
  }

  function toggleMultiSelect(id: string, option: string, maxSelect?: number) {
    const current = (answers[id] as string[] | undefined) ?? []
    const isSelected = current.includes(option)
    if (isSelected) {
      setAnswer(id, current.filter(v => v !== option))
    } else if (!maxSelect || current.length < maxSelect) {
      setAnswer(id, [...current, option])
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Character &amp; Interests</h2>
        <p className="text-sm text-gray-500">
          Help employers understand who you are beyond your resume. All questions are optional.
        </p>
      </div>

      <div className="space-y-8 divide-y divide-gray-100">
        {SURVEY_QUESTIONS.map(q => (
          <div key={q.id} className="pt-6 first:pt-0">
            <p className="text-sm font-medium text-gray-800 mb-3">{q.prompt}</p>

            {q.type === 'likert' && (
              <>
                <div className="flex gap-2">
                  {LIKERT_LABELS.map((label, i) => {
                    const val = String(i + 1)
                    const selected = answers[q.id] === val
                    return (
                      <button
                        key={i}
                        title={label}
                        onClick={() => setAnswer(q.id, val)}
                        className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
                          selected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
                        }`}
                      >
                        {i + 1}
                      </button>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">Strongly Disagree</span>
                  <span className="text-xs text-gray-400">Strongly Agree</span>
                </div>
              </>
            )}

            {q.type === 'multi-select' && (() => {
              // Cast to the broader MultiSelectQuestion type so optional maxSelect is accessible
              const msq = q as MultiSelectQuestion
              const selected = (answers[msq.id] as string[] | undefined) ?? []
              return (
                <div className="flex flex-wrap gap-2 items-center">
                  {msq.options.map(option => {
                    const isSelected = selected.includes(option)
                    const atCap = msq.maxSelect !== undefined && selected.length >= msq.maxSelect && !isSelected
                    return (
                      <button
                        key={option}
                        disabled={atCap}
                        onClick={() => toggleMultiSelect(msq.id, option, msq.maxSelect)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : atCap
                            ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                  {msq.maxSelect && (
                    <span className="text-xs text-gray-400">
                      {selected.length}/{msq.maxSelect}
                    </span>
                  )}
                </div>
              )
            })()}

            {q.type === 'free-text' && (
              <textarea
                value={(answers[q.id] as string | undefined) ?? ''}
                onChange={e => setAnswer(q.id, e.target.value)}
                placeholder={q.placeholder}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Build my graph →
        </button>
      </div>
    </div>
  )
}
