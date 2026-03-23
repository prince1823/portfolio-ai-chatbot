// ============================================
// Virtual File System
// ============================================

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:var(--selected);padding:1px 5px;border-radius:3px;font-family:var(--mono);font-size:12px">$1</code>')
    .replace(/(https?:\/\/[^\s<>"]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">$1</a>')
    .replace(/\n/g, '<br>');
}

async function insertExchange(sessionId, userMessage) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/terminal_conversations`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ session_id: sessionId, user_message: userMessage }),
    });
    const rows = await res.json();
    return rows[0]?.id || null;
  } catch (e) { return null; }
}

async function updateExchange(rowId, asifResponse) {
  if (!rowId) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/terminal_conversations?id=eq.${rowId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ asif_response: asifResponse }),
    });
  } catch (e) {}
}

const SYSTEM_PROMPT = `You are [YOUR NAME]. You are responding from a chat interface inside your own portfolio file system. Speak in first person, always.

This is a personal AI assistant that answers questions about the portfolio owner's work, skills, and background.

Replace this system prompt with your own personal context — your work history, personality, communication style, values, and anything else you want the AI to know about you.

The more specific and personal you make this prompt, the better the AI will represent you.
\`;


// The virtual filesystem
const FS = {
  '/': {
    type: 'folder',
    children: ['about', 'work', 'products', 'how-i-work', 'testimonials', 'personal', 'chat', 'productivity.log', 'contact.vcf', 'settings.app'],
  },
  '/about': {
    type: 'folder',
    children: ['README.md', 'timeline.txt', 'values.txt'],
  },
  '/about/README.md': {
    type: 'file', icon: '📄', modified: 'Mar 2026', size: '2.1 KB',
    title: 'about asif',
    content: `<p>hi, i'm asif.</p>
<p>i take a founder's idea and build the systems, partnerships, and momentum to make it real.</p>
<p>i've been the first hire at three different organizations. each time, the job description didn't exist yet. i like it that way.</p>
<p>over the last 7+ years, i've worked across community, product, operations, content strategy, and design — not because i couldn't pick one, but because founders rarely need someone who can only do one thing. they need someone who can figure it out, move fast, and own the outcome.</p>
<p>some people call this a generalist. i call it being an operator.</p>
<h3>contact</h3>
<ul>
  <li>email: hi@onlysif.com</li>
  <li>twitter/x: @theonlysif</li>
  <li>linkedin: in/asifhassanmuhamed</li>
  <li>location: bangalore, india</li>
</ul>`,
  },
  '/about/timeline.txt': {
    type: 'file', icon: '📄', modified: 'Mar 2026', size: '1.8 KB',
    title: 'career timeline',
    content: `<h2>how i got here</h2>
<h3>2018 — the beginning</h3>
<p>started as a graphic design hire at a marketing agency while still in college. first hire. learned everything by doing it wrong first and then figuring out the right way.</p>
<h3>2018–2024 — the agency days</h3>
<p>built my own agency called Desk. grew to ~12 people, 155+ clients across HR, real estate, furniture, wellness, education, and more. six years of managing client relationships, creative teams, and cross-functional execution under pressure.</p>
<h3>2024–2025 — people+ai / EkStep Foundation</h3>
<p>employee #1 at People+ai, an EkStep Foundation initiative. built the community (0→2,000+), events (70+), partnerships (SaaSBoomi, OpenAI, Z47). created the AI Use Case Garden and AI Imagineers Club. co-designed an 18-month fellowship program.</p>
<h3>2025–present — sthaan</h3>
<p>working with Tanuj Bhojwani on AI + financial inclusion research for the Bill & Melinda Gates Foundation. product coordination for Cloop and Innernet.</p>`,
  },
  '/about/values.txt': {
    type: 'file', icon: '📄', modified: 'Mar 2026', size: '0.9 KB',
    title: 'what i believe',
    content: `<h3>ownership over task lists</h3>
<p>"i don't want to be fed what i have to do every week or every day." i figure out what needs to happen, build the system, and make it happen.</p>
<h3>building from scratch</h3>
<p>"i like being the person who says 'i'll figure it out' and then actually does."</p>
<h3>speed</h3>
<p>AI-enabled, 30-minute turnaround mentality. if something used to take three days, i want to know why it can't take thirty minutes.</p>
<h3>cross-functional coordination</h3>
<p>bringing different parts of a company together. i sit comfortably between product teams, design, ops, and external stakeholders.</p>`,
  },
  '/work': {
    type: 'folder',
    children: ['sthaan', 'people-ai', 'strategic-consulting', 'desk-agency', 'clients', 'other-projects'],
  },
  '/work/people-ai': {
    type: 'folder',
    children: ['README.md'],
  },
  '/work/people-ai/README.md': {
    type: 'file', icon: '📄', modified: 'Jan 2025', size: '3.2 KB',
    title: 'people+ai — an EkStep Foundation initiative',
    content: `<p><strong>Role:</strong> Employee #1</p>
<p>built the community, events, and partner ecosystem from scratch.</p>
<div class="stat-row">
  <div class="stat-item"><span class="stat-num">2,000+</span><span class="stat-label">community members</span></div>
  <div class="stat-item"><span class="stat-num">70+</span><span class="stat-label">events</span></div>
  <div class="stat-item"><span class="stat-num">200+</span><span class="stat-label">avg attendees</span></div>
</div>
<h3>partnerships</h3>
<p>SaaSBoomi, OpenAI, Z47, and others.</p>
<h3>AI Use Case Garden</h3>
<p>a public leaderboard of actionable AI ideas crowdsourced from every meeting, event, and conversation. built the entire automation pipeline behind it — AI processing meeting transcripts to extract ideas, public voting, volunteer group formation.</p>
<h3>AI Imagineers Club</h3>
<p>volunteer working groups that picked ideas from the garden and actually built them. met every 2 weeks, all volunteer-led — required motivation, not mandates.</p>
<h3>Fellowship Program</h3>
<p>co-designed an 18-month fellowship program with Tanuj Bhojwani.</p>
<p><em>the work was fundamentally about coordination: getting researchers, policymakers, practitioners, and volunteers to move in the same direction on hard problems.</em></p>`,
  },
  '/work/strategic-consulting': { type: 'folder', children: ['README.md'] },
  '/work/strategic-consulting/README.md': {
    type: 'file', icon: '📄', modified: 'Dec 2023', size: '1.2 KB',
    title: 'strategic consulting — 2021–2023',
    content: `<p><strong>Role:</strong> Strategic Consultant · 2021–2023</p>
<p>worked with founders and authors on brand narratives, community, and growth strategy.</p>
<h3>Art of Bitfulness — Tanuj Bhojwani</h3>
<p>positioned and promoted a book on staying calm and focused in the digital world. translated ideas into content, events, and community touchpoints.</p>
<h3>Chemical Khichdi — Aparna Piramal Raje</h3>
<p>ongoing social media management and editorial content around her mental health book. managing posts, creating assets, scheduling, tagging collaborators.</p>
<h3>Still — Aastha Gupta</h3>
<p>Head of Growth for a wellness/breathwork app. brand, content strategy, and product experiments across multiple launches. anti-retention, anti-screen-time positioning.</p>`,
  },
  '/work/sthaan': { type: 'folder', children: ['README.md'] },
  '/work/sthaan/README.md': {
    type: 'file', icon: '📄', modified: 'Mar 2026', size: '2.4 KB',
    title: 'sthaan — product & project manager',
    content: `<p><strong>Role:</strong> Product & Project Manager · Jan 2024–Present</p>
<p>working with Tanuj Bhojwani. managing complex stakeholder projects at the intersection of AI, policy, and product.</p>
<h3>AI + Financial Inclusion Research</h3>
<p>authored and typeset a research report for the Gates Foundation across lending, insurance, fraud prevention, and financial access.</p>
<h3>Cloop + Innernet</h3>
<p>product coordination and user success for Cloop ("Superhuman for WhatsApp") and Innernet — bridging the gap between product teams and end-users.</p>
<p><em>this project sits at the intersection of AI, policy, and institutional design — the kind of work where the writing, the research, and the stakeholder management all have to be airtight.</em></p>`,
  },
  '/work/clients/mythril': { type: 'folder', children: ['README.md'] },
  '/work/clients/mythril/README.md': {
    type: 'file', icon: '📄', modified: 'Mar 2026', size: '1.2 KB',
    title: 'mythril — LinkedIn content strategy',
    content: `<p>mythril is building a worldbuilding platform for fiction authors. i'm running their LinkedIn growth strategy from positioning to publishing.</p>
<p>built the full strategy deck: audit, messaging architecture, channel roles, campaign concepts, publishing rhythm. writing and designing all social posts — tying product positioning to cultural commentary.</p>
<blockquote>"not an AI co-writer. a story operating system for authors."</blockquote>`,
  },
  '/work/clients/still': { type: 'folder', children: ['README.md'] },
  '/work/clients/still/README.md': {
    type: 'file', icon: '📄', modified: 'Feb 2026', size: '0.8 KB',
    title: 'still — wellness / breathwork app',
    content: `<p>worked with founder Aastha Gupta during the early days to build the brand, content strategy, and product experiments through multiple launches.</p>
<p>still brings ancient yogic breathwork into a modern app experience. linear journey of 100 "sits." anti-retention, anti-screen-time positioning.</p>`,
  },
  '/work/clients/art-of-bitfulness': { type: 'folder', children: ['README.md'] },
  '/work/clients/art-of-bitfulness/README.md': {
    type: 'file', icon: '📄', modified: 'Dec 2024', size: '0.6 KB',
    title: 'the Art of Bitfulness — book launch',
    content: `<p>worked with co-authors Tanuj Bhojwani and Nandan Nilekani to position and promote a book on staying calm and focused in the digital world.</p>
<p>translated the book's ideas into online touchpoints, content, and community events connecting with readers.</p>`,
  },
  '/work/clients/chemical-khichdi': { type: 'folder', children: ['README.md'] },
  '/work/clients/chemical-khichdi/README.md': {
    type: 'file', icon: '📄', modified: 'Mar 2026', size: '0.5 KB',
    title: 'Chemical Khichdi — social media & content',
    content: `<p>helped scale Aparna Piramal Raje's social presence around her book on mental health — creating assets for workshops, talks, LinkedIn content, and ongoing editorial management.</p>`,
  },
  '/work/clients/hello-ally': { type: 'folder', children: ['README.md'] },
  '/work/clients/hello-ally/README.md': {
    type: 'file', icon: '📄', modified: 'Feb 2026', size: '0.5 KB',
    title: 'hello ally — fundraising & strategy',
    content: `<p>built fundraising decks, tech stack visuals, and strategy materials for Kriti Krishnan's mental health simulation platform.</p>
<p>GTM: nonprofits, service providers, universities. built the "Three ways in. One platform." slide.</p>`,
  },
  '/work/desk-agency': { type: 'folder', children: ['README.md'] },
  '/work/desk-agency/README.md': {
    type: 'file', icon: '📄', modified: 'Jan 2025', size: '1.1 KB',
    title: 'Desk — the agency',
    content: `<p>before all of this, i built a one-person operation into a team of 12, serving 155+ clients across HR, real estate, furniture, wellness, education, and more.</p>
<div class="stat-row">
  <div class="stat-item"><span class="stat-num">1 → 12</span><span class="stat-label">team size</span></div>
  <div class="stat-item"><span class="stat-num">155+</span><span class="stat-label">clients</span></div>
  <div class="stat-item"><span class="stat-num">6</span><span class="stat-label">years</span></div>
</div>
<p>six years of managing client relationships, creative teams, and cross-functional execution under pressure.</p>
<p><em>Desk still takes clients for short-form video and social media retainers — reach out to asma@onlysif.com if that's your thing.</em></p>`,
  },
  '/work/clients': {
    type: 'folder',
    children: ['mythril', 'still', 'art-of-bitfulness', 'chemical-khichdi', 'hello-ally'],
  },
  '/work/other-projects': { type: 'folder', children: ['README.md'] },
  '/work/other-projects/README.md': {
    type: 'file', icon: '📄', modified: 'Mar 2026', size: '0.8 KB',
    title: 'other recent work',
    content: `<ul>
  <li><strong>Eyova</strong> — brand identity and moodboarding for a premium egg-protein hair tonic</li>
  <li><strong>Vama Gears</strong> — AI-generated product imagery pipeline</li>
  <li><strong>Canine Synergy</strong> — payments tracking app and marketing posters</li>
  <li><strong>Raintree Housse</strong> — website design and development</li>
  <li><strong>NAT</strong> — brochure design and print production</li>
  <li><strong>Aparna Piramal Raje</strong> — ongoing LinkedIn and social media management</li>
</ul>`,
  },
  '/products': {
    type: 'folder',
    children: ['whatswrapped', 'cloop', 'poke-automations'],
  },
  '/products/whatswrapped': { type: 'folder', children: ['README.md'] },
  '/products/whatswrapped/README.md': {
    type: 'file', icon: '📄', modified: 'Mar 2026', size: '1.4 KB',
    title: 'WhatsWrapped',
    content: `<p><a href="https://whatswrapped.onlysif.com" target="_blank">whatswrapped.onlysif.com</a></p>
<p>takes your WhatsApp chat history and roasts it back at you. built solo using Claude Code over a weekend.</p>
<p>features: friend battles, group battles, The Archive, Valentine's edition, Time Machine, Social DNA, Safe Share Cards.</p>
<p><strong>tech:</strong> Supabase, Razorpay, ElevenLabs, Gemini API. deployed on Netlify.</p>
<div class="tweet-grid">
  <blockquote class="twitter-tweet" data-theme="dark"><a href="https://x.com/theonlysif/status/2032512160388231471"></a></blockquote>
  <blockquote class="twitter-tweet" data-theme="dark"><a href="https://x.com/dechammaa/status/2009487106822058169"></a></blockquote>
  <blockquote class="twitter-tweet" data-theme="dark"><a href="https://x.com/theonlysif/status/2009609515436822559"></a></blockquote>
  <blockquote class="twitter-tweet" data-theme="dark"><a href="https://x.com/theonlysif/status/2009504502156833042"></a></blockquote>
</div>`,
  },
  '/products/cloop': { type: 'folder', children: ['README.md'] },
  '/products/cloop/README.md': {
    type: 'file', icon: '📄', modified: 'Sep 2024', size: '0.4 KB',
    title: 'Cloop',
    content: `<p>"Superhuman for WhatsApp" — a productivity layer for WhatsApp. built during the People+ai era. onboarding + early user loop.</p>`,
  },
  '/products/poke-automations': { type: 'folder', children: ['README.md'] },
  '/products/poke-automations/README.md': {
    type: 'file', icon: '📄', modified: 'Mar 2026', size: '0.9 KB',
    title: 'Poke Automations',
    content: `<p>custom Mac productivity monitoring system. LaunchAgent that tracks app switches, window titles, Focus Mode, WiFi, Bluetooth, meetings.</p>
<p>generates focus scores, standup reports, energy tracking, and day reconstruction from event logs.</p>`,
  },
  '/how-i-work': {
    type: 'folder',
    children: ['tools.md', 'ai-philosophy.md'],
  },
  '/how-i-work/tools.md': {
    type: 'file', icon: '📄', modified: 'Mar 2026', size: '1.3 KB',
    title: 'tools & workflow',
    content: `<h3>daily drivers</h3>
<ul>
  <li><strong>Superhuman</strong> — email (38-week Inbox Zero streak)</li>
  <li><strong>Motion</strong> — calendar + AI task management</li>
  <li><strong>Conductor</strong> — AI-powered code editor</li>
  <li><strong>Paper</strong> — presentation design</li>
  <li><strong>Figma</strong> — design</li>
  <li><strong>Claude / Claude Code</strong> — primary AI for building & thinking</li>
  <li><strong>ChatGPT Plus</strong> — research & drafting</li>
  <li><strong>Fireflies.ai</strong> — meeting transcripts</li>
</ul>
<h3>AI tools in action</h3>
<ul>
  <li><strong>claude code</strong> → building websites and apps</li>
  <li><strong>chatgpt</strong> → research and drafting</li>
  <li><strong>AI image gen</strong> → product visuals</li>
  <li><strong>custom pipelines</strong> → meeting transcripts → databases</li>
</ul>`,
  },
  '/how-i-work/ai-philosophy.md': {
    type: 'file', icon: '📄', modified: 'Mar 2026', size: '0.7 KB',
    title: 'how i think about AI',
    content: `<p>i use AI the way most people use Google — constantly, without thinking about it, for everything.</p>
<p>this isn't a line on my resume. it's how i think about speed. if something used to take three days, i want to know why it can't take thirty minutes.</p>
<p>when i work with a founder, the goal isn't just to do the thing. it's to build the system that does the thing — so it keeps working after i'm not looking at it.</p>`,
  },
  '/testimonials': {
    type: 'folder',
    children: ['nikita-kurup.txt', 'soumya-bhasin.txt', 'sarah-hussein.txt', 'suhasini-srirangam.txt'],
  },
  '/testimonials/nikita-kurup.txt': {
    type: 'file', icon: '📄', modified: 'Dec 2024', size: '0.4 KB',
    title: 'Nikita Kurup — Jar',
    content: `<blockquote>"Partnering with Asif's team has been a game-changer. It's incredibly rare to find creatives who don't just understand your vision — they expand it. Every brief is met with fresh thinking, lightning-fast execution, and a level of innovation that consistently exceeds expectations. With over 200 short-form content pieces under our belt, the impact has been undeniable — measurable engagement, rave reviews, and a growing audience that keeps coming back for more."</blockquote>`,
  },
  '/testimonials/soumya-bhasin.txt': {
    type: 'file', icon: '📄', modified: 'Nov 2024', size: '0.2 KB',
    title: 'Soumya Bhasin — Client Servicing & Concepts',
    content: `<blockquote>"An ingenious designer & strategist. He is very easy to get along with and is clear-thinking and quick-witted."</blockquote>`,
  },
  '/testimonials/sarah-hussein.txt': {
    type: 'file', icon: '📄', modified: 'Oct 2024', size: '0.2 KB',
    title: 'Sarah Hussein — HR Consultant',
    content: `<blockquote>"You definitely cannot go wrong with having Asif on your team to help you with your marketing goals."</blockquote>`,
  },
  '/testimonials/suhasini-srirangam.txt': {
    type: 'file', icon: '📄', modified: 'Sep 2024', size: '0.1 KB',
    title: 'Suhasini Srirangam — Yoga Instructor',
    content: `<blockquote>"Asif is a great powerhouse of knowledge, skills and people skills."</blockquote>`,
  },
  '/personal': {
    type: 'folder',
    children: ['unique-abilities.md', 'search-history.txt', 'thoughts.md', 'not-working.md'],
  },
  '/personal/unique-abilities.md': {
    type: 'file', icon: '📝', modified: 'Mar 2026', size: '0.8 KB',
    title: 'unique abilities',
    content: `<ul>
  <li>maintaining a 38-week inbox zero streak on superhuman (and counting)</li>
  <li>building a full payments tracking app in an afternoon using ai-assisted coding, including voice input, auto-parsing, and google sheets integration</li>
  <li>writing a custom productivity monitoring system for my mac from scratch — it tracks app switches, keystrokes, wifi, bluetooth, and generates a "focus score" every hour</li>
  <li>typing "LASJDLKAJDSLKA WHATTTT!!!!!!" with the same sincerity i bring to a gates foundation deck</li>
  <li>responding to "should i do an mba?" with "no" and nothing else</li>
</ul>`,
  },
  '/personal/search-history.txt': {
    type: 'file', icon: '📄', modified: 'Mar 2026', size: '0.5 KB',
    title: 'recent search history',
    content: `<p style="color:var(--fg-dim);margin-bottom:16px;font-size:12px;">a real, unedited selection of things i've searched for in the last two weeks. i think your search history says more about you than your resume ever will.</p>
<ul>
  <li>"pieces by sum 41 - suggest similar songs with apple music links pls"</li>
  <li>"8club.co - are they funded?"</li>
  <li>"indian brand tshirt"</li>
  <li>"old rock song with desert and military video"</li>
  <li>"if i schedule a message on slack - will they know?"</li>
  <li>"2L per month cash-in-hand CTC equivalent"</li>
  <li>"bank timings in rajasthan"</li>
  <li>"loco bear go-kart race results"</li>
</ul>`,
  },
  '/personal/thoughts.md': {
    type: 'file', icon: '📝', modified: 'Mar 2026', size: '1.1 KB',
    title: 'thoughts',
    content: `<p>my aim is to intentionally dedicate time to writing because it helps me follow my curiosity, dive down rabbit holes, and figure out how my brain works.</p>
<h3>sundayWrites</h3>
<p>i run a substack called <strong>sundayWrites</strong>. the tagline is "i sit & ponder; unfortunately." i launched it 5 years ago and post very infrequently because apparently sitting and pondering is the easy part.</p>
<p><a href="https://theonlysif.substack.com" target="_blank">View sundayWrites on Substack →</a></p>
<h3>echoes</h3>
<p>a different thing entirely — an infinite canvas of text where anyone can write anywhere. raw, unstructured, very me.</p>
<p><a href="https://www.yourworldoftext.com/~theonlysif/asif" target="_blank">Visit echoes →</a></p>
<h3>raw writing</h3>
<p>i have a daily 30-minute raw writing practice. no audience. no editing. just writing.</p>`,
  },
  '/personal/not-working.md': {
    type: 'file', icon: '📝', modified: 'Mar 2026', size: '1.3 KB',
    title: 'not working',
    content: `<h3>nyt connections</h3>
<p>i play every single day and post the score on twitter. my engagement rate on these tweets is higher than anything professional i've ever posted. make of that what you will.</p>
<h3>building random things</h3>
<p>i built <strong>whatswrapped</strong> over a weekend — a tool that takes your whatsapp chat and roasts it back at you. it has a valentine's edition, a "battle of the exes" mode, social dna analysis, time machine comparisons, and safe share cards.</p>
<p>i also built a bali vacation planning dashboard with 15 experimental features just because i felt like it.</p>
<h3>what i'm reading</h3>
<p>visakan veerasamy's substack (the internet's "do many things" philosopher), sari azout on information architecture, and the ainews daily digest.</p>
<h3>youtube</h3>
<p>mentour pilot (aviation breakdowns), johnny harris (geopolitics but make it beautiful), rabbit hole (deep dives), and S'nA — a global jazz fusion project with influences from india, pakistan, iran, kazakhstan, nigeria, and england. very niche. very good.</p>`,
  },
  '/chat': {
    type: 'chat',
    icon: '💬',
  },
  '/settings.app': {
    type: 'settings',
    icon: '⚙️',
    modified: 'Mar 2026',
    size: '--',
  },
  '/productivity.log': {
    type: 'productivity',
    icon: '📊',
    modified: 'Mar 22, 2026 · 4:31 PM',
    size: '7 days',
    lastUpdated: 'Sun Mar 22 2026, 4:31 PM IST',
    log: [
      {
        date: 'Sunday, March 22',
        score: 38,
        summary: 'A classic sunday rest and reset. Morning was offline — 2 hours of pickleball, social time, zero screens. Afternoon: a single ~30 minute focus block to prep for the week ahead. Updated project tracking in Fibery (s-level tracking, internal workspace views), cleared pending reminders, and caught up on newsletters. Intentionally low output. Exactly what a Sunday should be.',
        meetings: 0,
        projects: 2,
        deepWork: 0,
        hours: '09:00 → 16:31 IST',
        highlight: 'pickleball · Fibery updated · zero meetings',
      },
      {
        date: 'Friday, March 20',
        score: 94,
        summary: 'A high-intensity creative sprint day bookended by deep coding sessions. Kicked off at midnight with the portfolio site terminal implementation — shipped 40 interactive easter egg commands and a persistent settings overlay with theme toggle and resume download. Midday: 4 meetings across internal research syncs, a partner call for a new opportunity, and a client follow-up for a mental health project. Built high-fidelity product mockups and restructured consulting profile on a creator platform. Curated a client\'s mental health video series. Late-night: 3-hour coding sprint wrapping up site development and CLI/MCP integration. Multiple projects moved from in-progress to shipped within a single day.',
        meetings: 4,
        projects: 6,
        deepWork: 3,
        hours: '00:00 → 21:55 IST',
        highlight: '40 easter egg commands shipped · settings overlay built · product mockups delivered',
      },
      {
        date: 'Thursday, March 19',
        score: 85,
        summary: 'A creative and strategic day. Designed 9 marketing posters (all A4) for a dog training client using AI-assisted design in Paper. Had a morning strategy hour with a content client. Afternoon: job interview with a D2C company (partnership role). Then the biggest event of the day: a 1-hour career positioning call that reframed the professional narrative from "generalist" to "Entrepreneur in Residence" — revenue ownership, AI-speed execution, directed problem-solving. Spent the evening building an entire portfolio website from scratch: prototyped 4 experimental versions, settled on a dual-site approach, integrated a comprehensive context document into the AI system prompt, tested extensively.',
        meetings: 3,
        projects: 4,
        deepWork: 2,
        hours: '9:30 AM → 9:30 PM+',
        highlight: '9 poster designs, 4 website prototypes, 1 comprehensive personal context document',
      },
      {
        date: 'Wednesday, March 18',
        score: 95,
        summary: 'The heaviest technical execution day. Started at 7:22 AM in Conductor. Ran a massive content synchronization project on a large research report: full content audit across all artboards (76 tool calls, verified every page). Built 11 new presentation slides with a complete design system. Wrote and ran a verbatim fix script: scanned 1,441 text nodes, fixed 674 to match source content, auto-expanded all text boxes. Manually fixed layout issues across 25+ additional slides. Had 4 meetings throughout. Also squeezed in deck changes and brand work for other clients.',
        meetings: 5,
        projects: 4,
        deepWork: 3,
        hours: '7:22 AM → 6:30 PM+',
        highlight: '1,441 text nodes scanned · 674 fixed · 11 slides designed · ~10,000 lines of code',
      },
      {
        date: 'Tuesday, March 17',
        score: 92,
        summary: 'The busiest day of the week. Started deep work at 8:57 AM. Three separate job interviews — a partnership role at a D2C checkout company, a founder\'s office exploratory with an edtech, and an AI company conversation. In between interviews, built an entire payments tracking app from scratch using AI-assisted coding (Conductor + Gemini + Google Sheets), complete with voice input, AI parsing, and deployed to Netlify. Also wrote and designed social media posts for a client, made 4 rounds of deck changes for a startup, and briefed a junior team member.',
        meetings: 5,
        projects: 8,
        deepWork: 4,
        hours: '8:57 AM → 12:00 AM',
        highlight: '3 job interviews + 1 full payments app built and deployed',
      },
      {
        date: 'Monday, March 16 (Birthday)',
        score: 82,
        summary: 'Worked through the entire birthday. Started with an in-office sync on a major research report — spent significant time on Fibery collating detailed feedback (timestamped notes, structural changes, slide-by-slide revisions). Worked on an event company concept for 2 hours. Applied to a job platform. Wrote a personal reflection on turning 26 (9-10 PM). Then at 11 PM, sat down to write v1 of new website content — finished at 11:40 PM. All 5 daily routines completed.',
        meetings: 1,
        projects: 7,
        deepWork: 3,
        hours: '8:45 AM → 11:40 PM',
        highlight: 'All 5 routines completed · birthday reflection written · website v1 drafted at 11 PM',
      },
      {
        date: 'Sunday, March 15',
        score: 68,
        summary: 'A mixed day — half client work, half career strategy. Built website changes for a student housing client: content updates, regulatory information, deployed to production. Ran an extensive Figma review session on a fundraising deck (commenting on 15+ slides). Had a strategy call with a startup founder. Big job search push: drafted speculative outreach emails to 3 companies, sent networking messages. By 2:24 PM, Motion showed "no more meetings or tasks today" — but kept working through the evening.',
        meetings: 2,
        projects: 5,
        deepWork: 2,
        hours: '1:00 PM → 8:25 PM',
        highlight: '3 speculative outreach emails drafted · website deployed to production',
      },
      {
        date: 'Saturday, March 14',
        score: 40,
        summary: 'Lighter day — family birthday celebrations. Some evening freelance work visible: moodboarding for a brand client (7:35–8:35 PM) and deck revisions for a startup (8–8:45 PM). A scheduled 4-hour freelance sprint was missed. Reasonable to take it easier on a Saturday with personal commitments.',
        meetings: 0,
        projects: 2,
        deepWork: 1,
        hours: '7:35 PM → 8:45 PM',
        highlight: 'Family first. Some evening work squeezed in.',
      },
      {
        date: 'Thursday, March 13',
        score: 78,
        summary: 'A high-breadth day — touched 6+ projects across client work, research, and job search. Built out a full 10-day content bank for a LinkedIn client after a strategy call, including deep research on worldbuilding, franchise criticism, and author interviews. Reviewed brochure edits with a print client. Developed a new brand direction ("Curated Archive / Specimen Lab") for a hair tonic brand after client rejected earlier concepts. Drafted and sent an invoice. Had a podcast proposal built in Paper. Evening: friend hangout, then a late-night job interview call.',
        meetings: 5,
        projects: 6,
        deepWork: 2,
        hours: '9:00 AM → 10:45 PM',
        highlight: '10-day content bank built · new brand direction developed · late-night interview',
      },
    ],
  },
  '/contact.vcf': {
    type: 'file', icon: '📇', modified: 'Mar 2026', size: '0.3 KB',
    title: 'Asif Hassan Muhamed',
    content: `<div class="contact-card">
  <h2 style="font-family: var(--serif); font-weight: 400; font-size: 28px; margin-bottom: 4px;">Asif Hassan Muhamed</h2>
  <p style="color: var(--fg-dim); margin-bottom: 20px;">operator · bangalore, india</p>
  <div class="contact-row"><span class="contact-label">email</span><span class="contact-value"><a href="mailto:hi@onlysif.com">hi@onlysif.com</a></span></div>
  <div class="contact-row"><span class="contact-label">twitter/x</span><span class="contact-value"><a href="https://x.com/theonlysif" target="_blank">@theonlysif</a></span></div>
  <div class="contact-row"><span class="contact-label">linkedin</span><span class="contact-value"><a href="https://linkedin.com/in/asifhassanmuhamed" target="_blank">in/asifhassanmuhamed</a></span></div>
  <div class="contact-row"><span class="contact-label">website</span><span class="contact-value"><a href="https://onlysif.com" target="_blank">onlysif.com</a></span></div>
  <div class="contact-row"><span class="contact-label">github</span><span class="contact-value"><a href="https://github.com/theonlysif" target="_blank">theonlysif</a></span></div>
  <div class="contact-row" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)"><span class="contact-label">book a call</span><span class="contact-value"><a href="https://app.usemotion.com/meet/asif-hassan/meeting" target="_blank">schedule time →</a></span></div>
</div>`,
  },
};

