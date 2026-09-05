import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audio = formData.get('audio') as Blob
    
    if (!audio) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    const whisperForm = new FormData()
    whisperForm.append('file', audio, 'audio.webm')
    whisperForm.append('model', 'whisper-1')
    whisperForm.append('language', 'en')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: whisperForm,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Whisper API error:', response.status, error)
      return NextResponse.json({ error: 'Transcription failed: ' + error.slice(0, 200) }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ transcript: data.text })

  } catch (error) {
    console.error('Transcribe route error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
