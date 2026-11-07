// Run locally only. The shipped app uses the resulting static files, never an API key.
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const html = fs.readFileSync('index.html', 'utf8');
const section = (a,b) => html.slice(html.indexOf(a), html.indexOf(b,html.indexOf(a)));
const c = vm.createContext({ settings: { language: 'en' } });
vm.runInContext(fs.readFileSync('training-sports.js','utf8'), c);
vm.runInContext(section('const TRAINING_WORKOUTS =','function isPremiumUnlocked()'),c);
vm.runInContext(section('function parseMinutesFromTitle(','function getCurrentGuideStep('),c);
vm.runInContext(section('function getSportWorkouts(','function updateSportLibraryCounts('),c);
const coach = process.argv.includes('--maya') ? 'maya' : 'max';
const folder = coach === 'maya' ? 'coach-audio-maya' : 'coach-audio';
const texts = new Set(['Jab, cross, hook. Slip and step out.']);
for (const sport of ['all','boxing','k1','muaythai']) for(const minutes of [20,30,45,60,90]) {
    for(const workout of c.getSportWorkouts(minutes,sport)) for(const step of c.buildTrainingTimeline(workout)) {
        texts.add(`${step.title.replace(/^Rounds?\s+\d+(?:-\d+)?\s*-\s*/i,'')}. ${step.note}`);
    }
}
const tutorialCode = section('const TUT_STEPS =', 'function checkTutorial()');
vm.runInContext(tutorialCode+';this.tutorialSteps=TUT_STEPS;',c);
for(const step of c.tutorialSteps) texts.add(step.title+'. '+step.text);
texts.add('Welcome to FightWise! Want a quick tour before you start? See the main features step by step.');
texts.add(coach === 'maya' ? "Hi, I am Maya, your FightWise coach. Stay focused, trust your technique, and let us get to work!" : "Hi, I am Max, your FightWise coach. Clear instructions, sharp technique. Let us get to work!");
const manifest = Object.fromEntries([...texts].map(text => [text, folder+'/'+crypto.createHash('sha256').update(text).digest('hex').slice(0,20)+'.mp3']));
fs.mkdirSync(folder,{recursive:true});
fs.writeFileSync(folder+'/manifest.json',JSON.stringify(manifest,null,2));
console.log(`Collected ${texts.size} unique English instructions.`);
if(process.argv.includes('--list')) process.exit();
const key = fs.readFileSync('.env.local','utf8').match(/^OPENAI_API_KEY\s*=\s*(.+)$/m)?.[1].trim().replace(/^['"]|['"]$/g,'');
async function main() {
 let done=0;
 const queue = Object.entries(manifest);
 await Promise.all(Array.from({length:6}, async () => {
 while(queue.length) {
 const [text,path] = queue.shift();
  if(fs.existsSync(path)) { done++; continue; }
  const r=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4o-mini-tts',voice:coach === 'maya' ? 'marin' : 'cedar',input:text,instructions:'You are an energetic, encouraging combat sports coach. Speak clear English with crisp articulation at a moderate pace. Brief pauses between commands. Confident and punchy, never shout. No music or sound effects.',response_format:'mp3'})});
  if(!r.ok) { const j=await r.json(); throw new Error(`Speech request failed: ${r.status} ${j.error?.code || j.error?.type || ''}`); }
  fs.writeFileSync(path,Buffer.from(await r.arrayBuffer()));
  console.log(`Created ${++done}/${texts.size}`);
 }
 }));
 fs.writeFileSync(coach === 'maya' ? 'coach-maya-manifest.js' : 'coach-audio-manifest.js','const '+(coach === 'maya' ? 'COACH_MAYA_MANIFEST' : 'COACH_AUDIO_MANIFEST')+' = '+JSON.stringify(manifest,null,2)+';\n');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