// ============================================
// Sound Engine (Web Audio API — no files needed)
// ============================================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playClick() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

function playOpenFile() {
  try {
    const ctx = getAudioCtx();
    [0, 0.04].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(i === 0 ? 660 : 880, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.06, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.1);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.1);
    });
  } catch (e) {}
}

// Tinkering sound: periodic soft blips while Gemini is thinking
let tinkerInterval = null;

function startTinkering() {
  if (tinkerInterval) return;
  let step = 0;
  const pattern = [440, 0, 520, 0, 440, 480, 0, 560];
  tinkerInterval = setInterval(() => {
    const freq = pattern[step % pattern.length];
    step++;
    if (!freq) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {}
  }, 180);
}

function stopTinkering() {
  if (tinkerInterval) {
    clearInterval(tinkerInterval);
    tinkerInterval = null;
  }
  // play a soft "done" chord
  try {
    const ctx = getAudioCtx();
    [0, 0.06, 0.12].forEach((delay, i) => {
      const freqs = [523, 659, 784];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqs[i], ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.05, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.25);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.25);
    });
  } catch (e) {}
}

// State
let currentPath = '/';
let history = ['/'];
let historyIndex = 0;
let viewMode = 'grid';
let terminalHistory = [];

// DOM
const content = document.getElementById('content');
const breadcrumb = document.getElementById('breadcrumb');
const windowTitle = document.getElementById('windowTitle');
const statusbar = document.getElementById('statusbar');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');

