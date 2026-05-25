export type Lesson = {
  id: string
  week: string
  title: string
  focusTitle: string
  focusBody: string
  action: string
  intro: string
  video: string
  framework: string
  prompt: string
  commitQ: string
  pdfUrl: string
  pdfLabel: string
  status: 'published' | 'draft'
}

export const lessons: Lesson[] = [
  {
    id: 'week-1',
    week: 'Week 1',
    title: 'Know Your Edge',
    focusTitle: 'Understand your strengths and establish role clarity.',
    focusBody: 'Before you can perform under pressure, you need to know who you are under pressure. This week we build that foundation — your strengths, your role, and your standard.',
    action: 'Complete your Role Clarity Map and set your standard for the week. Refer to it before every session.',
    intro: 'The most overlooked element of elite performance is not physical. It is self-knowledge. When you understand your strengths, your role, and what your best looks like — you stop second-guessing in the moments that matter most.',
    video: 'https://player.vimeo.com/video/1193468502?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479',
    framework: 'This week uses three tools.\n\nRole Clarity Map — Map your strengths, your current role in the team, the behaviours people would say define you at your best, where you want to be in 6–12 months, and what success looks like this week.\n\nSounding Board System — Identify the people around you who keep you accountable. Your Anchor aligns and understands you. Your Supporter is always in your corner. Your Challenger pushes your standards.\n\nMy Standard — Set the one standard you are bringing into every environment this week — training, games, and off the field.',
    prompt: 'Think about the last time you performed at your best. What was true about how you prepared, how you communicated, and how you showed up? Be as specific as you can.',
    commitQ: 'What is your one standard for this week — the behaviour you will bring into every environment regardless of the result?',
    pdfUrl: 'https://drive.google.com/file/d/1gpOkWy0H5jTuKsaU0_jKDll-KNrAJo_e/view',
    pdfLabel: 'FHP Athlete Workbook — PDF',
    status: 'published',
  },
  {
    id: 'week-2',
    week: 'Week 2',
    title: 'Train How You Want To Play',
    focusTitle: 'Bring intention into every training session this week.',
    focusBody: 'The way you prepare becomes the way you perform. This week shifts from passive training to deliberate preparation — direction, not just effort.',
    action: 'Before every session this week, write down one specific focus. Not a goal — a behaviour you are bringing into that environment.',
    intro: 'Performance on game day is a reflection of how you prepared during the week. The athletes who perform best under pressure are not the ones who trained hardest — they are the ones who trained most intentionally.',
    video: 'https://player.vimeo.com/video/1193468704?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479',
    framework: 'This week uses two tools.\n\nWeek Plan — Map your week before it starts. Identify your key sessions and moments. For each one, attach a single intention — what standard or behaviour are you bringing into that environment?\n\nDaily Performance Focus — Each day, identify one specific focus point before you train or compete. Not a target. A behaviour. Something you can honestly answer yes or no to at the end of the day.',
    prompt: 'Think about a session where your preparation felt specific and intentional. What did you do differently before it? What did that feel like during the session itself?',
    commitQ: 'What is the one focus you are bringing into every training session and competition this week?',
    pdfUrl: 'https://drive.google.com/file/d/1gpOkWy0H5jTuKsaU0_jKDll-KNrAJo_e/view',
    pdfLabel: 'FHP Athlete Workbook — PDF',
    status: 'published',
  },
  {
    id: 'week-3',
    week: 'Week 3',
    title: 'Play Your Part',
    focusTitle: 'Understand your behavioural contribution to the team.',
    focusBody: 'This week moves from individual preparation to team contribution. Your behaviours — not just your skills — either strengthen or weaken the people around you.',
    action: 'Identify one specific behaviour that strengthens your team this week and commit to showing it consistently — especially when things get difficult.',
    intro: 'Every athlete has a part to play — not just a position. This week is about understanding how your specific behaviours, under pressure and in chaos, either lift or lower the people around you.',
    video: 'https://player.vimeo.com/video/1193469293?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479',
    framework: 'This week uses three tools.\n\nPlay Your Part — Identify what part you play in the team. When things get chaotic, what is your default?\n\nBehaviours — This week I will strengthen the team by [specific behaviour]. When I am not at my best, I weaken the team by [specific behaviour].\n\nBack to Best — Build your reset plan. Identify a specific Trigger — the moment that tells you things are going wrong. Then pair it with a Cue — the action you take to return to your best.',
    prompt: 'When things get chaotic in a game or training, what is your default response? Does that behaviour help the team or hurt it? Be honest.',
    commitQ: 'What is the one behaviour you are committing to this week that will strengthen the team — especially when things get hard?',
    pdfUrl: 'https://drive.google.com/file/d/1gpOkWy0H5jTuKsaU0_jKDll-KNrAJo_e/view',
    pdfLabel: 'FHP Athlete Workbook — PDF',
    status: 'published',
  },
  {
    id: 'week-4',
    week: 'Week 4',
    title: 'Review and Re-commit',
    focusTitle: 'Reflect honestly on the past four weeks and set your standard forward.',
    focusBody: 'Reflection is not the end of the program — it is the beginning of the next one. Review what worked, what to build on, and what to carry forward.',
    action: 'Complete your full program review. Identify your two biggest wins and two most important work-ons. Then set one standard to carry into the next block.',
    intro: 'The athletes who grow fastest are not the ones who train hardest — they are the ones who reflect most honestly. This final week builds the habit of structured review so that every block, season, and year compounds on the last.',
    video: '',
    framework: 'This week uses one tool across three reviews.\n\nWhat Worked / Work Ons — Run a structured review after games, training blocks, or competitive weeks. What worked? Be specific. What are your work ons? Be honest.\n\nRun this across the full four weeks. Where did your standard show up? Where did it drift? What is one behaviour to carry into the next block?',
    prompt: 'Looking back across all four weeks — where did you show up at your best? Where did your standard drift? What is the most honest thing you can say about how you performed?',
    commitQ: 'What is one standard or behaviour you are committing to carry into the next block — based on everything you have learned in the past four weeks?',
    pdfUrl: 'https://drive.google.com/file/d/1ZT8LT3okebfLZdWjW-MAOyEvIVjcFIom/view',
    pdfLabel: 'Weekly Review Worksheet — PDF',
    status: 'draft',
  },
]

export function getActiveLesson(): Lesson | null {
  return lessons.find(l => l.status === 'published') ?? null
}

export function getAllLessons(): Lesson[] {
  return lessons
}
