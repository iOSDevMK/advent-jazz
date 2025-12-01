// Constants and configuration
export const MAX_BG_TRACKS = 12;
export const FACT_AUDIO_MAX = 24;
export const BG_VOL_NORMAL = 0.08;
export const BG_VOL_DAY_DUCK = 0.02;
export const BG_VOL_FACT_DUCK = 0.01;
export const DEBUG_OPEN = new URLSearchParams(location.search).has('debug');
export const IS_LOCALHOST = ['localhost','127.0.0.1','::1'].includes(location.hostname);
export const DEV_OPEN = IS_LOCALHOST && DEBUG_OPEN;
export const CALENDAR_MONTH = 11; // December (0-indexed)

// Artist metadata for each day
export const dayMeta = {
  1: { artist: 'Ella Fitzgerald' },
  2: { artist: 'Louis Armstrong' },
  3: { artist: 'Nina Simone' },
  4: { artist: 'Melody Gardot' },
  5: { artist: 'Gregory Porter' },
  6: { artist: 'Nat King Cole' },
  7: { artist: 'Billie Holiday' },
  8: { artist: 'Madeleine Peyroux' },
  9: { artist: 'Jamie Cullum' },
  10: { artist: 'Dean Martin' },
  11: { artist: 'Norah Jones' },
  12: { artist: 'Tony Bennett' },
  13: { artist: 'Michael Bublé' },
  14: { artist: 'Dr. John' },
  15: { artist: 'Jazzmeia Horn' },
  16: { artist: 'ZAZ' },
  17: { artist: 'Chet Baker' },
  18: { artist: 'Samara Joy' },
  19: { artist: 'Sarah Vaughan' },
  20: { artist: 'Stacey Kent' },
  21: { artist: 'Harry Connick Jr.' },
  22: { artist: 'Peggy Lee' },
  23: { artist: 'Diana Krall' },
  24: { artist: 'Diane Reeves' },
};

