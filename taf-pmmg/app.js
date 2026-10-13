const PLAN=[
["Segunda","Musculação A + corrida leve",["Supino reto 4x8-10","Desenvolvimento 3x10","Tríceps corda 3x12","Flexão de braço 3x até perto da falha","Corrida leve 20-30 min (conversando)"]],
["Terça","Corrida intervalada + core",["Aquecimento 10 min","6 a 8 tiros de 400 m, descanso 90 s","Desaquecimento 10 min","Prancha 3x45 s","Abdominal remador 3x20"]],
["Quarta","Musculação B (costas e bíceps)",["Barra fixa 4x máx (ou graviton)","Remada curvada 4x10","Puxada alta 3x10","Rosca direta 3x12","Corrida leve 15-20 min"]],
["Quinta","Corrida de ritmo + mobilidade",["25-30 min em ritmo forte e constante","Alongamento de pernas 10 min","Mobilidade de quadril e ombro"]],
["Sexta","Musculação C (pernas)",["Agachamento 4x8-10","Leg press 3x12","Stiff 3x10","Panturrilha 4x15","Abdominal 4x20"]],
["Sábado","Longão + simulado de TAF",["Corrida contínua 40-60 min leve","Simulado: flexões, abdominais e barra no máximo","Anote os resultados em Registrar"]],
["Domingo","Descanso leve",["Caminhada 30 min","Alongamento geral","Sono e hidratação em dia"]]];
const COL=["#b39a5b","#c8202a","#ece9e0","#7a7468","#d9b86a"];
const $=s=>document.querySelector(s);
const esc=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const today=()=>fmt(new Date());
const wk=s=>{const x=new Date(s+"T12:00:00");x.setDate(x.getDate()-((x.getDay()+6)%7));return fmt(x)};

/* ---------- Backend: Firebase (compartilhado) ou local (só neste navegador) ---------- */
const cfg=window.FIREBASE_CONFIG||{};
const cloud=!!(cfg.apiKey&&window.firebase);
let B;
if(cloud){
  firebase.initializeApp(cfg);
  const auth=firebase.auth(),fs=firebase.firestore();
  const mail=u=>u.toLowerCase().replace(/[^a-z0-9]/g,"")+"@tafpmmg.app";
  B={
    async up(u,p){const c=await auth.createUserWithEmailAndPassword(mail(u),p);await fs.doc("logs/"+c.user.uid).set({name:u,entries:[]})},
    in:(u,p)=>auth.signInWithEmailAndPassword(mail(u),p),
    out:()=>auth.signOut(),
    watchAuth:cb=>auth.onAuthStateChanged(x=>cb(x?x.uid:null)),
    watch:cb=>fs.collection("logs").onSnapshot(s=>{const o={};s.forEach(d=>o[d.id]=d.data());cb(o)},e=>console.error(e)),
    save:(id,m)=>fs.doc("logs/"+id).set(m)
  };
}else{
  const g=k=>{try{return JSON.parse(localStorage.getItem(k)||"{}")}catch(e){return{}}};
  const s=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  let cbA=null,cbW=null;
  const emit=()=>{cbA&&cbA(localStorage.getItem("taf_s")||null)};
  B={
    async up(u,p){const k=u.toLowerCase(),us=g("taf_u");if(us[k])throw{message:"Usuário já existe"};us[k]=p;s("taf_u",us);const d=g("taf_d");d[k]={name:u,entries:[]};s("taf_d",d);localStorage.setItem("taf_s",k);emit()},
    async in(u,p){const k=u.toLowerCase();if(g("taf_u")[k]!==p)throw{message:"Usuário ou senha incorretos"};localStorage.setItem("taf_s",k);emit()},
    async out(){localStorage.removeItem("taf_s");emit()},
    watchAuth(cb){cbA=cb;emit()},
    watch(cb){cbW=cb;cb(g("taf_d"));return()=>{}},
    save(id,m){const d=g("taf_d");d[id]=m;s("taf_d",d);cbW&&cbW(d)}
  };
}

/* ---------- Estado ---------- */
let uid=null,all={},unsub=null,tab="plano",metric="km";
const mine=()=>all[uid]||{name:"",entries:[]};
const msg=e=>{const c=e&&e.code||"";
  if(c.includes("email-already"))return"Usuário já existe.";
  if(c.includes("invalid-credential")||c.includes("wrong-password")||c.includes("user-not-found"))return"Usuário ou senha incorretos.";
  return(e&&e.message)||"Erro inesperado."};
async function save(m){try{await B.save(uid,m)}catch(e){alert("Não foi possível salvar: "+msg(e))}}

B.watchAuth(id=>{
  uid=id;if(unsub){unsub();unsub=null}all={};
  if(id)unsub=B.watch(o=>{all=o;render()});
  render();
});