// Get icon for file/folder
function getIcon(name, isFolder) {
  if (isFolder) return '📁';
  if (name.endsWith('.md')) return '📝';
  if (name.endsWith('.txt')) return '📄';
  if (name.endsWith('.json')) return '📊';
  if (name.endsWith('.vcf')) return '📇';
  if (name.endsWith('.log')) return '📊';
  return '📄';
}

// Navigate to path
function navigate(path, addToHistory = true) {
  const node = FS[path];
  if (!node) return;

  currentPath = path;
  // Terminal needs a fill-height flex context; everything else scrolls normally
  content.classList.toggle('content--fill', node.type === 'chat');

  if (addToHistory) {
    history = history.slice(0, historyIndex + 1);
    history.push(path);
    historyIndex = history.length - 1;
  }

  updateNav();

  if (node.type === 'folder') {
    renderFolder(path, node);
  } else if (node.type === 'file') {
    renderFile(node);
  } else if (node.type === 'chat') {
    renderChat();
  } else if (node.type === 'settings') {
    renderSettings();
  } else if (node.type === 'productivity') {
    renderProductivity(node);
  }
}

function updateNav() {
  backBtn.disabled = historyIndex <= 0;
  forwardBtn.disabled = historyIndex >= history.length - 1;
  breadcrumb.innerHTML = `<span>/Users/asif/portfolio${currentPath === '/' ? '' : currentPath}</span>`;
  const name = currentPath === '/' ? 'portfolio' : currentPath.split('/').filter(Boolean).pop();
  windowTitle.textContent = name;

  // Update sidebar active
  document.querySelectorAll('.sidebar-item[data-path]').forEach(item => {
    const p = item.dataset.path;
    item.classList.toggle('active', currentPath === p || currentPath.startsWith(p + '/'));
  });
  // Update mobile nav active
  document.querySelectorAll('.mobile-nav-item[data-path]').forEach(item => {
    const p = item.dataset.path;
    item.classList.toggle('active', currentPath === p || currentPath.startsWith(p + '/'));
  });
}

