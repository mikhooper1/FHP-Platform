import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const entries = body.entries || []

    console.log('Mirror API called with', entries.length, 'entries')

    if (entries.length < 3) {
      return NextResponse.json({ error: 'Not enough entries' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    console.log('API key present:', !!apiKey, 'length:', apiKey?.length)

    if (!apiKey) {
      return NextResponse.json({
        snippet: 'API key not configured.',
        narrative: 'Please add your Anthropic API key to Vercel environment variables.',
        observations: [{ label: 'Setup', text: 'Add ANTHROPIC_API_KEY to Vercel.' }],
        question: 'Is the API key configured in Vercel?'
      })
    }

    const entriesText = entries.slice(0, 5).map((e: any, i: number) =>
      `Entry ${i + 1}: ${e.text}`
    ).join('\n\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `Read these athlete journal entries and return ONLY a JSON object with no markdown:
{"snippet":"one sentence max 20 words","narrative":"2-3 sentences about how this athlete operates","observations":[{"label":"label","text":"observation"},{"label":"label","text":"observation"}],"question":"one question for them"}

Entries:
${entriesText}`
        }]
      })
    })

    console.log('Anthropic response status:', response.status)

    const data = await response.json()
    console.log('Response data keys:', Object.keys(data))

    const text = data.content?.[0]?.text || ''
    console.log('Raw text (first 200):', text.slice(0, 200))

    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim()

    try {
      const parsed = JSON.parse(clean)
      console.log('Parse success')
      return NextResponse.json(parsed)
    } catch (e) {
      console.error('Parse failed, raw:', clean.slice(0, 300))
      // Return fallback with actual AI text embedded
      return NextResponse.json({
        snippet: 'Your mirror is ready.',
        narrative: text.slice(0, 200) || 'Keep reflecting to build your mirror.',
        observations: [
          { label: 'Reflection', text: 'Your entries show growing self-awareness.' },
          { label: 'Patterns', text: 'Continue writing to reveal deeper patterns.' }
        ],
        question: 'What would your best self focus on this week?'
      })
    }

  } catch (err: any) {
    console.error('Route error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
