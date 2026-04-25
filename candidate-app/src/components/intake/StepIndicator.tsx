interface Props {
  current: number
  labels: string[]
}

export function StepIndicator({ current, labels }: Props) {
  return (
    <nav className="flex items-center justify-center">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < current
                  ? 'bg-indigo-600 text-white'
                  : i === current
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span
              className={`mt-1 text-xs font-medium ${
                i === current ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div
              className={`w-16 h-0.5 mb-4 mx-1 transition-colors ${
                i < current ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </nav>
  )
}
