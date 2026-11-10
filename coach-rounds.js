// Recorded, continuous combination coaching. No network or device TTS is used.
const COACH_ROUNDS = (() => {
    const originals = [
    "Jab. Cross.",
    "Double jab. Cross.",
    "Jab. Cross. Lead hook.",
    "Jab to the body. Cross to the head.",
    "Slip. Cross. Lead hook.",
    "Jab. Cross. Lead uppercut. Cross.",
    "Jab. Lead hook. Cross.",
    "Double jab. Lead hook.",
    "Cross. Lead hook. Cross.",
    "Lead uppercut. Cross. Lead hook.",
    "Jab. Cross. Roll. Lead hook.",
    "Jab. Step back. Cross.",
    "Double jab. Cross. Step out.",
    "Jab. Cross. Lead hook to the body.",
    "Lead hook to the body. Lead hook to the head.",
    "Jab. Rear uppercut. Lead hook.",
    "Slip. Jab. Cross.",
    "Jab. Cross. Slip. Cross.",
    "Jab. Lead uppercut. Cross.",
    "Cross to the body. Lead hook to the head.",
    "Jab. Cross. Pivot out.",
    "Double jab. Cross. Lead hook.",
    "Jab to the body. Jab to the head. Cross.",
    "Lead hook. Cross. Lead hook.",
    "Jab. Slip. Cross.",
    "Rear uppercut. Lead hook. Cross.",
    "Jab. Cross. Lead hook. Cross.",
    "Double jab. Step back. Cross.",
    "Lead hook to the body. Cross.",
    "Jab. Cross to the body. Lead hook to the head.",
    "Jab. Lead hook. Pivot out.",
    "Slip. Cross. Lead uppercut.",
    "Jab. Cross. Roll. Cross.",
    "Double jab. Lead uppercut. Cross.",
    "Cross. Lead hook. Step out.",
    "Jab to the body. Cross. Lead hook.",
    "Jab. Cross. Rear low kick.",
    "Double jab. Rear body kick.",
    "Check. Cross. Rear low kick.",
    "Check. Cross. Rear body kick.",
    "Jab. Rear low kick.",
    "Cross. Lead hook. Rear low kick.",
    "Jab. Cross. Lead body kick.",
    "Lead front kick. Jab. Cross.",
    "Jab. Lead hook. Rear body kick.",
    "Rear low kick. Cross. Lead hook.",
    "Jab. Cross. Rear body kick.",
    "Double jab. Rear low kick.",
    "Check. Jab. Cross.",
    "Jab. Lead low kick. Cross.",
    "Lead hook. Rear body kick.",
    "Cross. Lead body kick.",
    "Jab. Cross. Lead hook. Rear low kick.",
    "Rear front kick. Jab. Cross.",
    "Jab. Rear body kick. Step out.",
    "Check. Lead hook. Rear low kick.",
    "Double jab. Lead body kick.",
    "Cross. Lead hook. Rear body kick.",
    "Jab to the body. Rear low kick.",
    "Lead front kick. Cross. Lead hook.",
    "Jab. Cross. Rear low kick. Step out.",
    "Jab. Lead low kick.",
    "Check. Cross. Lead hook.",
    "Jab. Rear front kick.",
    "Lead low kick. Jab. Cross.",
    "Cross. Lead hook. Lead body kick.",
    "Jab. Cross to the body. Rear low kick.",
    "Double jab. Cross. Rear body kick.",
    "Jab. Cross. One rear knee. Step out.",
    "Jab. Rear teep.",
    "Jab. Cross. Lead elbow.",
    "Jab. Cross. Two knees. Step out.",
    "Lead teep. Jab. Cross.",
    "Jab. Cross. Rear elbow.",
    "Jab. Lead knee. Step out.",
    "Cross. Lead hook. Rear knee.",
    "Check. Cross. Rear knee.",
    "Jab. Rear teep. Step out.",
    "Double jab. Rear knee.",
    "Lead elbow. Rear knee. Step out.",
    "Jab. Cross. Lead knee.",
    "Rear teep. Cross. Lead hook.",
    "Jab. Lead elbow. Rear elbow.",
    "Cross. Lead elbow. Step out.",
    "Lead teep. Rear body kick.",
    "Jab. Cross. Rear knee. Lead elbow.",
    "Check. Cross. Lead elbow.",
    "Jab. Lead teep.",
    "Double jab. Cross. Rear elbow.",
    "Lead hook. Rear knee. Step out.",
    "Jab. Cross. Lead elbow. Rear knee.",
    "Rear teep. Jab. Rear low kick.",
    "Jab. Cross. Lead knee. Step out.",
    "Check. Jab. Rear teep.",
    "Jab. Lead hook. Rear elbow.",
    "Lead teep. Cross. Rear knee.",
    "Jab. Rear elbow. Lead elbow.",
    "Cross. Lead hook. Two knees. Step out."
];
    // Deliberate punch sequences, extended only with compatible finishes.
    // No random technique-word concatenation occurs during a workout.
    const stems=[
        'Jab. Cross.','Double jab. Cross.','Jab to the body. Cross to the head.',
        'Slip. Cross.','Jab. Rear uppercut.','Jab. Cross to the body.',
        'Lead uppercut. Cross.','Step back. Cross.','Jab to the head. Cross to the body.',
        'Jab. Slip. Cross.','Jab. Cross. Roll. Cross.','Double jab. Rear uppercut.',
        'Jab. Lead hook. Cross.','Slip. Jab. Cross.','Lead hook to the body. Cross.',
        'Rear uppercut. Lead hook. Cross.','Jab. Step back. Cross.','Double jab. Cross to the body.'
    ];
    const extend=(starts,ends)=>starts.flatMap(start=>ends.map(end=>start+' '+end)).filter(text=>text.split('.').filter(t=>t.trim()).length<=5);
    const boxing=[...new Set([...originals.slice(0,36),...extend(stems,[
        'Lead hook.','Lead uppercut.','Lead hook to the body.','Lead hook to the head.',
        'Lead hook. Cross.','Lead uppercut. Cross.','Lead hook to the body. Cross.','Lead hook. Roll. Cross.'
    ])])];
    const kickAdditions=[...new Set([...originals.slice(36,68),...extend([...stems,
        'Lead front kick. Jab. Cross.','Rear low kick. Jab. Cross.','Check. Jab. Cross.','Lead low kick. Cross.'
    ],['Rear low kick.','Rear body kick.','Lead low kick.','Lead body kick.','Rear front kick.','Lead front kick.'])])];
    const thaiAdditions=[...new Set([...originals.slice(68),...extend([...stems,
        'Lead teep. Jab. Cross.','Check. Cross.','Rear teep. Jab. Cross.','Lead body kick. Cross.'
    ],['Rear knee. Step out.','Lead knee. Step out.','Lead elbow.','Rear elbow.','Lead elbow. Rear knee.','Two knees. Step out.'])])];
    const lines=[...boxing,...kickAdditions,...thaiAdditions];
    const movements=[
        ['Circle left. Keep your stance.','Kierrä vasemmalle. Säilytä otteluasento.','Nach links kreisen. Kampfstellung halten.'],
        ['Circle right. Keep your guard up.','Kierrä oikealle. Pidä suojaus ylhäällä.','Nach rechts kreisen. Deckung oben halten.'],
        ['Step in. Step out. Stay balanced.','Askel sisään. Askel ulos. Pidä tasapaino.','Schritt rein. Schritt raus. Gleichgewicht halten.'],
        ['Move left. Move right. Keep your feet apart.','Liiku vasemmalle ja oikealle. Pidä jalat erillään.','Links bewegen. Rechts bewegen. Füße auseinander halten.'],
        ['Stay light. Small steps. Hands up.','Liiku kevyesti, pienin askelin. Kädet ylös.','Leicht bleiben. Kleine Schritte. Hände hoch.'],
        ['Slip left. Slip right. Stay relaxed.','Väistä vasemmalle ja oikealle. Pysy rentona.','Links ausweichen. Rechts ausweichen. Locker bleiben.'],
        ['Step back. Reset. Come forward again.','Askel taakse. Palaa asentoon. Liiku taas eteen.','Schritt zurück. Neu ausrichten. Wieder vorwärts.'],
        ['Pivot out. Face your target.','Käänny sivuun. Pidä katse kohteessa.','Seitlich rausdrehen. Zum Ziel ausrichten.'],
        ['Use your feet. Change the angle.','Liikuta jalkoja. Vaihda kulmaa.','Füße bewegen. Winkel wechseln.'],
        ['Keep moving. Breathe. Find your rhythm.','Jatka liikettä. Hengitä. Löydä rytmisi.','In Bewegung bleiben. Atmen. Rhythmus finden.'],
        ['Move forward and back. Keep your stance.','Liiku eteen ja taakse. Säilytä otteluasento.','Vor und zurück bewegen. Kampfstellung halten.'],
        ['Hands up. Chin down. Circle your target.','Kädet ylös. Leuka alas. Kierrä kohdetta.','Hände hoch. Kinn runter. Um das Ziel kreisen.'],
        ['Take a small step out. Reset your guard.','Pieni askel ulos. Palauta suojaus.','Kleinen Schritt raus. Deckung neu ausrichten.'],
        ['Loose shoulders. Quiet feet. Stay ready.','Rennot hartiat. Kevyet askeleet. Pysy valmiina.','Lockere Schultern. Leise Füße. Bereit bleiben.'],
        ['Stay on balance. Turn with your feet.','Pidä tasapaino. Käänny jalkojen mukana.','Gleichgewicht halten. Mit den Füßen drehen.'],
        ['Step to the side. Reset. Eyes forward.','Askel sivuun. Palaa asentoon. Katse eteen.','Schritt zur Seite. Neu ausrichten. Blick nach vorn.']
    ];
    const comments = [
    "Keep your guard up.",
    "Chin down. Eyes forward.",
    "Breathe out with every strike.",
    "Hands back to your guard.",
    "Stay balanced.",
    "Relax your shoulders.",
    "Move your feet.",
    "Stay sharp. Keep working.",
    "Reset your stance.",
    "Good work. Stay focused.",
    "Control the power. Keep the technique.",
    "Stay light on your feet.",
    "Keep your elbows in.",
    "Finish strong.",
    "Find your rhythm.",
    "Stay loose. Stay ready.",
    "Let's go! Sharp and fast.",
    "Push the pace. Stay in control.",
    "That's it! Keep working.",
    "Strong finish. You've got this.",
    "Quick hands. Back to guard.",
    "Stay with me. Keep moving.",
    "Good! Now stay sharp.",
    "Commit to the combo. Let's go!",
    "Move with purpose. Keep it clean.",
    "Keep that energy. You're doing great."
];
    const previewText = "Ready? Listen for the combination. Let's work.";
    const sportCounts={boxing:boxing.length,k1:boxing.length+kickAdditions.length,muaythai:lines.length};
    const pools=Object.fromEntries(Object.entries(sportCounts).map(([sport,count])=>[sport,
        Object.fromEntries(['light','steady','hard'].map(level=>[level,Array.from({length:count},(_,i)=>i)]))
    ]));
    const intensity = {
        light: {rounds:3, seconds:120, rest:30},
        steady: {rounds:4, seconds:120, rest:30},
        hard: {rounds:5, seconds:120, rest:30}
    };
    function plan(sport, level) {
        if (!pools[sport] || !intensity[level]) throw new Error('Unknown coach session');
        const recipe=intensity[level];
        return {id:`coach-${sport}-${level}`, title:'Coach Rounds', voicePilot:true,
            coachRounds:{sport,level,...recipe,combos:pools[sport][level].map(i=>lines[i]),comments,movements:movements.map(m=>m[0])},
            sections:[{title:`Rounds - ${recipe.rounds} x 2 min, 30 s rest`,rounds:Array.from({length:recipe.rounds},(_,i)=>[`Round ${i+1} - Coach Rounds`,'Listen for the next combination.'])}]};
    }
    return {lines,comments,movements,sportCounts,previewText,pools,intensity,plan,restText:'Rest. Breathe, reset your stance and get ready for the next round.'};
})();

