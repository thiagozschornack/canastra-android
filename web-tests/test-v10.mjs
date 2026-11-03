import assert from 'node:assert/strict';
import {makeGame,seededRandom,verifyState,auditState,endRound,secureRandom,applyCommand,scoreTeam} from './core.mjs';
for(let seed=1;seed<=100;seed++){const s=makeGame(seededRandom(seed));assert(verifyState(s));assert(auditState(s).ok);const before=JSON.stringify(s);const invalid=applyCommand(s,{type:'discard',seat:1,id:'invalid'});assert(!invalid.ok);assert.equal(JSON.stringify(s),before);endRound(s,null,'stock');const totals=[...s.totals];endRound(s,null,'stock');assert.deepEqual(s.totals,totals);assert.equal(s.events.filter(e=>e.type==='end').length,1);assert.equal(s.scores[0].total,scoreTeam(s,0).total);}
for(let i=0;i<100;i++){const n=secureRandom();assert(n>=0&&n<1);}
console.log('V10: 100 estados iniciais, 100 comandos inválidos, 100 encerramentos idempotentes e 100 valores RNG: OK');
