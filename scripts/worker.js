// Fantasy Plus live scores — Cloudflare Worker.
// Phones ask this worker; it asks ESPN with your league cookies (kept in the LEAGUES_JSON secret) and returns
// only this week's matchup scores. Cached at the edge for 15 seconds so ESPN is hit at most 4 times a minute per league.
const STAT = {0:"PTS",1:"BLK",2:"STL",3:"AST",6:"REB",11:"TO",13:"FGM",14:"FGA",15:"FTM",16:"FTA",17:"3PM",19:"FG%",20:"FT%",21:"3P%",4:"OREB",5:"DREB",37:"DD",38:"TD"};
const CORS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, OPTIONS"};
const TTL = 15;

function side(x){
  if(!x) return null;
  const cs = x.cumulativeScore || {}, s = {};
  for(const [k,v] of Object.entries(cs.scoreByStat || {})){
    const n = STAT[+k];
    if(n && v && v.score != null) s[n] = n.endsWith("%") ? Math.round(v.score*10000)/10000 : Math.round(v.score*10)/10;
  }
  const pts = x.totalPointsLive != null ? x.totalPointsLive : (x.totalPoints || 0);
  return {id:x.teamId, pts:Math.round(pts*10)/10, w:cs.wins||0, l:cs.losses||0, t:cs.ties||0, s};
}

function build(raw){
  const per = (raw.status||{}).currentMatchupPeriod || 1, teams = {}, rec = {};
  for(const t of raw.teams || []){
    teams[t.id] = (t.name || ((t.location||"")+" "+(t.nickname||""))).trim();
    const o = (t.record||{}).overall || {};
    rec[t.id] = [o.wins||0, o.losses||0, o.ties||0, o.pointsFor||0];
  }
  const m = (raw.schedule||[]).filter(x => x.matchupPeriodId === per).map(x => ({h:side(x.home), a:side(x.away), win:x.winner}));
  return {lid:String(raw.id), period:per, sp:raw.scoringPeriodId, type:((raw.settings||{}).scoringSettings||{}).scoringType,
          teams, rec, m, ts:Math.floor(Date.now()/1000)};
}

export default {
  async fetch(req, env, ctx){
    if(req.method === "OPTIONS") return new Response(null, {headers:CORS});
    const url = new URL(req.url), lid = url.searchParams.get("lid");
    let leagues = JSON.parse(env.LEAGUES_JSON || "[]"); if(!Array.isArray(leagues)) leagues = leagues.leagues || [];
    const L = leagues.find(x => String(x.league_id) === lid);
    if(!L) return new Response(JSON.stringify({error:"unknown league"}), {status:404, headers:{...CORS,"Content-Type":"application/json"}});
    const cache = caches.default, key = new Request("https://fp-cache/live/"+lid);
    const hit = await cache.match(key); if(hit) return hit;
    const swid = (L.swid||"").trim(), q = ["mMatchupScore","mLiveScoring","mScoreboard","mStatus","mTeam","mSettings"].map(v=>"view="+v).join("&");
    const r = await fetch(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/${L.season}/segments/0/leagues/${lid}?${q}`, {
      headers:{"User-Agent":"Mozilla/5.0 (Fantasy Plus live)", "Cookie":`SWID=${swid.startsWith("{")?swid:"{"+swid+"}"}; espn_s2=${(L.espn_s2||"").trim()}`}});
    if(!r.ok) return new Response(JSON.stringify({error:"espn "+r.status}), {status:502, headers:{...CORS,"Content-Type":"application/json"}});
    const out = new Response(JSON.stringify(build(await r.json())), {headers:{...CORS,"Content-Type":"application/json","Cache-Control":`public, max-age=${TTL}`}});
    ctx.waitUntil(cache.put(key, out.clone()));
    return out;
  }
};
