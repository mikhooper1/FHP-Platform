'use client'

import { useState, useEffect } from 'react'
import { lessons, type Lesson } from '@/lib/lessons'

type Page = 'home' | 'lesson' | 'journal' | 'mirror'
type View = 'athlete' | 'admin'

const WELCOME_VIDEO = 'https://player.vimeo.com/video/1193469934?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479'
const FORMSPREE_URL = 'https://formspree.io/f/mlgvdppd'

export default function Home() {
  const [onboarded, setOnboarded] = useState(false)
  const [obStep, setObStep] = useState(1)
  const [athleteName, setAthleteName] = useState('')
  const [athleteEmail, setAthleteEmail] = useState('')
  const [page, setPage] = useState<Page>('home')
  const [view, setView] = useState<View>('athlete')
  const [mirrorState, setMirrorState] = useState<'early' | 'developed'>('early')
  const [journalText, setJournalText] = useState('')
  const [journalPrompt, setJournalPrompt] = useState('What mattered most today?')
  const [journalSaved, setJournalSaved] = useState(false)
  const [activeLesson] = useState<Lesson | null>(lessons.find(l => l.status === 'published') ?? null)

  useEffect(() => {
    const saved = localStorage.getItem('fhp_athlete_name')
    if (saved) {
      setAthleteName(saved)
      setOnboarded(true)
    }
  }, [])

  async function handleOnboard() {
    if (!athleteName.trim()) return
    if (!athleteEmail.trim() || !athleteEmail.includes('@')) return

    localStorage.setItem('fhp_athlete_name', athleteName.trim())
    localStorage.setItem('fhp_athlete_email', athleteEmail.trim())

    // Send to Formspree
    try {
      await fetch(FORMSPREE_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: athleteName, email: athleteEmail, source: 'FHP Academy onboarding' }),
      })
    } catch {}

    setObStep(2)
  }

  function handleEnter() {
    setOnboarded(true)
  }

  function saveJournal() {
    if (!journalText.trim()) return
    const entries = JSON.parse(localStorage.getItem('fhp_journal') || '[]')
    entries.unshift({ text: journalText, prompt: journalPrompt, date: new Date().toISOString() })
    localStorage.setItem('fhp_journal', JSON.stringify(entries))
    setJournalSaved(true)
  }

  const firstName = athleteName.split(' ')[0] || 'there'

  // ── ONBOARDING ──
  if (!onboarded) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
        <div style={{ width: '100%', maxWidth: 390, padding: '0 24px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <img src="/logo.png" alt="Foundation High Performance" style={{ width: 200, height: 'auto', margin: '0 auto', display: 'block' }} />
          </div>

          {obStep === 1 && (
            <div>
              <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 24, fontWeight: 300, letterSpacing: '0.03em', color: 'var(--ink)', marginBottom: 8, textAlign: 'center' }}>
                Welcome to FHP.
              </h1>
              <p style={{ fontSize: 13.5, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7, textAlign: 'center', marginBottom: 28 }}>
                A quiet environment for reflection, preparation and growth.
              </p>
              <input
                style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream4)', borderRadius: 7, padding: '13px 15px', fontFamily: 'Barlow', fontSize: 15, color: 'var(--ink)', outline: 'none', marginBottom: 11 }}
                placeholder="Your first name"
                value={athleteName}
                onChange={e => setAthleteName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleOnboard()}
              />
              <input
                style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream4)', borderRadius: 7, padding: '13px 15px', fontFamily: 'Barlow', fontSize: 15, color: 'var(--ink)', outline: 'none', marginBottom: 11 }}
                placeholder="Your email address"
                type="email"
                value={athleteEmail}
                onChange={e => setAthleteEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleOnboard()}
              />
              <button onClick={handleOnboard} style={{ width: '100%', padding: 13, background: 'var(--orange)', border: 'none', borderRadius: 7, fontFamily: 'Barlow Condensed', fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white', cursor: 'pointer' }}>
                Begin →
              </button>
              <p style={{ fontSize: 11, color: 'var(--ink4)', textAlign: 'center', marginTop: 10, lineHeight: 1.6 }}>
                By continuing you agree to receive FHP program updates. Unsubscribe anytime.
              </p>
            </div>
          )}

          {obStep === 2 && (
            <div>
              <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 24, fontWeight: 300, letterSpacing: '0.03em', color: 'var(--ink)', marginBottom: 8, textAlign: 'center' }}>
                Where are you right now?
              </h1>
              <p style={{ fontSize: 13.5, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7, textAlign: 'center', marginBottom: 24 }}>
                This shapes your experience.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 20 }}>
                {[['Academy', 'Development program'], ['Semi-pro', 'Transitioning to pro'], ['Professional', 'Contracted athlete'], ['School sport', 'Representative level']].map(([name, sub]) => (
                  <div key={name} onClick={handleEnter} style={{ border: '1px solid var(--cream4)', borderRadius: 7, padding: '12px 14px', cursor: 'pointer', background: 'var(--white)' }}>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>{name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 20 }}>
            {[1, 2].map(i => (
              <div key={i} style={{ width: 16, height: 1.5, borderRadius: 1, background: i <= obStep ? 'var(--orange)' : 'var(--cream3)', transition: 'background 0.2s' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── MAIN APP ──
  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: 960, margin: '0 auto' }}>

      {/* SIDEBAR */}
      <nav style={{ width: 184, flexShrink: 0, background: 'var(--white)', borderRight: '1px solid var(--cream3)', display: 'flex', flexDirection: 'column', padding: '28px 0 24px', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '0 18px 24px', borderBottom: '1px solid var(--cream3)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 11 }}>
          <img src="/logo.png" alt="FHP" style={{ width: 36, height: 'auto', display: 'block' }} />
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 9.5, fontWeight: 400, letterSpacing: '0.2em', color: 'var(--ink3)', textTransform: 'uppercase', lineHeight: 1.5 }}>
            Athlete<br />Platform
          </div>
        </div>

        {view === 'athlete' && (
          <>
            {(['home', 'lesson', 'journal', 'mirror'] as Page[]).map((p, i) => {
              const labels = ['Home', 'This week', 'Reflect', 'My mirror']
              return (
                <div key={p} onClick={() => setPage(p)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontSize: 13, letterSpacing: '0.04em', color: page === p ? 'var(--orange)' : 'var(--ink3)', borderLeft: `2px solid ${page === p ? 'var(--orange)' : 'transparent'}`, marginBottom: 1, transition: 'color 0.12s' }}>
                  {labels[i]}
                </div>
              )
            })}
          </>
        )}

        {view === 'admin' && (
          <>
            {['Modules', 'New lesson'].map((label) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontSize: 13, letterSpacing: '0.04em', color: 'var(--ink3)' }}>
                {label}
              </div>
            ))}
          </>
        )}

        <div style={{ marginTop: 'auto', padding: '18px 18px 0', borderTop: '1px solid var(--cream3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--orange)', background: 'var(--orange-t)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed', fontSize: 10, fontWeight: 600, color: 'var(--orange)', flexShrink: 0, letterSpacing: '0.04em' }}>
              {firstName[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 12, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3 }}>{athleteName}</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink4)' }}>{activeLesson?.week ?? 'Week 1'}</div>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main style={{ flex: 1, padding: '52px 44px 80px', overflowY: 'auto', minWidth: 0 }}>

        {/* HOME */}
        {page === 'home' && (
          <div>
            <div style={{ marginBottom: 36 }}>
              <span className="eyebrow eyebrow-orange">{activeLesson?.week ?? 'Week 1'}</span>
              <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 30, fontWeight: 300, letterSpacing: '0.02em', color: 'var(--ink)', lineHeight: 1.05 }}>
                Good morning, {firstName}.
              </h1>
            </div>

            {/* Welcome video */}
            <div style={{ marginBottom: 32, background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 14, padding: '20px 22px' }}>
              <span className="eyebrow">Welcome to FHP Academy</span>
              <div style={{ position: 'relative', width: '100%', maxWidth: 280, margin: '0 auto', borderRadius: 7, overflow: 'hidden', aspectRatio: '9/16', background: 'var(--cream2)' }}>
                <iframe src={WELCOME_VIDEO} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
              </div>
            </div>

            {/* This week */}
            <div style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid var(--cream3)' }}>
              <span className="eyebrow">This week</span>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 24, fontWeight: 600, letterSpacing: '0.01em', color: 'var(--ink)', lineHeight: 1.15, marginBottom: 18 }}>
                {activeLesson?.focusTitle ?? '—'}
              </div>
              <button className="btn-primary" onClick={() => setPage('lesson')}>Open lesson →</button>
            </div>

            {/* Action */}
            <div style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid var(--cream3)' }}>
              <span className="eyebrow">This week's action</span>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 16, fontWeight: 500, letterSpacing: '0.02em', color: 'var(--ink)', lineHeight: 1.4 }}>
                {activeLesson?.action ?? '—'}
              </div>
            </div>

            {/* Mirror */}
            <div style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid var(--cream3)' }}>
              <span className="eyebrow">From your mirror</span>
              <div style={{ fontSize: 14, fontStyle: 'italic', fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.65, marginBottom: 10 }}>
                "Your reflections suggest confidence improves when preparation feels intentional."
              </div>
              <button className="btn-ghost" onClick={() => setPage('mirror')}>Read full mirror →</button>
            </div>

            {/* Reflect */}
            <div>
              <span className="eyebrow">Today</span>
              <button className="btn-primary" onClick={() => setPage('journal')}>Reflect →</button>
            </div>
          </div>
        )}

        {/* THIS WEEK / LESSON */}
        {page === 'lesson' && activeLesson && (
          <div style={{ maxWidth: 580 }}>
            <div style={{ marginBottom: 40 }}>
              <span className="eyebrow eyebrow-orange">{activeLesson.week} · Lesson</span>
              <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 30, fontWeight: 300, letterSpacing: '0.02em', color: 'var(--ink)', lineHeight: 1.05 }}>
                {activeLesson.title}
              </h1>
            </div>

            <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.8, marginBottom: 28 }}>{activeLesson.intro}</p>

            {/* Video */}
            {activeLesson.video ? (
              <div style={{ position: 'relative', width: '100%', maxWidth: 320, margin: '0 auto 28px', borderRadius: 7, overflow: 'hidden', aspectRatio: '9/16', background: 'var(--cream2)', border: '1px solid var(--cream3)' }}>
                <iframe src={activeLesson.video} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
              </div>
            ) : (
              <div style={{ width: '100%', maxWidth: 320, margin: '0 auto 28px', aspectRatio: '9/16', borderRadius: 7, border: '1px solid var(--cream3)', background: 'var(--cream2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink4)' }}>Video coming soon</div>
              </div>
            )}

            {/* Framework */}
            <div style={{ marginBottom: 28 }}>
              <span className="eyebrow">The framework</span>
              {activeLesson.framework.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.8, marginBottom: 12 }}>{para}</p>
              ))}
            </div>

            {/* Exercise */}
            <div style={{ marginBottom: 28 }}>
              <span className="eyebrow">Exercise</span>
              <div style={{ background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 7, padding: '15px 18px', fontSize: 14, fontStyle: 'italic', fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7, marginBottom: 12 }}>
                {activeLesson.prompt}
              </div>
              <textarea style={{ width: '100%', background: 'var(--cream)', border: '1px solid var(--cream3)', borderRadius: 7, padding: '14px 16px', fontFamily: 'Barlow', fontSize: 13.5, fontWeight: 300, color: 'var(--ink)', resize: 'none', minHeight: 80, outline: 'none' }} placeholder="Write your response here..." />
            </div>

            {/* PDF */}
            {activeLesson.pdfUrl && (
              <div style={{ marginBottom: 28 }}>
                <span className="eyebrow">Resource</span>
                <a href={activeLesson.pdfUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 7, padding: '15px 18px', textDecoration: 'none' }}>
                  <div>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em', color: 'var(--ink)' }}>{activeLesson.pdfLabel}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink4)', marginTop: 2 }}>Download PDF</div>
                  </div>
                </a>
              </div>
            )}

            {/* Commitment */}
            <div style={{ background: 'var(--ink)', borderRadius: 14, padding: '28px 30px' }}>
              <span style={{ fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(232,132,26,0.7)', marginBottom: 10, display: 'block' }}>
                {activeLesson.week} commitment
              </span>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 17, fontWeight: 300, letterSpacing: '0.02em', color: 'white', lineHeight: 1.25, marginBottom: 16 }}>
                {activeLesson.commitQ}
              </div>
              <textarea style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '14px 16px', fontFamily: 'Barlow', fontSize: 14, fontWeight: 300, color: 'white', resize: 'none', minHeight: 64, outline: 'none' }} placeholder="This week, regardless of the result, I will..." />
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => setPage('home')}>Save and return →</button>
              </div>
            </div>
          </div>
        )}

        {/* REFLECT */}
        {page === 'journal' && (
          <div style={{ maxWidth: 540 }}>
            <div style={{ marginBottom: 40 }}>
              <span className="eyebrow eyebrow-orange">Reflection space</span>
              <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 30, fontWeight: 300, letterSpacing: '0.02em', color: 'var(--ink)' }}>Reflect.</h1>
            </div>

            {/* Prompts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
              {['What mattered most today?', 'Where did pressure show up?', 'What gave you confidence?', 'Behaviour vs standards?', 'One thing forward?'].map(q => (
                <button key={q} onClick={() => setJournalPrompt(q)} style={{ fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 12px', border: `1px solid ${journalPrompt === q ? 'var(--orange)' : 'var(--cream4)'}`, borderRadius: 40, color: journalPrompt === q ? 'var(--orange)' : 'var(--ink3)', background: journalPrompt === q ? 'var(--orange-t)' : 'transparent', cursor: 'pointer' }}>
                  {q}
                </button>
              ))}
            </div>

            {!journalSaved ? (
              <>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 20, fontWeight: 300, letterSpacing: '0.02em', color: 'var(--ink)', lineHeight: 1.25, marginBottom: 18 }}>{journalPrompt}</div>
                <textarea value={journalText} onChange={e => setJournalText(e.target.value)} style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 7, padding: '18px 20px', fontFamily: 'Barlow', fontSize: 14, fontWeight: 300, lineHeight: 1.8, resize: 'none', minHeight: 160, outline: 'none', color: 'var(--ink)' }} placeholder="Write here. There is no right or wrong. This space is yours." />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                  <span style={{ fontSize: 11, color: 'var(--ink4)' }}>{journalText.trim() ? journalText.trim().split(/\s+/).length : 0} words</span>
                  <button className="btn-primary" onClick={saveJournal}>Save →</button>
                </div>
              </>
            ) : (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 22, fontWeight: 300, letterSpacing: '0.04em', color: 'var(--ink)', marginBottom: 8 }}>Saved.</div>
                <div style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7, maxWidth: 300, margin: '0 auto 24px' }}>Your reflection has been added to your mirror. Return Monday to see updated insights.</div>
                <button className="btn-primary" onClick={() => { setJournalSaved(false); setJournalText('') }}>Add another entry</button>
              </div>
            )}
          </div>
        )}

        {/* MIRROR */}
        {page === 'mirror' && (
          <div style={{ maxWidth: 580 }}>
            <div style={{ marginBottom: 40 }}>
              <span className="eyebrow eyebrow-orange">AI reflection summary</span>
              <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 30, fontWeight: 300, letterSpacing: '0.02em', color: 'var(--ink)' }}>Your mirror.</h1>
            </div>

            {/* Toggle */}
            <div style={{ display: 'inline-flex', border: '1px solid var(--cream3)', borderRadius: 20, overflow: 'hidden', marginBottom: 36 }}>
              {(['early', 'developed'] as const).map(s => (
                <button key={s} onClick={() => setMirrorState(s)} style={{ fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '7px 14px', cursor: 'pointer', border: 'none', background: mirrorState === s ? 'var(--ink)' : 'transparent', color: mirrorState === s ? 'white' : 'var(--ink3)', transition: 'all 0.13s' }}>
                  {s === 'early' ? 'Early — forming' : 'Developed'}
                </button>
              ))}
            </div>

            {mirrorState === 'early' && (
              <div>
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 18, fontWeight: 300, letterSpacing: '0.03em', color: 'var(--ink)', marginBottom: 8 }}>The picture is forming.</div>
                  <div style={{ fontSize: 13.5, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.75, maxWidth: 380 }}>Keep writing honestly and without editing yourself. After five or six entries, something real begins to emerge.</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 20, alignItems: 'center' }}>
                    {[1,2,3,4,5,6].map(i => <div key={i} style={{ width: 28, height: 3, borderRadius: 2, background: i <= 3 ? 'var(--ink)' : 'var(--cream3)' }} />)}
                    <span style={{ fontSize: 11, color: 'var(--ink4)', marginLeft: 4 }}>3 of 6 entries</span>
                  </div>
                </div>
                <div className="divider" />
                <span className="eyebrow">Early observation</span>
                <div style={{ fontSize: 14, fontStyle: 'italic', fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.8, maxWidth: 480 }}>
                  "You appear to reflect most honestly after difficult days. The entries where things didn't go well are your most specific and self-aware. That's a good sign."
                </div>
              </div>
            )}

            {mirrorState === 'developed' && (
              <div>
                <div style={{ marginBottom: 32 }}>
                  <span style={{ fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink4)', marginBottom: 16, display: 'block' }}>Updated Monday · Week 3 · Based on 12 entries</span>
                  <p style={{ fontSize: 15, fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.85 }}>
                    You prepare well and you know what good looks like for you — your entries are clearest on days where preparation has been specific and intentional. The pattern that most consistently appears is a gap between your best moments and how quickly you recover when things don't go to plan. That window is getting shorter. Keep noticing it.
                  </p>
                </div>
                <div className="divider" />
                <span className="eyebrow" style={{ marginBottom: 0 }}>Observations</span>
                {[
                  ['Preparation and confidence', 'Your confidence appears most stable on days where preparation has been intentional rather than just physical.'],
                  ['Pressure and recovery', 'Pressure arrives after mistakes, not before performance. The recovery window is your development edge.'],
                  ['Communication', 'Entries describing proactive communication consistently show higher confidence and better decision-making.'],
                ].map(([label, text]) => (
                  <div key={label} style={{ padding: '20px 0', borderBottom: '1px solid var(--cream3)' }}>
                    <span className="eyebrow">{label}</span>
                    <div style={{ fontSize: 14, fontStyle: 'italic', fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.75 }}>&ldquo;{text}&rdquo;</div>
                  </div>
                ))}
                <div style={{ background: 'var(--ink)', borderRadius: 14, padding: '28px 30px', marginTop: 28 }}>
                  <span style={{ fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(232,132,26,0.7)', marginBottom: 10, display: 'block' }}>This week&apos;s question</span>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 18, fontWeight: 300, letterSpacing: '0.02em', color: 'white', lineHeight: 1.3, marginBottom: 8 }}>What does your reset response look like — and how quickly can you access it?</div>
                  <div style={{ fontSize: 12.5, fontWeight: 300, color: 'rgba(254,252,248,0.4)', lineHeight: 1.6 }}>Sit with this over the week. Let it surface in your reflections.</div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* View switch */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 20, overflow: 'hidden' }}>
        {(['athlete', 'admin'] as View[]).map(v => (
          <button key={v} onClick={() => setView(v)} style={{ fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '7px 14px', cursor: 'pointer', border: 'none', background: view === v ? 'var(--ink)' : 'transparent', color: view === v ? 'white' : 'var(--ink3)', transition: 'all 0.13s' }}>
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}
