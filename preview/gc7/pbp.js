/* Game log -> gamecast animations.
   Input: ESPN summary `plays` array (site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=ID).
   Output: one event per fantasy-relevant action, with the animation to run, who did it, where on the court, and the stats it adds. */
export const RULES={stealScoreSec:8,putbackSec:4,postFadeFt:12,turnaroundPostFt:14,floaterMaxFt:14};
const FT=.3048;
const SKIP=/Jumpball|Substitution|Timeout|Challenge|Review|End Period|End Game|End of|Delay|Ejection|Technical/i;
const clk=p=>{const s=String((p.clock&&p.clock.displayValue)||"0"),m=s.split(":");return m.length>1?+m[0]*60+ +m[1]:+s};
const per=p=>(p.period&&p.period.number)||0;
const pid=(p,i)=>(p.participants&&p.participants[i]&&p.participants[i].athlete&&String(p.participants[i].athlete.id))||null;
const ty=p=>(p.type&&p.type.text)||"";
const tm=p=>(p.team&&String(p.team.id))||null;

/* ESPN shot chart: x 0-50 ft across the floor, y = feet out from the basket, basket at (25,0). Free throws carry a huge negative placeholder. */
export function spot(p){const c=p.coordinate;if(!c||c.x==null||Math.abs(c.x)>1000||Math.abs(c.y)>1000)return null;
  return{x:+(12.75-c.y*FT).toFixed(2),z:+((c.x-25)*FT).toFixed(2),ft:Math.round(Math.hypot(c.x-25,c.y)),ang:+Math.atan2(c.x-25,Math.max(.01,c.y)).toFixed(3)}}

export function shotAnim(p){const t=ty(p),s=spot(p),d=s?s.ft:null;
  if(/Alley Oop/i.test(t))return"Alley-oop";
  if(/Putback|Tip/i.test(t))return"Putback";
  if(/Dunk/i.test(t))return"Dunk";
  if(/Float/i.test(t))return"Floater";
  if(/Fade/i.test(t))return(/Turnaround/i.test(t)||(d!=null&&d<=RULES.postFadeFt))?"Post fadeaway":"Fadeaway";
  if(/Turnaround/i.test(t)&&d!=null&&d<=RULES.turnaroundPostFt)return"Post fadeaway";
  if(/Hook/i.test(t))return"Floater";
  if(/Layup|Finger Roll/i.test(t))return"Layup";
  if(p.scoreValue===3||/three point/i.test(p.text||""))return"3PT";
  return"Mid-range"}

export function classify(plays){const ev=[];const live=plays.filter(p=>!SKIP.test(ty(p)));
  const mk=(p,anim,athlete,stats,extra)=>{const e=Object.assign({seq:+p.sequenceNumber||0,id:p.id,period:per(p),clock:(p.clock&&p.clock.displayValue)||"",wall:p.wallclock||null,anim,athlete,team:tm(p),stats,text:p.text||"",type:ty(p),spot:spot(p),src:[p.id]},extra||{});ev.push(e);return e};
  let steal=null,oreb=null;
  for(let i=0;i<live.length;i++){const p=live[i],t=ty(p),made=!!p.scoringPlay;
    const near=(a,sec)=>a&&a.period===per(p)&&a.clock-clk(p)>=0&&a.clock-clk(p)<=sec;
    /* free throws */
    if(/Free Throw/i.test(t)){mk(p,made?"Free throw":null,pid(p,0),made?{PTS:1,FTM:1,FTA:1}:{FTA:1});steal=null;oreb=null;continue}
    /* rebounds */
    if(/Rebound/i.test(t)){const a=pid(p,0);if(a){const e=mk(p,"Rebound",a,{REB:1},{off:/Offensive/i.test(t)});oreb=e.off?{e,athlete:a,period:per(p),clock:clk(p)}:null}steal=null;continue}
    /* turnovers and steals */
    if(/Turnover|Traveling|Bad Pass|Lost Ball|Violation/i.test(t)&&!p.shootingPlay){const loser=pid(p,0);if(loser)mk(p,"Turnover",loser,{TO:1});
      if(/steals?\)/i.test(p.text||"")&&pid(p,1)){const e=mk(p,/Bad Pass/i.test(t)?"Interception":"Steal",pid(p,1),{STL:1},{victim:loser,lostBy:tm(p)});steal={e,athlete:pid(p,1),lostBy:tm(p),period:per(p),clock:clk(p)}}else steal=null;
      oreb=null;continue}
    /* shots */
    if(p.shootingPlay){const shooter=pid(p,0),txt=p.text||"";
      if(!made){mk(p,null,shooter,{FGA:1,...(p.pointsAttempted===3||/three point/i.test(txt)?{"3PA":1}:{})});
        if(/ blocks /i.test(txt)&&pid(p,1))mk(p,"Block",pid(p,1),{BLK:1},{victim:shooter});steal=null;oreb=null;continue}
      let anim=shotAnim(p);const pts=p.scoreValue||2,stats={PTS:pts,FGM:1,FGA:1,...(pts===3?{"3PM":1,"3PA":1}:{})};
      const ast=/assists?\)/i.test(txt)?pid(p,1):null;
      /* and-one: made basket, shooting foul and a 1-of-1 free throw on the same clock */
      let and1=false;for(let j=i+1;j<Math.min(live.length,i+7);j++){const q=live[j];if(per(q)!==per(p)||clk(q)!==clk(p))break;if(/Free Throw - 1 of 1/i.test(ty(q))&&pid(q,0)===shooter){and1=true;break}}
      if(and1&&/Layup|Dunk|Floater|Mid-range|Putback/.test(anim))anim=anim==="Putback"?"Putback":"And-one";
      /* rebound + score: own offensive board, basket within the window */
      let merged=false;
      if(oreb&&oreb.athlete===shooter&&near(oreb,RULES.putbackSec)&&/Layup|Dunk|Putback|And-one|Floater/.test(anim)){const e=oreb.e;e.anim="Putback";e.combo="Rebound + score";Object.assign(e.stats,stats);e.spot=spot(p)||e.spot;e.src.push(p.id);e.text+=" → "+txt;e.and1=and1;merged=true}
      /* steal + score / steal + assist */
      if(!merged&&steal&&near(steal,RULES.stealScoreSec)&&tm(p)!==steal.lostBy){const e=steal.e;
        if(steal.athlete===shooter&&/Layup|Dunk|And-one/.test(anim)){e.anim="Steal + layup";e.combo="Steal + score";e.finish=/Dunk/.test(shotAnim(p))?"dunk":"layup";Object.assign(e.stats,stats);e.src.push(p.id);e.text+=" → "+txt;e.and1=and1;merged=true}
        else if(steal.athlete===ast){e.anim="Steal + assist";e.combo="Steal + assist";e.stats.AST=1;e.to=shooter;e.src.push(p.id);e.text+=" → "+txt}}
      if(!merged)mk(p,anim,shooter,stats,{and1,assist:ast});
      if(ast&&!(steal&&steal.e.anim==="Steal + assist"&&steal.athlete===ast))mk(p,/Alley Oop/i.test(t)?"Alley-oop":"Assist",ast,{AST:1},{role:"passer",to:shooter});
      steal=null;oreb=null;continue}
    /* fouls and anything else end the windows */
    steal=null;oreb=null}
  return ev}

export function tally(ev){const o={};ev.forEach(e=>{if(e.anim)o[e.anim]=(o[e.anim]||0)+1});return o}
