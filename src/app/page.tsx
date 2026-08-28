'use client'

import { useState, useEffect, useRef } from 'react'
import { lessons, type Lesson } from '@/lib/lessons'

type Page = 'home' | 'lesson' | 'journal' | 'mirror'

const FORMSPREE_URL = 'https://formspree.io/f/mlgvdppd'

const PROMPTS = [
  'What mattered most today?',
  'Where did pressure show up?',
  'What gave you confidence?',
  'Did my behaviour match my standards?',
  'What is one thing to carry into tomorrow?',
]

function getWeekNumber(): number {
  const stored = localStorage.getItem('fhp_start_date')
  if (!stored) {
    localStorage.setItem('fhp_start_date', new Date().toISOString())
    return 1
  }
  const start = new Date(stored)
  const now = new Date()
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7))
  return Math.min(diff + 1, 4)
}

// ── SHARED STYLES ──
const eyebrow = (color = 'var(--ink3)'): React.CSSProperties => ({
  fontFamily: 'Barlow Condensed',
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: '0.28em',
  textTransform: 'uppercase' as const,
  color,
  marginBottom: 10,
  display: 'block',
})

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '11px 22px',
  fontFamily: 'Barlow Condensed',
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
  borderRadius: 7,
  background: 'var(--orange)',
  border: '1.5px solid var(--orange)',
  color: 'white',
  transition: 'all 0.13s',
}

const btnOutline: React.CSSProperties = {
  ...btnPrimary,
  background: 'transparent',
  border: '1.5px solid var(--cream4)',
  color: 'var(--ink3)',
}

const card: React.CSSProperties = {
  background: 'var(--white)',
  border: '1px solid var(--cream3)',
  borderRadius: 14,
  padding: '24px',
}

const section: React.CSSProperties = {
  marginBottom: 32,
  paddingBottom: 32,
  borderBottom: '1px solid var(--cream3)',
}

