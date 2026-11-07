// First-launch preferences stay on this device. No account is required.
function createFightWiseSetup(host) {
    const key = 'fightwise_setup_v1';
    const copy = {
        fi: ['TEE FIGHTWISESTA OMASI', 'Valitse kieli', 'Miten treenaat?', 'Oma eräajastimesi', 'Miltä treenisi kuulostaa?', 'Valmista treeniin', 'Takaisin', 'Jatka', 'Aloita', 'Voit muuttaa kaikkia valintoja myöhemmin asetuksista.', 'Laji rajaa treenikirjaston sinulle sopivaksi.', 'Erän pituus', 'Tauon pituus', 'Erien määrä', 'Coach-ääni englanniksi', 'Selkeät, valmiit puheohjeet ohjattuihin treeneihin. Tekoälyllä tuotettu ääni.', 'Kelloäänet', 'Kellon toistot', 'Värinä', 'Kokeile coach-ääntä', 'Vaihe', 'Olet valmis. Hyvä treeni alkaa tästä.', 'Ohita käyttöönotto', 'Kaikki lajit', 'Nyrkkeily', 'K1', 'Muay Thai'],
        en: ['MAKE FIGHTWISE YOURS', 'Choose your language', 'How do you train?', 'Your round timer', 'Your training sound', 'Ready to train', 'Back', 'Continue', 'Start', 'You can change every choice later in settings.', 'Your sport filters the workout library for you.', 'Round length', 'Rest length', 'Number of rounds', 'English coach voice', 'Clear recorded instructions for guided workouts. AI-generated voice.', 'Round bells', 'Bell repetitions', 'Vibration', 'Preview coach voice', 'Step', 'You are ready. Your next session starts here.', 'Skip setup', 'All sports', 'Boxing', 'K1', 'Muay Thai'],
        de: ['DEIN FIGHTWISE', 'Wähle deine Sprache', 'Wie trainierst du?', 'Dein Rundentimer', 'Dein Trainingssound', 'Bereit fürs Training', 'Zurück', 'Weiter', 'Starten', 'Du kannst alle Angaben später in den Einstellungen ändern.', 'Deine Sportart filtert die Trainingsbibliothek.', 'Rundenlänge', 'Pausenlänge', 'Rundenanzahl', 'Englische Trainerstimme', 'Klare aufgezeichnete Trainingsanweisungen. KI-generierte Stimme.', 'Rundenglocken', 'Glockenwiederholungen', 'Vibration', 'Trainerstimme testen', 'Schritt', 'Alles bereit für dein nächstes Training.', 'Einrichtung überspringen', 'Alle Sportarten', 'Boxen', 'K1', 'Muay Thai']
    };
    let step = 0, draft, previousFocus, coachIntroPlayed = false;
    const root = document.createElement('div');
    root.id = 'firstRunSetup'; root.hidden = true;
    root.innerHTML = '<section role="dialog" aria-modal="true" aria-labelledby="setupHeading" class="setup-card"><header><span class="setup-brand"><img src="Fightwise app icon.png" alt="">FIGHTWISE</span><button type="button" id="setupSkip"></button></header><div id="setupProgress"></div><main id="setupBody"></main><footer><button type="button" id="setupBack"></button><button type="button" id="setupNext"></button></footer></section>';
    document.body.append(root);
    const el = id => root.querySelector('#' + id);
    const text = () => copy[draft.language] || copy.en;
    function select(name, label, options) {
        return `<label class="setup-field">${label}<select data-pref="${name}">${options.map(([value,title]) => `<option value="${value}" ${String(draft[name]) === String(value) ? 'selected' : ''}>${title}</option>`).join('')}</select></label>`;
    }
    function toggle(name,label,note='') { return `<label class="setup-toggle"><input type="checkbox" data-pref="${name}" ${draft[name] ? 'checked' : ''}><span><strong>${label}</strong>${note ? `<small>${note}</small>` : ''}</span></label>`; }
    function render() {
        const t=text();
        el('setupProgress').innerHTML = `<span>${t[20]} ${step+1} / 4</span><progress value="${step+1}" max="4" aria-label="${t[20]}"></progress>`;
        el('setupSkip').textContent=t[22]; el('setupBack').textContent=t[6]; el('setupBack').hidden=step===0; el('setupNext').textContent=step===3?t[8]:t[7];
        let body='';
        if(step===0) body=`<p class="setup-eyebrow">${t[0]}</p>`+select('language',t[1],[['en','English'],['fi','Suomi'],['de','Deutsch']]);
        if(step===1) body=`<p>${t[10]}</p><div class="setup-sports">${['all','boxing','k1','muaythai'].map((sport,i)=>`<button type="button" data-sport="${sport}" aria-pressed="${draft.sport===sport}">${t[23+i]}</button>`).join('')}</div>`;
        const local = (en,fi,de) => draft.language==='fi'?fi:draft.language==='de'?de:en;
        if(step===2) body='<p>'+local('Choose your voice. Tap a coach to hear an introduction.','Valitse äänesi. Kuuntele esittely napauttamalla coachia.','Wähle deine Stimme. Tippe für eine Hörprobe.')+'</p><div class="setup-coaches">'+[['max','Max',local('Energetic · Clear','Energinen · Selkeä','Energisch · Klar')],['maya','Maya',local('Encouraging · Punchy','Kannustava · Napakka','Motivierend · Direkt')]].map(([id,name,desc])=>'<button type="button" data-coach="'+id+'" aria-pressed="'+(draft.coachVoice===id)+'"><span class="coach-number">'+(id==='max'?'01':'02')+'</span><span><strong>'+name+'</strong><small>'+desc+'</small></span><span aria-hidden="true">▷</span></button>').join('')+'</div><p class="setup-hint">'+local('Recorded English instructions. AI-generated voices.','Valmiit englanninkieliset ohjeet. Tekoälyllä tuotetut äänet.','Aufgezeichnete englische Anweisungen. KI-generierte Stimmen.')+'</p><p id="setupAudioStatus" role="status"></p>';
        if(step===3) body='<p>'+local('The sound of a real round. Bell to start, gong to finish.','Oikean erän äänet. Kello aloittaa, gong päättää.','Wie im Ring: Glocke zum Start, Gong zum Ende.')+'</p>'+toggle('roundSoundsEnabled',t[16])+'<div class="setup-field"><span>'+t[17]+'</span><div class="settings-choice" role="group" aria-label="'+t[17]+'">'+[1,2,3].map(n=>'<button type="button" data-bell-repeat="'+n+'" aria-pressed="'+(draft.roundBellRepeats===n)+'">'+n+'</button>').join('')+'</div></div>'+toggle('uiClickSoundsEnabled',local('Button clicks','Painikeäänet','Tastentöne'))+toggle('vibrationEnabled',t[18]);
        el('setupBody').innerHTML=`<h1 id="setupHeading" tabindex="-1">${step===2?local('Your coach','Oma coach','Dein Coach'):step===3?local('Round bell','Eräkello','Rundenglocke'):t[step+1]}</h1>${body}<p class="setup-hint">${t[9]}</p>`;
        root.querySelectorAll('[data-bell-repeat]').forEach(button=>button.onclick=()=>{draft.roundBellRepeats=Number(button.dataset.bellRepeat);render();host.previewBell(draft.roundBellRepeats);});
        root.querySelectorAll('[data-pref]').forEach(input=>input.onchange=()=>{const name=input.dataset.pref;draft[name]=input.type==='checkbox'?input.checked: name==='language'?input.value:Number(input.value);if(name==='language')render();});
        root.querySelectorAll('[data-coach]').forEach(button=>button.onclick=async()=>{host.stopAudio();draft.coachVoice=button.dataset.coach;render();try{await host.preview(draft.coachVoice);}catch{const status=el('setupAudioStatus');if(status)status.textContent='Preview unavailable.';}});
        root.querySelectorAll('[data-sport]').forEach(button=>button.onclick=()=>{draft.sport=button.dataset.sport;render();});
        if(el('setupPreview')) el('setupPreview').onclick=async()=>{host.stopAudio();try{await host.preview();}catch{el('setupAudioStatus').textContent=draft.language==='fi'?'Äänen toisto ei onnistunut.':'Audio could not be played.';}};
        el('setupHeading').focus();
        if(step===2 && !coachIntroPlayed){coachIntroPlayed=true;draft.coachVoice='max';root.querySelectorAll('[data-coach]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.coach==='max')));host.preview('max').catch(()=>{});}
    }
    function close() { host.stopAudio(); root.hidden=true; document.body.classList.remove('setup-open'); host.showHome(); previousFocus?.focus(); }
    el('setupBack').onclick=()=>{host.stopAudio();step--;render();};
    el('setupNext').onclick=()=>{host.stopAudio();if(step<3){step++;render();return;}host.apply(draft);try{localStorage.setItem(key,'true');}catch{}close();host.tutorial();};
    el('setupSkip').onclick=()=>{try{localStorage.setItem(key,'true');}catch{}close();};
    root.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const nodes=[...root.querySelectorAll('button,select,input')].filter(n=>!n.hidden&&n.getClientRects().length);const first=nodes[0],last=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
    return { open(){previousFocus=document.activeElement;coachIntroPlayed=false;draft={...host.read(), voiceCoachEnabled:true};draft.coachVoice=draft.coachVoice||'max';step=0;root.hidden=false;document.body.classList.add('setup-open');render();}, completed(){try{return localStorage.getItem(key)==='true';}catch{return false;}} };
}
