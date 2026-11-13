const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function context(){const c=vm.createContext({});vm.runInContext(fs.readFileSync('coach-rounds.js','utf8'),c);return c;}
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};}
const settle=()=>new Promise(r=>setImmediate(r));
function setup(overrides={}){
 const c=context(),events=[];
 const ctrl=c.createCoachRoundsController({random:()=>0,cancelSpeech(){events.push('cancel');},stopSounds(){},bell(){events.push('bell');return Promise.resolve();},speak(t){events.push(t);return Promise.resolve();},onCombo(){},onError(){events.push('error');},...overrides});
 const state={key:'round-1',elapsed:0,duration:120,running:true,rest:false,roundIndex:0,cadence:7,bellEnabled:true,combos:['A','B','C']};
 return {c,ctrl,state,events};
}

function setupWizard(){
 const c=context(),root={hidden:true,innerHTML:'',scrollTop:77},previews=[],nodes=new Map();let started=null,cancelled=0;
 const classes={add(){},remove(){}};
 Object.assign(c,{settings:{language:'en',coachVoice:'max'},modeChoice:{classList:classes},trainingSection:{classList:classes},sparringSetup:{classList:classes},document:{getElementById(id){if(id==='coachRoundsSection')return root;if(!nodes.has(id))nodes.set(id,{focus(){}});return nodes.get(id);}},cancelCoachSpeech(){cancelled++;},setCoachVoice(voice){c.settings.coachVoice=voice;},unlockAppAudio(){},speakCoachText(text,voice){previews.push(voice);return Promise.resolve();},formatTime:seconds=>String(seconds),getTrainingDuration:plan=>plan.coachRounds.rounds*120+(plan.coachRounds.rounds-1)*30,startTrainingPlan(...args){started=args[4];},showModeChoice(){root.hidden=true;}});
 return {c,root,previews,get started(){return started;},get cancelled(){return cancelled;}};
}

