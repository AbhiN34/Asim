'use server'

// Full implementation in next increment.
// This stub exists so the intake form can import the action type now.

import { redirect } from 'next/navigation'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function submitCandidate(_formData: FormData): Promise<never> {
  // TODO: parse files → create Candidate record → ingest 3 episodes → update status → redirect
  redirect('/')
}
