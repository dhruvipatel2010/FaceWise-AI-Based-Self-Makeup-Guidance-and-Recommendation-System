import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// ── Built-in FaceWise Beauty Knowledge Base ─────────────────────────────────
const HAIRCUT_KNOWLEDGE = {
  round: {
    title: 'Round Face Haircut Recommendation',
    cuts: ['Long Layers with Waves', 'Angled Asymmetrical Lob', 'Textured High Pixie'],
    avoid: 'Blunt chin-length bobs or straight thick bangs that widen the cheeks.',
    why: 'Long cascading waves and angled lobs draw the eye downward, creating an elongating and slimming effect along your cheeks and jawline.',
  },
  oval: {
    title: 'Oval Face Haircut Recommendation',
    cuts: ['Layered Bob', 'Curtain Bangs with Waves', 'Collarbone Shag', 'Sleek Long Straight'],
    avoid: 'Excessive vertical height on top that needlessly lengthens your face.',
    why: 'Oval is the most naturally balanced facial geometry. You can rock almost any style! Soft curtain fringe and mid-length bobs highlight your natural cheekbone symmetry.',
  },
  square: {
    title: 'Square Face Haircut Recommendation',
    cuts: ['Soft Flowing Waves', 'Curtain Bangs', 'Layered Lob with Feathered Ends'],
    avoid: 'Sharp geometric blunt bobs and sharp straight bangs that emphasize square jaw corners.',
    why: 'Soft waves and wispy curtain bangs gently frame the face and diffuse the strong angles of a defined jawline, creating a soft feminine balance.',
  },
  heart: {
    title: 'Heart Face Haircut Recommendation',
    cuts: ['Chin-Length Bob', 'Side-Swept Fringe', 'Soft Shoulder Waves'],
    avoid: 'Tight slicked-back high ponytails that widen the forehead and expose a pointed chin.',
    why: 'Chin-length bobs and side-swept bangs build fullness around the narrower jawline and chin, harmonizing with a broader forehead.',
  },
  oblong: {
    title: 'Oblong Face Haircut Recommendation',
    cuts: ['Curtain Bangs', 'Layered Textured Bob', 'Voluminous Shoulder Waves'],
    avoid: 'Pin-straight center-parted long hair that pulls the face visually downward.',
    why: 'Bangs effectively reduce visual vertical length, while side volume and bouncy layers add horizontal fullness across the cheeks.',
  },
}

const HAIR_COLOR_KNOWLEDGE = {
  light: {
    title: 'Hair Colors for Fair / Light Skin',
    colors: ['Warm Honey Blonde', 'Soft Ash Brunette', 'Delicate Copper / Rose Gold'],
    why: 'Soft warm and neutral tones bring a luminous, healthy flush to fair complexions without washing them out.',
  },
  medium: {
    title: 'Hair Colors for Medium / Wheatish / Warm Skin',
    colors: ['Rich Chocolate Brown', 'Golden Caramel Highlights', 'Warm Auburn & Chestnut'],
    why: 'Mocha, golden caramel, and rich chocolate bring out golden undertones and give an effortless sun-kissed glow.',
  },
  deep: {
    title: 'Hair Colors for Deep / Dusky / Dark Skin',
    colors: ['Royal Burgundy / Wine', 'Glossy Jet Black', 'Dark Espresso / Mocha'],
    why: 'Rich jewel tones and deep espresso create breathtaking contrast and luxurious definition against deep complexions.',
  },
}

const MAKEUP_KNOWLEDGE = {
  light: {
    lip: ['Soft Rose', 'Coral Peach', 'Petal Pink'],
    blush: 'Soft peachy-pink blush placed lightly on cheek apples',
    contour: 'Subtle cool taupe contour beneath cheekbones',
  },
  medium: {
    lip: ['Berry Velvet', 'Warm Terracotta Nude', 'Mocha Rose'],
    blush: 'Warm rose or peach-gold blush swept diagonally along cheekbones',
    contour: 'Warm bronze contour along temples and jawline',
  },
  deep: {
    lip: ['Ruby Red', 'Plum Wine', 'Rich Chocolate Berry'],
    blush: 'Rich berry, terracotta, or warm copper blush high on the cheekbones',
    contour: 'Deep espresso contour for sculpted definition',
  },
}

