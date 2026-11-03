import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeGame,seededRandom,botPlay,auditState,deck,publicState,applyCommand,gameDiagnostics,chooseBotDraw,validateMeld} from './core.mjs';
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]));
for(const [,id] of app.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.has(id),`Elemento ausente: ${id}`);
assert.equal(deck().length,108);
const game=makeGame(seededRandom(912));
assert.equal(gameDiagnostics(game).valid,true);
assert.equal(JSON.stringify(publicState(game,0)).includes(game.hands[1][0].id),false);
const before=JSON.stringify(game);
assert.equal(applyCommand(game,{type:'discard',seat:0,id:'invalid'}).ok,false);
assert.equal(JSON.stringify(game),before);
assert.equal(validateMeld([{id:'a',rank:'5',suit:'♠'},{id:'b',rank:'6',suit:'♠'},{id:'c',rank:'7',suit:'♠'}]).ok,true);
let completed=0,batidas=0,blocked=0,stock=0;
for(let seed=1;seed<=300;seed++){const g=makeGame(seededRandom(seed));for(let step=0;step<2500&&!g.over;step++){botPlay(g,g.turn,['beginner','intermediate','advanced'][seed%3]);const a=auditState(g);assert.ok(a.ok,`Rodada ${seed}: ${a.problems.join('; ')}`);}assert.ok(g.over,`Rodada ${seed} não terminou`);completed++;if(g.winner!==null)batidas++;else if(g.endReason==='blocked')blocked++;else stock++;}
console.log(JSON.stringify({version:'9.0',completed,batidas,blocked,stock,uiReferencesChecked:[...app.matchAll(/\$\('([^']+)'\)/g)].length,status:'PASS'},null,2));
