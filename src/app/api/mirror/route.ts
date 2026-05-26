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

    const prompt = `You are the AI mirror for Foundation High Performance (FHP), a platform for athletes aged 14-22. Read these journal entries and provide calm, honest, specific insights.

Tone: calm, intelligent, non-judgmental. Like a trusted advisor who has been quietly paying attention. Always specific to what they actually wrote.

You MUST respond with ONLY a valid JSON object. No markdown, no backticks, no explanation. Just the raw JSON.

Required format:
{"snippet":"One sentence insight max 20 words","narrative":"3-4 sentences about how this athlete is currently operating. Specific and honest.","observations":[{"label":"Preparation","text":"Specific observation from their entries"},{"label":"Pressure","text":"Specific observation from their entries"},{"label":"Patterns","text":"Specific observation from their entries"}],"question":"One forward-looking question for them to sit with this week"}

Journal entries to analyse:

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

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic error:', errText)
      return NextResponse.json({ error: 'Anthropic API failed' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    
    // Strip any markdown or extra whitespace
    const clean = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    let parsed
    try {
      parsed = JSON.parse(clean)
    } catch (parseErr) {
      console.error('JSON parse error. Raw text:', text)
      // Return a fallback structure if parsing fails
      return NextResponse.json({
        snippet: 'Your reflections show a pattern worth understanding.',
        narrative: 'The AI has read your entries. Keep reflecting consistently for more specific insights.',
        observations: [
          { label: 'Consistency', text: 'You are building a reflection habit. This is the foundation.' },
          { label: 'Honesty', text: 'Your entries show self-awareness. Trust that process.' },
          { label: 'Growth', text: 'Each entry adds to the picture. Keep going.' }
        ],
        question: 'What would your best self do differently this week?'
      })
    }

    return NextResponse.json(parsed)

  } catch (err) {
    console.error('Mirror route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
