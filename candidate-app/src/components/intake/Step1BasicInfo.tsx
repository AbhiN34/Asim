'use client'

import { useState } from 'react'

interface FormSlice {
  name: string
  email: string
  phone: string
  resume: File | null
}

interface Props {
  form: FormSlice
  onChange: (patch: Partial<FormSlice>) => void
  onNext: () => void
}

export function Step1BasicInfo({ form, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!form.resume) e.resume = 'Please upload your resume.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Basic Information</h2>
        <p className="text-sm text-gray-500">
          We&apos;ll extract skills and experience from your resume to build your graph.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder="Jane Smith"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => onChange({ email: e.target.value })}
              placeholder="jane@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => onChange({ phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resume <span className="text-red-500">*</span>
          </label>
          <label
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              form.resume
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={e => onChange({ resume: e.target.files?.[0] ?? null })}
            />
            {form.resume ? (
              <div className="text-center px-4">
                <p className="text-sm font-medium text-indigo-700 truncate max-w-xs">
                  {form.resume.name}
                </p>
                <p className="text-xs text-indigo-400 mt-1">Click to replace</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-500">Click to upload PDF or DOCX</p>
                <p className="text-xs text-gray-400 mt-1">Max 10 MB</p>
              </div>
            )}
          </label>
          {errors.resume && <p className="mt-1 text-xs text-red-600">{errors.resume}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => validate() && onNext()}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
