const assert=require('node:assert/strict'),M=require('../math.js'),pi=Math.PI;
const value=(f,x=0,u='rad')=>M.evaluate(M.parse(f),x,u);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
near(value('2sen(x-pi/2)+1',pi/2),1);
near(value('cos(2x)',90,'deg'),-1);
near(value('-2^2'),-4);near(value('2^3^2'),512);
near(value('sen(x)^2+cos(x)^2',1.7),1);
near(value('2sen(x)cos(x)',.7),value('sen(2x)',.7));
near(value('sen(x)^2-cos(x)^2',.7),-value('cos(2x)',.7));
assert.ok(Number.isNaN(value('tan(x)',pi/2)));
assert.ok(Number.isNaN(value('tg(x)',90,'deg')));
for(const unit of ['rad','deg']){
 const pole=unit==='rad'?pi/2:90;
 assert.ok(!Number.isFinite(value('sen(x)/cos(x)',pole,unit)));
 near(value('cos(x)',pole,unit),0);
 assert.ok(Number.isFinite(value('tan(x)',pole+1e-6,unit)));
}
let p=M.properties(M.parse('3sen(2x-pi)+1'));near(p.amplitude,3);near(p.period,pi);near(p.shift,pi/2);near(p.D,1);
p=M.properties(M.parse('-2*cos(-2*(x+pi/4))-3'));near(p.amplitude,2);near(p.period,pi);near(p.shift,-pi/4);near(p.D,-3);
p=M.properties(M.parse('tg(2x)'),'deg');assert.equal(p.amplitude,null);near(p.period,90);
assert.equal(M.properties(M.parse('sen(x)^2+cos(x)^2')),null);
assert.equal(M.properties(M.parse('sen(0x)')).constant,true);
assert.equal(M.properties(M.parse('0sen(x)')).period,null);
for(const f of ['1e999','alert(1)','x;console.log(1)','sen(x','sen()','2**x','globalThis','sen x'])assert.throws(()=>M.parse(f));
for(let i=-100;i<=100;i++){const x=i*.05;near(value('sen(x)^2+cos(x)^2',x),1);near(value('sen(2x)',x),value('2sen(x)cos(x)',x));near(value('cos(2x)',x),value('cos(x)^2-sen(x)^2',x));if(Math.abs(Math.cos(x))>1e-6)near(value('tan(x)',x),value('sen(x)/cos(x)',x));}
console.log('OK: parser, parámetros, grados/radianes, discontinuidades e identidades.');