/* ---------- Telas ---------- */
function login(){
  $("#app").innerHTML=`<div class="card"><h3>Entrar</h3>
  ${cloud?"":'<p class="mut">Modo local: os dados ficam só neste navegador. Para o gráfico geral entre os três, configure o Firebase (veja o README).</p>'}
  <label>Usuário</label><input id="u" autocapitalize="none" autocomplete="username">
  <label>Senha (mínimo 6 caracteres)</label><input id="p" type="password" autocomplete="current-password"><br><br>
  <div class="g"><button class="p" onclick="go(0)">Entrar</button><button onclick="go(1)">Criar conta</button></div></div>`;
}
async function go(n){
  const u=$("#u").value.trim(),p=$("#p").value;
  if(u.length<3||p.length<6)return alert("Use usuário com 3+ letras e senha com 6+ caracteres.");
  try{n?await B.up(u,p):await B.in(u,p)}catch(e){alert(msg(e))}
}
function render(){
  if(!uid)return login();
  const m=mine();
  const tabs=[["plano","Semana"],["reg","Registrar"],["graf","Gráfico geral"],["hist","Meu histórico"]];
  let h=`<div class="top"><span class="mut">Olá, <b style="color:var(--gold)">${esc(m.name)}</b></span><button onclick="B.out()">Sair</button></div>
  <nav>${tabs.map(t=>`<button class="${tab==t[0]?"on":""}" onclick="tab='${t[0]}';render()">${t[1]}</button>`).join("")}</nav>`;
  if(tab=="plano"){
    const t=(new Date().getDay()+6)%7;
    h+=PLAN.map((p,i)=>`<div class="card ${i==t?"today":""}"><h3>${p[0]}${i==t?'<span class="tag">HOJE</span>':""}</h3><b>${p[1]}</b><ul>${p[2].map(x=>`<li>${x}</li>`).join("")}</ul></div>`).join("")
     +'<p class="mut">Plano-base: ajuste carga e ritmo ao seu nível e confira as provas e índices do edital.</p>';
  }
  if(tab=="reg")h+=`<div class="card"><h3>Registrar treino</h3>
    <div class="g"><div><label>Data</label><input id="d" type="date" value="${today()}"></div>
    <div><label>Km corridos</label><input id="km" type="number" step="0.1" min="0"></div>
    <div><label>Minutos de corrida</label><input id="mi" type="number" min="0"></div>
    <div><label>Exercícios feitos (musculação)</label><input id="ex" type="number" min="0"></div></div>
    <label>Esforço (1 leve a 5 máximo)</label><input id="rp" type="number" min="1" max="5">
    <label>Como foi? (semana, sensações, flexões/abs/barra)</label><textarea id="nt" rows="3"></textarea><br><br>
    <button class="p" onclick="add()">Salvar treino</button></div>`;
  if(tab=="graf")h+=graf();
  if(tab=="hist")h+=`<div class="card"><h3>Meus treinos</h3>${m.entries.length?[...m.entries].sort((a,b)=>b.date.localeCompare(a.date)).map(e=>`<div class="row"><span>${e.date.split("-").reverse().join("/")} · ${e.km||0} km · ${e.ex||0} ex. · esforço ${e.rpe||"-"}<br><span class="mut">${esc(e.note)}</span></span><button onclick="del('${e.id}')">✕</button></div>`).join(""):'<p class="mut">Nenhum registro ainda.</p>'}</div>`;
  $("#app").innerHTML=h;
}
function add(){
  const m=mine(),e={id:Date.now().toString(36),date:$("#d").value||today(),km:+$("#km").value||0,min:+$("#mi").value||0,ex:+$("#ex").value||0,rpe:+$("#rp").value||0,note:$("#nt").value.trim().slice(0,300)};
  tab="hist";save({name:m.name,entries:[...m.entries,e]});
}
function del(id){const m=mine();save({name:m.name,entries:m.entries.filter(e=>e.id!=id)})}
function graf(){
  const us=Object.values(all).filter(u=>u&&u.name&&u.entries),ws=[];
  let c=new Date(wk(today())+"T12:00:00");
  for(let i=0;i<6;i++){ws.unshift(fmt(c));c.setDate(c.getDate()-7)}
  const val=(u,w)=>u.entries.filter(e=>wk(e.date)==w).reduce((s,e)=>s+(metric=="km"?e.km:metric=="ex"?e.ex:1),0);
  const data=us.map(u=>ws.map(w=>val(u,w))),mx=Math.max(1,...data.flat()),W=640,H=240,gw=W/6,bw=Math.min(28,(gw-14)/Math.max(1,us.length));
  let s=`<svg viewBox="0 0 ${W} ${H+30}" width="100%" style="min-width:480px">`;
  ws.forEach((w,i)=>{
    s+=`<text x="${i*gw+gw/2}" y="${H+18}" fill="#9a9585" font-size="12" text-anchor="middle">${w.slice(8)}/${w.slice(5,7)}</text>`;
    data.forEach((d,j)=>{const hh=d[i]/mx*(H-20),x=i*gw+(gw-bw*us.length)/2+j*bw;
      s+=`<rect x="${x}" y="${H-hh}" width="${bw-3}" height="${hh}" fill="${COL[j%5]}" rx="2"/>`+(d[i]?`<text x="${x+bw/2-1}" y="${H-hh-4}" fill="#ece9e0" font-size="10" text-anchor="middle">${Math.round(d[i]*10)/10}</text>`:"");
    });
  });
  s+=`<line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="#3a3629"/></svg>`;
  const tot=us.map(u=>`<div class="row"><span>${esc(u.name)}</span><span>${Math.round(u.entries.reduce((a,e)=>a+e.km,0)*10)/10} km · ${u.entries.length} treinos</span></div>`).join("");
  return `<div class="card"><h3>Evolução semanal (semana começando em)</h3>
  <div style="display:flex;gap:6px;margin:8px 0">${[["km","Km"],["tr","Treinos"],["ex","Exercícios"]].map(x=>`<button class="${metric==x[0]?"on":""}" onclick="metric='${x[0]}';render()">${x[1]}</button>`).join("")}</div>
  <div class="sc">${s}</div><div class="lg">${us.map((u,j)=>`<span><i style="background:${COL[j%5]}"></i>${esc(u.name)}</span>`).join("")}</div></div>
  <div class="card"><h3>Total geral</h3>${tot||'<p class="mut">Sem dados.</p>'}</div>`;
}