test('Coach Rounds setup asks sport, coach and intensity in order and preserves choices when going back',()=>{
 const w=setupWizard();w.c.openCoachRounds();assert.ok(!w.root.hidden);assert.match(w.root.innerHTML,/Choose your sport/);assert.doesNotMatch(w.root.innerHTML,/src="Coach Max/);
 w.c.selectCoachSport('muaythai');w.c.moveCoachSetup(1);
 assert.match(w.root.innerHTML,/Choose your coach/);assert.match(w.root.innerHTML,/Coach Max\.png/);assert.match(w.root.innerHTML,/Coach Maya\.png/);assert.doesNotMatch(w.root.innerHTML,/Intensity Hard\.svg/);
 assert.equal(w.previews.at(-1),'max');w.c.selectRoundCoach('maya');assert.equal(w.previews.at(-1),'maya');
 const before=w.cancelled;w.c.moveCoachSetup(1);assert.ok(w.cancelled>before);assert.match(w.root.innerHTML,/Set the intensity/);
 for(const level of ['Light','Steady','Hard'])assert.match(w.root.innerHTML,new RegExp('Intensity '+level+'\\.svg'));
 w.c.selectCoachIntensity('hard');w.c.moveCoachSetup(-1);assert.match(w.root.innerHTML,/id="coach-voice-maya"[^>]*aria-pressed="true"/);
 w.c.moveCoachSetup(-1);assert.match(w.root.innerHTML,/id="coach-sport-muaythai"[^>]*aria-pressed="true"/);
 w.c.moveCoachSetup(1);w.c.moveCoachSetup(1);assert.match(w.root.innerHTML,/id="coach-level-hard"[^>]*aria-pressed="true"/);
 w.c.selectCoachStance('southpaw');
 w.c.moveCoachSetup(1);assert.equal(w.started.id,'coach-muaythai-hard');assert.equal(w.c.settings.coachVoice,'maya');
 assert.equal(w.started.coachRounds.stance,'southpaw');
});

test('reopening setup returns to sport; leaving cancels previews; Finnish and German headings follow each stage',()=>{
 const w=setupWizard();
 for(const [language,headings] of [['fi',['Valitse laji','Valitse coach','Valitse intensiteetti']],['de',['Wähle deine Sportart','Wähle deinen Coach','Wähle die Intensität']]]){
  w.c.settings.language=language;w.c.openCoachRounds();
  for(let i=0;i<3;i++){assert.ok(w.root.innerHTML.includes(headings[i]));if(i<2)w.c.moveCoachSetup(1);}
 }
 w.c.openCoachRounds();assert.match(w.root.innerHTML,/Wähle deine Sportart/);assert.equal(w.root.scrollTop,0);
 w.c.moveCoachSetup(1);const before=w.cancelled;w.c.closeCoachRoundsSetup();assert.ok(w.root.hidden);assert.ok(w.cancelled>before);
});
test('all nine coach plans have accurate positive round/rest timelines and sport-appropriate combos',()=>{
 const c=context(),html=fs.readFileSync('index.html','utf8');
 const start=html.indexOf('function parseMinutesFromTitle('),end=html.indexOf('function getCurrentGuideStep(',start);
 vm.runInContext(html.slice(start,end),c);
 const spec=vm.runInContext('COACH_ROUNDS',c);
 for(const sport of ['boxing','k1','muaythai'])for(const level of ['light','steady','hard']){
  const plan=spec.plan(sport,level),r=plan.coachRounds,steps=c.buildTrainingTimeline(plan);
  assert.equal(c.getTrainingDuration(plan),r.rounds*120+(r.rounds-1)*30);
  assert.equal(steps.filter(s=>s.kind==='round').length,r.rounds);
  assert.equal(steps.filter(s=>s.kind==='rest').length,r.rounds-1);
  const text=r.combos.join(' ');
  if(sport==='boxing')assert.doesNotMatch(text,/kick|knee|elbow|teep|clinch/i);
  if(sport==='k1')assert.doesNotMatch(text,/elbow|\bknees?\b|clinch/i);
 }
 assert.match(spec.plan('muaythai','hard').coachRounds.combos.join(' '),/elbow/);
});
test('all new combinations have playable local recordings for both coaches',()=>{
 const c=context(),lines=vm.runInContext('[...COACH_ROUNDS.recordedCombos,...COACH_ROUNDS.comments,...COACH_ROUNDS.movements.map(m=>m[0]),COACH_ROUNDS.previewText,COACH_ROUNDS.restText,COACH_ROUNDS.clinch.enter,COACH_ROUNDS.clinch.exit]',c);
 vm.runInContext(fs.readFileSync('coach-rounds-audio-manifest.js','utf8'),c);
 const shipped=vm.runInContext('COACH_ROUNDS_AUDIO_MANIFEST',c);
 for(const folder of ['coach-rounds-audio','coach-rounds-audio-maya']){
  const manifest=JSON.parse(fs.readFileSync(folder+'/manifest.json'));
  const coach=folder.endsWith('-maya')?'maya':'max';
  for(const line of lines){assert.ok(manifest[line],line);assert.equal(shipped[coach][line],manifest[line]);assert.ok(fs.statSync(manifest[line]).size>1000);}
 }
});

test('large sport pools are unique and do not shrink with intensity',()=>{
 const spec=vm.runInContext('COACH_ROUNDS',context());
 assert.equal(new Set(spec.lines).size,spec.lines.length);assert.equal(spec.comments.length,26);assert.equal(spec.movements.length,16);
 for(const [sport,size] of [['boxing',81],['k1',161],['muaythai',237]])for(const level of ['light','steady','hard'])assert.equal(spec.plan(sport,level).coachRounds.combos.length,size);
});

test('slips are single short calls whose side matches the immediate counter and the stance',()=>{
 const spec=vm.runInContext('COACH_ROUNDS',context());
 for(const stance of ['orthodox','southpaw']){
  const {combos}=spec.plan('muaythai','hard',stance).coachRounds;
  const leadSide=stance==='orthodox'?'left':'right';
  const rearSide=stance==='orthodox'?'right':'left';
  assert.ok(combos.includes(`Jab. Slip to the ${leadSide}. Lead hook.`));
  assert.ok(combos.includes(`Jab. Slip to the ${rearSide}. Rear hook.`));
  for(const combo of combos){
   const techniques=combo.split('. ').map(technique=>technique.replace(/\.$/,''));
   assert.ok((techniques.length>=2||combo==='Double jab.')&&techniques.length<=5,combo);
   assert.ok(techniques.every((technique,i)=>technique!==techniques[i-1]),combo);
   const slips=techniques.filter(technique=>/^Slip\b/.test(technique));
   if(!slips.length)continue;
   assert.ok(techniques.length<=3&&slips.length===1,combo);
   const counter=techniques[techniques.indexOf(slips[0])+1];
   assert.match(counter||'',/^(?:Lead (?:hook|uppercut)|Rear hook|Cross)$/);
   assert.equal(slips[0],`Slip to the ${counter.startsWith('Lead ')?leadSide:rearSide}`,combo);
  }
 }
});

test('catalogue progress survives new sessions, intensity changes and app relaunches',async()=>{
 const c=context(),spec=vm.runInContext('COACH_ROUNDS',c),data=new Map(),heard=[];
 const storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 let ctrl;
 const poolSize=spec.plan('boxing','hard').coachRounds.combos.filter(text=>
  text.split('. ').length+(/\bdouble\b/i.test(text)?1:0)===2).length;
 for(let n=0;n<poolSize+4;n++){
  if(n%11===0){
   ctrl?.reset();
   const memory=c.createCoachRoundsMemory(storage);
   ctrl=c.createCoachRoundsController({random:Math.random,cancelSpeech(){},stopSounds(){},bell:()=>Promise.resolve(),speak:()=>Promise.resolve(),onCombo:t=>heard.push(t),onError(){throw Error('Unexpected speech failure');},restore:s=>memory.read(s.sport,s.combos),remember:(s,p)=>memory.write(s.sport,s.combos,p)});
  }
  const plan=spec.plan('boxing',n%2?'light':'hard').coachRounds;
  ctrl.update({...plan,key:'round-'+n,elapsed:0,duration:120,running:true,rest:false,bellEnabled:false});await settle();
 }
 assert.equal(new Set(heard.slice(0,poolSize)).size,poolSize);
 assert.notEqual(heard[poolSize-1],heard[poolSize]);
 assert.equal(heard.length,poolSize+4);
});

test('corrupt or unavailable local storage cannot break coaching',()=>{
 const c=context(),pool=['A','B','C'],data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)},memory=c.createCoachRoundsMemory(storage);
 memory.write('boxing',pool,{remaining:['B','C'],last:'A'});
 assert.deepEqual(Array.from(memory.read('boxing',pool).remaining),['B','C']);
 const key=[...data.keys()][0],saved=JSON.parse(data.get(key));saved.remaining=['B','B'];data.set(key,JSON.stringify(saved));assert.equal(memory.read('boxing',pool),null);
 data.set(key,'bad json');assert.doesNotThrow(()=>memory.read('boxing',pool));
 const blocked=c.createCoachRoundsMemory({getItem(){throw Error('Blocked');},setItem(){throw Error('Blocked');}});
 blocked.write('boxing',pool,{remaining:['C'],last:'B'});assert.deepEqual(Array.from(blocked.read('boxing',pool).remaining),['C']);
 assert.equal(memory.read('boxing',['new catalogue']),null);
});

