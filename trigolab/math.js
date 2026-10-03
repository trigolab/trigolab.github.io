/* Parser sin eval ni Function. Se comparte entre navegador y pruebas Node. */
(function(root){
'use strict';
const PI=Math.PI;
// cosec, cotg y ctg llegan como cosec, cotan y ctan porque tg ya se reemplazó por tan.
const FUNCTIONS=['sin','cos','tan','sec','csc','cot'],ALIASES={cosec:'csc',cotan:'cot',ctan:'cot'};
function parse(source){
 let input=source.toLowerCase().replace(/^\s*(?:y|f\(x\))\s*=\s*/,'').replace(/π/g,'pi').replace(/sen/g,'sin').replace(/tg/g,'tan').replace(/[−–]/g,'-').replace(/²/g,'^2').replace(/³/g,'^3');
 if(input.length>240)throw Error('La fórmula es demasiado larga (máximo 240 caracteres).');
 const raw=input.match(/\d*\.?\d+(?:e[+-]?\d+)?|[a-z]+|[()+\-*/^]/g)||[];
 if(raw.join('')!==input.replace(/\s/g,''))throw Error('Usá números, x, pi, sen, cos, tan, sec, cosec, cotg y operaciones + − * / ^.');
 for(let i=0;i<raw.length;i++)raw[i]=ALIASES[raw[i]]||raw[i];
 let tokens=[];
 const ends=t=>t===')'||t==='x'||t==='pi'||/^\d|^\.\d/.test(t);
 const starts=t=>t==='('||t==='x'||t==='pi'||FUNCTIONS.includes(t)||/^\d|^\.\d/.test(t);
 for(let i=0;i<raw.length;i++){if(i&&ends(raw[i-1])&&starts(raw[i]))tokens.push('*');tokens.push(raw[i]);}
 let p=0;
 function primary(){const t=tokens[p++];if(t==='('){const n=add();if(tokens[p++]!==')')throw Error('Falta cerrar un paréntesis.');return n;}if(t==='x')return {t:'x'};if(t==='pi')return {t:'n',v:PI};if(FUNCTIONS.includes(t)){if(tokens[p++]!=='(')throw Error('Escribí la función con paréntesis: sen(x).');const a=add();if(tokens[p++]!==')')throw Error('Falta cerrar el paréntesis de la función.');return {t:'fn',f:t,a};}if(t&&/^(\d|\.\d)/.test(t)){const v=Number(t);if(!Number.isFinite(v))throw Error('Ese número es demasiado grande.');return {t:'n',v};}throw Error('La fórmula está incompleta o contiene un nombre no admitido.');}
 function power(){let a=primary();if(tokens[p]==='^'){p++;a={t:'op',op:'^',a,b:unary()};}return a;}
 function unary(){if(tokens[p]==='+'||tokens[p]==='-'){const op=tokens[p++];return {t:'op',op:'*',a:{t:'n',v:op==='-'?-1:1},b:unary()};}return power();}
 function mul(){let a=unary();while(tokens[p]==='*'||tokens[p]==='/'){const op=tokens[p++];a={t:'op',op,a,b:unary()};}return a;}
 function add(){let a=mul();while(tokens[p]==='+'||tokens[p]==='-'){const op=tokens[p++];a={t:'op',op,a,b:mul()};}return a;}
 const n=add();if(p!==tokens.length)throw Error('Revisá los paréntesis y las operaciones.');return n;
}
function evaluate(n,x,unit='rad'){
 if(n.t==='n')return n.v;if(n.t==='x')return x;
 if(n.t==='fn'){let a=evaluate(n.a,x,unit)*(unit==='deg'?PI/180:1);const sine=Math.sin(a),cosine=Math.cos(a),zero=v=>Math.abs(v)<1e-14;if((n.f==='tan'||n.f==='sec')&&zero(cosine)||(n.f==='csc'||n.f==='cot')&&zero(sine))return NaN;const value=n.f==='sin'?sine:n.f==='cos'?cosine:n.f==='tan'?Math.tan(a):n.f==='sec'?1/cosine:n.f==='csc'?1/sine:cosine/sine;return zero(value)?0:value;}
 const a=evaluate(n.a,x,unit),b=evaluate(n.b,x,unit);return n.op==='+'?a+b:n.op==='-'?a-b:n.op==='*'?a*b:n.op==='/'?a/b:a**b;
}
function linear(n){
 if(n.t==='n')return [0,n.v];if(n.t==='x')return [1,0];if(n.t!=='op')return null;
 const a=linear(n.a),b=linear(n.b);if(!a||!b)return null;
 if(n.op==='+')return [a[0]+b[0],a[1]+b[1]];if(n.op==='-')return [a[0]-b[0],a[1]-b[1]];
 if(n.op==='*'&&(!a[0]||!b[0]))return [a[0]*b[1]+b[0]*a[1],a[1]*b[1]];
 if(n.op==='/'&&!b[0]&&b[1])return [a[0]/b[1],a[1]/b[1]];return null;
}
function transform(n){
 // Los indicadores (amplitud, período, desfasaje) solo se calculan para seno, coseno y tangente.
 if(n.t==='fn'){if(!['sin','cos','tan'].includes(n.f))return null;const l=linear(n.a);return l?{f:n.f,A:1,B:l[0],C:l[1],D:0}:null;}
 if(n.t!=='op')return null;
 const left=transform(n.a),right=transform(n.b),a=linear(n.a),b=linear(n.b);
 if(left&&b&&!b[0]){const k=b[1];if(n.op==='+')return {...left,D:left.D+k};if(n.op==='-')return {...left,D:left.D-k};if(n.op==='*')return {...left,A:left.A*k,D:left.D*k};if(n.op==='/'&&k)return {...left,A:left.A/k,D:left.D/k};}
 if(right&&a&&!a[0]){const k=a[1];if(n.op==='+')return {...right,D:right.D+k};if(n.op==='-')return {...right,A:-right.A,D:k-right.D};if(n.op==='*')return {...right,A:right.A*k,D:right.D*k};}return null;
}
function properties(n,unit='rad'){
 const v=transform(n);if(!v||![v.A,v.B,v.C,v.D].every(Number.isFinite))return null;
 const turn=unit==='deg'?360:2*PI;
 return {...v,constant:v.A===0||v.B===0,amplitude:v.f==='tan'?null:Math.abs(v.A),period:v.A===0||v.B===0?null:(v.f==='tan'?turn/2:turn)/Math.abs(v.B),shift:v.B===0?null:-v.C/v.B};
}
root.TrigoMath={parse,evaluate,properties,linear};if(typeof module!=='undefined')module.exports=root.TrigoMath;
})(typeof globalThis!=='undefined'?globalThis:this);
