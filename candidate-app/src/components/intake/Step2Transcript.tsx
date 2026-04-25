'use client'

import { useState } from 'react'

type Mode = 'file' | 'text'

interface Props {
  transcript: File | null
  transcriptText: string
  onChange: (patch: { transcript?: File | null; transcriptText?: string }) => void
  onBack: () => void
  onNext: () => void
}

export function Step2Transcript({ transcript, transcriptText, onChange, onBack, onNext }: Props) {
  const [mode, setMode] = useState<Mode>('file')

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Interview Transcript</h2>
        <p className="text-sm text-gray-500">
          Optional — upload or paste a transcript to add richer context to your graph.
        </p>
      </div>

      <div className="flex rounded-lg overflow-hidden border border-gray-200 w-fit">
        <button
          onClick={() => setMode('file')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'file'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Upload file
        </button>
        <button
          onClick={() => setMode('text')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'text'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Paste text
        </button>
      </div>

      {mode === 'file' ? (
        <label
          className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            transcript
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={e => onChange({ transcript: e.target.files?.[0] ?? null })}
          />
          {transcript ? (
            <div className="text-center px-4">
              <p className="text-sm font-medium text-indigo-700 truncate max-w-xs">
                {transcript.name}
              </p>
              <p className="text-xs text-indigo-400 mt-1">Click to replace</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-500">Click to upload PDF, DOCX, or TXT</p>
              <p className="text-xs text-gray-400 mt-1">Max 10 MB</p>
            </div>
          )}
        </label>
      ) : (
        <textarea
          value={transcriptText}
          onChange={e => onChange({ transcriptText: e.target.value })}
          placeholder="Paste your interview transcript here..."
          rows={10}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
