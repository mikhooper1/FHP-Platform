import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const entries = body.entries || []
    const stage = body.stage || 'standard'
    const athleteName = body.athleteName || ''

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ snippet: 'API key not configured.' })
    }

    if (entries.length < 1) {
      return NextResponse.json({ snippet: '' })
    }

    const entriesText = entries.map((e: any, i: number) =>
      `Entry ${i + 1} (${e.type || e.prompt || 'reflection'}): ${e.text || e.response || ''}`
    ).join('\n\n')

    let systemPrompt = ''

    if (stage === 'early') {
      systemPrompt = `You are the FHP Mirror — a calm, observant behavioural mirror for young athletes aged 15-18.

The athlete has just completed their first two reflections. You have very limited evidence.

Your job right now is to give ONE restrained, honest observation — maximum two sentences. 

Rules:
- Must be tied to something they actually wrote — never generic
- Do NOT claim to identify a pattern — it is too early
- Do NOT say "you are someone who..." 
- Do NOT give advice
- Should create mild curiosity
- Tone: calm, specific, understated

If the evidence is too thin to say anything specific, say: "It's too early to call anything a pattern yet. But what you've described is worth holding onto this week."

The athlete's name is ${athleteName}.`
    } else {
      systemPrompt = `You are the FHP Mirror — a calm, observant behavioural mirror for young athletes aged 15-18.

Your job is to reflect what you notice in the athlete's own words. You are not a coach, not a therapist, not a problem detector.

Progressive Signal Logic — use this to calibrate confidence:
- First Signal: something appeared once. Note it cautiously. Never call it a pattern.
- Repeated Signal: appeared more than once. Beginning to emerge. Name it carefully.
- Developing Pattern: appears consistently across multiple entries. Moderate confidence.
- Stronger Evidence: appears repeatedly with specificity across different contexts. Reflect with confidence.

Core rules:
- Always look for what is working BEFORE identifying anything to develop
- Never give more than one thing to develop
- If evidence is thin: say "There isn't a clear pattern here yet"
- Never manufacture certainty
- Tone: calm, specific, understated, honest — never motivational, never generic
- Do NOT say "you are someone who..."
- Maximum 3-4 sentences for standard responses

The athlete's name is ${athleteName}.`
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Here are the athlete's reflections:\n\n${entriesText}\n\nProvide your mirror response now. Plain text only — no headers, no bullet points, no formatting.`
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Anthropic API error:', error)
      return NextResponse.json({ snippet: 'There isn\'t a clear pattern here yet.' })
    }

    const data = await response.json()
    const snippet = data.content?.[0]?.text || ''

    return NextResponse.json({ snippet })

  } catch (error) {
    console.error('Mirror route error:', error)
    return NextResponse.json({ snippet: 'There isn\'t a clear pattern here yet.' })
  }
}