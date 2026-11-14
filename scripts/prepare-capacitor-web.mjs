import { cpSync, copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';

const webDir = 'www';
const files = [
  'index.html',
  'tv-display.css',
  'tv-display.js',
  'onboarding.js',
  'onboarding.css',
  'training-sports.js',
  'training-audio.js',
  'coach-rounds.js',
  'coach-rounds.css',
  'coach-audio-manifest.js',
  'coach-maya-manifest.js',
  'coach-rounds-audio-manifest.js',
  'sw.js',
  'manifest.json',
  'privacy-policy.html',
  'FightWise logo.png',
  'FightWise text.png',
  'favicon.ico',
  'fightwise-neon-512.png',
  'fightwise-neon-maskable-512.png',
  'fightwise-neon-touch-180.png',
  'Unlock 50+ workouts with premium AD.png',
  'Sparring simple.png',
  'Training simple.png',
  'Coach Rounds simple.png',
  'Coach Max.png',
  'Coach Maya.png',
  'Intensity Light.svg',
  'Intensity Steady.svg',
  'Intensity Hard.svg',
  'Round Bell START.mp3',
  'Round Bell END.mp3'
];

const renamedFiles = [
  ['click soundeffect.mp3', 'click-soundeffect.mp3']
];

rmSync(webDir, { recursive: true, force: true });
mkdirSync(webDir, { recursive: true });

for (const file of files) {
  if (!existsSync(file)) {
    throw new Error(`Missing required web asset: ${file}`);
  }
  copyFileSync(file, join(webDir, basename(file)));
}

for (const [source, target] of renamedFiles) {
  if (!existsSync(source)) {
    throw new Error(`Missing required web asset: ${source}`);
  }
  copyFileSync(source, join(webDir, target));
}

console.log(`Prepared ${files.length + renamedFiles.length} web assets in ${webDir}/`);

cpSync('coach-audio', join(webDir, 'coach-audio'), { recursive: true });

cpSync('coach-audio-maya', join(webDir, 'coach-audio-maya'), { recursive: true });
cpSync('coach-rounds-audio', join(webDir, 'coach-rounds-audio'), { recursive: true });
cpSync('coach-rounds-audio-maya', join(webDir, 'coach-rounds-audio-maya'), { recursive: true });
