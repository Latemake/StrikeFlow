const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('a stalled training bell uses a single fallback and releases coaching', async () => {
 const timers=new Map();let nextId=0,fallbacks=0,audio;
 const context=vm.createContext({
  ROUND_START_SOUND_SRC:'bell.mp3',pendingTrainingBell:null,stopTrainingSounds(){},
  Audio:class {constructor(){audio=this;this.paused=false;}play(){return new Promise(()=>{});}pause(){this.paused=true;}},
  setTimeout(callback,delay){timers.set(++nextId,{callback,delay});return nextId;},
  clearTimeout(id){timers.delete(id);},playFallbackBell(){fallbacks++;}
 });
 vm.runInContext(html.slice(html.indexOf('function playTrainingStartBell('),html.indexOf('const trainingCueController =')),context);
 const playing=context.playTrainingStartBell();
 const staleError=audio.onerror;
 const deadline=[...timers.values()][0];
 assert.equal(deadline.delay,2000);
 deadline.callback();
 staleError();
 assert.equal(fallbacks,1);
 assert.equal(audio.paused,true);
 const tail=[...timers.values()][0];
 assert.equal(tail.delay,750);
 tail.callback();
 await playing;
 assert.equal(timers.size,0);
});
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};}
function setup(){
 let gesture=false;const players=[],calls=[];
 class MobileAudio{
  constructor(){this.paused=true;this.currentTime=0;this.results=[];this.plays=0;this.pauses=0;this.loads=0;this.unlocked=false;players.push(this);}
  play(){
   this.plays++;
   if(!gesture&&!this.unlocked)return Promise.reject(Object.assign(Error('User gesture required for this element'),{name:'NotAllowedError'}));
   this.unlocked=true;this.paused=false;calls.push(this.src);
   const result=this.results.shift();return result?result():Promise.resolve();
  }
  pause(){this.paused=true;this.pauses++;}
  load(){this.loads++;this.playbackRate=1;}
 }
 const c=vm.createContext({Audio:MobileAudio,setTimeout,clearTimeout,settings:{coachVoice:'max'},COACH_AUDIO_MANIFEST:{A:'ordinary-a.mp3'},COACH_MAYA_MANIFEST:{A:'ordinary-maya-a.mp3'},COACH_ROUNDS_AUDIO_MANIFEST:{max:{A:'a.mp3',B:'b.mp3',C:'c.mp3'},maya:{A:'maya-a.mp3',B:'maya-b.mp3',C:'maya-c.mp3'}},activeTrainingWorkout:{coachRounds:true},managedAudioPools:[],primeAudioElement(){},ensureAudioReady(){}});
 const start=html.indexOf('let coachRecording = null;'),end=html.indexOf('function playTrainingStartBell(',start);
 vm.runInContext('let pendingBrowserSpeech=null;function cancelCoachSpeech(){if(pendingBrowserSpeech)pendingBrowserSpeech();}\n'+html.slice(start,end),c);
 const unlockStart=html.indexOf('function unlockAppAudio()'),unlockEnd=html.indexOf('function resetManagedAudioPlayback(',unlockStart);
 vm.runInContext(html.slice(unlockStart,unlockEnd),c);
 return {c,players,calls,gesture(fn){gesture=true;try{return fn();}finally{gesture=false;}}};
}

test('one initial app gesture permits consecutive Max and Maya recordings without more taps',async()=>{
 const s=setup();s.gesture(()=>s.c.unlockAppAudio());await settle();
 for(const voice of ['max','maya'])for(const text of ['A','B','C','A']){
  const playback=s.c.speakCoachText(text,voice);await settle();
  assert.equal(s.players.length,1,'every cue must keep the same unlocked element');
  assert.equal(s.players[0].paused,false);assert.equal(s.players[0].playbackRate,1.2);assert.equal(s.players[0].preservesPitch,true);
  s.players[0].onended();await playback;
 }
 assert.equal(s.calls.filter(src=>src.endsWith('.mp3')).length,8);
});

test('coach unlocking uses inaudible samples, stays unmuted and retries a rejected gesture later',async()=>{
 const s=setup();s.c.primeCoachAudio();await settle();assert.equal(s.players[0].unlocked,false);
 s.gesture(()=>s.c.unlockAppAudio());await settle();const audio=s.players[0];
 const wav=Buffer.from(audio.src.split(',')[1],'base64');assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');assert.ok(wav.subarray(44).every(sample=>sample===0));assert.equal(audio.muted,false);assert.equal(audio.volume,1);
 const playback=s.c.speakCoachText('A');await settle();audio.onended();await playback;assert.equal(s.players.length,1);
});

