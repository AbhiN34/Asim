'use client'

import { useState, useTransition } from 'react'
import { submitCandidate } from '@/actions/submit-candidate'
import { StepIndicator } from '@/components/intake/StepIndicator'
import { Step1BasicInfo } from '@/components/intake/Step1BasicInfo'
import { Step2Transcript } from '@/components/intake/Step2Transcript'
import { Step3Survey } from '@/components/intake/Step3Survey'
import type { SurveyAnswers } from '@/lib/survey-questions'

interface IntakeForm {
  name: string
  email: string
  phone: string
  resume: File | null
  transcript: File | null
  transcriptText: string
  surveyAnswers: SurveyAnswers
}

const STEPS = ['Resume', 'Interview', 'Survey']

export default function IntakePage() {
  const [step, setStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<IntakeForm>({
    name: '',
    email: '',
    phone: '',
    resume: null,
    transcript: null,
    transcriptText: '',
    surveyAnswers: {},
  })

  function patch(partial: Partial<IntakeForm>) {
    setForm(f => ({ ...f, ...partial }))
  }

  function handleSubmit() {
    setError(null)
    const fd = new FormData()
    fd.append('name', form.name)
    if (form.email) fd.append('email', form.email)
    if (form.phone) fd.append('phone', form.phone)
    if (form.resume) fd.append('resume', form.resume)
    if (form.transcript) fd.append('transcript', form.transcript)
    fd.append('transcriptText', form.transcriptText)

    for (const [qId, answer] of Object.entries(form.surveyAnswers)) {
      if (Array.isArray(answer)) {
        for (const v of answer) fd.append(`survey_${qId}`, v)
      } else if (answer) {
        fd.append(`survey_${qId}`, answer)
      }
    }

    startTransition(async () => {
      const result = await submitCandidate(fd)
      if (result?.error) setError(result.error)
    })
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-5 max-w-sm px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Building your knowledge graph</h2>
            <p className="text-sm text-gray-500 mt-2">
              We&apos;re extracting skills, traits, and relationships from your submissions. This
              takes 60–90 seconds — please don&apos;t close this tab.
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div className="bg-indigo-600 h-1 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-center mb-6">Candidate Profile</h1>
          <StepIndicator current={step} labels={STEPS} />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === 0 && (
          <Step1BasicInfo
            form={form}
            onChange={patch}
            onNext={() => { setError(null); setStep(1) }}
          />
        )}
        {step === 1 && (
          <Step2Transcript
            transcript={form.transcript}
            transcriptText={form.transcriptText}
            onChange={patch}
            onBack={() => setStep(0)}
            onNext={() => { setError(null); setStep(2) }}
          />
        )}
        {step === 2 && (
          <Step3Survey
            answers={form.surveyAnswers}
            onChange={answers => patch({ surveyAnswers: answers })}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </main>
  )
}
