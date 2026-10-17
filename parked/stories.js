;(function(){
const SITE="https://site.api.espn.com/apis/site/v2/sports/basketball/nba";
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const last=n=>String(n).replace(/ (III|II|IV|Jr\.|Sr\.)$/,"").split(" ").slice(-1)[0];
const ph=id=>id&&window.HDP?HDP(id):"";
const CATS=["PTS","3PM","REB","AST","STL","BLK","FG%","FT%"],CNT=["PTS","REB","AST","STL","BLK","3PM"];
const ymd=off=>{const d=new Date(Date.now()-4*3600e3+off*864e5);return d.toISOString().slice(0,10).replace(/-/g,"")};
const fvOf=r=>+((r.PTS+1.2*r.REB+1.5*r.AST+3*r.STL+3*r.BLK+r["3PM"]-(r.TO||0))/5).toFixed(1);
const tcol=t=>((window.HDX&&HDX.TCOL)||{})[t]||["#333","#111"];
let DATA=null,LOADING=null;
async function loadNight(){
 let day=null,ev=[];
 for(let o=-1;o>=-6;o--){try{const j=await (await fetch(`${SITE}/scoreboard?dates=${ymd(o)}`)).json();const done=(j.events||[]).filter(e=>((e.competitions||[])[0]?.status?.type?.state||e.status?.type?.state)==="post");if(done.length){day=ymd(o);ev=done;break}}catch(e){}}
 if(!day)return {empty:true};
 const all=[];await Promise.all(ev.map(async e=>{try{const j=await (await fetch(`${SITE}/summary?event=${e.id}`)).json();((j.boxscore||{}).players||[]).forEach(t=>{const ab=(t.team||{}).abbreviation;(t.statistics||[]).forEach(sg=>{const k=sg.keys||[];(sg.athletes||[]).forEach(a=>{if(!a.stats||!a.stats.length||a.didNotPlay)return;const v=n=>{const i=k.indexOf(n);return i<0?"0":a.stats[i]};const sp=x=>String(x||"0-0").split("-").map(Number);
  const fg=sp(v("fieldGoalsMade-fieldGoalsAttempted")),ft=sp(v("freeThrowsMade-freeThrowsAttempted")),tp=sp(v("threePointFieldGoalsMade-threePointFieldGoalsAttempted"));
  const r={id:String((a.athlete||{}).id||""),n:(a.athlete||{}).displayName||"",t:ab,MIN:+v("minutes")||0,PTS:+v("points")||0,REB:+v("rebounds")||0,AST:+v("assists")||0,STL:+v("steals")||0,BLK:+v("blocks")||0,TO:+v("turnovers")||0,"3PM":tp[0]||0,FGM:fg[0]||0,FGA:fg[1]||0,FTM:ft[0]||0,FTA:ft[1]||0};r.fv=fvOf(r);all.push(r)})})})}catch(e){}}));
 const D=HDX.D,owner={},proj={};
 Object.entries(D.rost||{}).forEach(([tid,l])=>(l||[]).forEach(p=>owner[String(p.id)]=+tid));
 (D.team.rows||[]).forEach(r=>{owner[String(r.id)]=D.my;proj[String(r.id)]=r.line});
 const oppId=(D.power.find(t=>t.name===D.opp)||{}).id;((D.opTeam||{}).rows||[]).forEach(r=>{owner[String(r.id)]=oppId;proj[String(r.id)]=r.line});
 const W=(HDX.WH&&HDX.WH.data&&HDX.WH.data.players)||(D.wh&&D.wh.players)||[];const wz={};W.forEach(p=>{const pr=(p.win||{}).proj;if(pr){proj[String(p.id)]=pr.line;wz[String(p.id)]={z:pr.z,line:pr.line,own:p.owned,name:p.name,nba:p.nba}}});
 all.forEach(r=>{r.own=owner[r.id];const pl=proj[r.id];if(pl){const pf=fvOf({PTS:pl.PTS||0,REB:pl.REB||0,AST:pl.AST||0,STL:pl.STL||0,BLK:pl.BLK||0,"3PM":pl["3PM"]||0,TO:pl.TO||0});r.pf=pf;r.hot=pf>0?Math.round((r.fv-pf)/pf*100):null}});
 return {day,ev,all,my:D.my,opp:oppId,wz,owner};
}
function getData(){if(DATA)return Promise.resolve(DATA);if(!LOADING)LOADING=loadNight().then(d=>(DATA=d)).catch(()=>({empty:true}));return LOADING}
const line=r=>[`${r.PTS} PTS`,`${r.REB} REB`,`${r.AST} AST`,r.STL?`${r.STL} STL`:"",r.BLK?`${r.BLK} BLK`:"",r["3PM"]?`${r["3PM"]} 3PM`:"",`${r.FGM}-${r.FGA} FG`].filter(Boolean).join(" · ");
const grid=(r,hl)=>`<div class="sgr">${[["MIN",r.MIN],["PTS",r.PTS],["REB",r.REB],["AST",r.AST],["STL",r.STL],["BLK",r.BLK],["3PM",r["3PM"]],["FG",r.FGM+"-"+r.FGA],["FT",r.FTM+"-"+r.FTA],["TO",r.TO]].map(([k,v])=>`<div class="${k===hl?"on":""}"><b>${v}</b><small>${k}</small></div>`).join("")}</div>`;
const pgrid=(pl)=>`<div class="sgr p">${[["PTS",pl.PTS],["REB",pl.REB],["AST",pl.AST],["STL",pl.STL],["BLK",pl.BLK],["3PM",pl["3PM"]],["FG%",pl["FG%"]!=null?String((+pl["FG%"]).toFixed(3)).replace(/^0/,""):"–"],["FT%",pl["FT%"]!=null?String((+pl["FT%"]).toFixed(3)).replace(/^0/,""):"–"]].map(([k,v])=>`<div><b>${v??"–"}</b><small>${k}</small></div>`).join("")}</div>`;
const tag=(r,X)=>r.own===X.my?'<span class="sst me">yours</span>':r.own===X.opp?`<span class="sst op">${esc((HDX.D.opp||"").split(" ")[0])}</span>`:r.own?"":'<span class="sst fa">FA</span>';
const pimg=(r,s=38)=>`<span class="spi" style="width:${s}px;height:${s}px;background:${tcol(r.t)[0]}">${ph(r.id)?`<img src="${ph(r.id)}" alt="" onerror="this.remove()">`:""}<i>${esc(r.n.split(" ").map(w=>w[0]).join("").slice(0,2))}</i></span>`;
const prow=(r,X,i,extra,hl)=>`<div class="spr2"><div class="spr">${i!=null?`<b class="k">${i+1}</b>`:""}${pimg(r)}<div class="m"><b>${esc(r.n)} ${tag(r,X)}</b><small>${esc(r.t)}</small></div>${extra||`<span class="fv">${r.fv.toFixed(1)}</span>`}</div>${grid(r,hl)}</div>`;
const dayLabel=d=>{const x=new Date(d.slice(0,4)+"-"+d.slice(4,6)+"-"+d.slice(6)+"T12:00");return x.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})};
// ---------- slides ----------
function recapSlides(X){const D=HDX.D,mine=X.all.filter(r=>r.own===X.my),opp=X.all.filter(r=>r.own===X.opp);
 const tot=L=>{const o={};CNT.forEach(c=>o[c]=L.reduce((s,r)=>s+r[c],0));o.FGM=L.reduce((s,r)=>s+r.FGM,0);o.FGA=L.reduce((s,r)=>s+r.FGA,0);o.FTM=L.reduce((s,r)=>s+r.FTM,0);o.FTA=L.reduce((s,r)=>s+r.FTA,0);o["FG%"]=o.FGA?o.FGM/o.FGA:0;o["FT%"]=o.FTA?o.FTM/o.FTA:0;return o};
 const A=tot(mine),B=tot(opp);let w=0,l=0;
 const rows=CATS.map(c=>{const a=A[c],b=B[c],pc=c.endsWith("%"),win=a>b,tie=a===b;if(!tie)win?w++:l++;const top=pc?null:[...mine].sort((x,y)=>y[c]-x[c])[0],topo=pc?null:[...opp].sort((x,y)=>y[c]-x[c])[0];const f=v=>pc?(v?v.toFixed(3).replace(/^0/,""):"–"):v;
  return `<div class="smr"><span class="c">${c}</span><b class="a ${win?"w":""}">${f(a)}</b><div class="bar"><i style="width:${(a+b)?a/(a+b)*100:50}%"></i></div><b class="b ${!win&&!tie?"w":""}">${f(b)}</b><small>${top&&top[c]?esc(last(top.n))+" "+top[c]:pc?`${c==="FG%"?A.FGM+"-"+A.FGA:A.FTM+"-"+A.FTA}`:""}</small></div>`}).join("");
 const S=[];
 S.push({bg:"linear-gradient(115deg,#7B5236 0 50%,#0068A8 50%)",h:`<div class="scap">Your matchup · ${esc(dayLabel(X.day))}</div><div class="sbig">${mine.length||opp.length?`You ${w>l?"won":w<l?"lost":"split"} the night ${w}–${l}`:"Quiet night"}</div><div class="ssub">${mine.length} of your players played · ${opp.length} of ${esc(D.opp)}'s</div><div class="smh"><span>You</span><span></span><span>${esc((D.opp||"").split(" ")[0])}</span></div>${rows}`});
 const by={};X.all.forEach(r=>{if(r.own){(by[r.own]=by[r.own]||{fv:0,n:0,best:null});by[r.own].fv+=r.fv;by[r.own].n++;if(!by[r.own].best||r.fv>by[r.own].best.fv)by[r.own].best=r}});
 const teams=[...D.power].map(t=>({t,b:by[t.id]||{fv:0,n:0,best:null}})).sort((a,b)=>b.b.fv-a.b.fv);const mx=Math.max(1,...teams.map(x=>x.b.fv));
 S.push({bg:"linear-gradient(170deg,#1f2a44,#000 75%)",h:`<div class="scap">Around the league</div><div class="sbig">Who had the best night</div><div class="ssub">Fantasy output of every team's players last night</div>${teams.map((x,i)=>`<div class="slg ${x.t.id===X.my?"me":x.t.id===X.opp?"op":""}"><b class="k">${i+1}</b><div class="m"><b>${esc(x.t.name)}</b><small>${x.b.n} played${x.b.best?` · best: ${esc(last(x.b.best.n))} ${x.b.best.fv.toFixed(1)}`:""}</small><div class="bar"><i style="width:${x.b.fv/mx*100}%"></i></div></div><span class="fv">${x.b.fv.toFixed(1)}</span></div>`).join("")}`});
 const top=[...X.all].sort((a,b)=>b.fv-a.fv).slice(0,10);
 S.push({bg:"radial-gradient(circle at 50% 0,#3a2a00,#000 65%)",h:`<div class="scap">Top 10 of the night</div><div class="sbig">${esc(top[0]?top[0].n:"")}</div><div class="ssub">${top[0]?line(top[0]):""}</div>${top.map((r,i)=>prow(r,X,i)).join("")}`});
 S.push({bg:"linear-gradient(170deg,#2b1a4a,#000 75%)",h:`<div class="scap">Category leaders</div><div class="sbig">Who owned each stat</div><div class="scats">${CNT.map(c=>{const t=[...X.all].sort((a,b)=>b[c]-a[c]).slice(0,3);return `<div class="scc"><div class="cc">${c}</div>${t.map((r,i)=>prow(r,X,i,`<b class="cv">${r[c]}</b>`,c)).join("")}</div>`}).join("")}</div>`});
 const withP=X.all.filter(r=>r.hot!=null&&r.MIN>=10),hot=[...withP].sort((a,b)=>b.hot-a.hot).slice(0,5),cold=[...withP].sort((a,b)=>a.hot-b.hot).slice(0,5);
 S.push({bg:"linear-gradient(170deg,#4a1500,#000 50%,#001a33)",h:`<div class="scap">Hot & cold</div><div class="sbig">vs their projection</div><div class="shc h">🔥 Hottest</div>${hot.map(r=>prow(r,X,null,`<span class="pct up">+${r.hot}%</span>`)).join("")||'<p class="sno">No projections to compare yet.</p>'}<div class="shc c">🧊 Coldest</div>${cold.map(r=>prow(r,X,null,`<span class="pct dn">${r.hot}%</span>`)).join("")}`});
 return S}
