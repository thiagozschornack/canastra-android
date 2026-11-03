import assert from 'node:assert/strict';
import {makeGame,seededRandom,botPlay,auditState,publicState,draw,lay,discardCard,validateMeld} from './core.mjs';
let ended=0,stockEnds=0;
for(let seed=1;seed<=300;seed++){
 const g=makeGame(seededRandom(seed));
 assert.equal(draw(g,1,'stock').ok,false,'Other player cannot draw');
 assert.equal(lay(g,0,['not-a-card']).ok,false,'Cannot lay before draw');
 for(let i=0;i<1800&&!g.over;i++){
   botPlay(g,g.turn,['beginner','intermediate','advanced'][seed%3]);
   const audit=auditState(g);assert.ok(audit.ok,`Seed ${seed}, iteration ${i}: ${audit.problems}`);
 }
 assert.ok(g.over,`Seed ${seed}: round did not end`);
 assert.equal(g.scores.length,2);
 ended++;if(g.winner===null)stockEnds++;
 const view=publicState(g,0);assert.equal('stock' in view,false);assert.equal('hands' in view,false);assert.equal(view.ownHand.length,g.hands[0].length);
}
const a=makeGame(seededRandom(2026)),b=makeGame(seededRandom(2026));
assert.deepEqual(a.hands,b.hands,'Same seed gives same deal');
assert.equal(validateMeld([{id:'a',rank:'5',suit:'♠'},{id:'b',rank:'7',suit:'♠'},{id:'c',rank:'2',suit:'♥'}]).ok,true);
console.log(`OK V5: ${ended} seeded rounds; ${stockEnds} without finish; state audits, hidden information, deterministic deal and turn validation.`);
