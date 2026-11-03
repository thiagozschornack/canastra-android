export const SUITS=['♠','♥','♦','♣'];
export const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export const RULES={name:'Buraco Aberto — preset EmpreenderTHZ V10.0',decks:2,jokers:4,hand:11,dead:11,minimumMeld:3,minimumCanasta:7,goal:3000,cleanBonus:200,dirtyBonus:100,finishBonus:100,unusedDeadPenalty:100};
export const isWild=c=>c.rank==='2'||c.rank==='JK';
export const rankNum=c=>({A:14,J:11,Q:12,K:13})[c.rank]||Number(c.rank);
export const points=c=>c.rank==='JK'?50:c.rank==='2'?20:c.rank==='A'?15:rankNum(c)>=8?10:5;
export function deck(){let a=[];for(let d=0;d<2;d++)for(const suit of SUITS)for(const rank of RANKS)a.push({id:`${d}-${suit}-${rank}`,suit,rank});for(let j=0;j<4;j++)a.push({id:`joker-${j}`,suit:'',rank:'JK'});return a;}
export function shuffle(cards,rng=Math.random){const a=[...cards];for(let i=a.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
// Sequences only; 2 and joker are always wild. Ace high; no wrapping; at most one wild.
export function validateMeld(cards){if(cards.length<3)return {ok:false,reason:'O jogo precisa ter pelo menos 3 cartas.'};let wild=cards.filter(isWild),natural=cards.filter(c=>!isWild(c));if(wild.length>1)return {ok:false,reason:'Este preset permite no máximo um curinga por jogo.'};if(natural.length<2)return {ok:false,reason:'São necessárias duas cartas naturais.'};if(natural.some(c=>c.suit!==natural[0].suit))return {ok:false,reason:'As cartas naturais devem ter o mesmo naipe.'};let nums=natural.map(rankNum).sort((a,b)=>a-b);if(new Set(nums).size!==nums.length)return {ok:false,reason:'Não é permitido repetir o mesmo valor na sequência.'};let missing=nums[nums.length-1]-nums[0]+1-nums.length;if(missing>wild.length)return {ok:false,reason:'A sequência possui lacunas demais.'};if(nums[0]<3||nums[nums.length-1]>14)return {ok:false,reason:'Sequência fora dos valores permitidos.'};if(wild.length&&missing===0&&nums[0]===3&&nums[nums.length-1]===14)return {ok:false,reason:'Não há posição válida para o curinga.'};return {ok:true,clean:!wild.length,canasta:cards.length>=7,suit:natural[0].suit};}
export function teamOf(seat){return seat%2;}
export function scoreTeam(state,team){const melds=state.melds[team];const meldPoints=melds.flat().reduce((s,c)=>s+points(c),0);const bonuses=melds.reduce((s,m)=>s+(m.length>=7?(m.some(isWild)?RULES.dirtyBonus:RULES.cleanBonus):0),0);const hands=state.hands.reduce((s,h,i)=>s+(teamOf(i)===team?h.reduce((a,c)=>a+points(c),0):0),0);const unusedDead=state.deadTaken[team]?0:RULES.unusedDeadPenalty;const finish=state.winner===team?RULES.finishBonus:0;return {meldPoints,bonuses,hands,unusedDead,finish,total:meldPoints+bonuses+finish-hands-unusedDead};}
export function makeGame(rng=Math.random){let cards=shuffle(deck(),rng);const hands=Array.from({length:4},()=>cards.splice(0,11));const dead=[cards.splice(0,11),cards.splice(0,11)];const discard=[cards.pop()];return {hands,dead,stock:cards,discard,melds:[[],[]],deadTaken:[false,false],deadPending:[false,false],turn:0,phase:'draw',winner:null,over:false,log:[],round:1,totals:[0,0],lastMove:'Partida iniciada',events:[{type:'start',seat:0,message:'Cartas distribuídas'}]};}
export function hasCanasta(state,team){return state.melds[team].some(m=>m.length>=7);}
export function canFinish(state,seat){const t=teamOf(seat);return state.deadTaken[t]&&hasCanasta(state,t);}
export function takeDeadIfNeeded(state,seat,afterDiscard=false){let t=teamOf(seat);if(state.hands[seat].length!==0||state.deadTaken[t])return false;if(state.dead.length){state.hands[seat]=state.dead.shift();state.deadTaken[t]=true;state.deadPending[t]=afterDiscard;state.lastMove=`${seatName(seat)} pegou o morto`;return true;}return false;}
export const seatName=s=>['Você','Lia','Rafa','Nina'][s];
export function endRound(state,winner=null,reason=null){if(state.over)return state.scores;state.over=true;state.winner=winner;state.endReason=reason||(winner===null?'stock':'finish');const scores=[scoreTeam(state,0),scoreTeam(state,1)];state.totals=state.totals.map((x,i)=>x+scores[i].total);state.scores=scores;state.events?.push({type:'end',winner,scores});state.lastMove=winner===null?(state.endReason==='blocked'?'Rodada encerrada: mão bloqueada':'Rodada encerrada: monte esgotado'):`Rodada encerrada: ${winner===0?'sua dupla':'dupla adversária'} bateu`;return scores;}
export function nextTurn(state){state.turn=(state.turn+1)%4;state.phase='draw';const t=teamOf(state.turn);if(state.deadPending[t])state.deadPending[t]=false;if(!state.stock.length)endRound(state,null);}
export function draw(state,seat,source){if(state.over||state.turn!==seat||state.phase!=='draw')return {ok:false,reason:'Não é sua vez de comprar.'};if(source==='stock'){if(!state.stock.length){endRound(state);return {ok:false,reason:'O monte acabou.'};}state.hands[seat].push(state.stock.pop());}else if(source==='discard'){if(!state.discard.length)return {ok:false,reason:'O lixo está vazio.'};state.hands[seat].push(...state.discard.splice(0));}else return {ok:false,reason:'Origem inválida.'};state.phase='play';state.lastMove=`${seatName(seat)} ${source==='stock'?'comprou do monte':'pegou o lixo'}`;state.events?.push({type:'draw',seat,source,count:source==='discard'?state.hands[seat].length:1,message:state.lastMove});return {ok:true};}
export function lay(state,seat,ids,target=null){if(state.over||state.turn!==seat||state.phase!=='play')return {ok:false,reason:'Compre antes de baixar cartas.'};if(!ids.length||new Set(ids).size!==ids.length)return {ok:false,reason:'Selecione cartas válidas.'};const hand=state.hands[seat];const cards=ids.map(id=>hand.find(c=>c.id===id));if(cards.some(c=>!c))return {ok:false,reason:'Carta não encontrada na mão.'};let t=teamOf(seat),meld=target===null?cards:[...(state.melds[t][target]||[]),...cards];if(target!==null&&!state.melds[t][target])return {ok:false,reason:'Jogo de destino inválido.'};let validation=validateMeld(meld);if(!validation.ok)return validation;
// Without a dead pile, a player may only empty their hand if the team can finish.
const leaves=hand.length-cards.length;
const canFinishAfter=state.deadTaken[t]&&(hasCanasta(state,t)||meld.length>=7);
if(leaves===0&&((state.deadTaken[t]&&!canFinishAfter)||(!state.deadTaken[t]&&!state.dead.length)))return {ok:false,reason:'Para bater, sua dupla precisa ter pego o morto e formado uma canastra.'};
state.hands[seat]=hand.filter(c=>!ids.includes(c.id));if(target===null)state.melds[t].push(cards);else state.melds[t][target]=meld;state.lastMove=`${seatName(seat)} ${target===null?'baixou':'ampliou'} uma sequência`;state.events?.push({type:'meld',seat,ids:[...ids],target,message:state.lastMove});
if(state.hands[seat].length===0){if(!takeDeadIfNeeded(state,seat)&&canFinish(state,seat))endRound(state,t);}
return {ok:true};}
export function discardCard(state,seat,id){if(state.over||state.turn!==seat||state.phase!=='play')return {ok:false,reason:'Compre antes de descartar.'};let h=state.hands[seat],c=h.find(c=>c.id===id);if(!c)return {ok:false,reason:'Selecione uma carta para descartar.'};let t=teamOf(seat);if(h.length===1&&!state.dead.length&&!canFinish(state,seat))return {ok:false,reason:'Não é possível bater sem morto e canastra.'};state.hands[seat]=h.filter(x=>x.id!==id);state.discard.push(c);state.lastMove=`${seatName(seat)} descartou ${c.rank}${c.suit}`;state.events?.push({type:'discard',seat,id,message:state.lastMove});if(!state.hands[seat].length){if(!takeDeadIfNeeded(state,seat,true)&&canFinish(state,seat)){endRound(state,t);return {ok:true};}}nextTurn(state);return {ok:true};}
export function findCandidates(hand){let out=[];for(const suit of SUITS){let naturals=hand.filter(c=>c.suit===suit&&!isWild(c)).sort((a,b)=>rankNum(a)-rankNum(b));let unique=[];for(const c of naturals)if(!unique.some(x=>x.rank===c.rank))unique.push(c);for(let i=0;i<unique.length;i++)for(let j=i+1;j<unique.length&&j<i+11;j++){let part=unique.slice(i,j+1);if(part.length>=3&&validateMeld(part).ok)out.push(part);if(part.length>=2){for(const wild of hand.filter(isWild).slice(0,2)){let cand=[...part,wild];if(validateMeld(cand).ok)out.push(cand);}}}}return out.sort((a,b)=>(b.length>=7?30:0)+b.length*3-b.filter(isWild).length*2-((a.length>=7?30:0)+a.length*3-a.filter(isWild).length*2));}
// A bot evaluates only its own hand, the public discard pile and public team melds.
export function cardPotential(card,hand,teamMelds=[]){
 if(isWild(card))return 60;
 let value=points(card);
 for(const other of hand){if(other.id===card.id||isWild(other)||other.suit!==card.suit)continue;
  const distance=Math.abs(rankNum(card)-rankNum(other));
  if(distance===1)value+=23;else if(distance===2)value+=13;else if(distance===3)value+=4;
 }
 for(const meld of teamMelds)if(validateMeld([...meld,card]).ok)value+=35;
 return value;
}
export function chooseBotDiscard(hand,teamMelds,level='intermediate',discard=[],opponentMelds=[]){
 const top=discard.at(-1);
 const scored=hand.map(card=>{
  let value=cardPotential(card,hand,teamMelds);
  if(level==='beginner')value=points(card)+(isWild(card)?25:0);
  if(level==='advanced'&&top&&!isWild(top)&&!isWild(card)&&card.suit===top.suit&&Math.abs(rankNum(card)-rankNum(top))<=2)value+=18;
  if(level==='advanced'&&opponentMelds.some(m=>validateMeld([...m,card]).ok))value+=65;
  return {card,value};
 });
 scored.sort((a,b)=>a.value-b.value||points(a.card)-points(b.card));
 return scored[0]?.card;
}
export function chooseBotDraw(state,seat,level){
 if(!state.discard.length)return 'stock';
 const pile=state.discard,top=pile.at(-1),hand=state.hands[seat],melds=state.melds[teamOf(seat)];
 if(level==='beginner')return 'stock';
 const immediatelyUseful=melds.some(m=>validateMeld([...m,top]).ok)||findCandidates([...hand,top]).some(m=>m.some(c=>c.id===top.id));
 const canUseOther=level==='advanced'&&pile.length>=2&&pile.length<=5&&pile.some(c=>melds.some(m=>validateMeld([...m,c]).ok));
 const potential=level==='advanced'&&pile.length<=12&&pile.reduce((n,c)=>n+(melds.some(m=>validateMeld([...m,c]).ok)?2:0),0)>=2;return immediatelyUseful||canUseOther||potential?'discard':'stock';
}
export function botPlay(state,seat,level='intermediate'){
 if(state.over||state.turn!==seat)return;
 if(state.phase==='draw'){
  const source=chooseBotDraw(state,seat,level);
  const result=draw(state,seat,source);
  if(!result.ok||state.over)return;
 }
 let iterations=0;
 while(state.phase==='play'&&!state.over&&iterations++<35){
  const team=teamOf(seat),hand=state.hands[seat],melds=state.melds[team];
  const options=[];
  for(let target=0;target<melds.length;target++){
   for(const c of hand)if(validateMeld([...melds[target],c]).ok){
    const makesCanasta=melds[target].length===6;
    options.push({ids:[c.id],target,score:17+(makesCanasta?75:0)+points(c)*.2});
   }
  }
  for(const m of findCandidates(hand)){
   if(level==='beginner'&&m.some(isWild))continue;
   const makesCanasta=m.length>=7;
   const natural=m.filter(c=>!isWild(c)).length;
   let score=m.length*8+(makesCanasta?95:0)+natural*2;
   if(level==='advanced'){
    const remaining=hand.filter(c=>!m.some(x=>x.id===c.id));
    score+=remaining.reduce((v,c)=>v+cardPotential(c,remaining,melds),0)*.025;
    if(m.some(isWild)&&!makesCanasta)score-=15;
    if(!state.deadTaken[team]&&hand.length===m.length)score+=40;
   }
   options.push({ids:m.map(c=>c.id),target:null,score});
  }
  options.sort((a,b)=>b.score-a.score);
  let moved=false;
  for(const option of options){
   const result=lay(state,seat,option.ids,option.target);
   if(result.ok){moved=true;break;}
  }
  if(!moved)break;
 }
 if(state.over||state.phase!=='play')return;
 const hand=state.hands[seat];
 if(!hand.length)return;
 const discard=chooseBotDiscard(hand,state.melds[teamOf(seat)],level,state.discard,state.melds[1-teamOf(seat)]);
 if(hand.length===1&&!state.dead.length&&!canFinish(state,seat)){
  // The preset forbids emptying a hand without a legal finish.
  // With no legal finish, the hand cannot be emptied; a stock-exhausted round
  // must be resolved by the regular turn/stock rules, never by an AI shortcut.
  state.events?.push({type:'blocked',seat,message:'Mão bloqueada: não há descarte legal'});
  endRound(state,null,'blocked');return;
 }
 discardCard(state,seat,discard.id);
}
export function assertConservation(state){let all=[...state.hands.flat(),...state.dead.flat(),...state.stock,...state.discard,...state.melds.flat(2)];return all.length===108&&new Set(all.map(c=>c.id)).size===108;}

export function snapshot(state){return JSON.parse(JSON.stringify(state));}
export function verifyState(state){if(!state||!Array.isArray(state.hands)||state.hands.length!==4||!Array.isArray(state.melds)||state.melds.length!==2||![0,1,2,3].includes(state.turn)||!['draw','play'].includes(state.phase))return false;return Array.isArray(state.dead)&&Array.isArray(state.stock)&&Array.isArray(state.discard)&&Array.isArray(state.hands)&&state.hands.every(Array.isArray)&&state.melds.every(Array.isArray)&&Array.isArray(state.deadTaken)&&state.deadTaken.length===2&&Array.isArray(state.deadPending)&&state.deadPending.length===2&&assertConservation(state);}
export function scoreBreakdown(state){return [scoreTeam(state,0),scoreTeam(state,1)];}

// Deterministic seed for reproducible QA and independent round replays.
export function seededRandom(seed){let x=(seed>>>0)||0x6d2b79f5;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
export function publicState(state,seat=0){return {round:state.round,turn:state.turn,phase:state.phase,over:state.over,winner:state.winner,stockCount:state.stock.length,discard:[...state.discard],deadCount:state.dead.length,handCounts:state.hands.map(h=>h.length),ownHand:[...state.hands[seat]],melds:state.melds.map(team=>team.map(m=>[...m])),deadTaken:[...state.deadTaken],totals:[...state.totals],lastMove:state.lastMove};}
export function auditState(state){const problems=[];if(!verifyState(state))problems.push('Integridade ou estrutura inválida');if(state.melds.some(team=>team.some(m=>!validateMeld(m).ok)))problems.push('Jogo baixado inválido');if(state.deadTaken.some(x=>typeof x!=='boolean'))problems.push('Morto inválido');if(!Array.isArray(state.events))problems.push('Histórico de eventos ausente');if(state.over&&!['stock','blocked','finish'].includes(state.endReason|| (state.winner===null?'stock':'finish')))problems.push('Motivo de encerramento inválido');if(state.over&&(!Array.isArray(state.scores)||state.scores.length!==2||state.scores.some(s=>!Number.isFinite(s.total))))problems.push('Rodada encerrada sem placar válido');return {ok:problems.length===0,problems};}

// A command gateway for deterministic integration tests and future authoritative servers.
// Returns an immutable-style copy; an invalid command leaves the input unchanged.
export function applyCommand(game,command){
 const next=snapshot(game);let result;
 if(!command||!Number.isInteger(command.seat))return {ok:false,reason:'Comando inválido',state:game};
 switch(command.type){
 case 'draw':result=draw(next,command.seat,command.source);break;
 case 'lay':result=lay(next,command.seat,command.ids||[],command.target??null);break;
 case 'discard':result=discardCard(next,command.seat,command.id);break;
 default:return {ok:false,reason:'Ação desconhecida',state:game};
 }
 if(!result.ok)return {...result,state:game};
 const audit=auditState(next);
 if(!audit.ok)return {ok:false,reason:'Invariante violada: '+audit.problems.join('; '),state:game};
 return {ok:true,state:next};
}
export function legalActions(game,seat){
 if(game.over||game.turn!==seat)return [];
 if(game.phase==='draw')return [
 ...(game.stock.length?[{type:'draw',source:'stock'}]:[]),
 ...(game.discard.length?[{type:'draw',source:'discard'}]:[])];
 const result=[];
 for(const m of findCandidates(game.hands[seat]))result.push({type:'lay',ids:m.map(c=>c.id),target:null});
 for(let i=0;i<game.melds[teamOf(seat)].length;i++)for(const c of game.hands[seat])
 if(validateMeld([...game.melds[teamOf(seat)][i],c]).ok)result.push({type:'lay',ids:[c.id],target:i});
 for(const c of game.hands[seat]){
 const test=applyCommand(game,{type:'discard',seat,id:c.id});
 if(test.ok)result.push({type:'discard',id:c.id});
 }
 return result;
}

// V8: analyze a proposed play without modifying the active game.
export function previewMeld(game,seat,ids,target=null){
 if(!game||game.over||game.turn!==seat||game.phase!=='play')return {ok:false,reason:'Aguarde sua vez após comprar.'};
 if(!Array.isArray(ids)||!ids.length)return {ok:false,reason:'Selecione pelo menos uma carta.'};
 const result=applyCommand(game,{type:'lay',seat,ids,target});
 if(!result.ok)return {ok:false,reason:result.reason};
 const t=teamOf(seat),meld=target===null?result.state.melds[t].at(-1):result.state.melds[t][target];
 return {ok:true,canasta:meld.length>=7,clean:!meld.some(isWild),length:meld.length,remaining:result.state.hands[seat].length};
}

// V9: public-facing integrity report, never reveals opponent hands.
export function gameDiagnostics(state){
 const audit=auditState(state);
 return {valid:audit.ok,problems:audit.problems,turn:state.turn,phase:state.phase,stockCount:state.stock.length,discardCount:state.discard.length,handCounts:state.hands.map(h=>h.length),meldCounts:state.melds.map(m=>m.length),endReason:state.endReason||null};
}

// Randomness for browser games: crypto source when available; deterministic seeds remain for tests.
export function secureRandom(){
 if(typeof globalThis.crypto==='undefined'||typeof globalThis.crypto.getRandomValues!=='function')return Math.random();
 const max=0x100000000, bound=max-(max%0x1000000);const a=new Uint32Array(1);
 do{globalThis.crypto.getRandomValues(a);}while(a[0]>=bound);return (a[0]%0x1000000)/0x1000000;
}