function waiverSlides(X){const D=HDX.D,fa=X.all.filter(r=>!r.own),S=[];
 const top=[...fa].sort((a,b)=>b.fv-a.fv).slice(0,10);
 S.push({bg:"linear-gradient(170deg,#0b3d23,#000 75%)",h:`<div class="scap">Waiver watch · ${esc(dayLabel(X.day))}</div><div class="sbig">Top 10 free agents last night</div><div class="ssub">Not on any team in your league</div>${top.map((r,i)=>prow(r,X,i)).join("")||'<p class="sno">No free agents played.</p>'}`});
 S.push({bg:"linear-gradient(170deg,#0d3340,#000 75%)",h:`<div class="scap">Free-agent leaders</div><div class="sbig">Best available by stat</div><div class="scats">${CNT.map(c=>{const t=[...fa].sort((a,b)=>b[c]-a[c]).slice(0,3);return `<div class="scc"><div class="cc">${c}</div>${t.map((r,i)=>prow(r,X,i,`<b class="cv">${r[c]}</b>`,c)).join("")}</div>`}).join("")}</div>`});
 const hot=fa.filter(r=>r.hot!=null&&r.MIN>=10).sort((a,b)=>b.hot-a.hot).slice(0,6);
 S.push({bg:"linear-gradient(170deg,#4a2a00,#000 75%)",h:`<div class="scap">Breakouts</div><div class="sbig">Free agents way above projection</div><div class="ssub">Played much better than expected. Worth a look before others notice.</div>${hot.map(r=>prow(r,X,null,`<span class="pct up">+${r.hot}%</span>`)).join("")||'<p class="sno">No free-agent breakouts last night.</p>'}`});
 const P=(D.M||{}).probs||{},lose=CATS.filter(c=>P[c]!=null&&P[c]<.5).sort((a,b)=>P[a]-P[b]).slice(0,4);
 const recs=lose.map(c=>{const L=Object.entries(X.wz).filter(([id])=>!X.owner[id]).map(([id,w])=>({id,...w,zc:(w.z||{})[c]||0})).sort((a,b)=>b.zc-a.zc).slice(0,3);return {c,L}});
 const byId={};X.all.forEach(r=>byId[r.id]=r);
 S.push({bg:"linear-gradient(115deg,#7B5236,#000 60%)",h:`<div class="scap">Good for your matchup</div><div class="sbig">${lose.length?`Fix ${lose.join(", ")}`:"You're ahead everywhere"}</div><div class="ssub">Categories you're behind in vs ${esc(D.opp)}, with 3 free agents for each</div>${recs.map(g=>`<div class="srec"><div class="cc">${g.c} <span>${Math.round((P[g.c]||0)*100)}% to win</span></div>${g.L.map(p=>{const pl=p.line||{},ln=byId[p.id];return `<div class="spr">${pimg({id:p.id,n:p.name||"",t:p.nba},34)}<div class="m"><b>${esc(p.name)} <span class="sst fa">${p.own!=null?p.own+"%":"FA"}</span></b><small>${esc(p.nba||"")}</small></div><span class="fv">${g.c.endsWith("%")?(pl[g.c]!=null?String(pl[g.c].toFixed(3)).replace(/^0/,""):"–"):(pl[g.c]??"–")}</span></div><div class="sgl">Projection per game</div>${pgrid(pl)}${ln?`<div class="sgl y">Last night</div>${grid(ln,g.c==="FG%"?"FG":g.c==="FT%"?"FT":g.c)}`:""}`}).join("")}</div>`).join("")}`});
 return S}