test('live plans vary their rhythm while grouping short calls with longer sequences',async()=>{
 const count=text=>text.split('. ').length+(/\b(?:double|two)\b/i.test(text)?1:0);
 for(const [random,expected] of [[0,[2,2,4,2,3,4,2]],[.99,[2,4,3,4,3,2,4]]]){
  const s=setup({random:()=>random}),spec=vm.runInContext('COACH_ROUNDS',s.c);
  for(const level of ['light','steady','hard']){
   s.ctrl.reset();
   s.events.length=0;
   const state={...s.state,...spec.plan('boxing',level).coachRounds,rest:false,clinch:null,comments:[],movements:[],duration:120};
   for(let elapsed=0;elapsed<75;elapsed+=10){
    s.ctrl.update({...state,elapsed});
    await settle();
   }
   const sizes=s.events.filter(text=>spec.lines.includes(text)).slice(0,7).map(count);
   assert.deepEqual(sizes.map(size=>Math.min(size,4)),expected);
  }
 }
});

test('boxing and Muay Thai call two distinct sport-appropriate clinch combos between entry and exit',async()=>{
 const s=setup(),spec=vm.runInContext('COACH_ROUNDS',s.c);
 assert.equal(spec.plan('k1','hard').coachRounds.clinch,null);
 for(const sport of ['boxing','muaythai']){
  const plan=spec.plan(sport,'hard').coachRounds;
  const {clinch}=plan;
  const allowed=sport==='boxing'
   ? /^(?:Lead|Rear) (?:hook(?: to the body)?|uppercut)$/
   : /^(?:Lead|Rear) (?:hook(?: to the body)?|uppercut|knee)$/;
  for(const line of clinch.combos){
   for(const technique of line.split('.').map(part=>part.trim()).filter(Boolean)){
    assert.match(technique,allowed);
   }
  }
  s.ctrl.reset();
  s.events.length=0;
  const state={...s.state,...plan,rest:false};
  for(let elapsed=0;elapsed<120;elapsed++){
   s.ctrl.update({...state,elapsed});
   await settle();
  }
  const entry=s.events.indexOf(clinch.enter);
  assert.ok(entry>=0);
  assert.ok(clinch.combos.includes(s.events[entry+1]));
  assert.ok(clinch.combos.includes(s.events[entry+2]));
  assert.notEqual(s.events[entry+1],s.events[entry+2]);
  assert.equal(s.events[entry+3],clinch.exit);
  assert.equal(s.events.filter(text=>text===clinch.enter).length,1);
 }
});

