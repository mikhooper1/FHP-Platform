import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const entries = body.entries || []

    if (entries.length < 3) {
      return NextResponse.json({ error: 'Not enough entries' }, { status: 400 })
    }

    const entriesText = entries.slice(0, 10).map((e: any, i: number) => {
      const date = new Date(e.date).toLocaleDateString('en-AU')
      return `Entry ${i + 1} (${date})\nPrompt: "${e.prompt}"\n${e.text}`
    }).join('\n\n---\n\n')

    const prompt = `You are the AI mirror for Foundation High Performance (FHP), a platform for athletes aged 14-22. Read these journal entries and provide calm, honest, specific insights about patterns, confidence, preparation habits, and pressure responses.

Tone: calm, intelligent, non-judgmental. Like a trusted advisor who has been quietly paying attention. Be specific to what they actually wrote — never generic.

Respond with ONLY a JSON object in this exact format:
{
  "snippet": "One sentence insight max 20 words",
  "narrative": "3-4 sentences about how this athlete is currently operating. Specific and honest.",
  "observations": [
    {"label": "Preparation", "text": "Specific observation from their entries"},
    {"label": "Pressure", "text": "Specific observation from their entries"},
    {"label": "Patterns", "text": "Specific observation from their entries"}
  ],
  "question": "One forward-looking question for them to sit with this week"
}

Journal entries:

${entriesText}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Mirror error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