// ---------- viewer ----------
let V=null;
function open(kind){getData().then(X=>{if(!X||X.empty){toast("No finished NBA games in the last few days.");return}
 const S=kind==="waiver"?waiverSlides(X):recapSlides(X);let i=0,t=null,paused=false,start=0,left=0;const DUR=9000;
 V=document.createElement("div");V.id="fpsv";V.innerHTML=`<div class="sbars">${S.map(()=>'<div><i></i></div>').join("")}</div><div class="shead">${kind==="waiver"?'<span class="sb wv">$</span><b>Waiver Watch</b>':'<span class="sb rc">★</span><b>Daily Recap</b>'}<small>${esc(dayLabel(X.day))}</small><button class="sx" aria-label="Close">✕</button></div><div class="sbody"></div>`;
 document.body.appendChild(V);try{localStorage.setItem("fp_seen_"+kind,X.day)}catch(e){}paintBubbles();
 const body=V.querySelector(".sbody"),bars=[...V.querySelectorAll(".sbars i")];
 const show=k=>{i=Math.max(0,Math.min(S.length-1,k));V.style.background=S[i].bg;body.innerHTML=`<div class="sin">${S[i].h}</div>`;body.scrollTop=0;bars.forEach((b,j)=>{b.style.transition="none";b.style.width=j<i?"100%":"0"});left=DUR;run()};
 const run=()=>{clearTimeout(t);const b=bars[i];start=Date.now();requestAnimationFrame(()=>{b.style.transition=`width ${left}ms linear`;b.style.width="100%"});t=setTimeout(()=>{if(i<S.length-1)show(i+1);else close()},left)};
 const pause=()=>{if(paused)return;paused=true;clearTimeout(t);left-=Date.now()-start;const b=bars[i],w=getComputedStyle(b).width;b.style.transition="none";b.style.width=w};
 const resume=()=>{if(!paused)return;paused=false;run()};
 const close=()=>{clearTimeout(t);V.classList.add("out");setTimeout(()=>{V&&V.remove();V=null},250)};
 V.querySelector(".sx").onclick=e=>{e.stopPropagation();close()};
 let moved=false;body.addEventListener("touchmove",()=>moved=true,{passive:true});body.addEventListener("click",e=>{if(moved){moved=false;return}const x=e.clientX/innerWidth;if(x<.3)show(i-1);else if(x>.7){if(i<S.length-1)show(i+1);else close()}});
 body.addEventListener("touchstart",pause,{passive:true});body.addEventListener("touchend",resume,{passive:true});body.addEventListener("mousedown",pause);body.addEventListener("mouseup",resume);
 let y0=null;V.addEventListener("touchstart",e=>{y0=e.touches[0].clientY},{passive:true});V.addEventListener("touchend",e=>{if(y0!=null&&e.changedTouches[0].clientY-y0>120&&body.scrollTop<=0)close();y0=null},{passive:true});
 show(0)})}
function toast(m){const d=document.createElement("div");d.className="fptoast";d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}
// ---------- bubbles ----------
function paintBubbles(){document.querySelectorAll("#fpsb .sbub").forEach(b=>{let seen=false;try{seen=!!DATA&&localStorage.getItem("fp_seen_"+b.dataset.k)===DATA.day}catch(e){}b.classList.toggle("seen",seen)})}
function bubbles(el){const ah=el.querySelector(".ah")||el,h=ah.querySelector(".hdstk");if(!h||ah.querySelector("#fpsb"))return;
 const d=document.createElement("div");d.id="fpsb";d.innerHTML=`<button class="sbub" data-k="recap"><span class="ring"><span class="in rc">★</span></span><small>Daily Recap</small></button><button class="sbub" data-k="waiver"><span class="ring wv"><span class="in wv">$</span></span><small>Waiver Watch</small></button>`;
 h.after(d);d.querySelectorAll(".sbub").forEach(b=>b.onclick=e=>{e.stopPropagation();open(b.dataset.k)});getData().then(paintBubbles)}
window.FPSTORY={bubbles,open};
})();