test('versioned code and styles match the offline cache and worker registration survives app errors',()=>{
 const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
 const urls=[...html.matchAll(/(?:src|href)="([^"\s]+\.(?:js|css)\?v=\d+)"/g)].map(m=>m[1]);
 assert.equal(urls.length,10);
 for(const url of urls){assert.ok(sw.includes("'./"+url+"'"),url);assert.ok(fs.existsSync(url.split('?')[0]));}
 const register=html.indexOf("navigator.serviceWorker.register('./sw.js')");
 assert.ok(register>0&&register<html.indexOf('const coachRoundsMemory ='));
 assert.equal(html.match(/navigator.serviceWorker.register/g).length,1);
});

test('movement drills replace the combo with translated instructions',()=>{
 const c=context(),spec=vm.runInContext('COACH_ROUNDS',c),step={kind:'round'};
 Object.assign(c,{settings:{language:'fi'},sessionStats:{startedAt:1},timerState:{isRunning:true},escapeHtml:String,activeTrainingWorkout:spec.plan('boxing','light'),trainingTimeline:[step]});
 for(const movement of spec.movements)for(const [language,index] of [['en',0],['fi',1],['de',2]]){
  c.settings.language=language;vm.runInContext('coachRoundMovement='+JSON.stringify(movement[0])+';coachRoundCue="OLD COMBO";',c);
  const html=c.renderCoachRoundsGuide(step);assert.ok(!html.includes('OLD COMBO'));
  for(const part of movement[index].split('.').map(t=>t.trim()).filter(Boolean))assert.ok(html.includes(part),language+': '+part);
 }
});

test('timer reset clears all displayed coach instructions while retaining catalogue progress',()=>{
 const html=fs.readFileSync('index.html','utf8'),start=html.indexOf('function resetTimer()'),end=html.indexOf('let selectedTrainingDuration',start),c=context();let cancelled=0;
 const workout=vm.runInContext('COACH_ROUNDS.plan("boxing","light")',c);
 Object.assign(c,{settings:{roundTime:420,taskSparEnabled:false},intervalId:1,clearInterval(){},coachRoundsController:{reset(){cancelled++;}},trainingCueController:{reset(){}},resetManagedAudioPlayback(){},stopPreRoundDisplay(){},updateUI(){},PRE_ROUND_READ_SECONDS:5,appMode:'training',activeTrainingWorkout:workout,finishedOverlay:{classList:{remove(){}}}});
 vm.runInContext('coachRoundCue="Jab. Cross.";coachRoundTip="Guard up";coachRoundMovement="Move left";coachRoundError=true;'+html.slice(start,end),c);
 c.resetTimer();
 assert.deepEqual(Array.from(vm.runInContext('[coachRoundCue,coachRoundTip,coachRoundMovement,coachRoundError]',c)),['','','',false]);
 assert.equal(cancelled,1);assert.equal(c.activeTrainingWorkout,workout);assert.equal(c.timerState.isRunning,false);assert.equal(c.timerState.timeLeft,420);
});

