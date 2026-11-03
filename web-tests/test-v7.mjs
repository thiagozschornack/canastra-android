import assert from 'node:assert/strict';
import {makeGame,seededRandom,botPlay,auditState} from './core.mjs';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
const used=[...app.matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]);
for(const id of used)assert.ok(ids.has(id),`Missing UI control: ${id}`);
let completed=0,batidas=0;
for(let seed=1001;seed<=1200;seed++){const g=makeGame(seededRandom(seed));for(let step=0;step<2000&&!g.over;step++){botPlay(g,g.turn,seed%2?'advanced':'intermediate');assert.ok(auditState(g).ok,`Integrity failed seed ${seed}`);}assert.ok(g.over,`Round did not end seed ${seed}`);completed++;if(g.winner!==null)batidas++;}
console.log(JSON.stringify({version:'7.0',uiControlsChecked:used.length,rounds:completed,batidas,semBatida:completed-batidas,status:'PASS'},null,2));
