'use client'

import { useState, useEffect, useRef } from 'react'
import { sendOTP, verifyOTP, getSession, signOut } from '@/lib/auth'
import { getOrCreateAthlete, saveReflection, completeScreen, getCompletedScreens, saveToolResponse, saveMirrorOutput } from '@/lib/athlete'
import { createClient } from '@/lib/supabase'

type AuthStage = 'enter_email' | 'enter_code' | 'authenticated'
type AppScreen = 'fhp_picture' | 'onboarding_reflection' | 'early_mirror' | 'week1_video' | 'my_edge' | 'second_mirror' | 'experiment' | 'event_reflection' | 'sounding_board' | 'fuller_mirror' | 'w1_completion' | 'home'

const eyebrow = (color = 'var(--ink3)'): React.CSSProperties => ({
  fontFamily: 'Barlow Condensed', fontSize: 9, fontWeight: 600,
  letterSpacing: '0.28em', textTransform: 'uppercase' as const,
  color, marginBottom: 10, display: 'block',
})

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '11px 22px', fontFamily: 'Barlow Condensed', fontSize: 10,
  fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase' as const,
  cursor: 'pointer', borderRadius: 7, background: 'var(--orange)',
  border: '1.5px solid var(--orange)', color: 'white', transition: 'all 0.13s',
}

const btnOutline: React.CSSProperties = {
  ...btnPrimary, background: 'transparent',
  border: '1.5px solid var(--cream4)', color: 'var(--ink3)',
}

const card: React.CSSProperties = {
  background: 'var(--white)', border: '1px solid var(--cream3)',
  borderRadius: 14, padding: '24px',
}