// Jazz facts for locked days
export const jazzFacts = [
  `Jazz took shape in New Orleans around 1900 when African rhythms met European harmony. Congo Square gatherings kept drumming traditions alive. The port city's brass bands added parade energy. Early improvisers blurred written and oral traditions. That mix seeded the groove we now call Jazz.`,
  `Ragtime brought a jaunty offbeat and syncopated sparkle. The blues added tension, release, and direct storytelling. Together they gave early Jazz its snap and soul. Piano rolls spread the style across the country. Dancers and saloons demanded that feel every night.`,
  `Cornetist Buddy Bolden became an early folk hero—loud, loose, and fearless. His improvising proved personality could trump the written page. Crowds followed his band through parades and dances. Legends say his sound could be heard for blocks. His spirit set the tone for Jazz's boldness.`,
  `In 1917 the Original Dixieland Jass Band cut one of the first Jazz records. The novelty sound sparked national curiosity. Musicians soon traveled north to Chicago's clubs and dance halls. There the music gained new audiences and better pay. Records turned local scenes into national waves.`,
  `Louis Armstrong made the solo the main event. His warm tone, rhythmic swing, and playful scat turned every chorus into a story. Audiences heard a new, conversational horn voice. He influenced singers as much as instrumentalists. Jazz phrasing still echoes his approach.`,
  `Duke Ellington raised big-band Jazz to a composer's art. At the Cotton Club he painted with tone colors while keeping the swing alive. He wrote parts for specific players' sounds. Suites and sacred concerts showed Jazz could be concert music. His band became his instrument.`,
  `Kansas City nurtured a gritty, riff-driven swing. Count Basie's rhythm section perfected the light, buoyant pulse dancers loved. Jam sessions stretched solos deep into the night. Head arrangements let bands adapt on the fly. The result was relaxed but unstoppable Jazz momentum.`,
  `Bebop erupted in the 1940s as a rebellion. Dizzy Gillespie and Charlie Parker pushed lightning tempos and dense harmonies. Small combos replaced big bands in late-night jam sessions. Lines became angular, and rhythm sections hit harder. Jazz turned inward to reward deep listening.`,
  `Thelonious Monk used jagged melodies and carefully placed silences. His tunes sound quirky yet glow with deep blues feeling. Pianists learned that space could swing as hard as notes. His dissonances feel like characters in a story. Modern Jazz harmony owes him its edges.`,
  `Cool Jazz slowed the pace and softened the edges. Miles Davis's "Birth of the Cool" showed how quiet tones can still hit hard. Arrangers layered subtle horn voicings over light drums. West Coast players embraced the airy approach. The mood proved that Jazz could whisper and still command attention.`,
  `On the West Coast, arranged, airy lines thrived. Gerry Mulligan and Chet Baker personified that clear, relaxed sound. Counterpoint between horns replaced dense chord hits. Audiences heard Jazz as sleek, sunlit, and modern. The vibe contrasted the East Coast's grit.`,
  `Hard Bop pulled blues and gospel back to center in the 1950s. Art Blakey and Horace Silver balanced earthy grooves with fiery solos. Churchy harmonies met driving ride cymbals. Audiences clapped along to call-and-response riffs. Jazz felt both sophisticated and down-home.`,
  `Modal Jazz reduced chord changes to open space for melody. Miles Davis's "Kind of Blue" became the touchstone of that freedom. Players lingered on modes instead of racing through progressions. Solos breathed more, inviting lyrical phrasing. The approach reshaped how Jazz thinks about harmony.`,
  `John Coltrane chased urgency and spirit from "Giant Steps" to "A Love Supreme." His sheets of sound feel like prayer and storm at once. Each phase showed deeper harmonic exploration. His classic quartet stretched time and intensity. Jazz found a new spiritual voice in his horn.`,
  `Free Jazz broke forms and embraced collective improvisation. Ornette Coleman and later Coltrane challenged listeners with radical openness. Melody and rhythm could emerge spontaneously. Musicians reacted in real time without fixed roles. It proved Jazz could question every rule and still communicate.`,
  `Latin Jazz fused Afro-Cuban rhythm with Jazz harmony. Bossa nova and samba brought a sway that reshaped club playlists worldwide. Dizzy Gillespie's collaborations highlighted congas and claves. Brazilian songcraft met New York horn lines. Dancers felt a new kind of Jazz pulse.`,
  `Jimmy Smith's Hammond B3 sound defined Soul Jazz. Churchy chords and blues riffs turned into an endless, joyful party. Guitar and drums locked into greasy shuffles. Clubs filled with the smell of tube amps and groove. Jazz could feel like Sunday service and Saturday night at once.`,
  `Fusion in the 1970s mixed rock volume, funk grooves, and electronics. Miles Davis's "Bitches Brew" and Weather Report electrified improvisation. Synths and pedals expanded tone palettes. Drummers borrowed backbeats from funk. Jazz proved it could plug in without losing its edge.`,
  `The ECM label cultivated a spacious, echoing aesthetic. European voices found an airy, chamber-like home for improvisation. Silence and reverb became part of the music. Folk melodies intertwined with modern harmony. Jazz sounded like landscapes and long horizons.`,
  `Vocal Jazz stays central to the story. Ella Fitzgerald's scat, Sarah Vaughan's velvet, and Billie Holiday's phrasing show the voice's many colors. Each singer turned lyrics into personal confession. Standards became living stories night after night. Jazz singing keeps reinventing the songbook.`,
  `Swing was a social force as much as music. Big bands fueled Lindy Hop and Jitterbug nights in packed halls. Radio broadcasts spread band battles nationwide. Arrangers crafted shout choruses to lift the floor. Jazz gave dancers a shared heartbeat.`,
  `Jazz education moved into universities, from Berklee to North Texas. Ear training, theory, and improvisation became formal coursework. Students learned to transcribe solos and analyze harmony. Ensemble labs simulated bandstand realities. The academy helped preserve and evolve Jazz vocabulary.`,
  `European scenes built their own flavors, from Nordic lyricism to French Manouche swing. Django Reinhardt's guitar defined the latter with dazzling runs. Scandinavian players embraced space and folk melody. Festivals connected scenes across borders. Jazz proved it thrives on local voices.`,
  `Today Jazz blends with hip-hop, electronic textures, and global grooves. Sampling, looping, and live improvising coexist without genre fences. Artists tour with laptops and horns side by side. Rhymes and solos trade storytelling duties. Jazz keeps evolving because it welcomes new voices.`
];
