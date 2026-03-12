export interface PhonemeTip {
  symbol: string;
  name: string;
  exampleWord: string;
  exampleIPA: string;
  description: string;
  commonMistake: string;
  tip: string;
  mouthPosition: string;
  practiceWords: string[];
  commonFor: string[];
}

export const PHONEME_TIPS: Record<string, PhonemeTip> = {
  θ: {
    symbol: "θ",
    name: "Voiceless dental fricative",
    exampleWord: "think",
    exampleIPA: "/θɪŋk/",
    description:
      'The "th" sound in "think". Air flows between your tongue and teeth.',
    commonMistake:
      'Often replaced with "s", "t", or "f" by non-native speakers.',
    tip: "Place the tip of your tongue lightly between your upper and lower front teeth. Blow air gently over it without vibrating your vocal cords.",
    mouthPosition: "Tongue tip between teeth, lips slightly apart",
    practiceWords: ["think", "thought", "through", "math", "bath", "health"],
    commonFor: [
      "Spanish",
      "French",
      "German",
      "Japanese",
      "Korean",
      "Chinese",
    ],
  },
  ð: {
    symbol: "ð",
    name: "Voiced dental fricative",
    exampleWord: "this",
    exampleIPA: "/ðɪs/",
    description:
      'The "th" sound in "this". Like θ but with vocal cord vibration.',
    commonMistake: 'Often replaced with "d", "z", or "v".',
    tip: "Same tongue position as θ (between teeth), but vibrate your vocal cords. You should feel a buzzing in your throat.",
    mouthPosition: "Tongue tip between teeth, vocal cords vibrating",
    practiceWords: [
      "this",
      "that",
      "the",
      "mother",
      "brother",
      "weather",
    ],
    commonFor: [
      "Spanish",
      "French",
      "German",
      "Japanese",
      "Korean",
      "Chinese",
    ],
  },
  ɹ: {
    symbol: "ɹ",
    name: "Alveolar approximant",
    exampleWord: "red",
    exampleIPA: "/ɹɛd/",
    description:
      "The English R sound. The tongue curls back without touching the roof.",
    commonMistake:
      "Often trilled (like Spanish R) or replaced with L or W sounds.",
    tip: "Curl the tip of your tongue slightly back without touching the roof of your mouth. Round your lips slightly. The tongue should not vibrate.",
    mouthPosition: "Tongue curled back, lips slightly rounded",
    practiceWords: ["red", "right", "run", "tree", "green", "around"],
    commonFor: ["Japanese", "Korean", "Chinese", "French", "German"],
  },
  l: {
    symbol: "l",
    name: "Alveolar lateral approximant",
    exampleWord: "light",
    exampleIPA: "/laɪt/",
    description:
      "The L sound. Tongue tip touches the alveolar ridge behind the teeth.",
    commonMistake:
      'Often confused with R. "Dark L" at end of words can be difficult.',
    tip: 'Press the tip of your tongue firmly against the ridge behind your upper teeth. Air flows around the sides of your tongue. For "dark L" at the end of words, the back of the tongue also raises.',
    mouthPosition: "Tongue tip on alveolar ridge, air flows around sides",
    practiceWords: ["light", "love", "letter", "feel", "call", "tall"],
    commonFor: ["Japanese", "Korean", "Chinese"],
  },
  æ: {
    symbol: "æ",
    name: "Near-open front unrounded vowel",
    exampleWord: "cat",
    exampleIPA: "/kæt/",
    description:
      'The vowel sound in "cat". A wide, open sound between "a" and "e".',
    commonMistake:
      'Often replaced with "e" (as in "bet") or "a" (as in "father").',
    tip: 'Open your mouth wide and spread your lips slightly. Your tongue should be low and forward. Think of stretching the "e" sound wider.',
    mouthPosition: "Mouth wide open, tongue low and forward, lips spread",
    practiceWords: ["cat", "hat", "bad", "man", "hand", "back"],
    commonFor: [
      "Spanish",
      "Japanese",
      "Korean",
      "Arabic",
      "Italian",
      "Portuguese",
    ],
  },
  ɪ: {
    symbol: "ɪ",
    name: "Near-close near-front unrounded vowel",
    exampleWord: "sit",
    exampleIPA: "/sɪt/",
    description:
      'The short "i" sound in "sit". More relaxed than the "ee" in "see".',
    commonMistake:
      'Often replaced with "ee" (as in "seat"), making "sit" sound like "seat".',
    tip: 'Relax your tongue slightly from the "ee" position. Your mouth should be slightly more open. Think of a lazy, relaxed "ee" sound.',
    mouthPosition:
      "Tongue high-front but relaxed, mouth slightly more open than /iː/",
    practiceWords: ["sit", "bit", "fish", "big", "give", "will"],
    commonFor: ["Spanish", "Arabic", "Japanese", "Korean"],
  },
  ʌ: {
    symbol: "ʌ",
    name: "Open-mid back unrounded vowel",
    exampleWord: "cup",
    exampleIPA: "/kʌp/",
    description:
      'The "uh" sound in "cup". A short, centralized vowel.',
    commonMistake:
      'Often replaced with "a" (as in "cap") or "o" (as in "cop").',
    tip: "Relax your mouth to a neutral position. The sound comes from the middle of your mouth. Keep it short and unstressed.",
    mouthPosition: "Mouth slightly open, tongue in central position, relaxed",
    practiceWords: ["cup", "but", "love", "run", "much", "fun"],
    commonFor: ["Spanish", "Japanese", "Korean", "Italian", "Arabic"],
  },
  ɛ: {
    symbol: "ɛ",
    name: "Open-mid front unrounded vowel",
    exampleWord: "bed",
    exampleIPA: "/bɛd/",
    description:
      'The short "e" sound in "bed". Lower and more open than the "ay" in "bay".',
    commonMistake:
      'Often confused with /eɪ/ (as in "bay") or /ɪ/ (as in "bid").',
    tip: 'Open your mouth slightly wider than for "ee". Your tongue should be in the front-mid position. Keep it a pure, short sound — don\'t let it glide.',
    mouthPosition: "Tongue mid-front, mouth moderately open",
    practiceWords: ["bed", "red", "head", "said", "friend", "again"],
    commonFor: ["Korean", "Japanese", "Arabic"],
  },
  ʃ: {
    symbol: "ʃ",
    name: "Voiceless postalveolar fricative",
    exampleWord: "ship",
    exampleIPA: "/ʃɪp/",
    description:
      'The "sh" sound in "ship". A hushing, fricative sound.',
    commonMistake:
      'Often confused with "s" or the "ch" sound (/tʃ/).',
    tip: 'Round your lips slightly and push them forward. Place your tongue near the roof of your mouth just behind the alveolar ridge. Blow air through. Think "shh, be quiet".',
    mouthPosition: "Lips rounded and pushed forward, tongue near palate",
    practiceWords: ["ship", "fish", "shoe", "nation", "special", "ocean"],
    commonFor: ["Korean", "Spanish"],
  },
  ʒ: {
    symbol: "ʒ",
    name: "Voiced postalveolar fricative",
    exampleWord: "measure",
    exampleIPA: "/ˈmɛʒər/",
    description:
      'The "zh" sound in "measure". Like ʃ but voiced.',
    commonMistake:
      'Often replaced with "j" (/dʒ/) or "sh" (/ʃ/).',
    tip: "Same mouth position as ʃ (rounded lips, tongue near palate), but add voicing — vibrate your vocal cords.",
    mouthPosition: "Same as /ʃ/ but with vocal cord vibration",
    practiceWords: [
      "measure",
      "pleasure",
      "vision",
      "usually",
      "decision",
      "garage",
    ],
    commonFor: ["Korean", "Japanese", "Spanish", "Chinese"],
  },
  w: {
    symbol: "w",
    name: "Labial-velar approximant",
    exampleWord: "water",
    exampleIPA: "/ˈwɔːtər/",
    description:
      "The W sound. Lips are rounded and the back of the tongue is raised.",
    commonMistake: 'Often confused with "v" by speakers of some languages.',
    tip: "Round your lips tightly into a small circle, like you're about to whistle. Then quickly open them while making a voiced sound.",
    mouthPosition: "Lips tightly rounded, back of tongue raised",
    practiceWords: ["water", "want", "west", "away", "always", "twelve"],
    commonFor: ["German", "Hindi", "Hungarian"],
  },
  v: {
    symbol: "v",
    name: "Voiced labiodental fricative",
    exampleWord: "very",
    exampleIPA: "/ˈvɛri/",
    description:
      "The V sound. Lower lip touches upper teeth with voicing.",
    commonMistake:
      'Often confused with "w" or replaced with "b" in some languages.',
    tip: "Gently bite your lower lip with your upper teeth. Blow air through while vibrating your vocal cords. Don't press too hard.",
    mouthPosition:
      "Upper teeth lightly on lower lip, vocal cords vibrating",
    practiceWords: ["very", "voice", "love", "live", "have", "every"],
    commonFor: ["Japanese", "Korean", "Spanish", "Arabic"],
  },
  ŋ: {
    symbol: "ŋ",
    name: "Velar nasal",
    exampleWord: "sing",
    exampleIPA: "/sɪŋ/",
    description:
      'The "ng" sound in "sing". A nasal sound made at the back of the mouth.',
    commonMistake:
      'Often adding a hard "g" after it ("sing-g") or replacing with "n".',
    tip: 'Press the back of your tongue against your soft palate (the back of the roof of your mouth). Let air flow through your nose. Don\'t add a "g" sound after it.',
    mouthPosition:
      "Back of tongue against soft palate, air through nose",
    practiceWords: ["sing", "ring", "long", "thing", "running", "morning"],
    commonFor: ["French", "Spanish", "Italian", "Portuguese"],
  },
  ɑː: {
    symbol: "ɑː",
    name: "Open back unrounded vowel",
    exampleWord: "father",
    exampleIPA: "/ˈfɑːðər/",
    description:
      'The long "ah" sound in "father". Open, deep vowel.',
    commonMistake:
      'Often shortened or replaced with a shorter "a" sound.',
    tip: "Open your mouth wide. Drop your jaw. Keep your tongue low and flat at the back of your mouth. Hold the sound longer than short vowels.",
    mouthPosition: "Mouth wide open, tongue low and back, jaw dropped",
    practiceWords: ["father", "car", "heart", "start", "park", "calm"],
    commonFor: ["Japanese", "Korean"],
  },
  iː: {
    symbol: "iː",
    name: "Close front unrounded vowel",
    exampleWord: "see",
    exampleIPA: "/siː/",
    description:
      'The long "ee" sound in "see". Tongue is high and forward.',
    commonMistake:
      'Often not held long enough, making "see" sound like "si".',
    tip: "Raise your tongue as high as possible toward the front of your mouth. Spread your lips into a slight smile. Hold the sound.",
    mouthPosition: "Tongue high-front, lips spread in slight smile",
    practiceWords: ["see", "free", "three", "key", "people", "believe"],
    commonFor: ["General — length distinction"],
  },
  uː: {
    symbol: "uː",
    name: "Close back rounded vowel",
    exampleWord: "food",
    exampleIPA: "/fuːd/",
    description:
      'The long "oo" sound in "food". Lips are rounded, tongue is high-back.',
    commonMistake: 'Often shortened, or lips not rounded enough.',
    tip: "Round your lips tightly. Push them forward. Raise the back of your tongue toward the soft palate. Hold the sound.",
    mouthPosition: "Lips tightly rounded, tongue high-back",
    practiceWords: ["food", "moon", "blue", "two", "group", "through"],
    commonFor: ["General — length distinction"],
  },
  ɔː: {
    symbol: "ɔː",
    name: "Open-mid back rounded vowel",
    exampleWord: "thought",
    exampleIPA: "/θɔːt/",
    description:
      'The "aw" sound in "thought". An open, rounded vowel.',
    commonMistake:
      'Often confused with /oʊ/ (as in "go") or /ɑː/ (as in "car").',
    tip: "Open your mouth moderately. Round your lips loosely. The tongue should be mid-low and toward the back.",
    mouthPosition: "Lips loosely rounded, mouth moderately open, tongue low-back",
    practiceWords: ["thought", "call", "law", "water", "all", "because"],
    commonFor: ["Spanish", "Japanese", "Korean"],
  },
  dʒ: {
    symbol: "dʒ",
    name: "Voiced postalveolar affricate",
    exampleWord: "judge",
    exampleIPA: "/dʒʌdʒ/",
    description:
      'The "j" sound in "judge". Starts with a stop and releases into a fricative.',
    commonMistake:
      'Often replaced with a pure /ʒ/ (too soft) or /d/ + /ʒ/ (separated).',
    tip: 'Press the front of your tongue against the roof of your mouth (like a "d"), then release it into a "zh" sound. It should be one smooth movement.',
    mouthPosition: "Tongue pressed then released from palate, lips slightly rounded",
    practiceWords: ["judge", "jump", "age", "page", "change", "general"],
    commonFor: ["Korean", "Japanese", "Spanish"],
  },
  tʃ: {
    symbol: "tʃ",
    name: "Voiceless postalveolar affricate",
    exampleWord: "church",
    exampleIPA: "/tʃɜːrtʃ/",
    description:
      'The "ch" sound in "church". Like dʒ but voiceless.',
    commonMistake:
      'Often replaced with "sh" (/ʃ/) or separated into "t" + "sh".',
    tip: 'Same as dʒ but without voicing. Press tongue to palate, release into "sh". Think of sneezing: "achoo!"',
    mouthPosition: "Same as /dʒ/ but voiceless",
    practiceWords: ["church", "chair", "child", "much", "each", "teacher"],
    commonFor: ["French", "Portuguese"],
  },
  ə: {
    symbol: "ə",
    name: "Schwa (mid central vowel)",
    exampleWord: "about",
    exampleIPA: "/əˈbaʊt/",
    description:
      "The most common vowel in English. A very short, relaxed, neutral sound.",
    commonMistake:
      "Often over-pronounced. Many learners give full value to unstressed syllables.",
    tip: 'Completely relax your mouth. The sound should be quick and effortless. Think of the "uh" you say when hesitating. Never stress this vowel.',
    mouthPosition: "Completely relaxed, neutral position",
    practiceWords: ["about", "banana", "support", "problem", "computer", "again"],
    commonFor: ["General — most common English vowel"],
  },
  "ɜːr": {
    symbol: "ɜːr",
    name: "R-colored mid central vowel",
    exampleWord: "bird",
    exampleIPA: "/bɜːrd/",
    description:
      'The "er" sound in "bird". A sustained, R-colored vowel with no distinct consonant R.',
    commonMistake:
      'Often split into two sounds ("beh-rd") or the R coloring is dropped entirely.',
    tip: "Bunch the middle of your tongue up toward the roof of your mouth while keeping the tip slightly curled back. Hold the position steady — the R color comes from the tongue shape, not a separate R movement.",
    mouthPosition: "Tongue bunched upward in center, lips neutral or slightly rounded",
    practiceWords: ["bird", "nurse", "word", "learn", "first", "earth"],
    commonFor: ["Chinese", "Japanese", "Korean", "French", "German", "Spanish"],
  },
  ʊ: {
    symbol: "ʊ",
    name: "Near-close near-back rounded vowel",
    exampleWord: "book",
    exampleIPA: "/bʊk/",
    description:
      'The short "oo" sound in "book". Shorter and more relaxed than /uː/ in "food".',
    commonMistake:
      'Often replaced with /uː/ (making "book" sound like "buke") or with /ʌ/ (making it sound like "buck").',
    tip: 'Lightly round your lips — less tightly than for /uː/. Keep the sound short and relaxed. Think of it as a lazy, brief "oo".',
    mouthPosition: "Lips loosely rounded, tongue high-back but relaxed",
    practiceWords: ["book", "put", "good", "look", "foot", "could"],
    commonFor: ["Spanish", "Japanese", "Arabic", "Korean"],
  },
  eɪ: {
    symbol: "eɪ",
    name: "Diphthong (close-mid front to near-close front)",
    exampleWord: "say",
    exampleIPA: "/seɪ/",
    description:
      'The "ay" sound in "say". A gliding vowel that moves from /e/ toward /ɪ/.',
    commonMistake:
      'Often produced as a pure /e/ without the glide, making "say" sound like "seh".',
    tip: 'Start with your tongue in the mid-front position and glide upward toward the /ɪ/ position. You should feel your jaw close slightly. Don\'t cut the glide short.',
    mouthPosition: "Starts mid-open, glides to near-closed; lips unrounded",
    practiceWords: ["say", "day", "make", "name", "great", "eight"],
    commonFor: ["Spanish", "Japanese", "Korean", "Italian", "French"],
  },
  aɪ: {
    symbol: "aɪ",
    name: "Diphthong (open front to near-close front)",
    exampleWord: "my",
    exampleIPA: "/maɪ/",
    description:
      'The "eye" sound in "my". A wide glide from an open vowel up toward /ɪ/.',
    commonMistake:
      'Often shortened to a single "ah" sound, or the glide is not completed.',
    tip: "Start with your mouth wide open and your tongue low. Glide upward by raising your tongue toward the front of your mouth. The jaw should visibly close during the sound.",
    mouthPosition: "Starts wide open, glides to near-closed front position",
    practiceWords: ["my", "time", "like", "right", "life", "find"],
    commonFor: ["Spanish", "Japanese", "Korean"],
  },
  ɔɪ: {
    symbol: "ɔɪ",
    name: "Diphthong (open-mid back to near-close front)",
    exampleWord: "boy",
    exampleIPA: "/bɔɪ/",
    description:
      'The "oy" sound in "boy". Glides from a rounded back vowel to a front position.',
    commonMistake:
      'Often shortened or the starting point is not rounded enough.',
    tip: "Start with rounded lips and your tongue in the back-low position (like /ɔː/). Then glide forward and upward toward /ɪ/ while unrounding your lips.",
    mouthPosition: "Starts rounded and open, glides to unrounded near-closed front",
    practiceWords: ["boy", "coin", "join", "oil", "voice", "choice"],
    commonFor: ["Spanish", "Korean", "Japanese"],
  },
  aʊ: {
    symbol: "aʊ",
    name: "Diphthong (open front to near-close back)",
    exampleWord: "now",
    exampleIPA: "/naʊ/",
    description:
      'The "ow" sound in "now". Glides from an open position to a rounded back vowel.',
    commonMistake:
      'Often not rounded enough at the end, or replaced with a single "ah" sound.',
    tip: "Start with your mouth wide open and tongue low. Glide upward and backward while rounding your lips. The ending should feel like a brief /ʊ/.",
    mouthPosition: "Starts wide open, glides to rounded near-closed back",
    practiceWords: ["now", "out", "house", "down", "about", "how"],
    commonFor: ["Spanish", "Japanese", "Korean", "Italian"],
  },
  oʊ: {
    symbol: "oʊ",
    name: "Diphthong (close-mid back to near-close back)",
    exampleWord: "go",
    exampleIPA: "/ɡoʊ/",
    description:
      'The "oh" sound in "go". A glide from mid-back to a higher, more rounded position.',
    commonMistake:
      'Often produced as a pure /o/ without the glide, making "go" sound like "gaw".',
    tip: 'Start with moderately rounded lips and glide to a tighter, higher lip rounding. In American English, this is always a diphthong — never a pure "oh".',
    mouthPosition: "Starts mid-rounded, glides to tighter rounding; tongue rises in back",
    practiceWords: ["go", "home", "know", "boat", "phone", "over"],
    commonFor: ["Spanish", "Japanese", "Korean", "Italian", "French"],
  },
  ɪr: {
    symbol: "ɪr",
    name: "R-colored near-close front vowel",
    exampleWord: "ear",
    exampleIPA: "/ɪr/",
    description:
      'The "ear" sound as in "near". Starts with /ɪ/ and glides into an R-colored ending.',
    commonMistake:
      'Often the R is dropped or the /ɪ/ is replaced with a pure "ee".',
    tip: "Start with your tongue in the /ɪ/ position (high-front, relaxed). Then smoothly curl or bunch your tongue for the R coloring. Don't pause between the two parts.",
    mouthPosition: "Tongue starts high-front, transitions to R-colored bunched position",
    practiceWords: ["ear", "near", "here", "beer", "clear", "fear"],
    commonFor: ["Chinese", "Japanese", "Korean", "French"],
  },
  ɛr: {
    symbol: "ɛr",
    name: "R-colored open-mid front vowel",
    exampleWord: "air",
    exampleIPA: "/ɛr/",
    description:
      'The "air" sound as in "care". Starts with /ɛ/ and transitions to an R coloring.',
    commonMistake:
      'Often the vowel is too close to /ɪr/ ("ear") or the R is omitted.',
    tip: "Start with your mouth in the /ɛ/ position — moderately open with the tongue mid-front. Then transition into the R by bunching or curling your tongue. Keep the vowel distinct from /ɪr/.",
    mouthPosition: "Starts with tongue mid-front and open, transitions to R-colored",
    practiceWords: ["air", "care", "where", "there", "fair", "bear"],
    commonFor: ["Chinese", "Japanese", "Korean", "French"],
  },
  "ɑːr": {
    symbol: "ɑːr",
    name: "R-colored open back vowel",
    exampleWord: "car",
    exampleIPA: "/kɑːr/",
    description:
      'The "ar" sound as in "car". A long open vowel that transitions into R coloring.',
    commonMistake:
      'Often the R is dropped or the /ɑː/ is not open enough.',
    tip: "Drop your jaw and keep your tongue low and back for the /ɑː/ portion. Then smoothly add R coloring by bunching or curling your tongue. Hold the vowel before transitioning.",
    mouthPosition: "Jaw dropped, tongue low-back, then transitions to R position",
    practiceWords: ["car", "far", "star", "heart", "park", "garden"],
    commonFor: ["British English speakers", "Japanese", "Korean", "Chinese"],
  },
  p: {
    symbol: "p",
    name: "Voiceless bilabial stop",
    exampleWord: "pin",
    exampleIPA: "/pɪn/",
    description:
      'The "p" sound in "pin". Both lips press together and release a burst of air.',
    commonMistake:
      'Often not aspirated enough at the start of words (should have a puff of air). Some speakers confuse it with /b/.',
    tip: 'Press both lips together firmly, build up air pressure, then release with a strong puff of air. Hold your hand in front of your mouth — you should feel the burst. At the start of stressed syllables, American English /p/ is heavily aspirated.',
    mouthPosition: "Both lips pressed together, then released with aspiration",
    practiceWords: ["pin", "paper", "happy", "stop", "speak", "open"],
    commonFor: ["Arabic", "Chinese", "Vietnamese"],
  },
  b: {
    symbol: "b",
    name: "Voiced bilabial stop",
    exampleWord: "bin",
    exampleIPA: "/bɪn/",
    description:
      'The "b" sound in "bin". Like /p/ but with vocal cord vibration.',
    commonMistake:
      'Often confused with /p/ by speakers whose languages don\'t distinguish voicing. At the end of words, it may be devoiced.',
    tip: "Press both lips together just like for /p/, but vibrate your vocal cords as you release. Place your fingers on your throat — you should feel vibration. The burst of air is weaker than for /p/.",
    mouthPosition: "Both lips pressed together, vocal cords vibrating on release",
    practiceWords: ["bin", "baby", "about", "job", "grab", "cabin"],
    commonFor: ["Arabic", "Chinese", "Korean"],
  },
  t: {
    symbol: "t",
    name: "Voiceless alveolar stop",
    exampleWord: "tin",
    exampleIPA: "/tɪn/",
    description:
      'The "t" sound in "tin". Tongue tip touches the alveolar ridge and releases.',
    commonMistake:
      'In American English, /t/ between vowels becomes a flap (ɾ), sounding like a quick "d" (as in "water" or "better"). Many learners over-pronounce it as a full /t/.',
    tip: 'At the start of stressed syllables, use a strong aspirated /t/ (puff of air). Between vowels in casual American speech, tap your tongue very briefly against the ridge — this is the "flap" that makes "water" sound like "wadder".',
    mouthPosition: "Tongue tip on alveolar ridge, released with aspiration (or flapped between vowels)",
    practiceWords: ["tin", "water", "better", "city", "stop", "party"],
    commonFor: ["Chinese", "Vietnamese", "Hindi"],
  },
  d: {
    symbol: "d",
    name: "Voiced alveolar stop",
    exampleWord: "din",
    exampleIPA: "/dɪn/",
    description:
      'The "d" sound in "din". Like /t/ but with vocal cord vibration.',
    commonMistake:
      'Often confused with /t/, especially at word endings where English /d/ may be partially devoiced.',
    tip: "Touch your tongue tip to the alveolar ridge (the bumpy area behind your upper teeth). Release while vibrating your vocal cords. At word endings, make sure you still voice it — don't let it become a /t/.",
    mouthPosition: "Tongue tip on alveolar ridge, vocal cords vibrating",
    practiceWords: ["din", "dog", "day", "bad", "reading", "under"],
    commonFor: ["Chinese", "Korean", "Arabic"],
  },
  k: {
    symbol: "k",
    name: "Voiceless velar stop",
    exampleWord: "cat",
    exampleIPA: "/kæt/",
    description:
      'The "k" sound in "cat". The back of the tongue presses against the soft palate.',
    commonMistake:
      'Often not aspirated enough at word beginnings, or confused with /g/.',
    tip: "Press the back of your tongue against the soft palate (the back of the roof of your mouth). Build up pressure, then release with a burst of air. At the start of stressed syllables, you should feel strong aspiration.",
    mouthPosition: "Back of tongue against soft palate, released with aspiration",
    practiceWords: ["cat", "key", "come", "back", "school", "kitchen"],
    commonFor: ["Arabic", "Vietnamese", "Chinese"],
  },
  g: {
    symbol: "g",
    name: "Voiced velar stop",
    exampleWord: "go",
    exampleIPA: "/ɡoʊ/",
    description:
      'The "g" sound in "go". Like /k/ but with vocal cord vibration.',
    commonMistake:
      'Often devoiced at the end of words (making "dog" sound like "dock") or confused with /k/.',
    tip: "Same tongue position as /k/ — back of tongue against the soft palate — but vibrate your vocal cords as you release. The air burst is softer than for /k/.",
    mouthPosition: "Back of tongue against soft palate, vocal cords vibrating",
    practiceWords: ["go", "get", "big", "dog", "again", "begin"],
    commonFor: ["Arabic", "Korean", "Chinese"],
  },
  f: {
    symbol: "f",
    name: "Voiceless labiodental fricative",
    exampleWord: "fan",
    exampleIPA: "/fæn/",
    description:
      'The "f" sound in "fan". Upper teeth touch the lower lip and air is pushed through.',
    commonMistake:
      'Often confused with /p/ (bilabial) or /h/ by some speakers.',
    tip: "Lightly place your upper front teeth on your lower lip. Push air through the narrow gap without vibrating your vocal cords. Keep it gentle — don't press too hard.",
    mouthPosition: "Upper teeth lightly on lower lip, air forced through gap",
    practiceWords: ["fan", "fun", "off", "life", "after", "before"],
    commonFor: ["Japanese", "Korean", "Samoan"],
  },
  s: {
    symbol: "s",
    name: "Voiceless alveolar fricative",
    exampleWord: "see",
    exampleIPA: "/siː/",
    description:
      'The "s" sound in "see". Air is forced through a narrow channel along the tongue.',
    commonMistake:
      'Often confused with /ʃ/ ("sh"), or with /θ/ ("th"). Speakers of some languages may add a vowel before initial S clusters ("espeak" for "speak").',
    tip: "Place the tip of your tongue close to the alveolar ridge but don't touch it. Create a narrow groove down the center of your tongue and force air through. Keep the sound sharp and hissing.",
    mouthPosition: "Tongue tip near alveolar ridge, narrow groove in tongue center",
    practiceWords: ["see", "sun", "miss", "place", "school", "history"],
    commonFor: ["Japanese", "Spanish", "Greek", "Thai"],
  },
  n: {
    symbol: "n",
    name: "Alveolar nasal",
    exampleWord: "no",
    exampleIPA: "/noʊ/",
    description:
      'The "n" sound in "no". Tongue touches the alveolar ridge while air flows through the nose.',
    commonMistake:
      'Often confused with /ŋ/ (velar nasal) at word endings, or nasalization bleeds into adjacent vowels excessively.',
    tip: "Press the tip of your tongue against the alveolar ridge behind your upper teeth. The soft palate lowers to let air escape through your nose. Unlike /ŋ/, it's the tongue tip that makes contact, not the back.",
    mouthPosition: "Tongue tip on alveolar ridge, soft palate lowered, air through nose",
    practiceWords: ["no", "new", "never", "man", "then", "mine"],
    commonFor: ["General — distinguished from /ŋ/ and /m/"],
  },
  m: {
    symbol: "m",
    name: "Bilabial nasal",
    exampleWord: "me",
    exampleIPA: "/miː/",
    description:
      'The "m" sound in "me". Both lips press together while air flows through the nose.',
    commonMistake:
      'Rarely mispronounced on its own, but often confused with /n/ at word endings or in fast speech.',
    tip: "Press both lips together completely. Lower your soft palate so air flows entirely through your nose. You should feel vibration in your lips and a hum in your nasal cavity.",
    mouthPosition: "Both lips pressed together, soft palate lowered, air through nose",
    practiceWords: ["me", "my", "home", "swim", "name", "summer"],
    commonFor: ["General — one of the earliest sounds acquired"],
  },
};