export default function Home() {
  const [authStage, setAuthStage] = useState<AuthStage>('enter_email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [athleteId, setAthleteId] = useState('')
  const [athleteName, setAthleteName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [screen, setScreen] = useState<AppScreen>('fhp_picture')
  const [completedScreens, setCompletedScreens] = useState<Set<string>>(new Set())
  const [reflection1, setReflection1] = useState('')
  const [reflection2, setReflection2] = useState('')
  const [earlyMirror, setEarlyMirror] = useState('')
  const [mirrorLoading, setMirrorLoading] = useState(false)
  const [myEdge, setMyEdge] = useState<Record<string, string>>({})
  const [secondMirror, setSecondMirror] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    async function checkSession() {
      const session = await getSession()
      if (session) {
        setAthleteId(session.user.id)
        setAuthStage('authenticated')
        const completed = await getCompletedScreens(session.user.id)
        setCompletedScreens(completed)
        const supabase = createClient()
        const { data } = await supabase.from('athletes').select('name').eq('id', session.user.id).maybeSingle()
        if (data?.name) {
          setAthleteName(data.name)
          // Load stored mirror output
          const { data: mirrorData } = await supabase
            .from('mirror_outputs')
            .select('output_json')
            .eq('athlete_id', session.user.id)
            .eq('trigger_screen', 'after_onboarding_reflection')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          if (mirrorData?.output_json) {
            const output = mirrorData.output_json as { snippet: string }
            setEarlyMirror(output.snippet || '')
          }
          // Load second mirror
          const { data: secondMirrorData } = await supabase
            .from('mirror_outputs')
            .select('output_json')
            .eq('athlete_id', session.user.id)
            .eq('trigger_screen', 'after_my_edge')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          if (secondMirrorData?.output_json) {
            const output = secondMirrorData.output_json as { snippet: string }
            setSecondMirror(output.snippet || '')
          }
          // Load My Edge data
          console.log('Loading My Edge for athlete:', session.user.id)
          const { data: edgeData, error: edgeError } = await supabase
            .from('tool_responses')
            .select('field_name, value')
            .eq('athlete_id', session.user.id)
            .eq('week', 1)
            .eq('tool_name', 'my_edge')
          console.log('Edge data:', edgeData, 'Error:', edgeError)
          if (edgeData) {
            const edge: Record<string, string> = {}
            edgeData.forEach((r: any) => { edge[r.field_name] = r.value })
            setMyEdge(edge)
          }
          setScreen(completed.has('0:onboarding_reflection') ? 'home' : 'fhp_picture')
        } else {
          setScreen('fhp_picture')
        }
      }
    }
    checkSession()
  }, [])

  function startRecording(setter: (v: string) => void, current: string) {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-AU'
    let final = current
    recognition.onresult = (e: any) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) { final += (final ? ' ' : '') + t } else { interim = t }
      }
      setter(final + (interim ? ' ' + interim : ''))
    }
    recognition.onend = () => { setIsRecording(false); recognitionRef.current = null }
    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }

  function stopRecording() {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null }
    setIsRecording(false)
  }

  function toggleRecording(setter: (v: string) => void, current: string) {
    if (isRecording) { stopRecording(); return }
    startRecording(setter, current)
  }

  const VoiceBtn = ({ setter, current }: { setter: (v: string) => void, current: string }) => (
    <button onClick={() => toggleRecording(setter, current)} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '9px 16px', fontFamily: 'Barlow Condensed', fontSize: 10,
      fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase' as const,
      cursor: 'pointer', borderRadius: 7, marginBottom: 8,
      background: isRecording ? 'var(--orange)' : 'var(--white)',
      border: `1.5px solid ${isRecording ? 'var(--orange)' : 'var(--cream4)'}`,
      color: isRecording ? 'white' : 'var(--ink3)',
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: isRecording ? 'white' : 'var(--orange)', display: 'inline-block' }} />
      {isRecording ? 'Stop' : 'Speak'}
    </button>
  )

  async function handleSendOTP() {
    if (!email.trim()) return
    setAuthLoading(true)
    setAuthError('')
    const { error } = await sendOTP(email.trim())
    if (error) { setAuthError('Could not send code. Check your email and try again.'); setAuthLoading(false); return }
    setAuthStage('enter_code')
    setAuthLoading(false)
  }

  async function handleVerifyOTP() {
    if (!code.trim()) return
    setAuthLoading(true)
    setAuthError('')
    const { data, error } = await verifyOTP(email.trim(), code.trim())
    if (error || !data.session) { setAuthError('Incorrect code. Please try again.'); setAuthLoading(false); return }
    setAthleteId(data.session.user.id)
    setAuthStage('authenticated')
    const completed = await getCompletedScreens(data.session.user.id)
    setCompletedScreens(completed)
    const supabase = createClient()
    const { data: athlete } = await supabase.from('athletes').select('name').eq('id', data.session.user.id).maybeSingle()
    if (athlete?.name) {
      setAthleteName(athlete.name)
      setScreen(completed.has('0:onboarding_reflection') ? 'home' : 'fhp_picture')
    } else {
      setScreen('fhp_picture')
    }
    setAuthLoading(false)
  }

  async function handleSaveName() {
    if (!nameInput.trim() || !athleteId) return
    await getOrCreateAthlete(athleteId, nameInput.trim())
    setAthleteName(nameInput.trim())
    await completeScreen(athleteId, 0, 'name_saved')
    setScreen('onboarding_reflection')
  }

  async function handleSaveReflections() {
    
    if (!reflection1.trim()) return
    await saveReflection(athleteId, 0, 'onboarding_positive', reflection1.trim(), 'Think about a recent performance where you felt genuinely good. What was happening?')
    if (reflection2.trim()) {
      await saveReflection(athleteId, 0, 'onboarding_contrast', reflection2.trim(), "Think about a performance where you weren't quite yourself. What felt different?")
    }
    setMirrorLoading(true)
    
    try {
      const res = await fetch('/api/mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteId,
          entries: [
            { text: reflection1, prompt: 'Recent good performance', type: 'onboarding_positive' },
            ...(reflection2 ? [{ text: reflection2, prompt: 'Off performance', type: 'onboarding_contrast' }] : [])
          ],
          stage: 'early',
          athleteName
        })
      })
      const data = await res.json()
      
      const snippet = data.snippet || data.content?.[0]?.text || ''