test('late unlock completions cannot pause or replace a newer audible coach cue',async()=>{
 for(const failure of [false,true]){
  const s=setup(),priming=deferred(),audio=s.c.getCoachRecording();audio.results.push(()=>priming.promise);
  s.gesture(()=>s.c.unlockAppAudio());const playback=s.c.speakCoachText('A');await settle();audio.currentTime=.75;const pauses=audio.pauses;
  if(failure)priming.reject(Error('Old unlock failed'));else priming.resolve();await settle();
  assert.equal(audio.src,'a.mp3');assert.equal(audio.currentTime,.75);assert.equal(audio.pauses,pauses);assert.equal(audio.paused,false);
  s.gesture(()=>s.c.unlockAppAudio());assert.equal(audio.pauses,pauses);assert.equal(audio.src,'a.mp3');audio.onended();await playback;
 }
});

test('pause, coach changes and stale play errors preserve the new cue and its cancellation callback',async()=>{
 const s=setup();s.gesture(()=>s.c.unlockAppAudio());await settle();const audio=s.players[0],old=deferred();audio.results.push(()=>old.promise);
 const first=s.c.speakCoachText('A');const oldEnd=audio.onended;s.c.cancelCoachSpeech();await first;
 const second=s.c.speakCoachText('B','maya');await settle();old.reject(Error('Cancelled old source'));oldEnd();await settle();
 assert.equal(audio.src,'maya-b.mp3');assert.equal(audio.paused,false);assert.equal(s.players.length,1);
 s.c.cancelCoachSpeech();await second;assert.equal(audio.paused,true);
 const resumed=s.c.speakCoachText('B','maya');await settle();assert.equal(audio.paused,false);audio.onended();await resumed;
});

test('a transient media error retries once on the same element and preserves the faster speech rate',async()=>{
 const s=setup();s.gesture(()=>s.c.unlockAppAudio());await settle();const audio=s.players[0];
 audio.results.push(()=>Promise.reject(Object.assign(Error('Temporary failure'),{name:'NetworkError'})));
 const playback=s.c.speakCoachText('C');await settle();assert.equal(audio.loads,1);assert.equal(s.players.length,1);assert.equal(audio.playbackRate,1.2);audio.onended();await playback;
 audio.results.push(()=>Promise.reject(Error('Missing file')),()=>Promise.reject(Error('Missing file')));
 await assert.rejects(s.c.speakCoachText('A'),/Missing file/);assert.equal(audio.loads,2);
});

test('the shipped Coach Rounds controller runs successive timer-driven cues under a per-element autoplay restriction',async()=>{
 const s=setup();vm.runInContext(fs.readFileSync('coach-rounds.js','utf8'),s.c);
 let errors=0;const heard=[];
 const controller=s.c.createCoachRoundsController({random:()=>.5,cancelSpeech:s.c.cancelCoachSpeech,stopSounds(){},bell:()=>Promise.resolve(),speak:s.c.speakCoachText,onCombo:text=>heard.push(text),onError(){errors++;}});
 s.gesture(()=>s.c.unlockAppAudio());await settle();let finishAt=Infinity;
 for(let elapsed=0;elapsed<65;elapsed++){
  if(elapsed>=finishAt){s.players[0].onended?.();finishAt=Infinity;await settle();}
  const before=heard.length;
  controller.update({key:'round',elapsed,duration:120,running:true,rest:false,level:'hard',combos:['A','B','C'],comments:[],movements:[],bellEnabled:true});await settle();
  if(heard.length>before)finishAt=elapsed+2;
 }
 controller.reset();await settle();assert.equal(errors,0);assert.equal(s.players.length,1);assert.ok(heard.length>=10,'the regression occurs only after the first cue');
});

test('a coach recording that never ends releases the player and the round calls the next combo', async () => {
 const s=setup();
 let deadline;
 s.c.setTimeout=(callback, delay)=>{assert.equal(delay,15000);deadline=callback;return 1;};
 s.c.clearTimeout=()=>{deadline=null;};
 vm.runInContext(fs.readFileSync('coach-rounds.js','utf8'),s.c);
 s.gesture(()=>s.c.unlockAppAudio());
 await settle();
 const calls=[], errors=[];
 const controller=s.c.createCoachRoundsController({
  random:()=>.5, cancelSpeech:s.c.cancelCoachSpeech, stopSounds(){}, speak:s.c.speakCoachText,
  onCombo:text=>calls.push(text), onError:()=>errors.push('playback error')
 });
 const update=elapsed=>controller.update({key:'round',elapsed,duration:120,running:true,rest:false,level:'hard',combos:['A','B','C']});
 update(0);
 await settle();
 assert.equal(calls.length,1);
 update(15);
 deadline();
 await settle();
 assert.equal(s.players[0].paused,true);
 update(20);
 await settle();
 assert.equal(calls.length,2);
 assert.notEqual(calls[0],calls[1]);
 assert.equal(s.players.length,1);
 assert.deepEqual(errors,[]);
 s.players[0].onended();
 await settle();
 assert.equal(deadline,null);
});
