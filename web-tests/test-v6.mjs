import assert from 'node:assert/strict';
import {makeGame,seededRandom,applyCommand,legalActions,auditState,botPlay,chooseBotDiscard} from './core.mjs';
let rounds=0,batidas=0;
for(let seed=1;seed<=300;seed++){
 const g=makeGame(seededRandom(seed));
 const illegal=applyCommand(g,{type:'discard',seat:1,id:'fake'});
 assert.equal(illegal.ok,false);assert.equal(illegal.state,g);
 assert.ok(legalActions(g,0).some(a=>a.type==='draw'));
 const move=applyCommand(g,{type:'draw',seat:0,source:'stock'});
 assert.ok(move.ok);assert.equal(g.phase,'draw');assert.equal(move.state.phase,'play');
 for(let i=0;i<2000&&!g.over;i++){botPlay(g,g.turn,seed%3===0?'advanced':'intermediate');assert.ok(auditState(g).ok,`seed=${seed},step=${i}`);}
 assert.ok(g.over,`seed=${seed} did not terminate`);rounds++;if(g.winner!==null)batidas++;
}
console.log(JSON.stringify({version:'6.0',status:'PASS',rounds,batidas,semBatida:rounds-batidas},null,2));
