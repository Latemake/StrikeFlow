import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';

const webDir = 'www';
const files = [
  'index.html',
  'training-sports.js',
  'training-audio.js',
  'sw.js',
  'manifest.json',
  'privacy-policy.html',
  'FightWise logo.png',
  'FightWise text.png',
  'Fightwise app icon.png',
  'Unlock 50+ workouts with premium AD.png',
  'Sparring photo.png',
  'Training photo.png',
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
