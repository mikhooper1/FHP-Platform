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
    title: 'What High Performance Means to Me',
    focusTitle: 'High performance starts with asking better questions.',
    focusBody: 'Most athletes think high performance is about working harder or wanting it more. This week we challenge that. The athletes who perform best don\'t just train harder — they think differently. And it starts with the questions they ask.',
    action: 'This week, before every session, write down one question you want to answer through your performance. Not a goal — a question.',
    intro: 'Before we talk about preparation, training, or pressure — we need to talk about how you think. The most overlooked skill in high performance isn\'t physical. It\'s the ability to ask yourself better questions. This week is about understanding what high performance actually means to you — not what you\'ve been told it means.',
    video: 'https://player.vimeo.com/video/1193468502?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479',
    framework: 'High performance is not a destination. It is a way of operating.\n\nMost people define high performance by outcomes — winning, selection, stats. But outcomes are largely outside your control. What is inside your control is the quality of your preparation, the honesty of your reflection, and the questions you ask of yourself and those around you.\n\nAsking better questions is a skill. It means getting curious about your own performance rather than just judging it. Instead of "why did I play badly?" — "what specifically was different about how I prepared this week?" Instead of "am I good enough?" — "what would my best look like today?"\n\nThe question changes what you look for. What you look for changes what you find. What you find changes how you grow.',
    prompt: 'Think about a moment when you performed at your genuine best — not just a good result, but a moment where you felt truly in control of how you were operating. What questions were you asking yourself in the lead-up to that? What were you curious about? What were you paying attention to?',
    commitQ: 'What does high performance mean to you — in your own words, not anyone else\'s definition?',
    pdfUrl: 'https://drive.google.com/file/d/1gpOkWy0H5jTuKsaU0_jKDll-KNrAJo_e/view',
    pdfLabel: 'FHP Athlete Workbook — PDF',
    status: 'published',
  },
  {
    id: 'week-2',
    week: 'Week 2',
    title: 'Train How You Want To Play',
    focusTitle: 'The way you prepare becomes the way you perform.',
    focusBody: 'You can\'t switch it on when it matters if you haven\'t practised switching it on when it doesn\'t. This week is about bringing the same intention to training that you want to bring to competition.',
    action: 'Before every training session this week, set one specific intention — not a physical goal, a behavioural standard. How do you want to show up? Write it down before you start.',
    intro: 'There is a version of you that trains to get through the session. And there is a version of you that trains to become a better player. The physical output might look identical. The difference is entirely internal — the questions you\'re asking, the standards you\'re holding, the attention you\'re bringing. This week is about closing the gap between those two versions.',
    video: 'https://player.vimeo.com/video/1193468704?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479',
    framework: 'Preparation is not just physical. It is intentional.\n\nThe athletes who perform most consistently under pressure are not the ones who trained hardest. They are the ones who trained most deliberately — who brought a clear intention to every session and reflected honestly on what they found.\n\nTrain how you want to play means: the standard you hold in training is the standard available to you in competition. If you switch off when training feels easy, you will switch off when competition feels hard. If you communicate clearly in training, communication becomes available to you under pressure.\n\nThis is not about intensity. It is about attention. What are you paying attention to in training? Is it the same thing you want to be paying attention to when it matters most?',
    prompt: 'Think about a training session where you genuinely showed up the way you want to perform. What was different about your preparation beforehand? What were you paying attention to during it? What did that feel like compared to sessions where you just went through the motions?',
    commitQ: 'What is the one standard you are committing to bring into every training session this week — regardless of how you feel or what the session looks like?',
    pdfUrl: 'https://drive.google.com/file/d/1gpOkWy0H5jTuKsaU0_jKDll-KNrAJo_e/view',
    pdfLabel: 'FHP Athlete Workbook — PDF',
    status: 'published',
  },
  {
    id: 'week-3',
    week: 'Week 3',
    title: 'Asking For Help',
    focusTitle: 'The best athletes ask for help. It\'s not weakness — it\'s strategy.',
    focusBody: 'At some point every high performer hits a ceiling they can\'t break through alone. The ones who keep growing are the ones who get honest about what they need and who they need it from.',
    action: 'This week, identify one person in your environment who you could ask for honest feedback. Have the conversation. It doesn\'t have to be comfortable — it has to be real.',
    intro: 'There is a version of toughness that keeps everything inside, figures it out alone, and never shows vulnerability. That version has a ceiling. The athletes who perform at the highest level for the longest time are the ones who built a support system — people who tell them the truth, challenge their thinking, and help them see what they can\'t see themselves. Asking for help is not a sign that you\'re struggling. It\'s a sign that you\'re serious.',
    video: 'https://player.vimeo.com/video/1193469293?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479',
    framework: 'High performers are not self-made. They are well-supported.\n\nEvery elite athlete has a network of people they lean on — coaches, teammates, family, mentors, psychologists, friends who tell them the truth. Building that network is not something that happens automatically. It requires honesty about what you need and courage to ask for it.\n\nYour Sounding Board has three types of people:\n\nAnchors — people who know you deeply and help you stay grounded in who you are when things get hard.\n\nSupporters — people who are genuinely in your corner. They believe in you and want you to succeed.\n\nChallengers — people who tell you the truth even when it\'s uncomfortable. They push your standards and call out the gap between who you are and who you\'re capable of being.\n\nMost athletes have supporters. Fewer have anchors. Almost nobody cultivates challengers. That\'s where the real growth lives.',
    prompt: 'Who in your life tells you the honest truth about your performance — not just what you want to hear? What would it look like to ask them for more of that? What are you afraid they might say?',
    commitQ: 'Who is one person you are going to ask for honest feedback this week — and what specifically are you going to ask them?',
    pdfUrl: 'https://drive.google.com/file/d/1gpOkWy0H5jTuKsaU0_jKDll-KNrAJo_e/view',
    pdfLabel: 'FHP Athlete Workbook — PDF',
    status: 'draft',
  },
  {
    id: 'week-4',
    week: 'Week 4',
    title: 'Letting Go of the Outcome',
    focusTitle: 'You cannot control the result. You can control everything that goes into it.',
    focusBody: 'Result anxiety is one of the biggest performance killers in sport. This week is about building the mental framework to compete freely — fully invested in the process, released from the result.',
    action: 'After every training session or competition this week, write down what you controlled — not what happened. Shift your measurement from outcome to process.',
    intro: 'The scoreboard is not the whole story. You know this — but under pressure, when selection is on the line or the game is close, it is very easy to forget. The athletes who perform most consistently at the highest level have learned to separate their worth from the result. Not because they don\'t care — because caring about the result too much is exactly what stops you from being present in the moment that produces it. This week is about learning to let go — not of your standards, but of the outcome.',
    video: '',
    framework: 'Outcome focus versus process focus is not a binary choice. It is a balance.\n\nYou need to care about results — they tell you whether what you are doing is working. But if the result becomes the only thing you measure yourself by, you will eventually play not to lose rather than to win. You will protect instead of express. You will hesitate instead of act.\n\nProcess focus means: I define success by the quality of my preparation and the honesty of my effort. The result is feedback — useful, important, but not a verdict on my worth as an athlete or a person.\n\nThe question to ask after every performance is not "did we win?" It is "did I show up the way I committed to showing up?" If the answer is yes and you lost, you have information about what to improve. If the answer is no and you won, you have got a problem you haven\'t solved yet.\n\nLetting go of the outcome is not lowering your standards. It is focusing your energy where it actually belongs — on what you can control.',
    prompt: 'Think about a performance where you were so focused on the result that it affected how you played. What were you thinking about? What were you not thinking about? What would it have looked like to compete with full commitment but no attachment to the outcome?',
    commitQ: 'What is one thing you are going to focus on that is entirely within your control — regardless of the result — in your next competition or training session?',
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
