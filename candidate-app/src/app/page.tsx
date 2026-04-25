import Link from 'next/link'
import { prisma } from '@/lib/prisma'

function StatusBadge({ status }: { status: string }) {
  if (status === 'READY')
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Ready
      </span>
    )
  if (status === 'PROCESSING')
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        Processing
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Failed
    </span>
  )
}

export default async function Dashboard() {
  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const total = candidates.length
  const ready = candidates.filter(c => c.status === 'READY').length
  const processing = candidates.filter(c => c.status === 'PROCESSING').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Candidate Knowledge Graphs</h1>
            <p className="text-xs text-gray-400 mt-0.5">Powered by Graphiti + Neo4j</p>
          </div>
          <Link
            href="/intake"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            + Create New Graph
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Stats row */}
        {total > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Candidates', value: total },
              { label: 'Graphs Ready', value: ready },
              { label: 'Processing', value: processing },
            ].map(stat => (
              <div
                key={stat.label}
                className="bg-white border border-gray-200 rounded-xl px-6 py-4"
              >
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Candidate list */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Candidate Graphs
          </h2>

          {candidates.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl py-20 text-center">
              <p className="text-gray-400 text-sm mb-4">No candidate graphs yet.</p>
              <Link
                href="/intake"
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                + Create New Graph
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
              {candidates.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {c.email ?? 'No email'} &middot;{' '}
                        {new Date(c.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <StatusBadge status={c.status} />
                    {c.status === 'READY' ? (
                      <Link
                        href={`/candidates/${c.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        View Graph →
                      </Link>
                    ) : c.status === 'PROCESSING' ? (
                      <span className="text-sm text-gray-400">Building…</span>
                    ) : (
                      <span className="text-sm text-red-400">See errors</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
