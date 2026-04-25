'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-red-600 font-medium">{error.message}</p>
        <button
          onClick={reset}
          className="text-indigo-600 underline text-sm"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