setEarlyMirror(snippet)
if (snippet) {
  await saveMirrorOutput(athleteId, 1, 'after_onboarding_reflection', { snippet })
}
    } catch (e) {
      console.error('Mirror error:', e)
    }
    await completeScreen(athleteId, 0, 'onboarding_reflection')
    setCompletedScreens(prev => new Set([...prev, '0:onboarding_reflection']))
    setMirrorLoading(false)
    setScreen('early_mirror')
  }

  const firstName = athleteName.split(' ')[0] || 'there'

  // ── AUTH ──
  if (authStage !== 'authenticated') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <img src="/logo.png" alt="Foundation High Performance" style={{ width: 220, height: 'auto', margin: '0 auto', display: 'block' }} />
          </div>
          {authStage === 'enter_email' && (
            <div>
              <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 300, color: 'var(--ink)', textAlign: 'center', marginBottom: 8 }}>Welcome to FHP.</h1>
              <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink3)', textAlign: 'center', lineHeight: 1.7, marginBottom: 28 }}>Enter your email to get started. We'll send you a code.</p>
              <input type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream4)', borderRadius: 7, padding: '13px 15px', fontFamily: 'Barlow', fontSize: 15, color: 'var(--ink)', outline: 'none', marginBottom: 12, display: 'block', boxSizing: 'border-box' }} />
              {authError && <p style={{ fontSize: 12, color: '#c0392b', marginBottom: 10 }}>{authError}</p>}
              <button onClick={handleSendOTP} disabled={authLoading || !email.trim()} style={{ ...btnPrimary, width: '100%', justifyContent: 'center', opacity: authLoading || !email.trim() ? 0.5 : 1 }}>
                {authLoading ? 'Sending...' : 'Send code →'}
              </button>
              <p style={{ fontSize: 11, color: 'var(--ink4)', textAlign: 'center', lineHeight: 1.6, marginTop: 16 }}>FHP operators can access your reflections for research and beta review purposes. This is a closed beta.</p>
            </div>
          )}
          {authStage === 'enter_code' && (
            <div>
              <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 300, color: 'var(--ink)', textAlign: 'center', marginBottom: 8 }}>Check your email.</h1>
              <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink3)', textAlign: 'center', lineHeight: 1.7, marginBottom: 28 }}>We sent a 6-digit code to <strong>{email}</strong>. Check your spam if it doesn't arrive.</p>
              <input type="text" placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()} maxLength={6}
                style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream4)', borderRadius: 7, padding: '13px 15px', fontFamily: 'Barlow', fontSize: 22, letterSpacing: '0.2em', color: 'var(--ink)', outline: 'none', marginBottom: 12, display: 'block', boxSizing: 'border-box', textAlign: 'center' }} />
              {authError && <p style={{ fontSize: 12, color: '#c0392b', marginBottom: 10 }}>{authError}</p>}
              <button onClick={handleVerifyOTP} disabled={authLoading || code.length < 6} style={{ ...btnPrimary, width: '100%', justifyContent: 'center', opacity: authLoading || code.length < 6 ? 0.5 : 1 }}>
                {authLoading ? 'Verifying...' : 'Continue →'}
              </button>
              <button onClick={() => { setAuthStage('enter_email'); setCode(''); setAuthError('') }} style={{ ...btnOutline, width: '100%', justifyContent: 'center', marginTop: 8 }}>Back</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── NAME CAPTURE ──
  if (screen === 'fhp_picture' && !athleteName) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <img src="/logo.png" alt="Foundation High Performance" style={{ width: 180, height: 'auto', margin: '0 auto', display: 'block' }} />
          </div>
          <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 300, color: 'var(--ink)', textAlign: 'center', marginBottom: 8 }}>What's your name?</h1>
          <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink3)', textAlign: 'center', lineHeight: 1.7, marginBottom: 24 }}>Just your first name is fine.</p>
          <input placeholder="Your first name" value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream4)', borderRadius: 7, padding: '13px 15px', fontFamily: 'Barlow', fontSize: 15, color: 'var(--ink)', outline: 'none', marginBottom: 12, display: 'block', boxSizing: 'border-box' }} />
          <button onClick={handleSaveName} disabled={!nameInput.trim()} style={{ ...btnPrimary, width: '100%', justifyContent: 'center', opacity: nameInput.trim() ? 1 : 0.5 }}>Continue →</button>
        </div>
      </div>
    )
  }

  // ── FHP PICTURE ──
  if (screen === 'fhp_picture') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/logo.png" alt="FHP" style={{ width: 80, height: 'auto', margin: '0 auto 20px', display: 'block' }} />
            <span style={eyebrow('var(--orange)')}>Your FHP Picture</span>
            <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 32, fontWeight: 300, color: 'var(--ink)', marginBottom: 8 }}>What you're building.</h1>
            <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7 }}>Over four weeks, FHP builds a clearer picture of how you perform.</p>
          </div>
          {[
            { num: 1, label: 'My Edge', sub: 'When I am at my best', done: completedScreens.has('1:w1_completion') },
            { num: 2, label: 'My Preparation', sub: 'What helps me get ready', done: completedScreens.has('2:w2_completion') },
            { num: 3, label: 'My Contribution', sub: 'What I bring to others', done: completedScreens.has('3:w3_completion') },
            { num: 4, label: 'Play Free', sub: 'Where my attention goes under pressure', done: completedScreens.has('4:w4_completion') },
          ].map(item => (
            <div key={item.num} style={{ ...card, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, opacity: item.done ? 1 : 0.5 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: item.done ? 'var(--orange)' : 'var(--cream3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Barlow Condensed', fontSize: 14, fontWeight: 600, color: item.done ? 'white' : 'var(--ink4)' }}>{item.num}</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'var(--ink4)', marginTop: 2 }}>{item.sub}</div>
              </div>
            </div>
          ))}
          <div style={{ ...card, marginBottom: 32, opacity: 0.4 }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>Final FHP Reflection</div>
            <div style={{ fontSize: 12, color: 'var(--ink4)' }}>What FHP has noticed across your four weeks</div>
            <div style={{ marginTop: 8, height: 3, background: 'var(--cream3)', borderRadius: 2 }}>
              <div style={{ height: '100%', background: 'var(--orange)', borderRadius: 2, width: '0%', transition: 'width 0.5s' }} />
            </div>
          </div>
          <button onClick={() => setScreen('onboarding_reflection')} style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>Start Week 1 →</button>
        </div>
      </div>
    )
  }

  // ── ONBOARDING REFLECTION ──
  if (screen === 'onboarding_reflection') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/logo.png" alt="FHP" style={{ width: 80, height: 'auto', margin: '0 auto 16px', display: 'block' }} />
            <span style={eyebrow('var(--orange)')}>Week 1 — Know Your Edge</span>
          </div>
          <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 26, fontWeight: 300, color: 'var(--ink)', marginBottom: 8 }}>Start with you.</h2>
          <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7, marginBottom: 28 }}>Before anything else — think about a recent performance where you felt genuinely good. It doesn't need to have been your best result. Just a time where things were working.</p>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: 15, fontWeight: 400, color: 'var(--ink)', marginBottom: 10 }}>What was actually going well?</div>
            <VoiceBtn setter={setReflection1} current={reflection1} />
            <textarea value={reflection1} onChange={e => setReflection1(e.target.value)}
              style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 8, padding: '14px 16px', fontFamily: 'Barlow', fontSize: 14, fontWeight: 300, lineHeight: 1.7, resize: 'none', minHeight: 90, outline: 'none', color: 'var(--ink)', display: 'block', boxSizing: 'border-box' }}
              placeholder="Say it however you'd explain it to someone you trust..." />
          </div>
          {reflection1.trim().length > 10 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7, marginBottom: 12 }}>Now think about a performance where you weren't quite yourself. What felt different?</p>
              <VoiceBtn setter={setReflection2} current={reflection2} />
              <textarea value={reflection2} onChange={e => setReflection2(e.target.value)}
                style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 8, padding: '14px 16px', fontFamily: 'Barlow', fontSize: 14, fontWeight: 300, lineHeight: 1.7, resize: 'none', minHeight: 90, outline: 'none', color: 'var(--ink)', display: 'block', boxSizing: 'border-box' }}
                placeholder="No need to pull it apart. Just notice what changed..." />
            </div>
          )}
          <button onClick={handleSaveReflections} disabled={reflection1.trim().length < 10}
            style={{ ...btnPrimary, width: '100%', justifyContent: 'center', opacity: reflection1.trim().length < 10 ? 0.5 : 1 }}>Continue →</button>
          <p style={{ fontSize: 11, color: 'var(--ink4)', textAlign: 'center', lineHeight: 1.6, marginTop: 16 }}>Your reflections can be accessed by FHP operators for research and beta review. This is a closed beta.</p>
        </div>
      </div>
    )
  }

  // ── EARLY MIRROR ──
  if (screen === 'early_mirror') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <span style={eyebrow('var(--orange)')}>FHP noticed</span>
          <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 300, color: 'var(--ink)', marginBottom: 24 }}>One thing worth noticing.</h2>
          <div style={{ ...card, borderLeft: '3px solid var(--orange)', borderRadius: '0 14px 14px 0', marginBottom: 32 }}>
            {mirrorLoading
              ? <p style={{ fontSize: 14, color: 'var(--ink3)', fontStyle: 'italic' }}>Reading what you wrote...</p>
              : <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.8, fontStyle: 'italic' }}>"{earlyMirror || "It's too early to call anything a pattern yet. But what you've described is worth holding onto this week."}"</p>
            }
          </div>
          <button onClick={() => setScreen('week1_video')} disabled={mirrorLoading}
            style={{ ...btnPrimary, width: '100%', justifyContent: 'center', opacity: mirrorLoading ? 0.5 : 1 }}>Watch this week's video →</button>
        </div>
      </div>
    )
  }

  // ── WEEK 1 VIDEO ──
  if (screen === 'week1_video') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <span style={eyebrow('var(--orange)')}>Week 1</span>
          <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 300, color: 'var(--ink)', marginBottom: 8 }}>Know Your Edge</h2>
          <p style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 24 }}>What makes you effective?</p>
          <div style={{ width: '100%', aspectRatio: '9/16', maxWidth: 280, margin: '0 auto 28px', borderRadius: 12, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--cream3)' }}>
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Video placeholder</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 18, fontWeight: 300, color: 'white', lineHeight: 1.3 }}>Know Your Edge</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>3-4 minutes</div>
            </div>
          </div>
          <button onClick={() => { completeScreen(athleteId, 1, 'w1_video'); setScreen('my_edge') }}
            style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>Continue to My Edge →</button>
        </div>
      </div>
    )
  }

  // ── MY EDGE ──
  if (screen === 'my_edge') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <span style={eyebrow('var(--orange)')}>Week 1 — My Edge</span>
          <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 300, color: 'var(--ink)', marginBottom: 8 }}>Build your edge.</h2>
          <p style={{ fontSize: 13, color: 'var(--ink3)', lineHeight: 1.7, marginBottom: 28 }}>Based on what you've just thought about. One or two things is enough.</p>
          {[
            { key: 'what_i_bring', label: "What are one or two things you bring when you're playing well?" },
            { key: 'when_it_shows_up', label: 'What do you notice about yourself when those things are showing up?' },
            { key: 'want_to_keep', label: "What are you already doing that you want to keep?" },
            { key: 'im_building', label: "What's one thing you'd like to keep getting better at?" },
          ].map(field => (
            <div key={field.key} style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 14, fontWeight: 400, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.4 }}>{field.label}</div>
              <VoiceBtn setter={(v) => setMyEdge(prev => ({ ...prev, [field.key]: v }))} current={myEdge[field.key] || ''} />
              <textarea value={myEdge[field.key] || ''} onChange={e => setMyEdge(prev => ({ ...prev, [field.key]: e.target.value }))}
                style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 8, padding: '12px 14px', fontFamily: 'Barlow', fontSize: 14, fontWeight: 300, lineHeight: 1.7, resize: 'none', minHeight: 70, outline: 'none', color: 'var(--ink)', display: 'block', boxSizing: 'border-box' }}
                placeholder="Say it in your own words..." />
            </div>
          ))}
          <button onClick={async () => {
            for (const [field, value] of Object.entries(myEdge)) {
              if (value?.trim()) await saveToolResponse(athleteId, 1, 'my_edge', field, value.trim())
            }
            await completeScreen(athleteId, 1, 'w1_my_edge')
            // Generate second mirror
            
            try {
              const edgeEntries = Object.entries(myEdge)
                .filter(([, v]) => v?.trim())
                .map(([k, v]) => ({ text: v, type: `my_edge_${k}`, prompt: k }))
              const { getAthleteHistory } = await import('@/lib/athlete')
              const history = await getAthleteHistory(athleteId, 1)
              
              const historicEntries = history.reflections.map((r: any) => ({ text: r.response, type: r.type, prompt: r.prompt }))
              const res = await fetch('/api/mirror', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  athleteId,
                  entries: [
                    ...historicEntries,
                    ...edgeEntries
                  ],
                  stage: 'standard',
                  athleteName
                })
              })
              const data = await res.json()
              if (data.snippet) {
                setSecondMirror(data.snippet)
                await saveMirrorOutput(athleteId, 1, 'after_my_edge', { snippet: data.snippet })
              }
            } catch (e) {
              console.error('Second mirror error:', e)
            }
            setScreen('second_mirror')
          }} disabled={!myEdge.what_i_bring?.trim()}
            style={{ ...btnPrimary, width: '100%', justifyContent: 'center', opacity: myEdge.what_i_bring?.trim() ? 1 : 0.5 }}>Save my edge →</button>
        </div>
      </div>
    )
  }

  // ── SECOND MIRROR ──
  if (screen === 'second_mirror') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <span style={eyebrow('var(--orange)')}>FHP noticed</span>
          <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 300, color: 'var(--ink)', marginBottom: 24 }}>What's starting to emerge.</h2>
          <div style={{ ...card, borderLeft: '3px solid var(--orange)', borderRadius: '0 14px 14px 0', marginBottom: 32 }}>
            <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.8, fontStyle: 'italic' }}>
              "{secondMirror || "You've described what you bring and what you want to keep building. That's a useful starting point. Keep paying attention to when those qualities show up this week."}"
            </p>
          </div>
          <button onClick={() => setScreen('experiment')} style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>This week's experiment →</button>
        </div>
      </div>
    )
  }

  // ── EXPERIMENT ──
  if (screen === 'experiment') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <span style={eyebrow('var(--orange)')}>This week — one thing to try</span>
          <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 300, color: 'var(--ink)', marginBottom: 16 }}>Get another view.</h2>
          <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.8, marginBottom: 28 }}>Sometimes other people can see things in us that we don't notice ourselves. This week, ask one person you trust two simple questions.</p>
          <div style={{ ...card, marginBottom: 28 }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 12 }}>"When do you think I'm at my best?"</div>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>"What do you see me doing when I'm playing well?"</div>
            <div style={{ fontSize: 12, color: 'var(--ink4)', marginTop: 12, lineHeight: 1.6 }}>Coach. Teammate. Parent. Someone whose opinion you trust.</div>
          </div>
          <button onClick={async () => { await completeScreen(athleteId, 1, 'w1_experiment'); setScreen('home') }}
            style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>Got it →</button>
        </div>
      </div>
    )
  }

  // ── EVENT REFLECTION ──
  if (screen === 'event_reflection') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <button onClick={() => setScreen('home')} style={{ ...btnOutline, marginBottom: 24, padding: '6px 14px', fontSize: 9 }}>← Back</button>
          <span style={eyebrow('var(--orange)')}>After training or competition</span>
          <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 300, color: 'var(--ink)', marginBottom: 8 }}>What happened?</h2>
          <p style={{ fontSize: 13, color: 'var(--ink3)', lineHeight: 1.7, marginBottom: 28 }}>Answer what you can. Voice or text.</p>
          {[
            { key: 'ev_what_worked', label: 'What worked well today?' },
            { key: 'ev_felt_like_self', label: 'When did you feel most like yourself?' },
            { key: 'ev_repeat', label: "What did you do that you'd want to repeat?" },
            { key: 'ev_adjust', label: "What's one thing you might adjust next time?" },
          ].map(q => (
            <div key={q.key} style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 15, fontWeight: 400, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.4 }}>{q.label}</div>
              <VoiceBtn setter={(v) => setMyEdge(prev => ({ ...prev, [q.key]: v }))} current={myEdge[q.key] || ''} />
              <textarea value={myEdge[q.key] || ''} onChange={e => setMyEdge(prev => ({ ...prev, [q.key]: e.target.value }))}
                style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 8, padding: '12px 14px', fontFamily: 'Barlow', fontSize: 14, fontWeight: 300, lineHeight: 1.7, resize: 'none', minHeight: 70, outline: 'none', color: 'var(--ink)', display: 'block', boxSizing: 'border-box' }}
                placeholder="Speak or write here..." />
            </div>
          ))}
          <button onClick={async () => {
            const map: Record<string, string> = { ev_what_worked: 'event_what_worked', ev_felt_like_self: 'event_felt_like_self', ev_repeat: 'event_repeat', ev_adjust: 'event_adjust' }
            for (const [key, type] of Object.entries(map)) {
              const val = myEdge[key]
              if (val?.trim()) await saveReflection(athleteId, 1, type, val.trim())
            }
            await completeScreen(athleteId, 1, 'w1_event_reflection')
            setScreen('sounding_board')
          }} style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>Continue →</button>
        </div>
      </div>
    )
  }

  // ── SOUNDING BOARD ──
  if (screen === 'sounding_board') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <span style={eyebrow('var(--orange)')}>Sounding board</span>
          <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 300, color: 'var(--ink)', marginBottom: 16 }}>Did you get a chance to ask someone?</h2>
          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            <button onClick={() => setScreen('fuller_mirror')} style={{ ...btnOutline, flex: 1, justifyContent: 'center' }}>Not yet</button>
            <button onClick={() => setMyEdge(prev => ({ ...prev, sb_asked: 'yes' }))} style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}>Yes</button>
          </div>
          {myEdge.sb_asked === 'yes' && (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 14, color: 'var(--ink)', marginBottom: 8 }}>What did they say about when you're at your best?</div>
                <VoiceBtn setter={(v) => setMyEdge(prev => ({ ...prev, sb_response: v }))} current={myEdge.sb_response || ''} />
                <textarea value={myEdge.sb_response || ''} onChange={e => setMyEdge(prev => ({ ...prev, sb_response: e.target.value }))}
                  style={{ width: '100%', background: 'var(--white)', border: '1px solid var(--cream3)', borderRadius: 8, padding: '12px 14px', fontFamily: 'Barlow', fontSize: 14, fontWeight: 300, lineHeight: 1.7, resize: 'none', minHeight: 80, outline: 'none', color: 'var(--ink)', display: 'block', boxSizing: 'border-box' }}
                  placeholder="What they noticed..." />
              </div>
              <button onClick={async () => {
                if (myEdge.sb_response?.trim()) await saveReflection(athleteId, 1, 'sounding_board', myEdge.sb_response.trim())
                await completeScreen(athleteId, 1, 'w1_sounding_board')
                // Generate fuller mirror
                try {
                  const { reflections: allReflections, toolResponses } = await import('@/lib/athlete').then(m => m.getAthleteHistory(athleteId, 1))
                  const entries = [
                    ...allReflections.map((r: any) => ({ text: r.response, type: r.type, prompt: r.prompt })),
                    ...toolResponses.map((t: any) => ({ text: t.value, type: `${t.tool_name}_${t.field_name}`, prompt: t.field_name }))
                  ]
                  const res = await fetch('/api/mirror', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ athleteId, entries, stage: 'standard', athleteName })
                  })
                  const data = await res.json()
                  if (data.snippet) {
                    setEarlyMirror(data.snippet)
                    await saveMirrorOutput(athleteId, 1, 'after_event_reflection', { snippet: data.snippet })
                  }
                } catch (e) {
                  console.error('Fuller mirror error:', e)
                }
                setScreen('fuller_mirror')
              }} style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>Continue →</button>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── FULLER MIRROR ──
  if (screen === 'fuller_mirror') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <span style={eyebrow('var(--orange)')}>FHP Mirror</span>
          <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 300, color: 'var(--ink)', marginBottom: 24 }}>What FHP has noticed.</h2>
          <div style={{ ...card, borderLeft: '3px solid var(--orange)', borderRadius: '0 14px 14px 0', marginBottom: 32 }}>
            <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.8, fontStyle: 'italic' }}>
              "{earlyMirror || "Keep reflecting — FHP is building a clearer picture of how you perform."}"
            </p>
          </div>
          <button onClick={async () => { await completeScreen(athleteId, 1, 'w1_fuller_mirror'); setScreen('w1_completion') }}
            style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>See your FHP Picture →</button>
        </div>
      </div>
    )
  }

   // ── WEEK 1 COMPLETION ──
  if (screen === 'w1_completion') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto', textAlign: 'center' }}>
          <img src="/logo.png" alt="FHP" style={{ width: 80, height: 'auto', margin: '0 auto 32px', display: 'block' }} />
          <span style={eyebrow('var(--orange)')}>Your FHP Picture</span>
          <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 48, fontWeight: 300, color: 'var(--ink)', marginBottom: 8, letterSpacing: '0.02em' }}>1 of 4</h1>
          <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7, marginBottom: 40 }}>You've started building a clearer picture of what your best looks like.</p>

          {[
            { num: 1, label: 'My Edge', sub: 'When I am at my best', done: true },
            { num: 2, label: 'My Preparation', sub: 'What helps me get ready', done: false },
            { num: 3, label: 'My Contribution', sub: 'What I bring to others', done: false },
            { num: 4, label: 'Play Free', sub: 'Where my attention goes under pressure', done: false },
          ].map(item => (
            <div key={item.num} style={{ background: 'var(--white)', border: `1px solid ${item.done ? 'var(--orange)' : 'var(--cream3)'}`, borderRadius: 14, padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', opacity: item.done ? 1 : 0.4 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: item.done ? 'var(--orange)' : 'var(--cream3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Barlow Condensed', fontSize: 14, fontWeight: 600, color: item.done ? 'white' : 'var(--ink4)' }}>{item.done ? '✓' : item.num}</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'var(--ink4)', marginTop: 2 }}>{item.sub}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, padding: '16px 20px', background: 'var(--cream3)', borderRadius: 10, marginBottom: 32 }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--ink3)', letterSpacing: '0.15em', marginBottom: 6 }}>NEXT — WEEK 2</div>
            <div style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.6 }}>How do you prepare so more of that version of you shows up?</div>
          </div>

          <button onClick={async () => { await completeScreen(athleteId, 1, 'w1_completion'); setScreen('home') }}
            style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>Continue →</button>
        </div>
      </div>
    )
  }
  // ── HOME ──
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '48px 24px 90px' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <img src="/logo.png" alt="FHP" style={{ width: 60, height: 'auto' }} />
          <button onClick={() => signOut().then(() => { setAuthStage('enter_email'); setAthleteId(''); setAthleteName(''); setScreen('fhp_picture') })}
            style={{ ...btnOutline, padding: '6px 14px', fontSize: 9 }}>Sign out</button>
        </div>
        <span style={eyebrow()}>Week 1</span>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 36, fontWeight: 300, color: 'var(--ink)', marginBottom: 6 }}>Know Your Edge.</h1>
        <p style={{ fontSize: 13, color: 'var(--ink3)', lineHeight: 1.7, marginBottom: 32 }}>Notice when you feel most like yourself as an athlete this week.</p>
        <div style={{ ...card, marginBottom: 16 }}>
          <span style={eyebrow()}>Your focus this week</span>
          <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.7, marginBottom: 16 }}>Ask someone: <em>"When do you think I'm at my best?"</em></p>
          {myEdge.what_i_bring ? (
            <div style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.7, fontStyle: 'italic' }}>"{myEdge.what_i_bring}"</div>
          ) : (
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--ink4)', letterSpacing: '0.1em' }}>MY EDGE — BUILDING</div>
          )}
        </div>
        <div style={{ ...card }}>
          <span style={eyebrow()}>After training or competition</span>
          <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7, marginBottom: 16 }}>Come back here to add a reflection on what happened.</p>
          <button onClick={() => setScreen('event_reflection')} style={{ ...btnPrimary }}>Add a reflection →</button>
        </div>
      </div>
    </div>
  )
}