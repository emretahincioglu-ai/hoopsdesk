const STAT = {0:"PTS",1:"BLK",2:"STL",3:"AST",6:"REB",11:"TO",13:"FGM",14:"FGA",15:"FTM",16:"FTA",17:"3PM",19:"FG%",20:"FT%",21:"3P%",4:"OREB",5:"DREB",37:"DD",38:"TD"};
const PCT = {19:[13,14],20:[15,16],21:[17,18]};
const CORS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, PUT, OPTIONS","Access-Control-Allow-Headers":"Content-Type"};
const TTL = 15;
const PRO = {1:"ATL",2:"BOS",3:"NO",4:"CHI",5:"CLE",6:"DAL",7:"DEN",8:"DET",9:"GS",10:"HOU",11:"IND",12:"LAC",13:"LAL",14:"MIA",15:"MIL",16:"MIN",17:"BKN",18:"NY",19:"ORL",20:"PHI",21:"PHX",22:"POR",23:"SAC",24:"SA",25:"OKC",26:"UTAH",27:"WSH",28:"TOR",29:"MEM",30:"CHA"};
const SLOT = {0:"PG",1:"SG",2:"SF",3:"PF",4:"C",5:"G",6:"F",7:"SG/SF",8:"G/F",9:"PF/C",10:"F/C",11:"UTIL",12:"BE",13:"IR"};
const PS = {0:"PTS",1:"BLK",2:"STL",3:"AST",6:"REB",11:"TO",13:"FGM",14:"FGA",15:"FTM",16:"FTA",17:"3PM",18:"3PA",40:"MIN"};
function players(t, sp){
const out = [];
for(const e of ((t.roster||{}).entries||[])){
const p = (e.playerPoolEntry||{}).player || {};
const st = (p.stats||[]).find(s => s.scoringPeriodId === sp && s.statSourceId === 0);
if(!st) continue;
const r = st.stats || {};
if(!((r[42]||0) > 0 || (r[40]||0) > 0)) continue;
const s = {}; for(const [k,n] of Object.entries(PS)) s[n] = Math.round((r[k]||0)*10)/10;
out.push({id:p.id, n:p.fullName, tm:PRO[p.proTeamId]||"", slot:SLOT[e.lineupSlotId]||"", fp:Math.round((st.appliedTotal||0)*10)/10, s});
}
return out.sort((a,b)=>b.fp-a.fp || b.s.PTS-a.s.PTS);
}
const AV = {0:"PTS",1:"BLK",2:"STL",3:"AST",6:"REB",11:"TO",13:"FGM",14:"FGA",15:"FTM",16:"FTA",17:"3PM",40:"MIN"};
function rosters(raw){
const R = {};
for(const t of raw.teams||[]){
R[t.id] = ((t.roster||{}).entries||[]).map(e => {
const p = (e.playerPoolEntry||{}).player || {}, ss = p.stats||[];
const pick = ss.find(x => x.statSourceId === 0 && x.statSplitTypeId === 0 && x.seasonId === raw.seasonId && x.averageStats && (x.averageStats[42]||0) > 0) || ss.find(x => x.statSourceId === 1 && x.statSplitTypeId === 0 && x.averageStats);
const a = {}; if(pick){ for(const [k,n] of Object.entries(AV)) a[n] = Math.round((pick.averageStats[k]||0)*10)/10; a.GP = (pick.stats||{})[42]||0; }
const pos = (p.eligibleSlots||[]).filter(x => x <= 4).map(x => SLOT[x]);
return {id:p.id, n:p.fullName, tm:PRO[p.proTeamId]||"", slot:SLOT[e.lineupSlotId]||"", inj:p.injuryStatus||"ACTIVE", pos, a};
});
}
return R;
}
function allPlayers(raw, sp){ const P = {}; for(const t of raw.teams||[]) P[t.id] = players(t, sp); return P; }
function today(x, sp){
const t = {}; let pts = 0;
for(const e of ((x.rosterForCurrentScoringPeriod||{}).entries||[])){
if(e.lineupSlotId === 12 || e.lineupSlotId === 13) continue;
const p = (e.playerPoolEntry||{}).player || {};
const st = (p.stats||[]).find(s => s.scoringPeriodId === sp && s.statSourceId === 0);
if(!st) continue;
pts += st.appliedTotal || 0;
for(const [k,v] of Object.entries(st.stats||{})) t[k] = (t[k]||0) + v;
}
return {t, pts};
}
function side(x, sp, items){
if(!x) return null;
const cs = x.cumulativeScore || {}, base = {}, s = {};
for(const [k,v] of Object.entries(cs.scoreByStat || {})) if(v && v.score != null) base[k] = v.score;
const td = today(x, sp), tot = {};
const ids = new Set([...Object.keys(base), ...Object.keys(td.t)]);
for(const k of ids) if(!PCT[k]) tot[k] = (base[k]||0) + (td.t[k]||0);
for(const [k,[m,a]] of Object.entries(PCT)) if(base[k] != null || items[k] != null) tot[k] = tot[a] ? tot[m]/tot[a] : 0;
for(const [k,v] of Object.entries(tot)){ const n = STAT[+k]; if(n) s[n] = n.endsWith("%") ? Math.round(v*10000)/10000 : Math.round(v*10)/10; }
let pts = x.totalPointsLive;
if(pts == null) pts = (x.totalPoints || 0) + td.pts;
return {id:x.teamId, pts:Math.round(pts*10)/10, w:0, l:0, t:0, s, raw:tot};
}
function score(a, b, items){
if(!a || !b) return;
for(const [k,rev] of Object.entries(items)){
const x = a.raw[k] || 0, y = b.raw[k] || 0;
if(x === y){ a.t++; b.t++; } else if((x > y) !== rev){ a.w++; b.l++; } else { a.l++; b.w++; }
}
}
function build(raw){
const st = raw.status || {}, per = st.currentMatchupPeriod || 1, sp = raw.scoringPeriodId || st.latestScoringPeriod, teams = {}, rec = {};
const sc = (raw.settings||{}).scoringSettings || {}, cat = !/POINTS/.test(sc.scoringType||""), items = {};
if(cat) for(const i of sc.scoringItems||[]) items[i.statId] = !!i.isReverseItem;
for(const t of raw.teams || []){
teams[t.id] = (t.name || ((t.location||"")+" "+(t.nickname||""))).trim();
const o = (t.record||{}).overall || {};
rec[t.id] = [o.wins||0, o.losses||0, o.ties||0, o.pointsFor||0];
}
const m = (raw.schedule||[]).filter(x => x.matchupPeriodId === per).map(x => {
const h = side(x.home, sp, items), a = side(x.away, sp, items);
if(cat) score(h, a, items);
if(h) delete h.raw; if(a) delete a.raw;
return {h, a, win:x.winner};
});
const ST = {};
for(const x of (raw.schedule||[]).filter(x => x.matchupPeriodId <= per)){
for(const y of [x.home, x.away]){
if(!y) continue;
const sd = side(y, x.matchupPeriodId === per ? sp : -1, items);
const T = ST[y.teamId] = ST[y.teamId] || {FP:0, GP:0};
T.FP += sd.pts || 0;
for(const [k,v] of Object.entries(sd.raw||{})){ const n = STAT[+k] || ({18:"3PA",13:"FGM",14:"FGA",15:"FTM",16:"FTA"})[+k]; if(n && !n.endsWith("%")) T[n] = Math.round(((T[n]||0) + v)*10)/10; }
}
}
for(const T of Object.values(ST)){ T["FG%"] = T.FGA ? Math.round(T.FGM/T.FGA*10000)/10000 : 0; T["FT%"] = T.FTA ? Math.round(T.FTM/T.FTA*10000)/10000 : 0; T.FP = Math.round(T.FP*10)/10; }
const mp = (((raw.settings||{}).scheduleSettings||{}).matchupPeriods||{})[per] || [sp];
return {lid:String(raw.id), period:per, sp, days:mp, type:sc.scoringType, teams, rec, m, ST, P:allPlayers(raw, sp), ts:Math.floor(Date.now()/1000)};
}
async function espn(L, lid, extra){
const swid = (L.swid||"").trim(), q = ["mMatchupScore","mLiveScoring","mScoreboard","mStatus","mTeam","mSettings","mRoster"].map(v=>"view="+v).join("&");
return fetch(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/${L.season}/segments/0/leagues/${lid}?${q}${extra}`, {headers:{"User-Agent":"Mozilla/5.0 (Fantasy Plus live)", "Cookie":`SWID=${swid.startsWith("{")?swid:"{"+swid+"}"}; espn_s2=${(L.espn_s2||"").trim()}`}});
}
export default {
async fetch(req, env, ctx){
if(req.method === "OPTIONS") return new Response(null, {headers:CORS});
const pu = new URL(req.url);
if(pu.pathname === "/plan"){ const lid0 = pu.searchParams.get("lid")||""; if(!env.PLANS) return new Response(JSON.stringify({error:"plan sync off"}), {status:501, headers:{...CORS,"Content-Type":"application/json"}});
if(req.method === "PUT"){ const body = await req.text(); if(body.length > 200000) return new Response("too big", {status:413, headers:CORS}); await env.PLANS.put("plan:"+lid0, body); return new Response("{}", {headers:{...CORS,"Content-Type":"application/json"}}); }
const v = await env.PLANS.get("plan:"+lid0); return new Response(v || "{}", {headers:{...CORS,"Content-Type":"application/json","Cache-Control":"no-store"}}); }
const url = new URL(req.url), lid = url.searchParams.get("lid");
let leagues = JSON.parse(env.LEAGUES_JSON || "[]"); if(!Array.isArray(leagues)) leagues = leagues.leagues || [];
const ALIAS = {"1463568079":"1546386063"};
const L = leagues.find(x => String(x.league_id) === (ALIAS[lid] || lid));
if(!L) return new Response(JSON.stringify({error:"unknown league"}), {status:404, headers:{...CORS,"Content-Type":"application/json"}});
const cache = caches.default, key = new Request("https://fp-cache/live3/"+lid);
const want = url.searchParams.get("sp");
if(url.searchParams.get("r")){
const rk = new Request("https://fp-cache/rost2/"+lid), rh = await cache.match(rk); if(rh) return rh;
const swid = (L.swid||"").trim();
const rr = await fetch(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/${L.season}/segments/0/leagues/${lid}?view=mRoster&view=mTeam&view=mSettings&view=mStatus`, {headers:{"User-Agent":"Mozilla/5.0 (Fantasy Plus live)", "Cookie":`SWID=${swid.startsWith("{")?swid:"{"+swid+"}"}; espn_s2=${(L.espn_s2||"").trim()}`}});
if(!rr.ok) return new Response(JSON.stringify({error:"espn "+rr.status}), {status:502, headers:{...CORS,"Content-Type":"application/json"}});
const jr = await rr.json();
const per = (jr.status||{}).currentMatchupPeriod || 1, A = {lim:(((jr.settings||{}).acquisitionSettings)||{}).matchupAcquisitionLimit ?? -1, per, used:{}};
for(const t of jr.teams||[]) A.used[t.id] = (((t.transactionCounter||{}).matchupAcquisitionTotals)||{})[per] || 0;
const orr = new Response(JSON.stringify({lid, R:rosters(jr), A, ts:Math.floor(Date.now()/1000)}), {headers:{...CORS,"Content-Type":"application/json","Cache-Control":"public, max-age=30"}});
ctx.waitUntil(cache.put(rk, orr.clone()));
return orr;
}
const hit = want ? null : await cache.match(key); if(hit) return hit;
const spKey = new Request("https://fp-cache/sp/"+lid);
let sp = null; const sph = await cache.match(spKey); if(sph) sp = await sph.text();
if(!sp){ const r0 = await espn(L, lid, ""); if(!r0.ok) return new Response(JSON.stringify({error:"espn "+r0.status}), {status:502, headers:{...CORS,"Content-Type":"application/json"}}); const j0 = await r0.json(); sp = String(j0.scoringPeriodId || ((j0.status||{}).latestScoringPeriod) || 1); ctx.waitUntil(cache.put(spKey, new Response(sp, {headers:{"Cache-Control":"public, max-age=300"}}))); }
if(want && want !== sp){
const dk = new Request("https://fp-cache/day3/"+lid+"/"+want), dh = await cache.match(dk); if(dh) return dh;
const rd = await espn(L, lid, "&scoringPeriodId="+want);
if(!rd.ok) return new Response(JSON.stringify({error:"espn "+rd.status}), {status:502, headers:{...CORS,"Content-Type":"application/json"}});
const jd = await rd.json();
const od = new Response(JSON.stringify({lid, sp:+want, P:allPlayers(jd, +want), ts:Math.floor(Date.now()/1000)}), {headers:{...CORS,"Content-Type":"application/json","Cache-Control":`public, max-age=${+want < +sp ? 1800 : 60}`}});
ctx.waitUntil(cache.put(dk, od.clone()));
return od;
}
const r = await espn(L, lid, "&scoringPeriodId="+sp);
if(!r.ok) return new Response(JSON.stringify({error:"espn "+r.status}), {status:502, headers:{...CORS,"Content-Type":"application/json"}});
const j = await r.json(); j.scoringPeriodId = +sp;
const out = new Response(JSON.stringify(build(j)), {headers:{...CORS,"Content-Type":"application/json","Cache-Control":`public, max-age=${TTL}`}});
ctx.waitUntil(cache.put(key, out.clone()));
return out;
}
};
