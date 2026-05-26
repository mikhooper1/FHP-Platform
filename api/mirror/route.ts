import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { entries } = await req.json()

    if (!entries || entries.length < 3) {
      return NextResponse.json({ error: 'Not enough entries' }, { status: 400 })
    }

    const entriesText = entries.slice(0, 10).map((e: {prompt: string, text: string, date: string}, i: number) =>
      `Entry ${i + 1} (${new Date(e.date).toLocaleDateString('en-AU')}) — Prompt: "${e.prompt}"\n${e.text}`
    ).join('\n\n---\n\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are the AI mirror for Foundation High Performance (FHP), a high-performance platform for athletes aged 14-22. Your job is to read an athlete's journal entries and provide calm, honest, specific insights about their patterns, confidence, preparation habits, and how they respond to pressure.

Tone: calm, intelligent, non-judgmental, practical. Like a trusted performance advisor who has been quietly paying attention. Never generic. Always specific to what they actually wrote.

Format your response as JSON with these exact fields:
{
  "snippet": "One sentence insight for the home screen (max 20 words, no quotes in the text)",
  "narrative": "3-4 sentences describing how this athlete is currently operating. Be specific, honest, warm.",
  "observations": [
    {"label": "Short label", "text": "One specific observation based on their actual entries (1-2 sentences)"},
    {"label": "Short label", "text": "Another observation"},
    {"label": "Short label", "text": "Another observation"}
  ],
  "question": "One forward-looking question for them to sit with this week"
}

Here are their journal entries:

${entriesText}

Respond with only the JSON object, no other text.`
        }]
      })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (e) {
    console.error('Mirror API error:', e)
    return NextResponse.json({ error: 'Failed to generate mirror' }, { status: 500 })
  }
}