export interface PhonemeCombinationTip {
  pattern: string;
  description: string;
  tip: string;
  examples: string[];
}

export const PHONEME_COMBINATION_TIPS: PhonemeCombinationTip[] = [
  {
    pattern: "θr",
    description: 'The "thr" cluster as in "three"',
    tip: "Start with your tongue between your teeth for θ, then quickly move to the R position without adding a vowel between them.",
    examples: ["three", "through", "throw", "thread"],
  },
  {
    pattern: "str",
    description: 'The "str" cluster as in "street"',
    tip: 'Start with "s", then smoothly transition to "t" and "r" without pausing. The tongue moves from the alveolar ridge back for R.',
    examples: ["street", "strong", "strange", "stream"],
  },
  {
    pattern: "sts",
    description: 'The "sts" cluster as in "tests"',
    tip: "Keep the tongue near the alveolar ridge throughout. The two S sounds blend with a brief T stop between them.",
    examples: ["tests", "costs", "lists", "posts"],
  },
  {
    pattern: "sks",
    description: 'The "sks" cluster as in "asks"',
    tip: "Practice going from S to K to S smoothly. The back of the tongue briefly touches the soft palate for the K.",
    examples: ["asks", "tasks", "desks", "masks"],
  },
  {
    pattern: "lð",
    description: 'The "lth" cluster as in "health"',
    tip: "Keep tongue tip on the alveolar ridge for L, then slide it forward between your teeth for ð/θ.",
    examples: ["health", "wealth", "stealth", "filth"],
  },
  {
    pattern: "ɹ vs l",
    description: 'R/L confusion — distinguishing "right" from "light"',
    tip: 'For /ɹ/, curl your tongue back without touching anything — your lips round slightly. For /l/, press the tongue tip firmly against the ridge behind your teeth. Practice minimal pairs slowly: "right/light", "read/lead", "wrong/long". Exaggerate the lip rounding on R and the tongue-tip contact on L.',
    examples: ["right/light", "read/lead", "wrong/long", "row/low", "rake/lake", "arrive/alive"],
  },
  {
    pattern: "Final clusters",
    description: "Final consonant clusters (texts, sixths, strengths)",
    tip: 'Many languages don\'t allow complex consonant clusters at the end of words. Don\'t insert a vowel between consonants ("tekisuts" for "texts"). Practice by holding each consonant position briefly before moving to the next. Start slowly: "tex...ts", then speed up until it flows.',
    examples: ["texts", "sixths", "strengths", "asked", "worlds", "twelfths"],
  },
  {
    pattern: "w vs v",
    description: 'W/V confusion — distinguishing "west" from "vest"',
    tip: "For /w/, round your lips into a tight circle and don't let your teeth touch your lip. For /v/, your upper teeth must touch your lower lip. Practice by alternating: say \"wow\" (lips only) then \"vow\" (teeth on lip). If you can feel your teeth on your lip, it's a V.",
    examples: ["west/vest", "wine/vine", "wet/vet", "worse/verse", "wail/veil", "wow/vow"],
  },
  {
    pattern: "Short vs long vowels",
    description: "Short/long vowel pairs (ship/sheep, full/fool)",
    tip: "English distinguishes vowels by both length AND quality — it's not just about holding the sound longer. Short vowels (/ɪ/, /ʊ/) are more relaxed and centralized. Long vowels (/iː/, /uː/) are tenser and more extreme. Practice pairs: exaggerate the length difference first, then focus on the quality difference.",
    examples: ["ship/sheep", "full/fool", "bit/beat", "pull/pool", "live/leave", "look/Luke"],
  },
  {
    pattern: "Silent letters",
    description: "Silent letters in common English words",
    tip: 'English spelling preserves many historical letters that are no longer pronounced. The K in "knife", W in "write", P in "psychology", and B in "doubt" are all silent. Don\'t try to pronounce them. When unsure, check a dictionary with IPA transcriptions.',
    examples: ["knife", "write", "psychology", "doubt", "island", "Wednesday"],
  },
  {
    pattern: "Word stress",
    description: "Stress shifts that change meaning (REcord vs reCORD)",
    tip: "In English, stress placement can change a word's meaning and part of speech. Nouns often stress the first syllable, verbs the second. The stressed syllable is louder, longer, and higher in pitch. Practice by clapping on the stressed beat: \"RE-cord\" (noun) vs \"re-CORD\" (verb).",
    examples: ["REcord/reCORD", "PREsent/preSENT", "OBject/obJECT", "PERmit/perMIT", "CONtract/conTRACT", "PROduce/proDUCE"],
  },
  {
    pattern: "Schwa reduction",
    description: "Unstressed vowels reducing to schwa /ə/",
    tip: "In natural English speech, most unstressed vowels become a schwa /ə/ — a quick, neutral \"uh\" sound. \"Banana\" is /bəˈnænə/, not \"bah-NAH-nah\". \"Comfortable\" drops to three syllables: \"KUMF-ter-bul\". Don't fight this reduction — it's essential for natural rhythm. Over-pronouncing unstressed syllables sounds robotic.",
    examples: ["banana", "comfortable", "chocolate", "temperature", "vegetable", "different"],
  },
  {
    pattern: "Connected speech",
    description: "How words blend together in natural speech (gonna, wanna)",
    tip: "In fast, natural American English, words link and blend: \"going to\" → \"gonna\", \"want to\" → \"wanna\", \"should have\" → \"shoulda\". Consonants at word boundaries blend with the next vowel: \"turn off\" → \"tur-noff\". Practice by first saying phrases slowly, then gradually speeding up until words connect naturally.",
    examples: ["gonna (going to)", "wanna (want to)", "shoulda (should have)", "kinda (kind of)", "turn off → tur-noff", "an apple → a-napple"],
  },
  {
    pattern: "American T flapping",
    description: "T becoming a flap /ɾ/ between vowels (water, better)",
    tip: "In American English, /t/ between a stressed vowel and an unstressed vowel becomes a quick flap — a very fast tap of the tongue that sounds like a soft \"d\". \"Water\" sounds like \"wadder\", \"better\" like \"bedder\", \"city\" like \"siddy\". To produce it, tap your tongue tip once very quickly against the alveolar ridge.",
    examples: ["water", "better", "city", "butter", "little", "Saturday"],
  },
];