const SKINCARE_KNOWLEDGE = {
  oily: {
    routine: 'AM: Gentle Foaming Cleanser → 5% Niacinamide + Zinc Serum → Oil-Free Water Cream → Matte SPF 50\nPM: Salicylic Acid (BHA) Cleanser → Centella Gel → Lightweight Ceramide Moisturizer',
    actives: 'Salicylic Acid (BHA), Niacinamide, Zinc PCA, Green Tea',
  },
  dry: {
    routine: 'AM: Hydrating Milk Cleanser → Hyaluronic Acid Serum → Rich Barrier Cream → Dewy SPF 50\nPM: Nourishing Cleansing Balm → Multi-Peptide Serum → Squalane Night Cream',
    actives: 'Hyaluronic Acid, Ceramides, Squalane, Vitamin E',
  },
  combination: {
    routine: 'AM: Balancing Gel Cleanser → Vitamin C Serum → Lightweight Hydrating Gel → SPF 50\nPM: Gentle Wash → 2% Niacinamide → Dual-zone moisturizer (gel on T-zone, cream on cheeks)',
    actives: 'Niacinamide, Hyaluronic Acid, Vitamin C',
  },
  acne: {
    routine: 'AM: Tea Tree Gel Wash → Azelaic Acid / Niacinamide → Non-comedogenic Gel → Mineral SPF 50\nPM: Gentle Cleanser → 2% BHA Liquid (3x/wk) → Soothing Panthenol Barrier Lotion',
    actives: 'Salicylic Acid, Azelaic Acid, Tea Tree, Niacinamide',
  },
  aging: {
    routine: 'AM: Cream Cleanser → Matrixyl Peptide Serum → Firming Ceramide Cream → SPF 50+\nPM: Double Cleanse → 0.3% Encapsulated Retinol (alternate nights) → Rich Night Balm',
    actives: 'Retinol, Peptides, Ceramides, Vitamin C',
  },
}

