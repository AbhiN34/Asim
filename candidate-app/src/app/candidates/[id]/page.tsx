import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

// Profile page — graph visualization implemented in next increment.
export default async function CandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const candidate = await prisma.candidate.findUnique({ where: { id } })
  if (!candidate) notFound()

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">{candidate.name}</h1>
      {candidate.email && <p className="text-gray-500">{candidate.email}</p>}
      {candidate.summary && <p className="text-gray-700">{candidate.summary}</p>}
      <p className="text-sm text-gray-400">
        Status: <span className="font-medium">{candidate.status}</span>
      </p>
      <p className="text-gray-400">Graph visualization — coming next increment</p>
    </div>
  )
}
