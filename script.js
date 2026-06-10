const app = document.getElementById('app');
const teams = ['Australia','France','Brazil','Argentina','England','Japan','Germany','Spain','Italy','Netherlands','Portugal','USA','Mexico','South Korea','Morocco','Croatia'];
const symbols = { add: '+', sub: '−', mul: '×', div: '÷' };
let state = {};
function reset(){
  state = { screen:'home', ops:{add:true,sub:true,mul:true,div:true}, targetGoals:3, player1:{name:'Player 1',team:null,level:1,score:0,correct:0,total:0,times:[],streak:0}, player2:{name:'Player 2',team:null,level:1,score:0,correct:0,total:0,times:[],streak:0}, placementIndex:0, activePlayer:1, ball:0, questions:{}, matchStart:0 };
}
reset();
function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function choice(arr){return arr[Math.floor(Math.random()*arr.length)]}
function enabledOps(){let arr=Object.keys(state.ops).filter(k=>state.ops[k]); return arr.length?arr:['add'];}
function question(level, placement=false){
  const op = choice(enabledOps());
  let a,b,ans,text;
  const easy = level<=0, hard = level>=2;
  if(op==='add'){
    if(easy){a=rand(10,89);b=rand(1,9)} else if(hard){a=rand(120,699);b=rand(80,399)} else {a=rand(20,299);b=rand(10,99)}
    ans=a+b;text=`${a} + ${b}`;
  }
  if(op==='sub'){
    if(easy){a=rand(20,99);b=rand(1,9)} else if(hard){a=rand(250,799);b=rand(80,249)} else {a=rand(80,399);b=rand(10,99)}
    if(b>a)[a,b]=[b,a]; ans=a-b;text=`${a} − ${b}`;
  }
  if(op==='mul'){
    const facts = easy?[2,5,10]: hard?[3,4,6,7,8,9]:[2,3,4,5,6,10];
    a=choice(facts); b=hard?rand(3,12):rand(2,10); ans=a*b;text=`${a} × ${b}`;
  }
  if(op==='div'){
    const divisors = easy?[2,5,10]: hard?[3,4,6,7,8,9]:[2,3,4,5,6,10];
    b=choice(divisors); ans=hard?rand(3,12):rand(2,10); a=b*ans;text=`${a} ÷ ${b}`;
  }
  return { text, ans, op, started: Date.now() };
}
function html(strings,...vals){return strings.map((s,i)=>s+(vals[i]??'')).join('')}
function render(){
  if(state.screen==='home') home();
  if(state.screen==='teams') teamSelect();
  if(state.screen==='placement') placement();
  if(state.screen==='match') match();
  if(state.screen==='result') result();
}
function home(){
  app.innerHTML = html`<div class="screen"><h1>⚽ Maths World Cup</h1><p>Offline Year 3 four operations soccer battle</p><div class="card"><h2>Teacher Settings</h2><p class="muted">Choose which operations appear in the match.</p><div class="settings">
  ${opCheck('add','Addition')} ${opCheck('sub','Subtraction')} ${opCheck('mul','Multiplication')} ${opCheck('div','Division')}
</div><p class="small">First to 3 goals wins. Placement round is 5 questions per player.</p></div><button class="big-btn" onclick="goTeams()">Start Match</button></div>`;
}
function opCheck(key,label){return `<label class="check"><input type="checkbox" ${state.ops[key]?'checked':''} onchange="state.ops.${key}=this.checked"> ${symbols[key]} ${label}</label>`}
window.goTeams=()=>{ if(!enabledOps().length) state.ops.add=true; state.screen='teams'; render(); }
function teamSelect(){
  app.innerHTML = html`<div class="screen"><h2>Choose Teams</h2><div class="setup-grid"><div class="card player-pick"><div class="player-label">Player 1: ${state.player1.team??'Choose'}</div><div class="teams">${teams.map(t=>teamBtn(1,t)).join('')}</div></div><div class="card player-pick"><div class="player-label">Player 2: ${state.player2.team??'Choose'}</div><div class="teams">${teams.map(t=>teamBtn(2,t)).join('')}</div></div></div><button class="big-btn" ${state.player1.team&&state.player2.team?'':'disabled'} onclick="startPlacement()">Placement Round</button></div>`;
}
function teamBtn(p,t){const sel=state[`player${p}`].team===t?'selected':'';return `<button class="team ${sel}" onclick="pickTeam(${p},'${t}')">${flag(t)}<br>${t}</button>`}
function flag(t){return {Australia:'🇦🇺',France:'🇫🇷',Brazil:'🇧🇷',Argentina:'🇦🇷',England:'🏴',Japan:'🇯🇵',Germany:'🇩🇪',Spain:'🇪🇸',Italy:'🇮🇹',Netherlands:'🇳🇱',Portugal:'🇵🇹',USA:'🇺🇸',Mexico:'🇲🇽','South Korea':'🇰🇷',Morocco:'🇲🇦',Croatia:'🇭🇷'}[t]||'🏳️'}
window.pickTeam=(p,t)=>{ if(state.player1.team===t||state.player2.team===t){ if(state[`player${p}`].team!==t) return; } state[`player${p}`].team=t; render(); }
window.startPlacement=()=>{ state.screen='placement'; state.activePlayer=1; state.placementIndex=0; state.questions.placement=question(1,true); render(); }
function placement(){
 const p=state[`player${state.activePlayer}`]; const q=state.questions.placement;
 app.innerHTML=html`<div class="screen"><div class="card question-box"><h2>${flag(p.team)} ${p.team}</h2><p>Placement question ${state.placementIndex+1} of 5</p><div class="question">${q.text} = ?</div><div class="answer-row"><input id="ans" class="answer" type="number" inputmode="numeric" autofocus><button class="submit" onclick="submitPlacement()">Go</button></div></div></div>`;
 document.getElementById('ans').focus(); document.getElementById('ans').onkeydown=e=>{if(e.key==='Enter')submitPlacement()};
}
window.submitPlacement=()=>{
 const val=Number(document.getElementById('ans').value); const p=state[`player${state.activePlayer}`]; const q=state.questions.placement; const dt=(Date.now()-q.started)/1000;
 p.total++; if(val===q.ans)p.correct++; p.times.push(dt); state.placementIndex++;
 if(state.placementIndex<5){state.questions.placement=question(1,true); render(); return;}
 setLevel(p); if(state.activePlayer===1){state.activePlayer=2;state.placementIndex=0;state.questions.placement=question(1,true);render();return;}
 startMatch();
}
function setLevel(p){const acc=p.correct/Math.max(1,p.total); const avg=p.times.reduce((a,b)=>a+b,0)/Math.max(1,p.times.length); p.level=(acc>=.8&&avg<=5)?2:(acc<=.4||avg>=11)?0:1;}
function startMatch(){state.screen='match';state.ball=0;state.player1.score=0;state.player2.score=0;state.player1.correct=state.player1.total=0;state.player2.correct=state.player2.total=0;state.questions.p1=question(state.player1.level);state.questions.p2=question(state.player2.level);state.matchStart=Date.now();render();}
function match(){
 const p1=state.player1,p2=state.player2;
 app.innerHTML=html`<div class="split">
  ${half(2,p2,state.questions.p2,'top')}
  ${half(1,p1,state.questions.p1,'bottom')}
  <div class="pitch">${Array.from({length:7}).map(()=>'<div class="spot"></div>').join('')}<div class="ball" style="left:${((state.ball+3)/6)*100}%">⚽</div></div>
  <div class="scorebar"><div class="score">${flag(p1.team)} ${p1.score}</div><div class="score">${p2.score} ${flag(p2.team)}</div></div>
 </div>`;
 ['ans1','ans2'].forEach(id=>{const el=document.getElementById(id); if(el) el.onkeydown=e=>{if(e.key==='Enter')submitMatch(Number(id.slice(-1)))} });
}
function half(num,p,q,cls){return `<div class="player-half ${cls}" id="half${num}"><div class="hud"><span>${flag(p.team)} ${p.team}</span><span>${p.correct}/${p.total}</span></div><div class="question-box"><div class="question">${q.text} = ?</div><div class="answer-row"><input id="ans${num}" class="answer" type="number" inputmode="numeric"><button class="submit" onclick="submitMatch(${num})">Go</button></div></div></div>`}
window.submitMatch=(num)=>{
 const inp=document.getElementById('ans'+num); if(!inp||inp.value==='')return; const p=state[`player${num}`]; const q=state.questions[`p${num}`]; const val=Number(inp.value); p.total++;
 if(val===q.ans){p.correct++; const elapsed=(Date.now()-q.started)/1000; const move= elapsed<=4 ? 2 : 1; state.ball += num===1 ? move : -move; document.getElementById('half'+num)?.classList.add('flash');}
 else { state.ball += num===1 ? -1 : 1; }
 if(state.ball>=3){state.player1.score++; state.ball=0;}
 if(state.ball<=-3){state.player2.score++; state.ball=0;}
 if(state.player1.score>=state.targetGoals||state.player2.score>=state.targetGoals){state.screen='result'; render(); return;}
 state.questions[`p${num}`]=question(p.level); render();
}
function result(){const winner=state.player1.score>state.player2.score?state.player1:state.player2;app.innerHTML=html`<div class="screen"><div class="result-title">${flag(winner.team)} ${winner.team} wins!</div><div class="card stats"><p>${flag(state.player1.team)} ${state.player1.team}: ${state.player1.score} goals — ${state.player1.correct}/${state.player1.total} correct</p><p>${flag(state.player2.team)} ${state.player2.team}: ${state.player2.score} goals — ${state.player2.correct}/${state.player2.total} correct</p><p class="muted">Fast correct answers move the ball 2 spaces. Normal correct answers move it 1 space.</p></div><div class="row"><button class="big-btn" onclick="startMatch()">Rematch</button><button class="big-btn" onclick="reset();render()">New Game</button></div></div>`}
render();
