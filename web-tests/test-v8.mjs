import assert from 'node:assert/strict';
import {makeGame,seededRandom,botPlay,auditState,previewMeld,applyCommand,validateMeld,deck,publicState} from './core.mjs';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]));
for(const [,id] of app.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.has(id),`Missing UI element: ${id}`);
assert.equal(deck().length,108);
const g=makeGame(seededRandom(91)),before=JSON.stringify(g);
assert.equal(previewMeld(g,0,[]).ok,false);
assert.equal(JSON.stringify(g),before,'Preview mutated game');
assert.equal(applyCommand(g,{type:'discard',seat:0,id:'invalid'}).ok,false);
assert.equal(JSON.stringify(g),before,'Invalid command mutated game');
assert.ok(!JSON.stringify(publicState(g,0)).includes(g.hands[1][0].id),'Hidden card exposed');
let completed=0,batidas=0;
for(let seed=1;seed<=300;seed++){const game=makeGame(seededRandom(seed));for(let step=0;step<2500&&!game.over;step++){botPlay(game,game.turn,['beginner','intermediate','advanced'][seed%3]);assert.ok(auditState(game).ok,`Invalid game ${seed}`);}assert.ok(game.over,`Unfinished game ${seed}`);completed++;if(game.winner!==null)batidas++;}
console.log(JSON.stringify({version:'8.0',completed,batidas,semBatida:completed-batidas,uiReferencesChecked:[...app.matchAll(/\$\('([^']+)'\)/g)].length,status:'PASS'},null,2));
