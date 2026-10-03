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
// Recíprocas: secante, cosecante y cotangente, con sus alias.
near(value('sec(x)',0),1);near(value('sec(x)',pi/3),2);near(value('cosec(x)',pi/6),2);near(value('csc(x)',30,'deg'),2);
near(value('cotg(x)',pi/4),1);near(value('cot(x)',45,'deg'),1);near(value('ctg(x)',pi/4),1);near(value('2sec(x)',0),2);
assert.equal(value('cotg(x)',pi/2),0);assert.equal(value('cotg(x)',90,'deg'),0);
for(const unit of ['rad','deg']){
 const half=unit==='rad'?pi/2:90,full=unit==='rad'?pi:180;
 for(const f of ['sec(x)','sec(x)^2','1/cos(x)'])assert.ok(!Number.isFinite(value(f,half,unit)),f);
 for(const f of ['cosec(x)','cotg(x)','cosec(x)^2','1/sen(x)','cos(x)/sen(x)'])for(const x of [0,full])assert.ok(!Number.isFinite(value(f,x,unit)),f);
 assert.ok(!Number.isFinite(value('1/tan(x)',half,unit)));
}
for(const f of ['sec(x)','cosec(x)','cotg(x)','1+tan(x)^2'])assert.equal(M.properties(M.parse(f)),null);
assert.throws(()=>M.parse('sec x'));
// Pitagóricas derivadas y recíprocas, solo donde ambos lados están definidos.
for(let i=-100;i<=100;i++){const x=i*.05,s=Math.abs(Math.sin(x))>1e-6,c=Math.abs(Math.cos(x))>1e-6;
 if(c){near(value('1+tan(x)^2',x),value('sec(x)^2',x));near(value('sec(x)',x),value('1/cos(x)',x));}
 if(s){near(value('1+cotg(x)^2',x),value('cosec(x)^2',x));near(value('cosec(x)',x),value('1/sen(x)',x));near(value('cotg(x)',x),value('cos(x)/sen(x)',x));}
 if(s&&c)near(value('cotg(x)',x),value('1/tan(x)',x));}
console.log('OK: parser, parámetros, grados/radianes, discontinuidades e identidades.');