async function simulatePace(level){
 const c=context(),spec=vm.runInContext('COACH_ROUNDS',c),calls=[];let now=0,pending=null,seed=1742;
 const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const ctrl=c.createCoachRoundsController({random,cancelSpeech(){if(pending){pending.resolve();pending=null;}},stopSounds(){},bell:()=>Promise.resolve(),onCombo(){},onMovement(){},onTip(){},onError(){throw Error('Audio failed');},speak(text){assert.equal(pending,null,'overlapping speech');calls.push({text,start:now,end:now+3});const held=deferred();pending={...held,end:now+3};return held.promise;}});
 const plan=spec.plan('muaythai',level).coachRounds;
 for(now=0;now<180;now+=.25){
  if(pending&&now>=pending.end){pending.resolve();pending=null;await settle();}
  ctrl.update({...plan,key:'round',duration:180,elapsed:now,running:true,rest:false,bellEnabled:false});await settle();
 }
 ctrl.reset();await settle();
 return {calls,spec};
}

test('execution time grows with each technique and counts double punches and slower actions',()=>{
 const c=context(),duration=c.coachComboExecutionTime;
 const two=duration('Jab. Cross.'),three=duration('Jab. Cross. Lead hook.');
 assert.ok(two>=1.5&&two<2);
 assert.ok(three>two);
 assert.equal(duration('Double jab. Cross.'),three,'double jab counts as two punches');
 assert.ok(duration('Jab. Rear kick.')>two,'kicks need additional recovery time');
 assert.ok(duration('Jab. Pivot out.')>two,'footwork needs additional time');
});

test('Hard varies its rhythm while reserving execution time after each combination',async()=>{
 const {calls,spec}=await simulatePace('hard');
 const gaps=calls.slice(1).map((call,i)=>call.start-calls[i].end);
 assert.ok(gaps.every(gap=>gap>=.25),'speech must finish before the next cue');
 const comboGaps=calls.slice(1).flatMap((call,i)=>spec.lines.includes(calls[i].text)?[call.start-calls[i].end]:[]);
 assert.ok(comboGaps.every(gap=>gap>=1.5),'even short combos need execution time after the last spoken word');
 assert.ok(gaps.some(gap=>gap>=2),'short resets separate bursts');
 assert.ok(new Set(gaps).size>=5,'timing should vary');
 const combos=calls.filter(call=>spec.lines.includes(call.text));
 assert.equal(new Set(combos.map(call=>call.text)).size,combos.length);
});

test('Hard waits after completed audio and gives complex combinations longer execution time',async()=>{
 async function gapFor(text){
  const c=context(),calls=[];let now=0,resolveSpeech;
  const ctrl=c.createCoachRoundsController({random:()=>0,cancelSpeech(){},stopSounds(){},bell:()=>Promise.resolve(),onCombo(){},onError(){throw Error('Audio failed');},speak(){calls.push(now);return new Promise(resolve=>resolveSpeech=resolve);}});
  const state={key:'round',level:'hard',duration:120,running:true,rest:false,bellEnabled:false,combos:[text],comments:[],movements:[]};
  ctrl.update({...state,elapsed:0});await settle();
  // Even when the recording runs longer than expected, the execution allowance starts at its end.
  for(now=.1;now<=4;now+=.1){ctrl.update({...state,elapsed:now});await settle();}
  assert.equal(calls.length,1);const ended=now;resolveSpeech();await settle();
  for(;now<12&&calls.length<2;now+=.1){ctrl.update({...state,elapsed:now});await settle();}
  const gap=calls[1]-ended;ctrl.reset();resolveSpeech();await settle();return gap;
 }
 const gaps=[];
 for(let count=2;count<=6;count++)gaps.push(await gapFor(['Jab','Cross','Lead hook','Cross','Lead uppercut','Cross'].slice(0,count).join('. ')+'.'));
 assert.ok(gaps[0]>=1.5&&gaps[0]<2.3,'jab-cross has a brief execution allowance');
 for(let i=1;i<gaps.length;i++)assert.ok(gaps[i]>=gaps[i-1]+.5,'each additional technique adds execution time');
 const complex=await gapFor('Double jab. Cross. Lead hook. Rear kick. Slip. Cross.');
 assert.ok(complex>gaps.at(-1),'double punches and slower actions add time too');
});