// Render folder view
function renderFolder(path, node) {
  const items = node.children;
  statusbar.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

  const container = document.createElement('div');
  container.className = viewMode === 'grid' ? 'file-grid' : 'file-list';

  items.forEach(name => {
    const childPath = path === '/' ? `/${name}` : `${path}/${name}`;
    const childNode = FS[childPath];
    const isFolder = childNode?.type === 'folder' || childNode?.type === 'chat';
    const icon = childNode?.icon || getIcon(name, isFolder);

    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
      <span class="file-icon">${icon}</span>
      <span class="file-name">${name}</span>
      ${viewMode === 'list' ? `<span class="file-meta">${childNode?.modified || ''}</span>` : ''}
    `;

    item.addEventListener('dblclick', () => { playOpenFile(); navigate(childPath); });
    item.addEventListener('click', () => { if (window.innerWidth <= 768) { playOpenFile(); navigate(childPath); } });
    item.addEventListener('click', (e) => {
      playClick();
      document.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
      statusbar.textContent = `"${name}" selected — ${childNode?.size || (isFolder ? 'folder' : '--')}`;
    });

    container.appendChild(item);
  });

  content.innerHTML = '';
  content.appendChild(container);
}

// Render file view
function renderFile(node) {
  statusbar.textContent = node.size || '';
  content.innerHTML = `
    <div class="doc-viewer">
      <h1>${node.title}</h1>
      <div class="doc-meta">${node.modified} · ${node.size}</div>
      ${node.content}
    </div>
  `;
  if (window.twttr && window.twttr.widgets) {
    window.twttr.widgets.load(content);
  }
}

// Render productivity dashboard
function renderProductivity(node) {
  statusbar.textContent = `last updated: ${node.lastUpdated}`;
  const today = node.log[0];

  function scoreColor(s) {
    if (s >= 90) return '#4ec9b0';
    if (s >= 75) return '#dcdcaa';
    if (s >= 60) return '#ff9e64';
    return '#f44747';
  }

  const historyRows = node.log.slice(1).map(day => `
    <div class="prod-history-row">
      <div class="prod-hist-date">${day.date}</div>
      <div class="prod-hist-score" style="color:${scoreColor(day.score)}">${day.score}<span class="prod-hist-denom">/100</span></div>
      <div class="prod-hist-bar"><div class="prod-hist-fill" style="width:${day.score}%;background:${scoreColor(day.score)}"></div></div>
      <div class="prod-hist-meta">${day.meetings} mtg · ${day.projects} projects · ${day.deepWork} deep work blocks</div>
      <div class="prod-hist-summary">${day.summary}</div>
      <div class="prod-hist-highlight">↳ ${day.highlight}</div>
      <div class="prod-hist-hours">${day.hours}</div>
    </div>
  `).join('');

  content.innerHTML = `
    <div class="prod-view">
      <div class="prod-header">
        <div class="prod-title-row">
          <span class="prod-filename">productivity.log</span>
          <span class="prod-updated">last updated: ${node.lastUpdated}</span>
        </div>
      </div>

      <div class="prod-today">
        <div class="prod-today-left">
          <div class="prod-today-label">today</div>
          <div class="prod-today-date">${today.date}</div>
          <div class="prod-today-score" style="color:${scoreColor(today.score)}">${today.score}<span class="prod-score-denom">/100</span></div>
          <div class="prod-score-bar"><div class="prod-score-fill" style="width:${today.score}%;background:${scoreColor(today.score)}"></div></div>
          <div class="prod-today-meta">
            <span>${today.meetings} meetings</span>
            <span>${today.projects} projects</span>
            <span>${today.deepWork} deep work blocks</span>
            <span>${today.hours}</span>
          </div>
        </div>
        <div class="prod-today-right">
          <div class="prod-today-summary">${today.summary}</div>
          <div class="prod-today-highlight">↳ ${today.highlight}</div>
        </div>
      </div>

      <div class="prod-history-section">
        <div class="prod-history-title">history</div>
        ${historyRows}
      </div>
    </div>
  `;
}

const SUGGESTIONS = [
  "why should i hire you?",
  "what have you built?",
  "i'm hiring for a GTM / ops role",
  "what does your day actually look like?",
  "can we schedule a call?",
];

// ============================================
// Settings
// ============================================

const ACCENT_COLORS = [
  { name: 'blue',   value: '#4fc1ff' },
  { name: 'orange', value: '#ff9e64' },
  { name: 'green',  value: '#4ec9b0' },
  { name: 'purple', value: '#c792ea' },
  { name: 'red',    value: '#f07178' },
];

function applyAccent(color) {
  document.documentElement.style.setProperty('--accent', color);
  localStorage.setItem('accentColor', color);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('themeOverride', theme);
}

// On load: restore accent + theme override
(function initPrefs() {
  const savedAccent = localStorage.getItem('accentColor');
  if (savedAccent) document.documentElement.style.setProperty('--accent', savedAccent);
  const savedTheme = localStorage.getItem('themeOverride');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
})();

function renderSettings() {
  statusbar.textContent = 'settings';
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const currentAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

  const langs = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
  ];
  const currentLang = localStorage.getItem('lang') || 'en';

  content.innerHTML = `
    <div class="settings-view">
      <div class="settings-section">
        <div class="settings-label">appearance</div>
        <div class="settings-row">
          <span class="settings-row-label">theme</span>
          <div class="settings-toggle-group" id="themeToggle">
            <button class="settings-toggle-btn ${currentTheme === 'light' ? 'active' : ''}" data-val="light">light</button>
            <button class="settings-toggle-btn ${currentTheme === 'dark' ? 'active' : ''}" data-val="dark">dark</button>
            <button class="settings-toggle-btn ${!localStorage.getItem('themeOverride') ? 'active' : ''}" data-val="auto">auto</button>
          </div>
        </div>
        <div class="settings-row">
          <span class="settings-row-label">accent color</span>
          <div class="settings-accent-swatches" id="accentPicker">
            ${ACCENT_COLORS.map(c => `<button class="accent-swatch ${currentAccent === c.value || currentAccent === ' ' + c.value ? 'active' : ''}" data-color="${c.value}" style="background:${c.value}" title="${c.name}"></button>`).join('')}
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-label">language</div>
        <div class="settings-row">
          <span class="settings-row-label">ui language</span>
          <div class="settings-toggle-group" id="langToggle">
            ${langs.map(l => `<button class="settings-toggle-btn ${currentLang === l.code ? 'active' : ''}" data-val="${l.code}">${l.label}</button>`).join('')}
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-label">about this asif</div>
        <div class="about-asif-card">
          <div class="about-asif-avatar">A</div>
          <div class="about-asif-info">
            <div class="about-asif-name">Asif Hassan Muhamed</div>
            <div class="about-asif-version">Version 7.2 (2026 build)</div>
          </div>
        </div>
        <div class="about-asif-stats">
          <div class="about-stat"><span class="about-stat-label">experience</span><span class="about-stat-val">7+ years</span></div>
          <div class="about-stat"><span class="about-stat-label">clients served</span><span class="about-stat-val">155+</span></div>
          <div class="about-stat"><span class="about-stat-label">community built</span><span class="about-stat-val">0 → 2,000+</span></div>
          <div class="about-stat"><span class="about-stat-label">events run</span><span class="about-stat-val">70+</span></div>
          <div class="about-stat"><span class="about-stat-label">products shipped</span><span class="about-stat-val">4</span></div>
          <div class="about-stat"><span class="about-stat-label">location</span><span class="about-stat-val">Bangalore, India</span></div>
          <div class="about-stat"><span class="about-stat-label">chip</span><span class="about-stat-val">generalist M1 (cursed)</span></div>
          <div class="about-stat"><span class="about-stat-label">available</span><span class="about-stat-val">yes</span></div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-label">resume</div>
        <div class="settings-row">
          <span class="settings-row-label">Asif Hassan — Resume.pdf</span>
          <a class="settings-download-btn" href="/resume.pdf" download="Asif Hassan - Resume.pdf">↓ download</a>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-label">schedule</div>
        <div class="settings-row">
          <span class="settings-row-label">book a 30-min call</span>
          <a class="settings-download-btn" href="https://app.usemotion.com/meet/asif-hassan/meeting" target="_blank">open →</a>
        </div>
      </div>
    </div>
  `;

  // Theme toggle
  document.getElementById('themeToggle').querySelectorAll('.settings-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playClick();
      const val = btn.dataset.val;
      document.getElementById('themeToggle').querySelectorAll('.settings-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (val === 'auto') {
        localStorage.removeItem('themeOverride');
        const h = new Date().getHours();
        document.documentElement.setAttribute('data-theme', (h >= 7 && h < 19) ? 'light' : 'dark');
      } else {
        applyTheme(val);
      }
    });
  });

  // Accent picker
  document.getElementById('accentPicker').querySelectorAll('.accent-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      playClick();
      document.getElementById('accentPicker').querySelectorAll('.accent-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyAccent(btn.dataset.color);
    });
  });

  // Language toggle
  document.getElementById('langToggle').querySelectorAll('.settings-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playClick();
      document.getElementById('langToggle').querySelectorAll('.settings-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      localStorage.setItem('lang', btn.dataset.val);
      // Apply UI language
      applyLang(btn.dataset.val);
    });
  });
}

const UI_STRINGS = {
  en: {
    home: 'portfolio', about: 'about', work: 'work', products: 'products',
    'how-i-work': 'how-i-work', testimonials: 'testimonials', personal: 'personal',
    chat: 'chat', log: 'log',
  },
  hi: {
    home: 'पोर्टफोलियो', about: 'परिचय', work: 'काम', products: 'प्रोडक्ट',
    'how-i-work': 'कार्यशैली', testimonials: 'समीक्षाएं', personal: 'निजी',
    chat: 'चैट', log: 'लॉग',
  },
};

function applyLang(lang) {
  const s = UI_STRINGS[lang] || UI_STRINGS.en;
  document.querySelectorAll('.sidebar-item[data-path]').forEach(item => {
    const key = item.dataset.path.replace('/', '') || 'home';
    const icon = item.querySelector('.sidebar-icon');
    if (s[key]) item.innerHTML = `<span class="sidebar-icon">${icon?.textContent || ''}</span> ${s[key]}`;
  });
  document.querySelectorAll('.mobile-nav-item[data-path]').forEach(item => {
    const path = item.dataset.path.replace('/', '') || 'home';
    const label = item.querySelector('.mobile-nav-label');
    const icon = item.querySelector('.mobile-nav-icon');
    if (label && s[path]) label.textContent = s[path];
  });
}

// Restore lang on load
(function() {
  const lang = localStorage.getItem('lang');
  if (lang && lang !== 'en') applyLang(lang);
})();

// Render chat
function renderChat() {
  statusbar.textContent = 'chat — ask asif anything';
  content.innerHTML = `
    <div class="terminal-view">
      <div class="terminal-output" id="terminalOutput">
        <div class="terminal-msg"><span class="t-label t-asif">asif:</span> <span class="t-text">hey — ask me anything about my work, skills, or whether i'd be right for your role. type below or pick a prompt.</span></div>
      </div>
      <div class="terminal-suggestions" id="terminalSuggestions">
        ${SUGGESTIONS.map(s => `<button class="t-suggest">${s}</button>`).join('')}
      </div>
      <div class="terminal-input">
        <span class="terminal-prompt">❯</span>
        <input type="text" id="terminalInput" placeholder="ask me anything..." autofocus>
        <button class="terminal-send" id="terminalSend">→</button>
      </div>
    </div>
  `;

  const termInput = document.getElementById('terminalInput');
  const termOutput = document.getElementById('terminalOutput');
  const suggestionsEl = document.getElementById('terminalSuggestions');
  const sessionId = crypto.randomUUID();

  // Suggestion chip clicks
  suggestionsEl.querySelectorAll('.t-suggest').forEach(btn => {
    btn.addEventListener('click', () => {
      playClick();
      termInput.value = btn.textContent;
      termInput.focus();
      submitMessage(btn.textContent);
    });
  });

  // ── Easter egg command handler ──────────────────────────────────────────
  function getEasterEgg(raw) {
    const cmd = raw.trim().toLowerCase();

    // sudo rm -rf / → dramatic wipe then restore
    if (/^sudo\s+rm\s+-rf\s+[\/\*]/.test(cmd)) {
      setTimeout(() => {
        const items = termOutput.querySelectorAll('.terminal-msg');
        let i = 0;
        const del = setInterval(() => {
          if (i < items.length) { items[i].style.transition = 'opacity 0.1s'; items[i].style.opacity = '0'; i++; }
          else {
            clearInterval(del);
            setTimeout(() => {
              termOutput.querySelectorAll('.terminal-msg').forEach(el => el.remove());
              const restore = document.createElement('div');
              restore.className = 'terminal-msg';
              restore.innerHTML = `<span class="t-label t-asif">asif:</span> <span class="t-text">...just kidding. nothing was harmed. (this whole site is fake files anyway.)</span>`;
              termOutput.appendChild(restore);
              termOutput.scrollTop = termOutput.scrollHeight;
            }, 400);
          }
        }, 60);
      }, 500);
      return `<span style="color:var(--accent)">⚠️ WARNING: deleting everything...</span>`;
    }

    // sudo hire asif
    if (/^sudo\s+hire\s+asif/.test(cmd)) return `✅ executing hire sequence...<br><br>just kidding — that's above my permission level. but you can grab a slot here: <a href="https://app.usemotion.com/meet/asif-hassan/meeting" target="_blank">book a call →</a>`;

    // sudo make me a sandwich
    if (/^sudo\s+make\s+me\s+a\s+sandwich/.test(cmd)) return `okay.`;

    // sudo (anything else)
    if (/^sudo\s+/.test(cmd)) return `🔐 <strong>admin mode activated.</strong> access level: guest (with confidence). what exactly were you hoping to do?`;

    // ls -la
    if (/^ls(\s+-\w+)*$/.test(cmd)) return `total 42<br>drwxr-xr-x  asif  staff   about/<br>drwxr-xr-x  asif  staff   work/<br>drwxr-xr-x  asif  staff   products/<br>-rw-r--r--  asif  staff   .secrets<br>-rw-r--r--  asif  staff   .embarrassing_tweets<br>-rw-r--r--  asif  staff   .crushes.txt<br>-rw-r--r--  asif  staff   resume.pdf<br>-rw-r--r--  asif  staff   productivity.log`;

    // cat .secrets
    if (cmd === 'cat .secrets') return `i have been tracking my NYT Connections score every single day since it launched. i have never missed a day. i have told almost no one.`;

    // cat .embarrassing_tweets
    if (cmd === 'cat .embarrassing_tweets') return `[2019-04-12] "okay but what if hustle culture is actually good tho"<br>[2020-08-03] "anyone else feel like they're meant for something bigger? just me?"<br>[2021-01-01] "new year new me fr this time"<br><br><span style="color:var(--fg-dim)">...3,847 more entries. file truncated.</span>`;

    // cat .crushes.txt
    if (cmd === 'cat .crushes.txt') return `permission denied.<br><span style="color:var(--fg-dim)">(some files are private even on a portfolio site)</span>`;

    // rm anything
    if (/^rm\s+/.test(cmd)) return `removed. (it wasn't real anyway. nothing here is real. this is all just asif in a trench coat.)`;

    // mv asif
    if (/^mv\s+asif/.test(cmd)) return `moved. good call.`;

    // chmod 777
    if (/^chmod\s+777\s+asif/.test(cmd)) return `full permissions granted. he'll do anything. within reason.`;

    // top / htop
    if (cmd === 'top' || cmd === 'htop') return `<strong>AsifOS processes — sorted by CPU</strong><br><br>PID   NAME                          CPU    MEM<br>001   overthinking.exe              99%    4GB<br>002   coffee_dependency.service     87%    2GB<br>003   motion_calendar_anxiety.app   73%    1GB<br>004   too_many_tabs.app             68%    8GB<br>005   random_ideas.daemon           45%    512MB<br>006   actual_work.sh                12%    256MB<br>007   inbox_zero_streak.service      8%    64MB<br><br><span style="color:var(--fg-dim)">press q to quit (it won't work)</span>`;

    // ps aux
    if (cmd === 'ps aux') return `USER   PID  COMMAND<br>asif   001  /usr/bin/thinking<br>asif   002  /usr/bin/building_something<br>asif   003  /usr/bin/reading_substack<br>asif   004  /usr/bin/nyt_connections<br>asif   005  /usr/bin/slack_notification_anxiety<br>asif   006  /usr/bin/coffee`;

    // ping asif
    if (/^ping\s+asif/.test(cmd)) return `PING asif.onlysif.com (192.168.asif.1): 56 bytes<br>64 bytes: icmp_seq=0 ttl=64 time=12ms<br>64 bytes: icmp_seq=1 ttl=64 time=8ms<br>64 bytes: icmp_seq=2 ttl=64 time=11ms<br><br>he's online. usually.`;

    // ping (anything else)
    if (/^ping\s+/.test(cmd)) return `request timeout.<br>asif doesn't use Google. he uses Claude.`;

    // uptime
    if (cmd === 'uptime') return ` 09:41  up 7 years, 4 months, 12 days, 6:23, 1 user, load averages: 2.41 2.19 1.87<br><span style="color:var(--fg-dim)">no kernel panics. a few memory leaks. running fine.</span>`;

    // whoami
    if (cmd === 'whoami') return `a curious stranger who found the easter eggs. respect.`;

    // uname
    if (/^uname/.test(cmd)) return `AsifOS 7.2.0 HSR-Bangalore #generalist SMP Mar 2026 OPERATOR x86_generalist`;

    // history
    if (cmd === 'history') return `  1  wake up<br>  2  check motion calendar<br>  3  swallow_the_frog.sh<br>  4  raw_writing 30min<br>  5  open 47 tabs<br>  6  close 46 tabs<br>  7  build something<br>  8  client call<br>  9  nyt_connections<br> 10  dinner 18:30<br> 11  build something else<br> 12  !!`;

    // df -h
    if (/^df/.test(cmd)) return `Filesystem        Size    Used   Avail  Use%<br>/dev/overthinking  100G    97G    3G     97%<br>/dev/ideas         500G    60G    440G   12%<br>/dev/bandwidth     ∞       12G    ∞       0%<br>/dev/patience      10G     8G     2G     80%<br>/dev/coffee        2G      2G     0G     100%`;

    // man asif
    if (cmd === 'man asif') return `<strong>ASIF(1)                   User Commands                  ASIF(1)</strong><br><br><strong>NAME</strong><br>       asif — generalist operator, first-hire specialist<br><br><strong>SYNOPSIS</strong><br>       asif [--build] [--community] [--ship] [--figure-it-out]<br><br><strong>DESCRIPTION</strong><br>       asif takes a founder's idea and builds the systems, partnerships,<br>       and momentum to make it real. works across product, ops, community,<br>       design, and content. has never once said "that's not my job."<br><br><strong>OPTIONS</strong><br>       --first-hire    joins before the job description exists<br>       --generalist    covers everything; specialist in execution<br>       --ai-native     uses AI the way most people use Google<br><br><strong>BUGS</strong><br>       occasionally overcommits. known to open 47 tabs.<br>       responds to "can you also just quickly..." with "yes."<br><br><strong>SEE ALSO</strong><br>       onlysif.com, whatswrapped.onlysif.com, /contact.vcf`;

    // git log
    if (/^git\s+log/.test(cmd)) return `<strong>commit a3f9d21</strong> (HEAD -> main)<br>Author: Asif Hassan &lt;hi@onlysif.com&gt;<br>Date:   today, probably too late<br>    fix: stop overthinking, just ship it<br><br><strong>commit b8c4e19</strong><br>    feat: add another side project nobody asked for<br><br><strong>commit 2d71f8a</strong><br>    chore: close 46 of the 47 open tabs<br><br><strong>commit 9f3a205</strong><br>    feat: research report shipped, stakeholders happy<br><br><strong>commit 1c0b774</strong><br>    init: first hire. no playbook. figure it out.`;

    // git blame
    if (/^git\s+blame/.test(cmd)) return `all lines written by asif. no one else to blame.`;

    // git status
    if (/^git\s+status/.test(cmd)) return `On branch main<br>nothing to commit, working tree clean.<br><br>asif is available. open to the right opportunity.`;

    // git checkout
    if (/^git\s+checkout\s+job/.test(cmd)) return `Switched to branch 'job'<br>Your branch is 1 commit ahead of 'searching/main'.<br>merge request pending — <a href="https://app.usemotion.com/meet/asif-hassan/meeting" target="_blank">book a call →</a>`;

    // git push
    if (/^git\s+push/.test(cmd)) return `Pushing asif to production...<br>Enumerating objects: 7 years, done.<br>Compressing objects: 100% (155+ clients), done.<br>remote: everything deployed. asif is now available.`;

    // ssh
    if (/^ssh\s+/.test(cmd)) return `Connection established.<br>Welcome to asif's brain. It's louder than expected.<br>Last login: Mon Mar 2026 from bangalore<br><br><span style="color:var(--fg-dim)">tip: there is no exit command.</span>`;

    // curl
    if (/^curl\s+/.test(cmd)) return `&lt;!DOCTYPE asif&gt;<br>&lt;head&gt;<br>  &lt;meta name="type" content="operator"&gt;<br>  &lt;meta name="location" content="bangalore"&gt;<br>  &lt;meta name="available" content="yes"&gt;<br>&lt;/head&gt;<br>&lt;body&gt;<br>  &lt;p&gt;generalist. first-hire specialist. ships fast.&lt;/p&gt;<br>&lt;/body&gt;`;

    // nmap
    if (/^nmap\s+/.test(cmd)) return `Starting nmap scan of asif...<br><br>PORT      STATE   SERVICE<br>80/tcp    open    ideas<br>443/tcp   open    execution<br>22/tcp    open    collaboration<br>3000/tcp  open    side-projects<br>8080/tcp  open    client-work<br>9000/tcp  filtered  weekends (intermittent)`;

    // ifconfig / ipconfig
    if (/^(ifconfig|ipconfig)/.test(cmd)) return `en0: flags=8863 mtu 1500<br>    inet 192.168.asif.1 netmask 0xffffff00<br>    ether as:if:ha:ss:an:00<br>    status: active, available, not yet employed`;

    // traceroute
    if (/^traceroute\s+/.test(cmd)) return `traceroute to hired (destination unknown)<br> 1  bangalore (1ms)<br> 2  idea (3ms)<br> 3  prototype (12ms)<br> 4  shipped (48ms)<br> 5  hired (pending...)`;

    // exit
    if (cmd === 'exit' || cmd === 'quit') return `you can check out any time you like, but you can never leave.<br><span style="color:var(--fg-dim)">(also — why would you? you haven't seen everything yet.)</span>`;

    // clear
    if (cmd === 'clear') {
      setTimeout(() => {
        termOutput.querySelectorAll('.terminal-msg').forEach(el => el.remove());
        termOutput.scrollTop = 0;
      }, 100);
      return null; // silent — just clears
    }

    // help
    if (cmd === 'help' || cmd === 'man') return `<strong>asif — available commands</strong><br><br>the obvious ones:<br>  help, whoami, uptime, history, clear, exit<br><br>filesystem:<br>  ls -la, cat .secrets, cat .embarrassing_tweets, rm &lt;file&gt;<br>  chmod 777 asif, mv asif ~/hired/<br><br>system:<br>  top, ps aux, df -h, uname -a, ifconfig<br><br>network:<br>  ping asif, ssh asif@onlysif.com, curl asif.com<br>  nmap asif, traceroute hired<br><br>git:<br>  git log, git blame, git status, git push<br>  git checkout job<br><br>meta:<br>  man asif, asif --version, asif --help<br>  hire asif, sudo hire asif<br>  sudo rm -rf /, sudo make me a sandwich<br>  vim, matrix, echo \$PATH<br><br><span style="color:var(--fg-dim)">or just ask me anything. i'm more interesting than a command list.</span>`;

    // asif --version
    if (/^asif\s+--version/.test(cmd)) return `asif 7.2.0 (march 2026 build) — generalist edition<br>built with: curiosity, caffeine, claude code, and mild chaos`;

    // asif --help
    if (/^asif\s+--help/.test(cmd)) return `Usage: asif [OPTIONS] [ROLE]<br><br>Options:<br>  --build           ships products solo over weekends<br>  --community       scales from 0 to 2,000+ members<br>  --first-hire      joins before the job description exists<br>  --ai-native       makes AI do the boring parts<br>  --generalist      covers everything<br><br>Examples:<br>  asif --build startup<br>  asif --first-hire your-company<br>  sudo hire asif`;

    // hire asif (without sudo)
    if (/^hire\s+asif/.test(cmd)) return `permission denied.<br><span style="color:var(--fg-dim)">try: sudo hire asif</span>`;

    // vim
    if (cmd === 'vim' || cmd === 'vi' || cmd === 'nano') return `<span style="color:var(--accent)">welcome to ${cmd}.</span><br>you are now trapped.<br><br>~<br>~<br>~<br><span style="color:var(--fg-dim)">"${cmd}" [New File]                        0,0-1         All</span><br><br>type :q! to escape. good luck.`;

    // matrix
    if (cmd === 'matrix') {
      const chars = '日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:#000;z-index:9999;font-family:monospace;font-size:14px;color:#00ff41;overflow:hidden;pointer-events:none;';
      document.body.appendChild(overlay);
      let frame = 0;
      const rain = setInterval(() => {
        if (frame++ > 60) { clearInterval(rain); overlay.remove(); return; }
        let txt = '';
        for (let r = 0; r < 30; r++) {
          for (let c = 0; c < 60; c++) txt += Math.random() > 0.7 ? chars[Math.floor(Math.random()*chars.length)] : ' ';
          txt += '<br>';
        }
        overlay.innerHTML = txt;
      }, 50);
      return `wake up, asif...<br>follow the white rabbit.`;
    }

    // echo $PATH
    if (/^echo\s+\$?path/i.test(cmd)) return `~/ambition:~/systems:~/community:~/design:~/product:~/writing:~/chaos:~/coffee`;

    // cd ..
    if (cmd === 'cd ..' || cmd === 'cd ../') return `you can't go above root. this is as deep as it goes.`;

    // pwd
    if (cmd === 'pwd') return `/Users/asif/portfolio/brain`;

    // date
    if (cmd === 'date') return new Date().toString();

    // no match
    return null;
  }

  async function submitMessage(msg) {
    if (!msg) return;
    termInput.value = '';
    termInput.disabled = true;
    // Hide suggestions after first message
    suggestionsEl.style.display = 'none';

    const userDiv = document.createElement('div');
    userDiv.className = 'terminal-msg';
    userDiv.innerHTML = `<span class="t-label t-user">you:</span> <span class="t-text">${msg}</span>`;
    termOutput.appendChild(userDiv);

    terminalHistory.push({ role: 'user', parts: [{ text: msg }] });
    const rowId = await insertExchange(sessionId, msg);

    // Check for easter egg commands first
    const eggResponse = getEasterEgg(msg);
    if (eggResponse !== null) {
      if (eggResponse !== '') {
        const eggDiv = document.createElement('div');
        eggDiv.className = 'terminal-msg';
        eggDiv.innerHTML = `<span class="t-label t-asif">asif:</span> <span class="t-text" style="font-family:var(--mono);font-size:12px">${eggResponse}</span>`;
        termOutput.appendChild(eggDiv);
        termOutput.scrollTop = termOutput.scrollHeight;
      }
      termInput.disabled = false;
      termInput.focus();
      return;
    }

    const asifDiv = document.createElement('div');
    asifDiv.className = 'terminal-msg';
    asifDiv.innerHTML = `<span class="t-label t-asif">asif:</span> <span class="t-text t-thinking">thinking<span class="t-dots">...</span></span>`;
    termOutput.appendChild(asifDiv);
    const textSpan = asifDiv.querySelector('.t-text');
    termOutput.scrollTop = termOutput.scrollHeight;

    startTinkering();

    try {
      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: terminalHistory,
          generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                if (firstChunk) { stopTinkering(); firstChunk = false; }
                fullText += text;
                textSpan.classList.remove('t-thinking');
                textSpan.innerHTML = renderMarkdown(fullText);
                termOutput.scrollTop = termOutput.scrollHeight;
              }
            } catch (e) {}
          }
        }
      }

      stopTinkering();
      terminalHistory.push({ role: 'model', parts: [{ text: fullText }] });
      updateExchange(rowId, fullText);
    } catch (err) {
      stopTinkering();
      textSpan.classList.remove('t-thinking');
      textSpan.textContent = 'something went wrong. try again?';
    }

    termInput.disabled = false;
    termInput.focus();
    termOutput.scrollTop = termOutput.scrollHeight;
  }

  termInput.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter') return;
    const msg = termInput.value.trim();
    if (!msg) return;
    submitMessage(msg);
  });

  document.getElementById('terminalSend').addEventListener('click', () => {
    const msg = termInput.value.trim();
    if (!msg) return;
    submitMessage(msg);
  });

  termInput.focus();
}