// Only catalogue progress is stored locally: no account, audio or workout history.
function createCoachRoundsMemory(storage){
    const cache=new Map();
    const fingerprint=pool=>{let h=2166136261;for(const char of pool.join('\n'))h=Math.imul(h^char.charCodeAt(0),16777619);return (h>>>0).toString(16);};
    return {
        read(sport,pool){
            const key='fightwise_coach_progress_v1:'+sport;
            let saved=cache.get(key);
            try{const raw=storage.getItem(key);if(raw&&raw.length<150000)saved=JSON.parse(raw);}catch{}
            if(!saved||saved.signature!==fingerprint(pool)||!Array.isArray(saved.remaining)||saved.remaining.length>pool.length)return null;
            const allowed=new Set(pool);
            if(saved.remaining.some(t=>!allowed.has(t))||new Set(saved.remaining).size!==saved.remaining.length)return null;
            return {remaining:[...saved.remaining],last:allowed.has(saved.last)?saved.last:''};
        },
        write(sport,pool,progress){
            const key='fightwise_coach_progress_v1:'+sport;
            const saved={signature:fingerprint(pool),remaining:[...progress.remaining],last:progress.last};
            cache.set(key,saved);try{storage.setItem(key,JSON.stringify(saved));}catch{}
        }
    };
}

