// Offline audio edit. No API calls or credentials; preserve every sample outside long quiet gaps.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const run=promisify(execFile);
function tightenPauses(pcm,rate=24000){
 const frame=Math.round(rate*.01),threshold=32768*Math.pow(10,-48/20),count=pcm.length/2;
 const cuts=[];let quietStart=-1;
 function finish(end){
  if(quietStart<0)return;
  if(end-quietStart>=rate*.25){
   const edge=quietStart===0||end===count;
   const keep=Math.round(rate*(edge?.05:.12));
   const before=quietStart===0?0:end===count?keep:Math.floor(keep/2);
   const after=keep-before;
   cuts.push([quietStart+before,end-after]);
  }
  quietStart=-1;
 }
 for(let start=0;start<count;start+=frame){
  const end=Math.min(count,start+frame);let peak=0;
  for(let n=start;n<end;n++)peak=Math.max(peak,Math.abs(pcm.readInt16LE(n*2)));
  if(peak<threshold){if(quietStart<0)quietStart=start;}else finish(start);
 }
 finish(count);
 const chunks=[];let cursor=0;
 for(const [a,b] of cuts){chunks.push(pcm.subarray(cursor*2,a*2));cursor=b;}
 chunks.push(pcm.subarray(cursor*2));
 return {pcm:Buffer.concat(chunks),cuts,removedSamples:cuts.reduce((sum,[a,b])=>sum+b-a,0)};
}
async function main(){
 const ffmpeg=process.argv[2];if(!ffmpeg)throw Error('Pass the absolute path to ffmpeg.');
 const c=vm.createContext({});vm.runInContext(fs.readFileSync('coach-rounds.js','utf8'),c);
 const combos=new Set(vm.runInContext('COACH_ROUNDS.recordedCombos',c));
 const manifestPaths=['coach-rounds-audio/manifest.json','coach-rounds-audio-maya/manifest.json'];
 const manifests=manifestPaths.map(p=>JSON.parse(fs.readFileSync(p,'utf8')));
 const backup='.coach-audio-originals',jobs=[];
 for(let voice=0;voice<2;voice++)for(const [text,source] of Object.entries(manifests[voice])){
  if(!combos.has(text)||source.endsWith('-tight-v1.mp3'))continue;
  jobs.push({voice,text,source,target:source.replace(/\.mp3$/,'-tight-v1.mp3')});
 }
 if(!jobs.length){console.log('Combination recordings already have tightened pauses.');return;}
 fs.mkdirSync(backup,{recursive:true});let completed=0;const report=[];
 const queue=[...jobs];
 await Promise.all(Array.from({length:4},async()=>{
  while(queue.length){
   const job=queue.shift(),saved=path.join(backup,job.source),stage=path.join(backup,job.target);
   fs.mkdirSync(path.dirname(saved),{recursive:true});
   if(!fs.existsSync(saved))fs.copyFileSync(job.source,saved);
   const decoded=await run(ffmpeg,['-v','error','-i',saved,'-f','s16le','-ac','1','-ar','24000','pipe:1'],{encoding:'buffer',maxBuffer:16*1024*1024});
   const result=tightenPauses(decoded.stdout);
   if(result.pcm.length<decoded.stdout.length*.3)throw Error('Unexpected loss of speech: '+job.source);
   const wav=stage+'.pcm';fs.writeFileSync(wav,result.pcm);
   await run(ffmpeg,['-v','error','-y','-f','s16le','-ar','24000','-ac','1','-i',wav,'-c:a','libmp3lame','-b:a','128k',stage]);
   fs.unlinkSync(wav);
   const check=await run(ffmpeg,['-v','error','-i',stage,'-f','null','-']);
   if(fs.statSync(stage).size<1000)throw Error('Empty edited recording');
   report.push({...job,beforeSeconds:decoded.stdout.length/48000,afterSeconds:result.pcm.length/48000,gaps:result.cuts.length});
   completed++;if(completed%100===0||completed===jobs.length)console.log(`Edited ${completed}/${jobs.length} recordings`);
  }
 }));
 // Only replace assets after every edited recording has encoded and decoded successfully.
 for(const job of jobs){fs.copyFileSync(path.join(backup,job.target),job.target);manifests[job.voice][job.text]=job.target;}
 for(let voice=0;voice<2;voice++)fs.writeFileSync(manifestPaths[voice],JSON.stringify(manifests[voice],null,2)+'\n');
 fs.writeFileSync('coach-rounds-audio-manifest.js','const COACH_ROUNDS_AUDIO_MANIFEST = '+JSON.stringify({max:manifests[0],maya:manifests[1]},null,2)+';\n');
 for(const job of jobs)fs.unlinkSync(job.source);
 fs.writeFileSync(path.join(backup,'report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({recordings:report.length,removedSeconds:report.reduce((sum,r)=>sum+r.beforeSeconds-r.afterSeconds,0),samples:report.filter(r=>r.text==='Jab. Cross.')}));
}
module.exports={tightenPauses};
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
