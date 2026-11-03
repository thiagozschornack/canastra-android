import assert from 'node:assert/strict';
import {makeGame,seededRandom,botPlay,auditState,chooseBotDiscard,chooseBotDraw,validateMeld,deck,publicState} from './core.mjs';
assert.equal(deck().length,108);
assert.equal(validateMeld([{id:'a',rank:'5',suit:'♠'},{id:'b',rank:'6',suit:'♠'},{id:'c',rank:'7',suit:'♠'}]).ok,true);
assert.equal(validateMeld([{id:'a',rank:'5',suit:'♠'},{id:'b',rank:'6',suit:'♥'},{id:'c',rank:'7',suit:'♠'}]).ok,false);
const sample=[{id:'1',rank:'5',suit:'♠'},{id:'2',rank:'6',suit:'♠'},{id:'3',rank:'K',suit:'♥'}];
assert.equal(chooseBotDiscard(sample,[],'advanced').id,'3');
let finished=0,batidas=0,exhausted=0;
for(let seed=1;seed<=500;seed++){
 const g=makeGame(seededRandom(seed));
 assert.equal(chooseBotDraw(g,0,'beginner'),'stock');
 for(let turn=0;turn<1800&&!g.over;turn++){
  botPlay(g,g.turn,['beginner','intermediate','advanced'][seed%3]);
  const audit=auditState(g);
  assert.ok(audit.ok,`seed=${seed} turn=${turn}: ${audit.problems.join(', ')}`);
 }
 assert.ok(g.over,`seed ${seed} failed to terminate`);
 assert.ok(g.scores.every(s=>Number.isFinite(s.total)));
 const view=publicState(g,0);
 assert.equal('hands' in view,false);
 assert.equal('stock' in view,false);
 assert.equal('dead' in view,false);
 finished++;
 if(g.winner===null)exhausted++;else batidas++;
}
console.log(JSON.stringify({status:'PASS',seededRounds:finished,batidas,withoutBatida:exhausted,checks:['conservation','valid melds','scoring finite','hidden hands','bot turn completion','discard preference']},null,2));