// Execution allowance in seconds, measured after the last spoken technique.
function coachComboExecutionTime(text){
    const parts=text.split('.').map(t=>t.trim()).filter(Boolean);
    const doubles=(text.match(/\bdouble\b/gi)||[]).length;
    const triples=(text.match(/\btriple\b/gi)||[]).length;
    const slowerActions=(text.match(/\b(?:kick|knee|elbow|roll|slip|pivot|switch|step)\b/gi)||[]).length;
    return .25+(parts.length+doubles+triples*2)*.65+slowerActions*.3;
}

function createCoachRoundsController(output) {
    let generation=0,key=null,running=false,busy=false,due=0,current='',latest=null;
    let comboBag=[],tipBag=[],movementBag=[],poolSignature='',lastCombo='',lastTip='',lastMovement='',currentMovement='',sinceTip=0,nextTip=4,burstLeft=0;
    const random=output.random||Math.random;
    function draw(list,bag,last,eligible=()=>true){
        if(!bag.length){
            bag.push(...list);
            for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
            // A fresh bag cannot immediately repeat the previous bag's last call.
            if(bag.length>1&&bag[bag.length-1]===last)[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];
        }
        // Avoid near-identical openings even when the full combinations differ.
        const opening=t=>t.split('.').slice(0,2).join('.');
        let index=bag.findLastIndex(eligible);
        if(index<0)return null;
        if(last&&opening(bag[index])===opening(last)){
            const alternative=bag.findIndex(t=>eligible(t)&&opening(t)!==opening(last));if(alternative>=0)index=alternative;
        }
        return bag.splice(index,1)[0];
    }
    function invalidate(){generation++;busy=false;output.cancelSpeech();output.stopSounds();}
    function guidanceThreshold(){return latest.level==='light'?2+Math.floor(random()*2):latest.level==='hard'?5+Math.floor(random()*4):4+Math.floor(random()*3);}
    function delayAfter(text,kind){
        if(!latest.level)return kind==='tip'?2:null; // Compatibility for the plain cue-controller contract.
        const range=(min,max)=>min+random()*(max-min);
        if(kind==='movement')return latest.level==='light'?range(3,5):range(1.5,2.5);
        if(kind==='tip')return range(.5,1.3);
        const techniques=text.split('.').filter(t=>t.trim()).length;
        // This starts AFTER speech ends: tightening the recording must not remove execution time.
        const execution=coachComboExecutionTime(text);
        if(latest.level==='light')return Math.max(range(1.8,3.8)+techniques*.12,execution+.8);
        if(latest.level==='steady')return Math.max(range(1,2.7)+techniques*.1,execution+.4);
        if(burstLeft>0){burstLeft--;return execution+range(0,.45);}
        burstLeft=1+Math.floor(random()*2);
        return execution+range(.25,.65);
    }
    function speak(text,kind='combo'){
        const ticket=generation;busy=true;
        if(kind==='tip')output.onTip?.(text);
        else if(kind==='movement'){currentMovement=text;output.onMovement?.(text);output.onTip?.('');}
        else {current=text;currentMovement='';output.onMovement?.('');output.onCombo(text);output.onTip?.('');}
        const started=latest.elapsed;
        Promise.resolve().then(()=>{
            if(ticket!==generation||!running)return;
            return output.speak(text);
        }).catch(error=>{
            // A stalled clip has already been stopped by the player. Keep coaching
            // after the athlete has had time to perform the displayed instructions.
            if(error?.name!=='TimeoutError')throw error;
        }).then(()=>{
            if(ticket!==generation||!running)return;
            const delay=delayAfter(text,kind);
            due=delay===null?Math.max(started+(latest.cadence||7),latest.elapsed+2):latest.elapsed+delay;
        }).catch(()=>{if(ticket===generation&&running)output.onError();})
        .finally(()=>{if(ticket===generation)busy=false;});
    }
    function next(forceCombo=false){
        const remaining=latest.duration===undefined?Infinity:latest.duration-latest.elapsed;
        if(remaining<6){busy=false;due=Infinity;return;}
        if(!forceCombo&&remaining>12&&sinceTip>=nextTip&&(latest.comments?.length||latest.movements?.length)){
            sinceTip=0;nextTip=guidanceThreshold();burstLeft=0;
            const movementChance=latest.level==='light' ? .8 : latest.level==='steady' ? .3 : .1;
            if(latest.movements?.length&&(!latest.comments?.length||random()<movementChance)){
                lastMovement=draw(latest.movements,movementBag,lastMovement);speak(lastMovement,'movement');
            }else{lastTip=draw(latest.comments,tipBag,lastTip);speak(lastTip,'tip');}
            return;
        }
        const combo=draw(latest.combos,comboBag,lastCombo,text=>remaining>=9||text.split('.').filter(t=>t.trim()).length<=3);
        if(!combo){busy=false;due=Infinity;return;}
        lastCombo=combo;
        output.remember?.(latest,{remaining:comboBag,last:lastCombo});
        sinceTip++;speak(lastCombo);
    }
    return {
        update(state){
            latest=state;
            const signature=JSON.stringify(state.combos);
            if(signature!==poolSignature){
                poolSignature=signature;
                const saved=output.restore?.(state);
                comboBag=saved?.remaining?[...saved.remaining]:[];lastCombo=saved?.last||'';
                tipBag=[];movementBag=[];lastTip='';lastMovement='';sinceTip=0;nextTip=state.level?guidanceThreshold():4;burstLeft=0;
            }
            if(!state.running){if(running)invalidate();running=false;return;}
            const resumed=!running;running=true;
            if(key!==state.key){
                invalidate();key=state.key;current='';currentMovement='';due=0;burstLeft=0;
                output.onStep?.();
                const ticket=generation;busy=true;
                const bell=state.bellEnabled?output.bell(state.rest):Promise.resolve();
                Promise.resolve(bell).catch(()=>{}).then(()=>{
                    if(ticket!==generation||!running)return;
                    if(latest.rest)speak(COACH_ROUNDS.restText);else next(true);
                });
                return;
            }
            if(resumed){if(currentMovement)speak(currentMovement,'movement');else if(current)speak(current);else if(state.rest)speak(COACH_ROUNDS.restText);else next(true);return;}
            if(!state.rest&&!busy&&state.elapsed>=due)next();
        },
        reset(){invalidate();key=null;running=false;current='';currentMovement='';latest=null;due=0;comboBag=[];tipBag=[];movementBag=[];poolSignature='';sinceTip=0;burstLeft=0;},
        current(){return current;}
    };
}