// Event listeners
backBtn.addEventListener('click', () => {
  if (historyIndex > 0) {
    playClick();
    historyIndex--;
    navigate(history[historyIndex], false);
  }
});

forwardBtn.addEventListener('click', () => {
  if (historyIndex < history.length - 1) {
    playClick();
    historyIndex++;
    navigate(history[historyIndex], false);
  }
});

document.querySelectorAll('.sidebar-item[data-path]').forEach(item => {
  item.addEventListener('click', () => { playClick(); navigate(item.dataset.path); });
});

document.querySelectorAll('.mobile-nav-item[data-path]').forEach(item => {
  item.addEventListener('click', () => { playClick(); navigate(item.dataset.path); });
});

// Keep mobile nav pinned above keyboard + shrink finder to visual viewport on iOS Safari
if (window.visualViewport) {
  const mobileNavEl = document.getElementById('mobileNav');
  const finderEl = document.querySelector('.finder');
  function handleViewportChange() {
    const vv = window.visualViewport;
    const offset = window.innerHeight - vv.height - vv.offsetTop;
    mobileNavEl.style.transform = offset > 0 ? `translateY(-${offset}px)` : '';
    if (window.innerWidth <= 768) {
      finderEl.style.height = vv.height + 'px';
    }
  }
  window.visualViewport.addEventListener('resize', handleViewportChange);
  window.visualViewport.addEventListener('scroll', handleViewportChange);
}

document.getElementById('gridViewBtn').addEventListener('click', () => {
  viewMode = 'grid';
  document.getElementById('gridViewBtn').classList.add('active');
  document.getElementById('listViewBtn').classList.remove('active');
  const node = FS[currentPath];
  if (node?.type === 'folder') renderFolder(currentPath, node);
});

document.getElementById('listViewBtn').addEventListener('click', () => {
  viewMode = 'list';
  document.getElementById('listViewBtn').classList.add('active');
  document.getElementById('gridViewBtn').classList.remove('active');
  const node = FS[currentPath];
  if (node?.type === 'folder') renderFolder(currentPath, node);
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  playClick();
  navigate('/settings.app');
});

// Init
// If linked from gist page with ?terminal=1, skip chooser and go straight to terminal
if (new URLSearchParams(window.location.search).get('terminal') === '1') {
  document.getElementById('chooser').style.display = 'none';
  navigate('/chat');
} else {
  navigate('/');
}