test('Light actively coaches movement and leaves execution time without long empty waits',async()=>{
 const light=await simulatePace('light'),hard=await simulatePace('hard');
 const movements=light.calls.filter(call=>light.spec.movements.some(m=>m[0]===call.text));
 assert.ok(movements.length>=4);
 for(const move of movements){const next=light.calls[light.calls.indexOf(move)+1];if(next)assert.ok(next.start-move.end>=3);}
 const gaps=light.calls.slice(1).map((call,i)=>call.start-light.calls[i].end);
 assert.ok(Math.max(...gaps)<=7.5,'execution time must stay bounded even for complex combos');
 assert.ok(hard.calls.length>light.calls.length);
});

test('pausing a movement drill cancels its voice and resumes the same movement',async()=>{
 const move='Circle left. Keep your stance.',spoken=[],s=setup({speak:t=>{spoken.push(t);return Promise.resolve();}});
 const state={...s.state,level:'light',movements:[move],comments:[]};
 for(const elapsed of [0,15,30]){s.ctrl.update({...state,elapsed});await settle();}
 assert.equal(spoken.at(-1),move);
 s.ctrl.update({...state,elapsed:31,running:false});s.ctrl.update({...state,elapsed:31,running:true});await settle();assert.equal(spoken.at(-1),move);
 s.ctrl.reset();s.ctrl.update({...state,elapsed:0});s.ctrl.reset();await settle();assert.equal(spoken.filter(t=>t===move).length,2);
});

test('all combo techniques have Finnish and German display translations',()=>{
 const c=context();
 Object.assign(c,{settings:{language:'fi'},sessionStats:{startedAt:1},timerState:{isRunning:true},escapeHtml:t=>String(t).replaceAll('<','&lt;')});
 const spec=vm.runInContext('COACH_ROUNDS',c),step={kind:'round'};
 c.activeTrainingWorkout=spec.plan('muaythai','steady');c.trainingTimeline=[step];
 for(const language of ['fi','de']){
  c.settings.language=language;
  for(const line of spec.lines){
   vm.runInContext('coachRoundCue='+JSON.stringify(line),c);
   const rendered=c.renderCoachRoundsGuide(step);
   for(const term of line.split('.').map(t=>t.trim()).filter(Boolean)){
    if(language==='de'&&['Jab','Cross'].includes(term))continue;
    assert.ok(!rendered.includes('<li>'+term+'</li>'),language+': '+term);
   }
  }
 }
});

test('shuffle bags exhaust the sport catalogue across rounds without boundary repeats',async()=>{
 let seed=42;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const calls=[],s=setup({random:rng,onCombo:t=>calls.push(t)});
 for(let n=0;n<18;n++){s.ctrl.update({...s.state,key:'round-'+Math.floor(n/2),elapsed:(n%2)*10});await settle();}
 assert.equal(calls.length,18);
 for(let n=0;n<calls.length;n+=3)assert.equal(new Set(calls.slice(n,n+3)).size,3);
 for(let n=1;n<calls.length;n++)assert.notEqual(calls[n],calls[n-1]);
 assert.notDeepEqual(calls.slice(0,3),calls.slice(3,6));
});

test('reminders interleave without replacing the combo or overlapping speech, and resume repeats the combo',async()=>{
 const held=deferred(),tips=[],s=setup({onTip:t=>tips.push(t),speak(t){s.events.push(t);return t==='Guard up'?held.promise:Promise.resolve();}});
 const state={...s.state,duration:300,comments:['Guard up','Breathe']};
 for(const elapsed of [0,10,20,30,40]){s.ctrl.update({...state,elapsed});await settle();}
 assert.equal(s.events.filter(t=>t==='Guard up').length,1);
 const combo=s.ctrl.current();assert.ok(['A','B','C'].includes(combo));assert.equal(tips.at(-1),'Guard up');
 s.ctrl.update({...state,elapsed:70});await settle();assert.equal(s.ctrl.current(),combo);
 s.ctrl.update({...state,elapsed:70,running:false});s.ctrl.update({...state,elapsed:70});await settle();
 assert.equal(s.events.at(-1),combo);held.resolve();await settle();
 s.ctrl.update({...state,elapsed:71});await settle();assert.equal(s.events.at(-1),combo);
});