let coachRoundSport='boxing',coachRoundLevel='steady',coachRoundCue='',coachRoundError=false,coachRoundTip='',coachRoundMovement='',coachSetupStep=0;
function coachText(en,fi,de){return settings.language==='fi'?fi:settings.language==='de'?de:en;}
function coachSportName(sport){return sport==='boxing'?coachText('Boxing','Nyrkkeily','Boxen'):sport==='k1'?coachText('Kickboxing','Potkunyrkkeily','Kickboxen'):'Muay Thai';}
function coachLevelName(level){return ({light:coachText('Light','Kevyt','Leicht'),steady:coachText('Steady','Reipas','Mittel'),hard:coachText('Hard','Kova','Hart')})[level];}
function coachPaceDescription(level){return ({
    light:coachText('Technique, footwork and room to learn.','Tekniikkaa, liikkumista ja aikaa oppia.','Technik, Beinarbeit und Zeit zum Lernen.'),
    steady:coachText('Varied calls. Keep your rhythm.','Vaihteleva rytmi. Pysy liikkeessä.','Wechselnde Ansagen. Im Rhythmus bleiben.'),
    hard:coachText('Hard pace. Time to finish each combo.','Kova tahti. Aikaa tehdä jokainen yhdistelmä.','Hohes Tempo. Zeit für jede Kombination.')
})[level];}
function openCoachRounds(){
    cancelCoachSpeech();coachSetupStep=0;
    modeChoice.classList.add('hidden');trainingSection.classList.add('hidden');sparringSetup.classList.add('hidden');
    document.getElementById('coachRoundsSection').hidden=false;
    renderCoachRoundsPicker('coachSetupHeading');
}
function closeCoachRoundsSetup(){cancelCoachSpeech();showModeChoice();}
function selectCoachSport(sport){if(!COACH_ROUNDS.pools[sport])return;coachRoundSport=sport;renderCoachRoundsPicker('coach-sport-'+sport);}
function selectCoachIntensity(level){if(!COACH_ROUNDS.intensity[level])return;coachRoundLevel=level;renderCoachRoundsPicker('coach-level-'+level);}
function playCoachRoundsPreview(coach){unlockAppAudio();speakCoachText(COACH_ROUNDS.previewText,coach).catch(()=>{});}
function selectRoundCoach(coach){if(!['max','maya'].includes(coach))return;setCoachVoice(coach);renderCoachRoundsPicker('coach-voice-'+coach);playCoachRoundsPreview(coach);}
function moveCoachSetup(direction){
    cancelCoachSpeech();
    if(direction<0&&coachSetupStep===0){closeCoachRoundsSetup();return;}
    if(direction>0&&coachSetupStep===2){startCoachRounds();return;}
    coachSetupStep=Math.max(0,Math.min(2,coachSetupStep+(direction>0?1:-1)));
    renderCoachRoundsPicker('coachSetupHeading');
    if(coachSetupStep===1)playCoachRoundsPreview(settings.coachVoice);
}
function coachSportDescription(sport){return sport==='boxing'?coachText('Hands only.','Vain käsitekniikoita.','Nur Fausttechniken.'):sport==='k1'?coachText('Punches and kicks.','Lyöntejä ja potkuja.','Schläge und Tritte.'):coachText('Punches, kicks, knees and elbows.','Lyönnit, potkut, polvet ja kyynärpäät.','Schläge, Tritte, Knie und Ellbogen.');}
function renderCoachRoundsPicker(focusId){
    const root=document.getElementById('coachRoundsSection');if(!root||root.hidden)return;
    const r=COACH_ROUNDS.intensity[coachRoundLevel],total=r.rounds*r.seconds+(r.rounds-1)*r.rest;
    const labels=[coachText('Sport','Laji','Sportart'),coachText('Coach','Coach','Coach'),coachText('Intensity','Intensiteetti','Intensität')];
    const titles=[coachText('Choose your sport','Valitse laji','Wähle deine Sportart'),coachText('Choose your coach','Valitse coach','Wähle deinen Coach'),coachText('Set the intensity','Valitse intensiteetti','Wähle die Intensität')];
    const hints=[coachText('Your combinations match your sport.','Yhdistelmät valitsemasi lajin mukaan.','Kombinationen passend zu deiner Sportart.'),coachText('Tap a coach to hear the voice.','Kuuntele ääni painamalla coachia.','Tippe auf einen Coach, um die Stimme zu hören.'),coachText('Choose the pace for today.','Valitse tähän päivään sopiva tahti.','Wähle das Tempo für heute.')];
    const marker='<span class="coach-choice-check" aria-hidden="true">✓</span>';
    let choices;
    if(coachSetupStep===0)choices=['boxing','k1','muaythai'].map(s=>`<button id="coach-sport-${s}" class="coach-choice-card coach-sport-choice" aria-pressed="${s===coachRoundSport}" onclick="selectCoachSport('${s}')"><span class="coach-choice-main"><strong>${coachSportName(s)}</strong><span>${coachSportDescription(s)}</span><small>${COACH_ROUNDS.sportCounts[s]} ${coachText('combinations','yhdistelmää','Kombinationen')}</small></span>${s===coachRoundSport?marker:''}</button>`).join('');
    else if(coachSetupStep===1)choices=['max','maya'].map(c=>`<button id="coach-voice-${c}" class="coach-choice-card" aria-pressed="${settings.coachVoice===c}" onclick="selectRoundCoach('${c}')"><img class="coach-choice-art" src="Coach ${c==='max'?'Max':'Maya'}.png" alt=""><span class="coach-choice-main"><strong>${c==='max'?'Max':'Maya'}</strong><span>${c==='max'?coachText('Energetic · Clear','Energinen · Selkeä','Energisch · Klar'):coachText('Encouraging · Punchy','Kannustava · Napakka','Ermutigend · Kraftvoll')}</span><small>▷ ${coachText('Hear voice','Kuuntele ääni','Stimme hören')}</small></span>${settings.coachVoice===c?marker:''}</button>`).join('');
    else choices=Object.entries(COACH_ROUNDS.intensity).map(([level,v])=>`<button id="coach-level-${level}" class="coach-choice-card" aria-pressed="${level===coachRoundLevel}" onclick="selectCoachIntensity('${level}')"><img class="coach-choice-art" src="Intensity ${level[0].toUpperCase()+level.slice(1)}.svg" alt=""><span class="coach-choice-main"><strong>${coachLevelName(level)}</strong><span>${v.rounds} × 2 min · 30 s ${coachText('rest','tauko','Pause')}</span><small>${coachPaceDescription(level)}</small></span>${level===coachRoundLevel?marker:''}</button>`).join('');
    root.innerHTML=`<div class="coach-rounds-panel coach-setup-panel" data-coach-i18n>
        <div class="coach-setup-top"><button class="coach-home" onclick="closeCoachRoundsSetup()">← ${coachText('Home','Etusivu','Startseite')}</button><span>Coach Rounds</span></div>
        <ol class="coach-setup-progress" aria-label="${coachText('Setup progress','Valintojen vaiheet','Einrichtungsschritte')}">${labels.map((label,i)=>`<li class="${i<=coachSetupStep?'reached':''}"${i===coachSetupStep?' aria-current="step"':''}>${i+1}. ${label}</li>`).join('')}</ol>
        <h1 id="coachSetupHeading" tabindex="-1">${titles[coachSetupStep]}</h1><p class="coach-intro">${hints[coachSetupStep]}</p>
        <div class="coach-setup-choices" role="group" aria-label="${titles[coachSetupStep]}">${choices}</div>
        ${coachSetupStep===1?`<p class="coach-detail">${coachText('Prerecorded English AI coach voices.','Valmiiksi tallennetut englanninkieliset tekoälyäänet.','Aufgezeichnete englische KI-Coach-Stimmen.')}</p>`:coachSetupStep===2?`<p class="coach-session-info">${coachSportName(coachRoundSport)} · ${settings.coachVoice==='maya'?'Maya':'Max'} · ${formatTime(total)}</p><p class="coach-detail">${coachText('Warm up before starting.','Lämmittele ennen aloitusta.','Vor dem Start aufwärmen.')}</p>`:''}
        <div class="coach-setup-footer"><button onclick="moveCoachSetup(-1)">${coachText('Back','Takaisin','Zurück')}</button><button class="coach-setup-next" onclick="moveCoachSetup(1)">${coachSetupStep===2?coachText('Start session','Aloita harjoitus','Einheit starten'):coachText('Continue','Jatka','Weiter')}</button></div>
    </div>`;
    if(focusId){document.getElementById(focusId)?.focus({preventScroll:true});if(focusId==='coachSetupHeading')root.scrollTop=0;}
}
function startCoachRounds(){
    cancelCoachSpeech();
    const plan=COACH_ROUNDS.plan(coachRoundSport,coachRoundLevel);
    coachRoundError=false;coachRoundCue='';coachRoundTip='';coachRoundMovement='';
    startTrainingPlan(getTrainingDuration(plan),'COACH ROUNDS',null,null,plan);
}
function renderCoachRoundsGuide(step){
    const plan=activeTrainingWorkout.coachRounds;
    const paused=!!sessionStats.startedAt&&!timerState.isRunning;
    const round=trainingTimeline.filter(s=>s.kind==='round').indexOf(step)+1;
    const movement=COACH_ROUNDS.movements.find(m=>m[0]===coachRoundMovement);
    const movementText=movement?.[settings.language==='fi'?1:settings.language==='de'?2:0]||coachRoundMovement;
    const cue=step.kind==='rest'?coachText('Breathe. Reset.','Hengitä. Palaudu.','Atmen. Erholen.'):movementText||coachRoundCue;
    const parts=cue?cue.split('.').map(x=>x.trim()).filter(Boolean):[];
    const terms={fi:{'Jab':'Etusuora','Cross':'Takasuora','Double jab':'Tuplaetusuora','Lead hook':'Etukoukku','Lead uppercut':'Etukäden alakoukku','Rear low kick':'Takajalan alapotku','Rear body kick':'Takajalan vartalopotku','Rear teep':'Takajalan työntöpotku','Lead elbow':'Etukäden kyynärpää','One rear knee':'Yksi takajalan polvi','Two knees':'Kaksi polvea','Step out':'Poistu','Slip':'Väistö','Check':'Potkublokki','Jab to the body':'Etusuora vartaloon','Cross to the head':'Takasuora päähän'},de:{'Jab':'Jab','Cross':'Cross','Double jab':'Doppelter Jab','Lead hook':'Führungshaken','Lead uppercut':'Führhand-Aufwärtshaken','Rear low kick':'Lowkick hinten','Rear body kick':'Körpertritt hinten','Rear teep':'Teep hinten','Lead elbow':'Ellbogen vorne','One rear knee':'Ein hinteres Knie','Two knees':'Zwei Knie','Step out':'Rausgehen','Slip':'Ausweichen','Check':'Kick blocken','Jab to the body':'Jab zum Körper','Cross to the head':'Cross zum Kopf'}};
    const extraTerms={
        'Lead hook to the body':['Etukoukku vartaloon','Führungshaken zum Körper'],
        'Lead hook to the head':['Etukoukku päähän','Führungshaken zum Kopf'],
        'Cross to the body':['Takasuora vartaloon','Cross zum Körper'],
        'Jab to the head':['Etusuora päähän','Jab zum Kopf'],
        'Rear uppercut':['Takakäden alakoukku','Hinterer Aufwärtshaken'],
        'Roll':['Sukella lyönnin ali','Unter dem Schlag abtauchen'],
        'Step back':['Askel taakse','Schritt zurück'],
        'Pivot out':['Käänny sivuun','Seitlich rausdrehen'],
        'Lead body kick':['Etujalan vartalopotku','Körpertritt vorne'],
        'Lead low kick':['Etujalan alapotku','Lowkick vorne'],
        'Lead front kick':['Etujalan työntöpotku','Frontkick vorne'],
        'Rear front kick':['Takajalan työntöpotku','Frontkick hinten'],
        'Lead teep':['Etujalan työntöpotku','Teep vorne'],
        'Lead knee':['Etujalan polvi','Knie vorne'],
        'Rear knee':['Takajalan polvi','Knie hinten'],
        'Rear elbow':['Takakäden kyynärpää','Ellbogen hinten']
    };
    for(const [term,pair] of Object.entries(extraTerms)){terms.fi[term]=pair[0];terms.de[term]=pair[1];}
    const reminderTranslations={
        'Keep your guard up.':['Pidä suojaus ylhäällä.','Deckung oben halten.'],
        'Chin down. Eyes forward.':['Leuka alas. Katse eteen.','Kinn runter. Blick nach vorn.'],
        'Breathe out with every strike.':['Hengitä ulos jokaisella iskulla.','Bei jedem Schlag ausatmen.'],
        'Hands back to your guard.':['Palauta kädet suojaukseen.','Hände zurück in die Deckung.'],
        'Stay balanced.':['Pidä tasapaino.','Im Gleichgewicht bleiben.'],
        'Relax your shoulders.':['Rentouta hartiat.','Schultern locker lassen.'],
        'Move your feet.':['Liikuta jalkoja.','Füße bewegen.'],
        'Stay sharp. Keep working.':['Pysy tarkkana. Jatka työtä.','Wach bleiben. Weiterarbeiten.'],
        'Reset your stance.':['Palaa otteluasentoon.','Kampfstellung neu ausrichten.'],
        'Good work. Stay focused.':['Hyvää työtä. Keskity.','Gute Arbeit. Konzentriert bleiben.'],
        'Control the power. Keep the technique.':['Hallitse voima. Pidä tekniikka.','Kraft kontrollieren. Technik halten.'],
        'Stay light on your feet.':['Liiku kevyesti.','Leicht auf den Füßen bleiben.'],
        'Keep your elbows in.':['Pidä kyynärpäät lähellä vartaloa.','Ellbogen eng am Körper halten.'],
        'Finish strong.':['Tee loppuun asti vahvasti.','Stark abschließen.'],
        'Find your rhythm.':['Löydä rytmisi.','Finde deinen Rhythmus.'],
        'Stay loose. Stay ready.':['Pysy rentona ja valmiina.','Locker und bereit bleiben.'],
        "Let's go! Sharp and fast.":['Nyt mennään! Terävästi ja nopeasti.','Los geht’s! Präzise und schnell.'],
        'Push the pace. Stay in control.':['Lisää vauhtia. Pidä hallinta.','Tempo erhöhen. Kontrolliert bleiben.'],
        "That's it! Keep working.":['Juuri noin! Jatka työtä.','Genau so! Weiterarbeiten.'],
        "Strong finish. You've got this.":['Vahvasti loppuun. Sinä pystyt tähän.','Stark abschließen. Du schaffst das.'],
        'Quick hands. Back to guard.':['Nopeat kädet. Takaisin suojaukseen.','Schnelle Hände. Zurück in die Deckung.'],
        'Stay with me. Keep moving.':['Pysy mukana. Jatka liikettä.','Bleib bei mir. Weiter bewegen.'],
        'Good! Now stay sharp.':['Hyvä! Pysy tarkkana.','Gut! Jetzt wach bleiben.'],
        "Commit to the combo. Let's go!":['Tee yhdistelmä päättäväisesti. Mennään!','Kombination entschlossen ausführen. Los geht’s!'],
        'Move with purpose. Keep it clean.':['Liiku tarkoituksella. Pidä tekniikka puhtaana.','Gezielt bewegen. Sauber bleiben.'],
        "Keep that energy. You're doing great.":['Pidä energia yllä. Hyvin menee.','Energie halten. Du machst das gut.']
    };
    const tip=reminderTranslations[coachRoundTip]?.[settings.language==='fi'?0:settings.language==='de'?1:2]||coachRoundTip;
    const error=coachRoundError?coachText('Coach audio could not play. Tap Continue to try again.','Coach-ääni ei käynnistynyt. Yritä uudelleen painamalla Jatka.','Coach-Audio konnte nicht starten. Mit Weiter erneut versuchen.'):'';
    return `<div class="guide-card" data-coach-i18n><div class="guide-round-label">${step.kind==='rest'?coachText('Rest','Tauko','Pause'):`${coachText('Round','Erä','Runde')} ${round}/${plan.rounds}`}</div>
      ${error?`<p role="alert" class="coach-error">${escapeHtml(error)}</p>`:''}
      ${paused?`<h2 class="guide-title">${coachText('Paused','Tauotettu','Pausiert')}</h2>`:parts.length?`<ol class="coach-combo">${parts.map(p=>`<li>${escapeHtml(terms[settings.language]?.[p]||p)}</li>`).join('')}</ol>`:`<h2 class="guide-title">${coachText('Listen and react','Kuuntele ja reagoi','Hören und reagieren')}</h2>`}
      <p class="coach-tip">${!paused&&step.kind!=='rest'?escapeHtml(tip):''}</p>
      <p class="coach-detail">${paused?coachText('Continue when ready.','Jatka, kun olet valmis.','Weiter, wenn du bereit bist.'):step.kind==='rest'?'':coachRoundMovement?coachText('Keep moving until the next call.','Jatka liikettä seuraavaan ohjeeseen asti.','Bis zur nächsten Ansage in Bewegung bleiben.'):coachText('Do the combo once. Stay ready.','Tee yhdistelmä kerran. Pysy valmiina.','Kombination einmal ausführen. Bereit bleiben.')}</p></div>`;
}
function initCoachRoundsUI(){
    const section=document.createElement('section');section.id='coachRoundsSection';section.hidden=true;section.className='coach-rounds-section';document.body.append(section);
    if(['boxing','k1','muaythai'].includes(selectedTrainingSport))coachRoundSport=selectedTrainingSport;
}
