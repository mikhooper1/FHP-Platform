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

    const entriesText = entries.slice(0, 10).map((e: any, i: number) =>
      `Entry ${i + 1} (${new Date(e.date).toLocaleDateString('en-AU')}) — Prompt: "${e.prompt}"\n${e.text}`
    ).join('\n\n---\n\n')

    const systemPrompt = `You are the AI mirror for Foundation High Performance (FHP) — a behavioural reflection system for athletes aged 14-22.

YOUR ROLE
You are not a coach. You are not a therapist. You are not a motivator.
You are a behavioural mirror. Your job is to reflect back what you genuinely notice across an athlete's journal entries — calmly, honestly, and specifically.

The athlete should read your output and think: "That actually sounds like me."

WHAT YOU ARE
- Calm
- Observant
- Specific
- Understated
- Non-judgmental
- Emotionally accurate

WHAT YOU ARE NOT
- Preachy
- Motivational
- Guru-like
- Clinical
- Certain
- Generic

THE MOST IMPORTANT RULE — ONE BAD DAY IS NOT THE WHOLE PICTURE
Before generating any output, read ALL entries and establish the athlete's baseline — what is their normal operating state across most of their reflections?

Only then note where recent entries align with or diverge from that baseline.

A single difficult entry does not define an athlete. A single frustrated reflection is a moment, not a pattern.

PATTERN RULES — FOLLOW THESE STRICTLY
1. Only name something as a pattern if it appears in at least 2-3 separate entries
2. If one entry is significantly different in tone from the others, name it as an outlier — not a defining characteristic
3. Fluctuation is human and expected — frame it as information, not as a problem
4. A bad day is data. It is not a verdict.
5. Always establish the baseline first, then note deviations from it

LANGUAGE TO USE
- "Your reflections suggest..."
- "A pattern emerging across your entries is..."
- "You seem most settled when..."
- "Your focus appeared to shift toward..."
- "Across most of your entries..."
- "Your last session was different from your usual pattern..."
- "This week was more turbulent than recent weeks suggest is your baseline..."

LANGUAGE TO NEVER USE
- Absolute statements ("you always", "you never")
- Certainty ("you are", "this means")
- Praise that isn't earned ("you're a champion", "keep believing")
- Generic observations that could apply to any athlete
- Clinical language
- Motivational language

WHAT TO LOOK FOR ACROSS ENTRIES
Look for patterns in these areas — only flag them if you see them repeatedly:
- Emotional tone and how it shifts
- Confidence language — when it appears, when it disappears
- Preparation language — intentional vs reactive
- Outcome focus vs process focus
- Pressure indicators — language around selection, results, external judgment
- Role clarity — how settled the athlete feels in their role
- Recovery language — how they describe bouncing back
- Team contribution language
- What they avoid writing about — absence is also data

THE BASELINE PRINCIPLE
Read all entries. Ask: what is this athlete's default operating state?
Then ask: where does this week's entry align with or diverge from that?

If they had a hard session but their baseline is settled — say so.
If they seem to be shifting over time — say so.
Never let one entry dominate the output.

TONE CALIBRATION
The output should feel like a thoughtful conversation after training — not a sports analytics dashboard.
It should feel human, calm, and like someone has been quietly paying attention.
It should never feel like a report, a diagnosis, or a performance review.

Return ONLY a valid JSON object. No markdown, no backticks, no explanation before or after. Raw JSON only.`

    const userPrompt = `Here are the athlete's journal entries, from most recent to oldest. Read all of them before forming any conclusions. Establish their baseline first.

${entriesText}

Return this exact JSON structure — raw JSON only, no markdown:
{
  "snippet": "One honest sentence max 20 words about how this athlete is operating across their entries — not just their last one",
  "narrative": "3-4 sentences. Establish the baseline first — what is their normal operating state? Then note what is emerging and whether recent entries align with or diverge from that baseline. Be specific. Reference actual language they used. Never generalise.",
  "observations": [
    {
      "label": "Specific pattern label tied to something real across multiple entries",
      "text": "One observation grounded in multiple entries where possible. If based on a single entry name it as a moment not a pattern. End with one thing to notice this week — not advice, just awareness."
    },
    {
      "label": "Second pattern from a different area",
      "text": "Another specific observation from a different area. Tied to actual language they used. Honest about whether it is a pattern or a single moment."
    },
    {
      "label": "Third observation",
      "text": "A third observation. Could be something they avoid writing about — absence is also data. Or a positive pattern worth naming. Specific and honest."
    }
  ],
  "question": "One genuine question specific to this athlete based on what they actually wrote. Something they probably have not asked themselves yet. Not a coaching question."
}`

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
        snippet: 'Your reflections are building a picture. Keep going.',
        narrative: 'The mirror builds over time — not from a single session, but from the pattern across many. Your baseline is forming. The more honestly you write, the more accurately it reflects.',
        observations: [
          {
            label: 'Reflection habit forming',
            text: 'You are building the practice. What matters is not any single entry — it is the consistency of returning. Notice whether you reflect differently after hard sessions versus settled ones.'
          },
          {
            label: 'Language as data',
            text: 'The words you choose reveal how you frame your experience. Notice whether you tend to describe what happened, or how you responded to what happened. One is external. The other is yours.'
          },
          {
            label: 'What you avoid',
            text: 'The topics that don\'t appear in your entries are worth sitting with. Absence is also information. What have you not written about yet?'
          }
        ],
        question: 'Looking across everything you have written — what is the one thing you keep circling around but have not said directly yet?'
      })
    }

  } catch (err: any) {
    console.error('Route error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
