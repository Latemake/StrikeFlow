const test=require('node:test'),assert=require('node:assert/strict');
const {tightenPauses}=require('../scripts/tighten-coach-pauses.cjs');
function signal(parts){return Buffer.concat(parts.map(([ms,value])=>{const b=Buffer.alloc(Math.round(ms*24)*2);for(let i=0;i<b.length;i+=2)b.writeInt16LE(value,i);return b;}));}
test('long pauses shorten to 120ms while every voiced sample is preserved',()=>{
 const input=signal([[300,0],[400,2000],[600,0],[500,-3000],[400,0]]);
 const out=tightenPauses(input);assert.equal(out.pcm.length/48,1120);
 const voiced=b=>{const samples=[];for(let i=0;i<b.length;i+=2){const n=b.readInt16LE(i);if(Math.abs(n)>130)samples.push(n);}return samples;};
 assert.deepEqual(voiced(out.pcm),voiced(input));assert.equal(out.cuts.length,3);
});
test('short natural gaps and quiet speech remain untouched',()=>{
 const input=signal([[200,300],[150,0],[200,-300]]);
 assert.deepEqual(tightenPauses(input).pcm,input);
});