// ── Smart Response Engine ───────────────────────────────────────────────────
function analyzeAndGenerateResponse(userText, context, currentPath) {
  const text = userText.toLowerCase().trim()

  // 1. Detect Vague / False / Random / Meaningless input
  const isTooShort = text.length < 3
  const isGreeting = /^(hi|hello|hey|namaste|hola|yo|sup|hii|helo)$/i.test(text)
  const isNonsense = /^([a-z])\1{2,}$|^(asdf|qwer|xyz|test|abc|kuch bhi|kya|hmmm|ok|okay|fine)$/i.test(text)
  const hasNoKeywords = !/(hair|cut|face|round|oval|square|heart|oblong|skin|tone|fair|light|medium|deep|dark|wheatish|oily|dry|acne|makeup|lip|blush|routine|serum|color|colour)/i.test(text)

  if ((isTooShort || isGreeting || isNonsense || hasNoKeywords) && !context.awaitingDetail) {
    let sectionGreeting = 'I am your personal AI Beauty & Grooming Advisor at FaceWise!'
    if (currentPath.includes('hair')) sectionGreeting = 'Welcome to the Hair Studio! I can recommend the most flattering haircuts and hair colors tailored to your face shape and skin tone.'
    if (currentPath.includes('makeup')) sectionGreeting = 'Welcome to the Makeup Studio! I can suggest the exact lipstick shades, blush placement, and contour techniques for your features.'
    if (currentPath.includes('skincare')) sectionGreeting = 'Welcome to Skin Diagnostics! I can craft a customized morning and evening skincare regimen for your skin type.'

    return {
      message: `${isGreeting ? 'Hello gorgeous! ✨' : 'I didn’t catch all the details!'} ${sectionGreeting}\n\nTo give you the most accurate personalized recommendation, please tell me your details (e.g. "Round face, medium skin tone, oily skin") or tap any topic below:`,
      suggestions: [
        '💇‍♀️ Haircut for Round Face',
        '💇‍♂️ Best Haircut for Oval Face',
        '💄 Lipstick for Medium Skin Tone',
        '🧴 Skincare Routine for Oily & Acne Skin',
        '🎨 Hair Color for Warm Undertones',
        '📐 How do I find my Face Shape?',
      ],
      updatedContext: { awaitingDetail: true },
    }
  }

  // 2. Extract Details
  let detectedShape = context.faceShape || null
  if (text.includes('round')) detectedShape = 'round'
  else if (text.includes('oval')) detectedShape = 'oval'
  else if (text.includes('square')) detectedShape = 'square'
  else if (text.includes('heart')) detectedShape = 'heart'
  else if (text.includes('oblong') || text.includes('long face')) detectedShape = 'oblong'

  let detectedTone = context.skinTone || null
  if (text.includes('fair') || text.includes('light')) detectedTone = 'light'
  else if (text.includes('medium') || text.includes('warm') || text.includes('wheatish')) detectedTone = 'medium'
  else if (text.includes('deep') || text.includes('dark') || text.includes('dusky')) detectedTone = 'deep'

  let detectedSkin = context.skinType || null
  if (text.includes('oily')) detectedSkin = 'oily'
  else if (text.includes('dry')) detectedSkin = 'dry'
  else if (text.includes('combination')) detectedSkin = 'combination'
  else if (text.includes('acne') || text.includes('pimple')) detectedSkin = 'acne'
  else if (text.includes('aging') || text.includes('wrinkle') || text.includes('fine line')) detectedSkin = 'aging'

  const wantsHair = text.includes('hair') || text.includes('cut') || text.includes('color') || text.includes('colour') || currentPath.includes('hair')
  const wantsMakeup = text.includes('makeup') || text.includes('lip') || text.includes('blush') || text.includes('shade') || currentPath.includes('makeup')
  const wantsSkincare = text.includes('skin') || text.includes('routine') || text.includes('serum') || text.includes('cream') || text.includes('acne') || currentPath.includes('skincare')

  // Construct comprehensive answer
  let answerParts = []

  // HAIR RECOMMENDATION
  if (wantsHair || (!wantsMakeup && !wantsSkincare)) {
    const shape = detectedShape || 'oval'
    const tone = detectedTone || 'medium'
    const hairData = HAIRCUT_KNOWLEDGE[shape]
    const colorData = HAIR_COLOR_KNOWLEDGE[tone]

    answerParts.push(
      `💇‍♀️ **AI Hair Recommendation for ${shape.toUpperCase()} Face & ${tone.toUpperCase()} Tone**:\n` +
      `• **Top Flattering Haircuts**: ${hairData.cuts.join(', ')}\n` +
      `• **Why it suits you**: ${hairData.why}\n` +
      `• **Avoid**: ${hairData.avoid}\n` +
      `• **Best Hair Colors for your complexion**: ${colorData.colors.join(', ')} (${colorData.why})`
    )
  }

  // MAKEUP RECOMMENDATION
  if (wantsMakeup || (!wantsHair && !wantsSkincare)) {
    const tone = detectedTone || 'medium'
    const shape = detectedShape || 'oval'
    const makeupData = MAKEUP_KNOWLEDGE[tone]

    answerParts.push(
      `💄 **AI Makeup Match for ${tone.toUpperCase()} Tone & ${shape.toUpperCase()} Face**:\n` +
      `• **Lipstick Shades**: ${makeupData.lip.join(', ')}\n` +
      `• **Blush Technique**: ${makeupData.blush}\n` +
      `• **Contour Strategy**: ${makeupData.contour}`
    )
  }

  // SKINCARE RECOMMENDATION
  if (wantsSkincare || (!wantsHair && !wantsMakeup)) {
    const skin = detectedSkin || 'combination'
    const skinData = SKINCARE_KNOWLEDGE[skin]

    answerParts.push(
      `🧴 **AI Custom Skincare Routine (${skin.toUpperCase()} Skin)**:\n` +
      `• **Key Active Ingredients**: ${skinData.actives}\n` +
      `• **Regimen**:\n${skinData.routine}`
    )
  }

  // If user only asked a specific question
  if (text.includes('how') && (text.includes('find') || text.includes('know')) && text.includes('shape')) {
    answerParts = [
      `📐 **How to determine your Face Shape**:\n` +
      `1. Open the camera in the **Hairdressing** or **Makeup** tab.\n` +
      `2. Our MediaPipe AI will automatically measure your face ratio: length, cheekbone width, forehead, and jawline!\n` +
      `3. **Quick Guide**:\n` +
      `• **Oval**: Length is ~1.5x width, soft jaw.\n` +
      `• **Round**: Equal length and width with soft cheeks.\n` +
      `• **Square**: Defined angular jaw, equal forehead and jaw width.\n` +
      `• **Heart**: Wider forehead tapering to a delicate chin.\n` +
      `• **Oblong**: Noticeably longer than wide with a straight jaw.`
    ]
  }

  return {
    message: answerParts.join('\n\n'),
    suggestions: [
      `What haircut suits my ${detectedShape || 'face'}?`,
      `Best lipstick for ${detectedTone || 'my'} skin`,
      `Skincare routine for ${detectedSkin || 'glowing'} skin`,
      `Try on haircuts on live camera`,
    ],
    updatedContext: {
      faceShape: detectedShape,
      skinTone: detectedTone,
      skinType: detectedSkin,
      awaitingDetail: false,
    },
  }
}