export default function Home() {
  const [onboarded, setOnboarded] = useState(false)
  const [obStep, setObStep] = useState(1)
  const [athleteName, setAthleteName] = useState('')
  const [athleteEmail, setAthleteEmail] = useState('')
  const [page, setPage] = useState<Page>('home')
  const [journalText, setJournalText] = useState('')
  const [journalPrompt, setJournalPrompt] = useState(PROMPTS[0])
  const [journalSaved, setJournalSaved] = useState(false)
  const [journalEntries, setJournalEntries] = useState<{text: string, prompt: string, date: string}[]>([])
  const [currentWeek, setCurrentWeek] = useState(1)
  const [aiInsight, setAiInsight] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [mirrorData, setMirrorData] = useState<Record<string, unknown> | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(true)
  const [firstReflection1, setFirstReflection1] = useState('')
  const [firstReflection2, setFirstReflection2] = useState('')
  const recognitionRef = useRef<any>(null)
  const mainRef = useRef<HTMLElement>(null)

  const activeLesson: Lesson | null =
    lessons.find(l => l.week === `Week ${currentWeek}` && l.status === 'published') ??
    lessons.find(l => l.status === 'published') ??
    null

  useEffect(() => {
    const saved = localStorage.getItem('fhp_athlete_name')
    if (saved) {
      setAthleteName(saved)
      setOnboarded(true)
      setCurrentWeek(getWeekNumber())
    }
    const entries = JSON.parse(localStorage.getItem('fhp_journal') || '[]')
    setJournalEntries(entries)
    const savedInsight = localStorage.getItem('fhp_mirror_insight')
    if (savedInsight) setAiInsight(savedInsight)
    const savedSummary = localStorage.getItem('fhp_mirror_summary')
    if (savedSummary) {
      try { setMirrorData(JSON.parse(savedSummary)) } catch {}
    }
  }, [])

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [page])

  async function handleBegin() {
    if (!athleteName.trim()) return
    localStorage.setItem('fhp_athlete_name', athleteName.trim())

    const entries = []
    if (firstReflection1.trim()) {
      entries.push({
        text: firstReflection1.trim(),
        prompt: 'Think about a recent time you performed really well. What was going on before it?',
        date: new Date().toISOString()
      })
    }
    if (firstReflection2.trim()) {
      entries.push({
        text: firstReflection2.trim(),
        prompt: "Think about a time you weren't quite yourself. What was different?",
        date: new Date().toISOString()
      })
    }
    if (entries.length > 0) {
      localStorage.setItem('fhp_journal', JSON.stringify(entries))
      setJournalEntries(entries)
    }
    setObStep(2)
  }

  async function handleEnter() {
    if (athleteEmail.trim() && athleteEmail.includes('@')) {
      localStorage.setItem('fhp_athlete_email', athleteEmail.trim())
      try {
        await fetch(FORMSPREE_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: athleteName, email: athleteEmail, source: 'FHP Academy' }),
        })
      } catch {}
    }
    setCurrentWeek(getWeekNumber())
    setOnboarded(true)
  }

  async function generateAiInsight(entries: typeof journalEntries) {
    if (entries.length < 1) return
    setAiLoading(true)
    try {
      const response = await fetch('/api/mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })
      if (!response.ok) throw new Error('API failed')
      const parsed = await response.json()
      setAiInsight(parsed.snippet || '')
      setMirrorData(parsed)
      localStorage.setItem('fhp_mirror_insight', parsed.snippet || '')
      localStorage.setItem('fhp_mirror_summary', JSON.stringify(parsed))
    } catch (e) {
      console.error('AI error:', e)
    }
    setAiLoading(false)
  }

  function saveJournal() {
    if (!journalText.trim()) return
    if (isRecording) stopRecording()
    const entries = JSON.parse(localStorage.getItem('fhp_journal') || '[]')
    const newEntry = { text: journalText, prompt: journalPrompt, date: new Date().toISOString() }
    entries.unshift(newEntry)
    localStorage.setItem('fhp_journal', JSON.stringify(entries))
    setJournalEntries(entries)
    setJournalSaved(true)
    generateAiInsight(entries)
  }

  function stopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
  }

  function startRecording(setter: (v: string) => void, current: string) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { setVoiceSupported(false); return }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-AU'
    let finalTranscript = current
    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + t
        } else { interim = t }
      }
      setter(finalTranscript + (interim ? ' ' + interim : ''))
    }
    recognition.onerror = () => { setIsRecording(false); recognitionRef.current = null }
    recognition.onend = () => { setIsRecording(false); recognitionRef.current = null }
    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }

  function toggleRecording(setter: (v: string) => void, current: string) {
    if (isRecording) { stopRecording(); return }
    startRecording(setter, current)
  }

  function navTo(p: Page) { setPage(p) }

  const firstName = athleteName.split(' ')[0] || 'there'
  const wordCount = journalText.trim() ? journalText.trim().split(/\s+/).length : 0

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'lesson', label: 'This week' },
    { id: 'journal', label: 'Reflect' },
    { id: 'mirror', label: 'My mirror' },
  ]

  const VoiceBtn = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '9px 16px', fontFamily: 'Barlow Condensed', fontSize: 10,
      fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase' as const,
      cursor: 'pointer', borderRadius: 7,
      background: isRecording ? 'var(--orange)' : 'var(--white)',
      border: `1.5px solid ${isRecording ? 'var(--orange)' : 'var(--cream4)'}`,
      color: isRecording ? 'white' : 'var(--ink3)',
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: isRecording ? 'white' : 'var(--orange)', display: 'inline-block' }} />
      {isRecording ? 'Stop' : 'Speak'}
    </button>
  )

  const privacyNote = (
    <p style={{ fontSize: 11, color: 'var(--ink4)', textAlign: 'center', lineHeight: 1.6, marginTop: 12 }}>
      Your reflections are private. Only the AI reads them to help you notice patterns. No coach, parent or school can see what you write.
    </p>
  )

  // ── ONBOARDING ──
  if (!onboarded) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <img src="/logo.png" alt="Foundation High Performance" style={{ width: 220, height: 'auto', margin: '0 auto', display: 'block' }} />
          </div>

          {/* STEP 1 — Name first, then reflections */}
          {obStep === 1 && (
            <div>
              <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 32, fontWeight: 300, letterSpacing: '0.02em', color: 'var(--ink)', marginBottom: 6, textAlign: 'center', lineHeight: 1.1 }}>
                Welcome to FHP.
              </h1>
              <p style={{ fontSize: 13.5, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7, textAlign: 'center', marginBottom: 24 }}>
                Understand how you actually prepare, respond and perform.
              </p>

              <input
                style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream4)', borderRadius: 7, padding: '13px 15px', fontFamily: 'Barlow', fontSize: 15, color: 'var(--ink)', outline: 'none', marginBottom: 24, display: 'block' }}
                placeholder="Your first name"
                value={athleteName}
                onChange={e => setAthleteName(e.target.value)}
              />

              {athleteName.trim() && (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: 15, fontWeight: 400, color: 'var(--ink)', lineHeight: 1.35, marginBottom: 10 }}>
                      {athleteName.split(' ')[0]}, think about a recent time you performed really well. What was going on before it?
                    </div>
                    <VoiceBtn onClick={() => toggleRecording(setFirstReflection1, firstReflection1)} />
                    <textarea
                      value={firstReflection1}
                      onChange={e => setFirstReflection1(e.target.value)}
                      style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 8, padding: '14px 16px', fontFamily: 'Barlow', fontSize: 14, fontWeight: 300, lineHeight: 1.7, resize: 'none', minHeight: 80, outline: 'none', color: 'var(--ink)', display: 'block', marginTop: 8 }}
                      placeholder="Speak or write here..."
                    />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: 15, fontWeight: 400, color: 'var(--ink)', lineHeight: 1.35, marginBottom: 10 }}>
                      Think about a time you weren&apos;t quite yourself. What was different?
                    </div>
                    <VoiceBtn onClick={() => toggleRecording(setFirstReflection2, firstReflection2)} />
                    <textarea
                      value={firstReflection2}
                      onChange={e => setFirstReflection2(e.target.value)}
                      style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 8, padding: '14px 16px', fontFamily: 'Barlow', fontSize: 14, fontWeight: 300, lineHeight: 1.7, resize: 'none', minHeight: 80, outline: 'none', color: 'var(--ink)', display: 'block', marginTop: 8 }}
                      placeholder="Speak or write here..."
                    />
                  </div>
                </>
              )}

              <button
                onClick={handleBegin}
                disabled={!athleteName.trim()}
                style={{ ...btnPrimary, width: '100%', justifyContent: 'center', opacity: athleteName.trim() ? 1 : 0.5 }}>
                Continue →
              </button>

              {privacyNote}
            </div>
          )}

          {/* STEP 2 — How it works + email */}
          {obStep === 2 && (
            <div>
              <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 30, fontWeight: 300, color: 'var(--ink)', marginBottom: 8, textAlign: 'center', lineHeight: 1.1 }}>
                Here&apos;s how it works.
              </h1>
              <p style={{ fontSize: 13.5, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7, textAlign: 'center', marginBottom: 24 }}>
                The more honestly you use this, the more useful it becomes.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  ['01', 'Learn something', 'Each week covers one idea about how you prepare and perform under pressure.'],
                  ['02', 'Try it and reflect', 'At the end of each day, take five minutes to note what actually happened.'],
                  ['03', 'Notice what keeps showing up', 'Over time FHP helps you see patterns in how you think and perform.'],
                ].map(([num, title, desc]) => (
                  <div key={num} style={{ display: 'flex', gap: 16, padding: '14px', background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 10 }}>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: 20, fontWeight: 600, color: 'var(--orange)', flexShrink: 0, lineHeight: 1, paddingTop: 2 }}>{num}</div>
                    <div>
                      <div style={{ fontFamily: 'Barlow Condensed', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 3 }}>{title}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.6 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <input
                style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream4)', borderRadius: 7, padding: '13px 15px', fontFamily: 'Barlow', fontSize: 15, color: 'var(--ink)', outline: 'none', marginBottom: 14, display: 'block' }}
                placeholder="Your email — to save your progress"
                type="email"
                value={athleteEmail}
                onChange={e => setAthleteEmail(e.target.value)}
              />

              <button onClick={handleEnter} style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>
                Start →
              </button>

              {privacyNote}
            </div>
          )}

          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 20 }}>
            {[1, 2].map(i => (
              <div key={i} style={{ width: 18, height: 2, borderRadius: 1, background: i <= obStep ? 'var(--orange)' : 'var(--cream3)', transition: 'background 0.2s' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── MAIN APP ──
  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: 1000, margin: '0 auto' }}>

      {/* SIDEBAR */}
      <nav style={{ width: 184, flexShrink: 0, background: 'var(--white)', borderRight: '1px solid var(--cream3)', display: 'flex', flexDirection: 'column', padding: '28px 0 24px', position: 'sticky', top: 0, height: '100vh' }} className="desktop-sidebar">
        <div style={{ padding: '0 18px 22px', borderBottom: '1px solid var(--cream3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="FHP" style={{ width: 32, height: 'auto', display: 'block' }} />
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink3)', textTransform: 'uppercase', lineHeight: 1.5 }}>Athlete<br />Platform</div>
        </div>

        {navItems.map(({ id, label }) => (
          <div key={id} onClick={() => navTo(id as Page)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontSize: 13.5, letterSpacing: '0.04em', color: page === id ? 'var(--orange)' : 'var(--ink3)', borderLeft: `2px solid ${page === id ? 'var(--orange)' : 'transparent'}`, marginBottom: 2, background: page === id ? 'var(--orange-t)' : 'transparent' }}>
            {label}
          </div>
        ))}

        <div style={{ margin: '20px 18px 0', padding: '14px', background: 'var(--cream)', borderRadius: 8 }}>
          <div style={{ ...eyebrow(), marginBottom: 8, fontSize: 8 }}>Program progress</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {[1, 2, 3, 4].map(w => (
              <div key={w} style={{ flex: 1, height: 3, borderRadius: 2, background: w <= currentWeek ? 'var(--orange)' : 'var(--cream3)' }} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink4)' }}>Week {currentWeek} of 4</div>
        </div>

        <div style={{ marginTop: 'auto', padding: '16px 18px 0', borderTop: '1px solid var(--cream3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--orange)', background: 'var(--orange-t)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed', fontSize: 11, fontWeight: 600, color: 'var(--orange)', flexShrink: 0 }}>
              {firstName[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 12, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.2 }}>{athleteName}</div>
              <div style={{ fontSize: 10, color: 'var(--ink4)' }}>Week {currentWeek} of 4</div>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main ref={mainRef} style={{ flex: 1, padding: '48px 40px 100px', overflowY: 'auto', minWidth: 0 }}>

        {/* HOME */}
        {page === 'home' && (
          <div>
            <div style={{ marginBottom: 36 }}>
              <span style={eyebrow('var(--orange)')}>Week {currentWeek}</span>
              <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 42, fontWeight: 300, letterSpacing: '0.02em', color: 'var(--ink)', lineHeight: 1.0 }}>
                Good morning, {firstName}.
              </h1>
            </div>

            <div style={section}>
              <span style={eyebrow()}>This week&apos;s focus</span>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 26, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.15, marginBottom: 16 }}>
                {activeLesson?.focusTitle ?? 'No lesson published yet.'}
              </div>
              <button onClick={() => navTo('lesson')} style={btnPrimary}>Open lesson →</button>
            </div>

            <div style={section}>
              <span style={eyebrow()}>This week&apos;s action</span>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 16, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.45 }}>
                {activeLesson?.action ?? '—'}
              </div>
            </div>

            <div style={section}>
              <span style={eyebrow()}>
                From your mirror
                <span style={{ fontSize: 9, color: 'var(--ink4)', fontWeight: 400, marginLeft: 8, letterSpacing: '0.08em', textTransform: 'none' as const }}>
                  — builds as you reflect
                </span>
              </span>
              {journalEntries.length === 0 ? (
                <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7 }}>
                  Your mirror builds as you reflect. Start by adding your first entry today.
                </div>
              ) : journalEntries.length < 3 ? (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7, marginBottom: 12 }}>
                    {3 - journalEntries.length} more {3 - journalEntries.length === 1 ? 'entry' : 'entries'} before patterns start to emerge.
                  </div>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ width: 32, height: 3, borderRadius: 2, background: i <= journalEntries.length ? 'var(--orange)' : 'var(--cream3)' }} />
                    ))}
                    <span style={{ fontSize: 11, color: 'var(--ink4)', marginLeft: 4 }}>{journalEntries.length} / 3</span>
                  </div>
                </div>
              ) : aiLoading ? (
                <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink4)', fontStyle: 'italic' }}>Reading your entries...</div>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontStyle: 'italic', fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.7, marginBottom: 12 }}>
                    &ldquo;{aiInsight || 'Keep reflecting — your mirror is building.'}&rdquo;
                  </div>
                  <button onClick={() => navTo('mirror')} style={{ fontFamily: 'Barlow Condensed', fontSize: 9, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--orange)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Read your full mirror →
                  </button>
                </>
              )}
            </div>

            <div>
              <span style={eyebrow()}>Today</span>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 16, fontWeight: 400, color: 'var(--ink)', marginBottom: 14 }}>
                Five minutes. One honest entry.
              </div>
              <button onClick={() => navTo('journal')} style={btnPrimary}>Reflect now →</button>
            </div>
          </div>
        )}

        {/* LESSON */}
        {page === 'lesson' && (
          <div style={{ maxWidth: 580 }}>
            {activeLesson ? (
              <>
                <div style={{ marginBottom: 36 }}>
                  <span style={eyebrow('var(--orange)')}>{activeLesson.week} · Lesson</span>
                  <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 38, fontWeight: 300, letterSpacing: '0.02em', color: 'var(--ink)', lineHeight: 1.05 }}>
                    {activeLesson.title}
                  </h1>
                </div>

                <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.8, marginBottom: 28 }}>{activeLesson.intro}</p>

                {activeLesson.video ? (
                  <div style={{ position: 'relative', width: '100%', maxWidth: 300, margin: '0 auto 32px', borderRadius: 10, overflow: 'hidden', aspectRatio: '9/16', background: '#111', border: '1px solid var(--cream3)' }}>
                    <iframe src={activeLesson.video} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
                  </div>
                ) : (
                  <div style={{ width: '100%', maxWidth: 300, margin: '0 auto 32px', aspectRatio: '9/16', borderRadius: 10, border: '1px solid var(--cream3)', background: 'var(--cream2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink4)' }}>Video coming soon</div>
                  </div>
                )}

                <div style={{ marginBottom: 28 }}>
                  <span style={eyebrow()}>The framework</span>
                  {activeLesson.framework.split('\n\n').map((para, i) => (
                    <p key={i} style={{ fontSize: 14, fontWeight: para.includes('—') ? 500 : 300, color: para.includes('—') ? 'var(--ink)' : 'var(--ink2)', lineHeight: 1.8, marginBottom: 12 }}>{para}</p>
                  ))}
                </div>

                <div style={{ marginBottom: 28 }}>
                  <span style={eyebrow()}>Your exercise</span>
                  <div style={{ background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 8, padding: '15px 18px', fontSize: 14, fontStyle: 'italic', fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7, marginBottom: 12 }}>
                    {activeLesson.prompt}
                  </div>
                  <textarea style={{ width: '100%', background: 'var(--cream)', border: '1px solid var(--cream3)', borderRadius: 8, padding: '14px 16px', fontFamily: 'Barlow', fontSize: 13.5, fontWeight: 300, color: 'var(--ink)', resize: 'none', minHeight: 90, outline: 'none', lineHeight: 1.7 }}
                    placeholder="Write your response here..." />
                </div>

                {activeLesson.pdfUrl && (
                  <div style={{ marginBottom: 28 }}>
                    <span style={eyebrow()}>Download</span>
                    <a href={activeLesson.pdfUrl} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 8, padding: '14px 18px', textDecoration: 'none' }}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--ink4)" strokeWidth="1.3"><path d="M3.5 2h8l4 4v10a1 1 0 01-1 1H3.5a1 1 0 01-1-1V3a1 1 0 011-1z" /><path d="M11.5 2v5h4" /></svg>
                      <div>
                        <div style={{ fontFamily: 'Barlow Condensed', fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>{activeLesson.pdfLabel}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink4)', marginTop: 2 }}>Tap to download</div>
                      </div>
                    </a>
                  </div>
                )}

                <div style={{ background: 'var(--ink)', borderRadius: 14, padding: '28px 30px' }}>
                  <span style={{ fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase' as const, color: 'rgba(232,132,26,0.8)', marginBottom: 10, display: 'block' }}>
                    {activeLesson.week} commitment
                  </span>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 17, fontWeight: 300, color: 'white', lineHeight: 1.3, marginBottom: 16 }}>
                    {activeLesson.commitQ}
                  </div>
                  <textarea style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '14px 16px', fontFamily: 'Barlow', fontSize: 14, fontWeight: 300, color: 'white', resize: 'none', minHeight: 64, outline: 'none', lineHeight: 1.6 }}
                    placeholder="This week, regardless of the result, I will..." />
                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => navTo('home')} style={btnPrimary}>Save and return →</button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 18, fontWeight: 300, color: 'var(--ink)', marginBottom: 8 }}>Week {currentWeek} lesson coming soon.</div>
              </div>
            )}
          </div>
        )}

        {/* REFLECT */}
        {page === 'journal' && (
          <div style={{ maxWidth: 540 }}>
            <div style={{ marginBottom: 36 }}>
              <span style={eyebrow('var(--orange)')}>Daily reflection</span>
              <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 42, fontWeight: 300, color: 'var(--ink)' }}>Reflect.</h1>
              <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink3)', marginTop: 6, lineHeight: 1.6 }}>
                Your reflections are private. Only the AI reads them to help you notice patterns over time.
              </p>
            </div>

            <span style={eyebrow()}>Choose a prompt</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {PROMPTS.map(q => (
                <button key={q} onClick={() => setJournalPrompt(q)}
                  style={{ fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '6px 12px', border: `1px solid ${journalPrompt === q ? 'var(--orange)' : 'var(--cream4)'}`, borderRadius: 40, color: journalPrompt === q ? 'var(--orange)' : 'var(--ink3)', background: journalPrompt === q ? 'var(--orange-t)' : 'transparent', cursor: 'pointer' }}>
                  {q}
                </button>
              ))}
            </div>

            {!journalSaved ? (
              <>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 19, fontWeight: 300, color: 'var(--ink)', lineHeight: 1.25, marginBottom: 16 }}>{journalPrompt}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <VoiceBtn onClick={() => { if (isRecording) { stopRecording(); return }; startRecording(setJournalText, journalText) }} />
                  {isRecording && <span style={{ fontSize: 12, color: 'var(--orange)', fontStyle: 'italic' }}>Listening...</span>}
                </div>
                <textarea value={journalText} onChange={e => setJournalText(e.target.value)}
                  style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 8, padding: '18px 20px', fontFamily: 'Barlow', fontSize: 14, fontWeight: 300, lineHeight: 1.8, resize: 'none', minHeight: 160, outline: 'none', color: 'var(--ink)' }}
                  placeholder="Speak or write here. This space is yours." />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                  <span style={{ fontSize: 11, color: 'var(--ink4)' }}>{wordCount} words</span>
                  <button onClick={saveJournal} style={btnPrimary}>Save →</button>
                </div>
              </>
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 22, fontWeight: 300, color: 'var(--ink)', marginBottom: 8 }}>Saved.</div>
                <div style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7, maxWidth: 300, margin: '0 auto 24px' }}>
                  {journalEntries.length >= 3
                    ? 'Your mirror is updating.'
                    : `${3 - journalEntries.length} more ${3 - journalEntries.length === 1 ? 'entry' : 'entries'} before patterns start to emerge.`}
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => { setJournalSaved(false); setJournalText('') }} style={btnOutline}>Add another</button>
                  <button onClick={() => { setPage('mirror'); setJournalSaved(false); setJournalText('') }} style={btnPrimary}>View my mirror →</button>
                </div>
              </div>
            )}

            {!journalSaved && journalEntries.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <span style={eyebrow()}>Recent entries</span>
                {journalEntries.slice(0, 3).map((entry, i) => (
                  <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--cream3)' }}>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink4)', marginBottom: 4 }}>
                      {new Date(entry.date).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.5 }}>
                      {entry.text.slice(0, 120)}{entry.text.length > 120 ? '...' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MIRROR */}
        {page === 'mirror' && (
          <div style={{ maxWidth: 580 }}>
            <div style={{ marginBottom: 36 }}>
              <span style={eyebrow('var(--orange)')}>Your mirror</span>
              <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 42, fontWeight: 300, color: 'var(--ink)' }}>What FHP notices.</h1>
              <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink3)', marginTop: 6, lineHeight: 1.6 }}>
                The more honestly you reflect, the more accurately this builds a picture of how you actually operate.
              </p>
            </div>

            {journalEntries.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: '40px 24px' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 18, fontWeight: 300, color: 'var(--ink)', marginBottom: 10 }}>Nothing here yet.</div>
                <div style={{ fontSize: 13.5, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.75, maxWidth: 300, margin: '0 auto 20px' }}>
                  Start with one honest reflection. That&apos;s enough to begin.
                </div>
                <button onClick={() => navTo('journal')} style={btnPrimary}>Reflect now →</button>
              </div>
            ) : journalEntries.length < 3 ? (
              <div>
                <div style={{ ...card, textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 18, fontWeight: 300, color: 'var(--ink)', marginBottom: 10 }}>The picture is forming.</div>
                  <div style={{ fontSize: 13.5, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.75, maxWidth: 320, margin: '0 auto 20px' }}>
                    It&apos;s too early to call anything a pattern yet. Keep checking in and FHP will start to notice what keeps showing up.
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ width: 28, height: 3, borderRadius: 2, background: i <= journalEntries.length ? 'var(--orange)' : 'var(--cream3)' }} />
                    ))}
                    <span style={{ fontSize: 11, color: 'var(--ink4)', marginLeft: 4 }}>{journalEntries.length} of 3</span>
                  </div>
                  <button onClick={() => navTo('journal')} style={btnPrimary}>Add a reflection →</button>
                </div>

                {journalEntries.length > 0 && (
                  <div style={{ background: 'var(--white)', border: '1px solid var(--cream3)', borderLeft: '2px solid var(--orange)', borderRadius: '0 8px 8px 0', padding: '16px 20px' }}>
                    <span style={{ ...eyebrow(), marginBottom: 8 }}>One thing worth noticing from today</span>
                    <div style={{ fontSize: 14, fontStyle: 'italic', fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.75 }}>
                      &ldquo;It&apos;s too early to call this a pattern — but keep checking in this week and we&apos;ll see whether it appears again.&rdquo;
                    </div>
                  </div>
                )}
              </div>
            ) : aiLoading ? (
              <div style={{ ...card, textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 16, fontWeight: 300, color: 'var(--ink)', marginBottom: 8 }}>Reading your entries...</div>
                <div style={{ fontSize: 13, color: 'var(--ink3)' }}>This takes a moment.</div>
              </div>
            ) : mirrorData ? (
              <div>
                <div style={{ marginBottom: 28 }}>
                  <span style={{ fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink4)', marginBottom: 14, display: 'block' }}>
                    Based on {journalEntries.length} {journalEntries.length === 1 ? 'entry' : 'entries'}
                  </span>
                  <p style={{ fontSize: 15, fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.85 }}>
                    {(mirrorData.narrative as string) ?? ''}
                  </p>
                </div>

                <div style={{ height: 1, background: 'var(--cream3)', margin: '28px 0' }} />

                <span style={eyebrow()}>What&apos;s showing up</span>
                {((mirrorData.observations as Array<{label: string, text: string}>) ?? []).map((obs, i) => (
                  <div key={i} style={{ padding: '18px 0', borderBottom: '1px solid var(--cream3)' }}>
                    <span style={{ ...eyebrow(), marginBottom: 8 }}>{obs.label}</span>
                    <div style={{ fontSize: 14, fontStyle: 'italic', fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.75 }}>&ldquo;{obs.text}&rdquo;</div>
                  </div>
                ))}

                <div style={{ background: 'var(--ink)', borderRadius: 14, padding: '28px 30px', marginTop: 28 }}>
                  <span style={{ fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: 'rgba(232,132,26,0.7)', marginBottom: 10, display: 'block' }}>
                    Something to sit with
                  </span>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 18, fontWeight: 300, color: 'white', lineHeight: 1.3, marginBottom: 8 }}>
                    {(mirrorData.question as string) ?? ''}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 300, color: 'rgba(254,252,248,0.4)', lineHeight: 1.6 }}>
                    Let it surface in your reflections this week.
                  </div>
                </div>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <button onClick={() => generateAiInsight(journalEntries)} style={btnOutline}>Refresh mirror</button>
                </div>
              </div>
            ) : (
              <div style={{ ...card, textAlign: 'center', padding: '40px 24px' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 18, fontWeight: 300, color: 'var(--ink)', marginBottom: 8 }}>Ready to build your mirror.</div>
                <div style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 20, lineHeight: 1.6 }}>You have {journalEntries.length} entries. FHP will read them now.</div>
                <button onClick={() => generateAiInsight(journalEntries)} style={btnPrimary}>Generate my mirror →</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <div style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--white)', borderTop: '1px solid var(--cream3)', padding: '8px 0', zIndex: 50 }} className="mobile-nav">
        <div style={{ display: 'flex', justifyContent: 'space-around', maxWidth: 500, margin: '0 auto' }}>
          {navItems.map(({ id, label }) => (
            <button key={id} onClick={() => navTo(id as Page)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: page === id ? 'var(--orange)' : 'var(--ink4)', fontWeight: page === id ? 600 : 400 }}>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: page === id ? 'var(--orange)' : 'transparent', marginBottom: 2 }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 640px) {
          .desktop-sidebar { display: none !important; }
          .mobile-nav { display: block !important; }
          main { padding: 28px 20px 90px !important; }
        }
      ` }} />
    </div>
  )
}