test('a new work round always opens with a combo even when a reminder is due',async()=>{
 const s=setup(),state={...s.state,comments:['Guard up']};
 for(const elapsed of [0,10,20,30]){s.ctrl.update({...state,elapsed});await settle();}
 s.ctrl.update({...state,key:'rest',rest:true,elapsed:0});await settle();
 s.ctrl.update({...state,key:'round-2',elapsed:0});await settle();
 assert.ok(['A','B','C'].includes(s.events.at(-1)));
 s.ctrl.update({...state,key:'round-2',elapsed:10});await settle();assert.equal(s.events.at(-1),'Guard up');
});
test('one opening bell completes before the first combo and cadence does not repeat announcements',async()=>{
 const bell=deferred(),s=setup({bell(){s.events.push('bell');return bell.promise;}});
 s.ctrl.update(s.state);s.ctrl.update({...s.state,elapsed:1});await settle();
 assert.equal(s.events.filter(x=>x==='A').length,0);
 bell.resolve();await settle();assert.equal(s.events.filter(x=>x==='A').length,1);
 for(const elapsed of [2,3,6.9])s.ctrl.update({...s.state,elapsed});await settle();
 assert.equal(s.events.filter(x=>x==='C').length,0);
 s.ctrl.update({...s.state,elapsed:8});await settle();assert.equal(s.events.filter(x=>x==='C').length,1);
 assert.equal(s.events.filter(x=>x==='bell').length,1);
});

test('new work rounds clear the old rest instruction while the opening bell is still playing',async()=>{
 const bell=deferred();let displayed='',steps=0;
 const s=setup({bell:()=>bell.promise,onStep(){displayed='';steps++;},onCombo:text=>{displayed=text;}});
 s.ctrl.update({...s.state,key:'rest',rest:true,bellEnabled:false});await settle();assert.match(displayed,/^Rest\./);
 s.ctrl.update({...s.state,key:'next-round',rest:false});assert.equal(displayed,'');assert.equal(steps,2);
 await settle();assert.equal(displayed,'');bell.resolve();await settle();assert.ok(['A','B','C'].includes(displayed));
});
test('long speech never overlaps or queues a burst after time jumps',async()=>{
 const speech=deferred(),s=setup({speak(t){s.events.push(t);return speech.promise;}});
 s.ctrl.update(s.state);await settle();s.ctrl.update({...s.state,elapsed:40});await settle();
 assert.equal(s.events.filter(x=>x==='C').length,0);
 speech.resolve();await settle();s.ctrl.update({...s.state,elapsed:41});await settle();assert.equal(s.events.filter(x=>x==='C').length,0);
 s.ctrl.update({...s.state,elapsed:43});await settle();assert.equal(s.events.filter(x=>x==='C').length,1);
});
test('pausing cancels pending bells; resume repeats the current combo rather than skipping it',async()=>{
 const bell=deferred(),s=setup({bell(){return bell.promise;}});
 s.ctrl.update(s.state);s.ctrl.update({...s.state,running:false});bell.resolve();await settle();
 assert.ok(!s.events.includes('A'));
 s.ctrl.update({...s.state,elapsed:2});await settle();assert.equal(s.events.filter(x=>x==='A').length,1);
 s.ctrl.update({...s.state,running:false,elapsed:3});s.ctrl.update({...s.state,elapsed:3});await settle();
 assert.equal(s.events.filter(x=>x==='A').length,2);assert.ok(!s.events.includes('B'));
});
test('rest, skipping and reset invalidate old callbacks; silent preference still keeps the coach',async()=>{
 const first=deferred(),s=setup({speak(t){s.events.push(t);return t==='A'?first.promise:Promise.resolve();}});
 s.ctrl.update({...s.state,bellEnabled:false});await settle();assert.ok(s.events.includes('A'));assert.ok(!s.events.includes('bell'));
 s.ctrl.update({...s.state,key:'rest',rest:true,elapsed:0});await settle();assert.ok(s.events.some(x=>x.startsWith('Rest.')));
 first.resolve();await settle();s.ctrl.update({...s.state,key:'rest',rest:true,elapsed:20});await settle();assert.ok(!s.events.includes('B'));
 s.ctrl.reset();s.ctrl.update({...s.state,key:'round-2',roundIndex:1});s.ctrl.reset();await settle();assert.equal(s.events.filter(x=>x==='A').length,1);
});
test('audio failure is reported and the last seconds do not start an unfinished combo',async()=>{
 const s=setup({speak(){return Promise.reject(Error('Missing audio'));}});
 s.ctrl.update(s.state);await settle();assert.ok(s.events.includes('error'));
 const t=setup();t.ctrl.update({...t.state,elapsed:118});await settle();assert.ok(!t.events.includes('A'));
});
