# Coach Rounds

Continuous prerecorded combination coaching, separate from the existing guided workouts.

- Bottom navigation after the main menu: Spar, Training, Coach Rounds.
- Coach Rounds setup asks for sport, coach, then intensity. Back preserves choices; reopening starts at sport. Max and Maya have dedicated black/lime portraits. Intensity uses simple SVG flame symbols, with one, two and three flames. Coach selection plays a preview, and leaving that stage stops it.
- Boxing: 161 hands-only combinations. Kickboxing: 320 punch/kick combinations. Muay Thai: 471 combinations including knees, elbows and teeps. Combinations contain at most five instructions and are built from deliberate punch sequences and compatible finishes.
- Light / Steady / Hard change round count and coaching style. Cue timing is sampled after speech completes. Hard has quick clusters and short resets; Light adds coached footwork with time to perform it. There is no fixed cue interval.
- A shuffled bag exhausts every combination before repeating, survives round breaks and prevents an immediate repeat at the bag boundary. Similar two-technique openings are separated when alternatives exist. Remaining combinations are saved locally per sport, shared across intensities and restored in later sessions. Blocked storage falls back to memory. Pausing deliberately repeats the current instruction on resume.
- Twenty-six reminders and encouragements, plus sixteen movement drills, use separate shuffled bags. Reminders leave the main combo visible; movement drills replace it with the current movement instruction. Every work round starts with a combination after one bell.
- Max and Maya each have 515 dedicated projected gym-coach recordings, including preview and rest instructions. Coach Rounds plays these at 1.2× speed with pitch preserved. Regular guided-workout recordings keep their original speed. These are static assets; no API calls or device TTS run in the app.

Generate missing recordings locally with `node scripts/generate-coach-rounds-audio.cjs`. Existing clips are cached. Credentials stay in ignored local configuration and never enter the web or Android bundle. Increment the style identifier to deliberately regenerate a voice style.

Run `npm test`, then `npm run cap:sync`. Android verification uses the installed JDK 21 and Gradle `--no-daemon --max-workers=1 --no-parallel :app:assembleDebug :app:lintDebug :app:testDebugUnitTest`. Do not run Capacitor sync while Gradle is building.

Release 1.1.0 uses Android version code 13. Deploy the complete web bundle, including both new audio directories, their manifests and SVG intensity icons. Keep versioned script/style URLs in the HTML and service worker precache aligned.
