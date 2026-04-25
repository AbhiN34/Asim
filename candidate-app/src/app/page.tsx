import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        <h1 className="text-4xl font-bold tracking-tight">Candidate Knowledge Graph</h1>
        <p className="text-gray-500 text-lg">
          Submit your profile and let employers discover you through an intelligent knowledge graph.
        </p>
        <Link
          href="/intake"
          className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Submit as Candidate
        </Link>
      </div>
    </main>
  )
}
