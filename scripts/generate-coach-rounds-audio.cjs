// Local production tool: the app receives static MP3s, never credentials or TTS calls.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync('coach-rounds.js','utf8'),context);
const spec=vm.runInContext('COACH_ROUNDS',context);
const texts=[...new Set([...spec.recordedCombos,...spec.comments,...spec.movements.map(m=>m[0]),spec.previewText,spec.restText,spec.clinch.enter,spec.clinch.exit])];
const style='projected-gym-v1';
const manifests=Object.fromEntries(['max','maya'].map(coach=>[coach,Object.fromEntries(texts.map(text=>[text,`coach-rounds-audio${coach==='maya'?'-maya':''}/${crypto.createHash('sha256').update(style+text).digest('hex').slice(0,20)}.mp3`]))]));
const env=fs.existsSync('.env.local')?fs.readFileSync('.env.local','utf8'):'';
const key=process.env.OPENAI_API_KEY||env.match(/^OPENAI_API_KEY\s*=\s*(.+)$/m)?.[1].trim().replace(/^['"]|['"]$/g,'');
if(!key)throw Error('No local speech-generation credential configured.');
async function main(){
 for(const coach of ['max','maya']){
  const folder=`coach-rounds-audio${coach==='maya'?'-maya':''}`;fs.mkdirSync(folder,{recursive:true});
  const queue=Object.entries(manifests[coach]);let completed=0;
  await Promise.all(Array.from({length:6},async()=>{
   while(queue.length){
    const [text,basePath]=queue.shift();
    const tightenedPath=basePath.replace(/\.mp3$/,'-tight-v1.mp3');
    const path=fs.existsSync(tightenedPath)?tightenedPath:basePath;
    manifests[coach][text]=path;
    if(!fs.existsSync(path)){
     let response;
     for(let attempt=0;attempt<4;attempt++){
      response=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4o-mini-tts',voice:coach==='maya'?'marin':'cedar',input:text,instructions:'You are a real, energetic combat sports coach calling combinations across a busy gym. Project your voice with a slightly raised, assertive coaching call: strong, punchy, encouraging, a little shouted but never screaming or strained. Speak extremely clear English, brisk but intelligible. Give short distinct pauses between techniques so an athlete can follow. Keep the same confident gym-coach character for every line. No music, no sound effects, no background noise.',response_format:'mp3'})});
      if(response.ok)break;
      if(response.status!==429&&response.status<500)throw Error(`Speech generation failed: HTTP ${response.status}`);
      await new Promise(resolve=>setTimeout(resolve,1500*(attempt+1)));
     }
     if(!response.ok)throw Error(`Speech generation failed: HTTP ${response.status}`);
     const audio=Buffer.from(await response.arrayBuffer());if(audio.length<1000)throw Error('Empty speech recording');
     fs.writeFileSync(path,audio);
    }
    completed++;if(completed%10===0||completed===texts.length)console.log(`${coach}: ${completed}/${texts.length}`);
   }
  }));
  fs.writeFileSync(folder+'/manifest.json',JSON.stringify(manifests[coach],null,2));
 }
 fs.writeFileSync('coach-rounds-audio-manifest.js','const COACH_ROUNDS_AUDIO_MANIFEST = '+JSON.stringify(manifests,null,2)+';\n');
 console.log(`Ready: ${texts.length*2} prerecorded Coach Rounds clips.`);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
