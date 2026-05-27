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

    const entriesText = entries.slice(0, 8).map((e: any, i: number) =>
      `Entry ${i + 1} (${new Date(e.date).toLocaleDateString('en-AU')}) — Prompt: "${e.prompt}"\n${e.text}`
    ).join('\n\n---\n\n')

    const systemPrompt = `You are the AI mirror for Foundation High Performance — a calm, intelligent reflection system for athletes aged 14-22. You have been quietly reading this athlete's journal entries. Your job is to reflect back what you genuinely notice — not what sounds good, but what is actually true based on what they wrote.

The best output you can give an athlete:
1. A specific pattern named honestly — tied to what they actually wrote, not generic
2. An observation that connects their behaviour to something they can recognise in themselves  
3. One thing to notice this week — not advice, just awareness. Something behavioural they can watch for.

Tone: like a trusted person who has been paying close attention. Calm, specific, honest, warm. Never generic. Never coaching-speak. If they wrote something revealing, reflect it back. If there is a pattern in their language, name it.

The four areas this program explores:
- Asking better questions (curiosity, self-awareness, how they frame challenges)
- Preparation and intention (how deliberately they approach training and competition)
- Asking for help (who they lean on, whether they isolate under pressure)
- Letting go of outcome (how much result anxiety appears in their language)

Look for patterns across those four areas. A gap — something they never write about — is also data.

Return ONLY a valid JSON object. No markdown, no backticks, no explanation before or after. Raw JSON only.`

    const userPrompt = `Here are the athlete's journal entries. Read them carefully and generate their mirror.

${entriesText}

Return this exact JSON structure with no markdown:
{"snippet":"One honest sentence max 20 words about how this athlete is operating right now","narrative":"3-4 sentences. Be specific. Reference what they actually wrote. Name the real pattern not the flattering version. What is genuinely true about how this athlete prepares responds to pressure and thinks about themselves","observations":[{"label":"Specific pattern label","text":"One observation tied directly to their entries. Name something specific they wrote and what it reveals. End with one behavioural thing to notice this week."},{"label":"Second pattern","text":"Another specific observation from a different area. Tied to actual language they used. Ends with something to notice."},{"label":"Third pattern","text":"A third observation. Could be something they avoided writing about — a gap is also data."}],"question":"One question to sit with this week. Not a coaching question. A genuine question that only makes sense for this specific athlete based on what they wrote."}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    console.log('Anthropic response status:', response.status)

    const data = await response.json()
    console.log('Response data keys:', Object.keys(data))

    const text = data.content?.[0]?.text || ''
    console.log('Raw text (first 300):', text.slice(0, 300))

    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim()

    try {
      const parsed = JSON.parse(clean)
      console.log('Parse success')
      return NextResponse.json(parsed)
    } catch (e) {
      console.error('Parse failed, raw:', clean.slice(0, 300))
      return NextResponse.json({
        snippet: 'Your mirror is building. Keep reflecting.',
        narrative: 'The AI has read your entries and is identifying patterns. The more specifically you write, the more accurate the mirror becomes.',
        observations: [
          { label: 'Reflection habit', text: 'You are building the practice. Consistency matters more than perfection. Notice whether you reflect differently after hard sessions versus good ones.' },
          { label: 'Language patterns', text: 'The words you choose reveal how you frame your experience. Notice whether you describe situations or your response to them.' },
          { label: 'What you avoid', text: 'The topics that don\'t appear in your entries are worth exploring. Absence is also information.' }
        ],
        question: 'What is the one thing you consistently avoid writing about — and why?'
      })
    }

  } catch (err: any) {
    console.error('Route error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