// ── Component ───────────────────────────────────────────────────────────────
export default function AIChatBotPopup() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! ✨ I am your FaceWise AI Beauty Advisor. Ask me anything about haircuts, hair colors, makeup shades, or skincare routines for your unique face structure and skin tone!',
      suggestions: [
        '💇‍♀️ Haircut for Round Face',
        '💄 Best Lipstick for Medium Tone',
        '🧴 Skincare for Oily / Acne Skin',
        '🎨 Hair Colors for Warm Undertone',
      ],
    },
  ])
  const [context, setContext] = useState({})
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function handleSend(textToSend) {
    const query = (textToSend || input).trim()
    if (!query) return

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: query }])
    setInput('')
    setIsTyping(true)

    // Simulate AI thinking and generate tailored advice
    setTimeout(() => {
      const response = analyzeAndGenerateResponse(query, context, location.pathname)
      setContext((prev) => ({ ...prev, ...response.updatedContext }))
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.message,
          suggestions: response.suggestions,
        },
      ])
      setIsTyping(false)
    }, 450)
  }

  function resetChat() {
    setContext({})
    setMessages([
      {
        sender: 'ai',
        text: 'Chat reset! 🌸 Tell me your face shape (Oval, Round, Square, Heart, Oblong), skin tone (Fair, Medium, Deep), or skin type to get tailored beauty guidance.',
        suggestions: [
          '💇‍♀️ Haircut for Square Face',
          '💄 Nude Lipstick for Warm Skin',
          '🧴 Skincare for Dry Skin',
          '📐 Help me find my Face Shape',
        ],
      },
    ])
  }

  return (
    <div className='fixed bottom-6 right-6 z-50 font-sans'>
      {/* ── Collapsed Floating Button ─────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className='group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-plum via-rose to-rose px-5 py-3.5 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-rose/40'
          aria-label='Open AI Beauty Advisor'
        >
          <div className='flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-base backdrop-blur-xs'>
            ✨
          </div>
          <span className='font-display text-sm font-bold tracking-wide'>
            AI Beauty Advisor
          </span>
          <span className='relative flex h-2.5 w-2.5'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75'></span>
            <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400'></span>
          </span>
        </button>
      )}

      {/* ── Expanded Chat Popup Card ──────────────────────────────── */}
      {isOpen && (
        <div className='flex h-[560px] w-[370px] sm:w-[420px] flex-col overflow-hidden rounded-3xl border border-plum/15 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200'>
          {/* Header */}
          <div className='flex items-center justify-between bg-gradient-to-r from-plum to-rose px-5 py-4 text-white shadow-xs'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-lg backdrop-blur-md border border-white/20'>
                ✨
              </div>
              <div>
                <h3 className='font-display text-base font-bold leading-tight'>FaceWise AI Advisor</h3>
                <div className='flex items-center gap-1.5 text-[11px] text-white/80'>
                  <span className='h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse'></span>
                  Live Expert Guidance · All Sections
                </div>
              </div>
            </div>

            <div className='flex items-center gap-1'>
              <button
                onClick={resetChat}
                title='Reset Conversation'
                className='rounded-full p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition'
              >
                🔄
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title='Close Popup'
                className='rounded-full p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition text-lg leading-none'
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Context Bar */}
          <div className='flex items-center justify-between bg-plum/5 px-4 py-1.5 text-[10px] font-semibold text-plum/70 border-b border-plum/10'>
            <span>Category: {location.pathname.replace('/', '').toUpperCase() || 'HOME'}</span>
            <span>
              {context.faceShape && `Face: ${context.faceShape}`}
              {context.skinTone && ` · Tone: ${context.skinTone}`}
              {!context.faceShape && !context.skinTone && 'No details shared yet'}
            </span>
          </div>

          {/* Chat Messages Area */}
          <div className='flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin bg-page/40'>
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={'flex flex-col ' + (m.sender === 'user' ? 'items-end' : 'items-start')}
              >
                <div
                  className={
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs whitespace-pre-line ' +
                    (m.sender === 'user'
                      ? 'bg-rose text-white rounded-br-xs'
                      : 'bg-white text-plum border border-plum/10 rounded-bl-xs')
                  }
                >
                  {m.text}
                </div>

                {/* Interactive Suggestion Chips (especially when user needs guidance or enters false input!) */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className='mt-2 flex flex-wrap gap-1.5 max-w-[95%]'>
                    {m.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(sug)}
                        className='rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-rose border border-rose/30 shadow-2xs hover:bg-rose hover:text-white transition-all text-left'
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className='flex items-center gap-1.5 rounded-2xl bg-white border border-plum/10 px-3.5 py-2 text-xs text-plum/60 w-fit'>
                <span className='h-2 w-2 rounded-full bg-rose animate-bounce'></span>
                <span className='h-2 w-2 rounded-full bg-rose animate-bounce [animation-delay:0.2s]'></span>
                <span className='h-2 w-2 rounded-full bg-rose animate-bounce [animation-delay:0.4s]'></span>
                <span className='ml-1 text-[11px] font-medium'>FaceWise AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Input Pills */}
          <div className='flex gap-1.5 overflow-x-auto px-4 py-2 border-t border-plum/10 bg-white scrollbar-none'>
            {[
              '💇‍♀️ Best Haircut',
              '🎨 Hair Color',
              '💄 Lipstick Shade',
              '🧴 Skincare Routine',
              '📐 Find Face Shape',
            ].map((pill, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSend(pill)}
                className='shrink-0 rounded-full bg-plum/5 px-2.5 py-1 text-[10px] font-bold text-plum/70 hover:bg-rose/10 hover:text-rose transition'
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Input Field & Send Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className='flex items-center gap-2 border-t border-plum/10 bg-white p-3'
          >
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='e.g. Round face, fair skin, oily...'
              className='min-h-10 flex-1 rounded-full border border-plum/20 bg-page px-4 text-xs text-plum focus:border-rose focus:outline-none transition'
            />
            <button
              type='submit'
              disabled={!input.trim()}
              className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose text-white shadow-xs hover:opacity-90 disabled:opacity-40 transition'
            >
              ➔
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
