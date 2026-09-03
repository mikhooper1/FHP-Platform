import { createClient } from './supabase'

export async function getOrCreateAthlete(userId: string, name: string) {
  const supabase = createClient()
  const { data: existing } = await supabase
    .from('athletes')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (existing) return existing
  const { data, error } = await supabase
    .from('athletes')
    .insert({ id: userId, name, program_start_date: new Date().toISOString() })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

export async function saveReflection(athleteId: string, week: number, type: string, response: string, prompt?: string) {
  const supabase = createClient()
  const { error } = await supabase.from('reflections').insert({ athlete_id: athleteId, week, type, response, prompt })
  if (error) throw error
}

export async function saveToolResponse(athleteId: string, week: number, toolName: string, fieldName: string, value: string) {
  const supabase = createClient()
  const { error } = await supabase.from('tool_responses').upsert({
    athlete_id: athleteId, week, tool_name: toolName, field_name: fieldName, value, updated_at: new Date().toISOString()
  }, { onConflict: 'athlete_id,week,tool_name,field_name' })
  if (error) throw error
}

export async function completeScreen(athleteId: string, week: number, screen: string) {
  const supabase = createClient()
  const { error } = await supabase.from('screen_completions').upsert(
    { athlete_id: athleteId, week, screen },
    { onConflict: 'athlete_id,week,screen' }
  )
  if (error) throw error
}

export async function getCompletedScreens(athleteId: string) {
  const supabase = createClient()
  const { data } = await supabase.from('screen_completions').select('week, screen').eq('athlete_id', athleteId)
  return new Set((data || []).map((r: any) => `${r.week}:${r.screen}`))
}

export async function getAthleteHistory(athleteId: string, upToWeek: number) {
  const supabase = createClient()
  const [reflections, tools, mirrors] = await Promise.all([
    supabase.from('reflections').select('week, type, prompt, response, created_at')
      .eq('athlete_id', athleteId).lte('week', upToWeek).order('created_at'),
    supabase.from('tool_responses').select('week, tool_name, field_name, value')
      .eq('athlete_id', athleteId).lte('week', upToWeek),
    supabase.from('mirror_outputs').select('week, trigger_screen, output_json, created_at')
      .eq('athlete_id', athleteId).order('created_at')
  ])
  return {
    reflections: reflections.data || [],
    toolResponses: tools.data || [],
    previousMirrors: mirrors.data || []
  }
}

export async function saveMirrorOutput(athleteId: string, week: number, triggerScreen: string, outputJson: object) {
  const supabase = createClient()
  const { error } = await supabase.from('mirror_outputs').insert({
    athlete_id: athleteId, week, trigger_screen: triggerScreen, output_json: outputJson
  })
  if (error) throw error
}