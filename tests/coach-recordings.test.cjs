const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html','utf8');
test('recorded coach plays identical files and cancels on pause without device speech', async () => {
 let current;
 class Audio {
  constructor(src) {this.src=src; current=this;}
  play(){return Promise.resolve();}
  pause(){this.paused=true;}
 }
 const c=vm.createContext({settings:{coachVoice:"max"},Audio, COACH_AUDIO_MANIFEST:{'Test instruction':'coach-audio/test.mp3'}});
 const start=html.indexOf('let coachRecording = null;');
 const end=html.indexOf('const trainingCueController',start);
 vm.runInContext('let pendingBrowserSpeech = null; function cancelCoachSpeech(){if(pendingBrowserSpeech)pendingBrowserSpeech();}\n'+html.slice(start,end),c);
 const pending=c.speakCoachText('Test instruction');
 assert.equal(current.src,'coach-audio/test.mp3');
 c.cancelCoachSpeech(); await pending; assert.equal(current.paused,true);
 await assert.rejects(c.speakCoachText('Unknown custom instruction'));
});
test('every manifest recording exists and contains audio', () => {
 const manifest=JSON.parse(fs.readFileSync('coach-audio/manifest.json','utf8'));
 assert.ok(Object.keys(manifest).length>400);
 for(const file of Object.values(manifest)) assert.ok(fs.statSync(file).size>1000,file);
});

test('browser timer callbacks retain their required window receiver', () => {
 const window = { setTimeout(fn,delay){assert.equal(this,window);return 123;}, clearTimeout(id){assert.equal(this,window);assert.equal(id,123);} };
 let output;
 const c=vm.createContext({window,performance:{now:()=>0},setTimeout:window.setTimeout,clearTimeout:window.clearTimeout,createTrainingCueController(o){output=o;},playTrainingStartBell(){},playTrainingGong(){},playTrainingTone(){},stopTrainingSounds(){},cancelCoachSpeech(){},speakCoachText(){}});
 const start=html.indexOf('const trainingCueController =');
 vm.runInContext(html.slice(start,html.indexOf('function isVoicePilot(',start)),c);
 output.clearTimeout(output.setTimeout(()=>{},700));
});

test('Maya has the same workout and tutorial coverage as Max', () => {
 const male=JSON.parse(fs.readFileSync('coach-audio/manifest.json','utf8'));
 const female=JSON.parse(fs.readFileSync('coach-audio-maya/manifest.json','utf8'));
 for(const text of Object.keys(male).filter(t=>!t.startsWith('Hi, I am Max'))) {
  assert.ok(female[text],text);
  assert.ok(fs.statSync(female[text]).size>1000,female[text]);
 }
});

test('selected coach controls which recording plays', async () => {
 let source;
 class Audio { constructor(src){source=src;} play(){return Promise.resolve();} pause(){} }
 const c=vm.createContext({settings:{coachVoice:'maya'},Audio,COACH_AUDIO_MANIFEST:{Test:'max.mp3'},COACH_MAYA_MANIFEST:{Test:'maya.mp3'}});
 const start=html.indexOf('let coachRecording = null;'),end=html.indexOf('const trainingCueController',start);
 vm.runInContext('let pendingBrowserSpeech=null;function cancelCoachSpeech(){if(pendingBrowserSpeech)pendingBrowserSpeech();}\n'+html.slice(start,end),c);
 const playing=c.speakCoachText('Test');assert.equal(source,'maya.mp3');c.cancelCoachSpeech();await playing;
 const preview=c.speakCoachText('Test','max');assert.equal(source,'max.mp3');c.cancelCoachSpeech();await preview;
});

test('changing coach preferences preserves the other saved audio choices', () => {
 let stored;
 const settings={trainingCuesEnabled:true,periodicCuesEnabled:false,voiceCoachEnabled:true,roundSoundsEnabled:false,uiClickSoundsEnabled:true,vibrationEnabled:false};
 const c=vm.createContext({settings,TRAINING_PREFERENCES_KEY:'audio',localStorage:{setItem(key,value){stored=JSON.parse(value);}},trainingCueController:{cancelVoice(){}},updateSettingsUI(){}});
 const start=html.indexOf('function saveAudioPreferences('),end=html.indexOf('async function testVoiceCoach(',start);
 vm.runInContext(html.slice(start,end),c);c.setTrainingAudioPreference('voiceCoachEnabled',false);
 assert.equal(stored.uiClickSoundsEnabled,true);assert.equal(stored.roundSoundsEnabled,false);assert.equal(stored.vibrationEnabled,false);assert.equal(stored.voiceCoachEnabled,false);
});

test('Coach Rounds speeds up both coaches and their previews while preserving pitch and ordinary training playback',async()=>{
 let source,audio;
 class Audio{constructor(src){source=src;audio=this;}play(){return Promise.resolve();}pause(){}}
 const c=vm.createContext({settings:{coachVoice:'maya'},Audio,COACH_AUDIO_MANIFEST:{Test:'ordinary-max.mp3'},COACH_MAYA_MANIFEST:{Test:'ordinary-maya.mp3'},COACH_ROUNDS_AUDIO_MANIFEST:{max:{Test:'projected-max.mp3',Preview:'preview-max.mp3'},maya:{Test:'projected-maya.mp3'}},COACH_ROUNDS:{previewText:'Preview'},activeTrainingWorkout:{coachRounds:true}});
 const start=html.indexOf('let coachRecording = null;'),end=html.indexOf('const trainingCueController',start);
 vm.runInContext('let pendingBrowserSpeech=null;function cancelCoachSpeech(){if(pendingBrowserSpeech)pendingBrowserSpeech();}\n'+html.slice(start,end),c);
 let playing=c.speakCoachText('Test');assert.equal(source,'projected-maya.mp3');assert.equal(audio.playbackRate,1.2);assert.equal(audio.preservesPitch,true);c.cancelCoachSpeech();await playing;
 c.activeTrainingWorkout=null;
 playing=c.speakCoachText('Preview','max');assert.equal(source,'preview-max.mp3');assert.equal(audio.playbackRate,1.2);assert.equal(audio.preservesPitch,true);c.cancelCoachSpeech();await playing;
 playing=c.speakCoachText('Test');assert.equal(source,'ordinary-maya.mp3');assert.equal(audio.playbackRate,1);c.cancelCoachSpeech();await playing;
});
