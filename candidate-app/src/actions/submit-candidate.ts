'use server'

import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { ingestText } from '@/lib/graphiti'
import { parseUploadedFile } from '@/lib/parse-file'
import { SURVEY_QUESTIONS } from '@/lib/survey-questions'

export async function submitCandidate(formData: FormData): Promise<{ error: string } | void> {
  const name = (formData.get('name') as string | null)?.trim()
  const email = (formData.get('email') as string | null)?.trim() || null
  const phone = (formData.get('phone') as string | null)?.trim() || null
  const resumeFile = formData.get('resume') as File | null
  const transcriptFile = formData.get('transcript') as File | null
  const transcriptPasted = (formData.get('transcriptText') as string | null)?.trim() || null

  if (!name) return { error: 'Name is required.' }
  if (!resumeFile || resumeFile.size === 0) return { error: 'Resume is required.' }

  // Parse resume
  let resumeText: string
  try {
    const parsed = await parseUploadedFile(resumeFile)
    resumeText = parsed.text
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to parse resume.' }
  }

  // Parse transcript (file takes precedence over pasted text)
  let transcriptText: string | null = transcriptPasted
  if (transcriptFile && transcriptFile.size > 0) {
    try {
      const parsed = await parseUploadedFile(transcriptFile)
      transcriptText = parsed.text
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to parse transcript.' }
    }
  }

  // Build survey text blob
  const surveyLines: string[] = ['Candidate survey responses:']
  for (const q of SURVEY_QUESTIONS) {
    const values =
      q.type === 'multi-select'
        ? (formData.getAll(`survey_${q.id}`) as string[])
        : [(formData.get(`survey_${q.id}`) as string | null) ?? '']
    const answer = values.filter(Boolean).join(', ')
    if (!answer) continue
    surveyLines.push(`Q: ${q.prompt}`)
    surveyLines.push(`A: ${answer}`)
    surveyLines.push('')
  }
  const surveyText = surveyLines.length > 1 ? surveyLines.join('\n') : null

  // Create candidate record — get id before ingesting so we can fail gracefully
  const graphGroupId = randomUUID()
  let candidateId: string
  try {
    const candidate = await prisma.candidate.create({
      data: { name, email, phone, graphGroupId, status: 'PROCESSING' },
    })
    candidateId = candidate.id
  } catch {
    return { error: 'Failed to create candidate record. Please try again.' }
  }

  // Ingest episodes into Graphiti (30–90s each — caller shows loading state)
  // redirect() must be called outside try/catch (Next.js throws NEXT_REDIRECT internally)
  let ingestError: string | null = null
  try {
    await ingestText(resumeText, graphGroupId, 'resume')
    if (transcriptText) {
      await ingestText(transcriptText, graphGroupId, 'interview transcript')
    }
    if (surveyText) {
      await ingestText(surveyText, graphGroupId, 'character and interest survey')
    }
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: 'READY' },
    })
  } catch (e) {
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: 'FAILED' },
    })
    ingestError = e instanceof Error ? e.message : 'Graph building failed. Please try again.'
  }

  if (ingestError) return { error: ingestError }

  redirect(`/candidates/${candidateId}`)
}
