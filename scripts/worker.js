const STAT = {0:"PTS",1:"BLK",2:"STL",3:"AST",6:"REB",11:"TO",13:"FGM",14:"FGA",15:"FTM",16:"FTA",17:"3PM",19:"FG%",20:"FT%",21:"3P%",4:"OREB",5:"DREB",37:"DD",38:"TD"};
const PCT = {19:[13,14],20:[15,16],21:[17,18]};
const CORS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, OPTIONS"};
const TTL = 15;
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
return {lid:String(raw.id), period:per, sp, type:sc.scoringType, teams, rec, m, ts:Math.floor(Date.now()/1000)};
}
async function espn(L, lid, extra){
const swid = (L.swid||"").trim(), q = ["mMatchupScore","mLiveScoring","mScoreboard","mStatus","mTeam","mSettings","mRoster"].map(v=>"view="+v).join("&");
return fetch(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/${L.season}/segments/0/leagues/${lid}?${q}${extra}`, {headers:{"User-Agent":"Mozilla/5.0 (Fantasy Plus live)", "Cookie":`SWID=${swid.startsWith("{")?swid:"{"+swid+"}"}; espn_s2=${(L.espn_s2||"").trim()}`}});
}
export default {
async fetch(req, env, ctx){
if(req.method === "OPTIONS") return new Response(null, {headers:CORS});
const url = new URL(req.url), lid = url.searchParams.get("lid");
let leagues = JSON.parse(env.LEAGUES_JSON || "[]"); if(!Array.isArray(leagues)) leagues = leagues.leagues || [];
const L = leagues.find(x => String(x.league_id) === lid);
if(!L) return new Response(JSON.stringify({error:"unknown league"}), {status:404, headers:{...CORS,"Content-Type":"application/json"}});
const cache = caches.default, key = new Request("https://fp-cache/live2/"+lid);
const hit = await cache.match(key); if(hit) return hit;
const spKey = new Request("https://fp-cache/sp/"+lid);
let sp = null; const sph = await cache.match(spKey); if(sph) sp = await sph.text();
if(!sp){ const r0 = await espn(L, lid, ""); if(!r0.ok) return new Response(JSON.stringify({error:"espn "+r0.status}), {status:502, headers:{...CORS,"Content-Type":"application/json"}}); const j0 = await r0.json(); sp = String(j0.scoringPeriodId || ((j0.status||{}).latestScoringPeriod) || 1); ctx.waitUntil(cache.put(spKey, new Response(sp, {headers:{"Cache-Control":"public, max-age=300"}}))); }
const r = await espn(L, lid, "&scoringPeriodId="+sp);
if(!r.ok) return new Response(JSON.stringify({error:"espn "+r.status}), {status:502, headers:{...CORS,"Content-Type":"application/json"}});
const j = await r.json(); j.scoringPeriodId = +sp;
const out = new Response(JSON.stringify(build(j)), {headers:{...CORS,"Content-Type":"application/json","Cache-Control":`public, max-age=${TTL}`}});
ctx.waitUntil(cache.put(key, out.clone()));
return out;
}
};
