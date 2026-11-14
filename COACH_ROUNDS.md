# Coach Rounds

Continuous prerecorded combination coaching, separate from the existing guided workouts.

- Bottom navigation after the main menu: Spar, Training, Coach Rounds.
- Coach Rounds setup asks for sport, coach, then intensity. Back preserves choices; reopening starts at sport. Max and Maya have dedicated black/lime portraits. Intensity uses simple SVG flame symbols, with one, two and three flames. Coach selection plays a preview, and leaving that stage stops it.
- Boxing offers 107 calls, kickboxing 204, and Muay Thai 295. The catalogue includes single strikes, feint-and-strike sequences, count calls such as four hooks or two kicks, and longer combinations. The athlete chooses the strikes for count calls that leave the side or target open. Six short combinations per stance pair a single directional slip with an immediate counter. The intensity screen saves the selected stance locally. Coach calls use the athlete's left and right.
- Light / Steady / Hard change round count and coaching style. Cue timing is sampled after speech completes. Hard varies clusters and resets while reserving execution time after each combination recording ends: a short jab/cross gets about 1.5–2.2 seconds, and each additional strike adds 0.65 seconds before the variable rhythm margin. Double and triple punches count as additional strikes; kicks and slower actions add more time. Light and Steady keep additional execution margins; Light adds coached footwork. There is no fixed cue interval.
- The coach randomly selects short sequences of combination lengths, such as short, short, long or short, medium, long. Each length group cycles through its own combinations before repeating. Similar two-technique openings are separated when alternatives exist. Remaining combinations are saved locally per sport and stance, shared across intensities and restored in later sessions. Blocked storage falls back to memory. Pausing repeats the current instruction on resume.
- Boxing and Muay Thai can get zero, one or two clinch blocks per round. Each block normally has three to six different calls, with an exit cue before returning to regular combinations. Boxing uses hooks and uppercuts. Muay Thai also includes knees. Count calls, such as four hooks or two kicks, are mixed into the regular short slots and let the athlete pick the individual strikes.
- Twenty-six reminders and encouragements, plus sixteen movement drills, use separate shuffled bags. Reminders leave the main combo visible; movement drills replace it with the current movement instruction. Every work round starts with a combination after one bell.
- Max and Maya each have 351 prerecorded Coach Rounds clips, including both stances, previews, rest instructions and clinch calls. Coach Rounds plays these at 1.2× speed with pitch preserved. Regular guided-workout recordings keep their original speed. The app plays bundled files locally.

Generate missing recordings locally with `node scripts/generate-coach-rounds-audio.cjs`. Existing clips are cached. Credentials stay in ignored local configuration and never enter the web or Android bundle. Increment the style identifier to deliberately regenerate a voice style.

Run `npm test`, then `npm run cap:sync`. Android verification uses the installed JDK 21 and Gradle `--no-daemon --max-workers=1 --no-parallel :app:assembleDebug :app:lintDebug :app:testDebugUnitTest`. Do not run Capacitor sync while Gradle is building.

Release 1.1.1 uses Android version code 14. Coach recordings share one persistent media element, unlocked by an initial user gesture. Silent unlocking cannot interrupt later speech, and a transient load failure retries once on the same player. Deploy the complete web bundle, including both new audio directories, their manifests and SVG intensity icons. Keep versioned script/style URLs in the HTML and service worker precache aligned.

## Tighter combination calls (local update)

Both coaches now use edited versions of all 471 combination recordings each (942 files). The offline edit removes only the middle of quiet gaps lasting at least 250 ms, retaining 120 ms between speech segments and 50 ms at clip edges. Speech outside those gaps is preserved sample-for-sample before MP3 encoding. Short natural pauses remain. Existing Coach Rounds playback speed and pitch handling are unchanged.

Reproduce with `node scripts/tighten-coach-pauses.cjs <absolute-ffmpeg-path>`. No API request or new speech generation is used. Original recordings and the edit report stay in ignored `.coach-audio-originals/`. Every edited MP3 was decoded successfully before replacing any assets. Versioned filenames prevent an old offline cache from supplying the longer recordings. The generator preserves existing tightened files when rebuilding manifests.

Coach setup now uses an in-flow sticky footer so the final sport/intensity choice can scroll fully above the actions. Compact mobile cards were checked at 393x852 and 320x568 with 59px top and 34px bottom safe areas. Personalization shows the existing Max and Maya illustrations; both cards retain their voice preview behavior.

Validation: 87 automated tests passed, including signal preservation and pause shortening. All 942 edited clips decode successfully. Max's Jab / Cross internal silence measured approximately 0.568 seconds before and 0.138 seconds after encoding. These changes are local and not yet deployed.

Local Hard pacing correction: speech recordings stay punchy, but execution time is measured after speech completion, independently of recording length. Tests cover delayed speech completion, a minimum execution allowance, and longer allowances for complex combinations. All 89 tests passed. Not deployed yet.

Length-based pacing refinement: the previous flat 2.2-second minimum is removed. Controlled timing tests verify strictly increasing execution allowances for two through six techniques, including extra allowances for double punches, kicks and footwork. Local preview only.
