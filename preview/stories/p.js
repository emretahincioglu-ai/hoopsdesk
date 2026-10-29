const ST=[
{n:"Daily Recap",s:"Recap",c:"#ffc62b",c2:"#ff8a00",i:"★",p:"5104157",h:"Wemby 36-14-5",new:1},
{n:"Waiver Watch",s:"Waivers",c:"#3fcf6c",c2:"#0fa3a3",i:"$",p:"4397189",h:"Kolek +143%",new:1},
{n:"Matchup Pulse",s:"Matchup",c:"#4aa8ff",c2:"#6b5bff",i:"◎",p:"4431678",h:"Up 6–3 · 95%",new:1},
{n:"Trade Desk",s:"Trades",c:"#b48cff",c2:"#ff5fa2",i:"⇄",p:"3975",h:"Sell-high: Curry",new:0}];
const ph=id=>`https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${id}.png&w=260&h=190`;
const im=s=>`<img src="${ph(s.p)}" alt="" onerror="this.style.display='none'">`;
const ring=(s,z=54)=>`<span class="ring ${s.new?"":"seen"}" style="--a:${s.c};--b:${s.c2};width:${z}px;height:${z}px"><span>${im(s)}<i>${s.i}</i></span></span>`;
const icon=(s,z=28,r=8)=>`<i class="ico" style="background:${s.c};width:${z}px;height:${z}px;border-radius:${r}px">${s.i}</i>`;
/* home sections */
const H={
hdr:`<div class="hdr"><span class="lg">MM</span><b>Home</b><span class="sr">⌕</span></div>`,
tabs:`<div class="tabs"><span class="on">Overview</span><span>Team</span><span>Matchup</span><span>Players</span><span>League</span></div>`,
mc:`<div class="mc"><span class="t">Mastika Magics<b>6</b><small>1-0</small></span><span class="m">WK 2<em>95%</em></span><span class="t r">Dimes Square SK<b>3</b><small>See the game ›</small></span></div>`,
cats:`<div class="row1">This week's categories <span>›</span></div>`,
totw:`<div class="totw">🏆 <b>Team of the Week 1 is here</b><span>›</span></div>`,
ln:`<div class="sec"><div class="sh">LAST NIGHT <span>Wed, Oct 28 · Final</span></div><div class="lnr"><div class="lc" style="background:#7a1d24"><b>Reed</b><small>16 PTS · 4 REB</small></div><div class="lc" style="background:#8a2a2a"><b>Wiggins</b><small>10 PTS · 4 REB</small></div></div></div>`,
wv:`<div class="sec"><div class="sh">HOT ON WAIVERS <span>See all ›</span></div><div class="wr"><b>C. Johnson</b><span>13.8 · 4.2 · 2.9</span></div><div class="wr"><b>A. Nesmith</b><span>13.8 · 4.3 · 1.6</span></div><div class="wr"><b>J. Smith</b><span>12.1 · 7.9 · 1.4</span></div></div>`,
nav:`<div class="nav"><span class="on">⌂<small>Home</small></span><span>☰<small>Overview</small></span><span>🏀<small>NBA</small></span><span>📰<small>News</small></span><span>•••<small>More</small></span></div>`};
const page=(parts,over="",cls="")=>`<div class="scr ${cls}"><div class="body">${parts.map(p=>H[p]!==undefined?H[p]:p).join("")}</div>${H.nav}${over}</div>`;
const P=[];const add=(name,where,why,html,css="")=>P.push({name,where,why,html,css});
const strip=(z)=>`<div class="rs">${ST.map(s=>`<div class="it">${ring(s,z)}<small>${s.s}</small></div>`).join("")}</div>`;
/* 1 */add("Bottom dock","Floating above the bottom nav","Circles sit in a frosted strip just above the nav bar, always in thumb reach.",
page(["hdr","tabs","mc","cats","totw","ln","wv"],`<div class="dock">${ST.map(s=>ring(s,44)).join("")}<span class="dl">4 new</span></div>`));
/* 2 */add("Its own tab","A Stories tab in the bottom nav","Stories get a home of their own: a nav tab with a badge that opens a full page of covers.",
`<div class="scr"><div class="body"><div class="hdr"><span class="lg">MM</span><b>Stories</b><span class="sr">⌕</span></div><div class="sp">${ST.map(s=>`<div class="cv" style="background:linear-gradient(160deg,${s.c},${s.c2})">${im(s)}<div class="ct"><small>${s.n.toUpperCase()}</small><b>${s.h}</b></div>${s.new?"":'<em>Watched</em>'}</div>`).join("")}</div><div class="spf">Yesterday's stories ›</div></div><div class="nav"><span>⌂<small>Home</small></span><span class="on st">◉<small>Stories</small><em>3</em></span><span>🏀<small>NBA</small></span><span>📰<small>News</small></span><span>•••<small>More</small></span></div></div>`);
/* 3 */add("Squares mid-page","Between the matchup card and the rest","After you check the matchup, a strip of 4 squares appears. That's the point where you want the details.",
page(["hdr","tabs","mc",`<div class="sqs">${ST.map(s=>`<div class="sq ${s.new?"u":""}" style="--a:${s.c};background:linear-gradient(150deg,${s.c}55,#141518 70%)">${im(s)}<b>${s.s}</b></div>`).join("")}</div>`,"cats","ln","wv"]));
/* 4 */add("Inside the matchup card","Mini circles in the card's footer","No new row: the matchup card grows a footer with 4 small story circles.",
page(["hdr","tabs",`<div class="mc mcf"><div class="mcr"><span class="t">Mastika Magics<b>6</b></span><span class="m">WK 2<em>95%</em></span><span class="t r">Dimes Square SK<b>3</b></span></div><div class="mft">${ST.map(s=>`<span>${ring(s,30)}<small>${s.s}</small></span>`).join("")}</div></div>`,"cats","totw","ln","wv"]));
/* 5 */add("Replaces Last Night","Tall story cards in the middle of Home","Daily Recap already covers last night, so that section turns into big swipeable story cards.",
page(["hdr","tabs","mc","cats",`<div class="sec"><div class="sh">TODAY'S STORIES <span>4 new</span></div><div class="tall">${ST.map(s=>`<div class="tc" style="--a:${s.c}">${im(s)}<i style="background:${s.c}">${s.i}</i><b>${s.n}</b></div>`).join("")}</div></div>`,"wv"]));
/* 6 */add("Ring on your team logo","Your logo in the header, Instagram-profile style","Your team logo top-left gets a gradient ring when stories are waiting. Tap it to start.",
page([`<div class="hdr"><span class="lgr"><span class="lg">MM</span></span><b>Home</b><span class="sr">⌕</span></div><div class="hint">← 4 new stories</div>`,"tabs","mc","cats","totw","ln","wv"]));
/* 7 */add("Pull-down drawer","Hidden above the header, pull Home down","Pull the page down and a stories drawer opens above the header. Out of sight until you want it.",
page([`<div class="pull">${strip(46)}<div class="ph2">↓ Pull to close</div></div>`,"hdr","tabs","mc","cats","ln"],"","pulled"));
/* 8 */add("Bottom sheet","A sheet peeking up from the bottom","A handle at the bottom: \"4 new stories\". Swipe it up to see covers, swipe down to hide.",
page(["hdr","tabs","mc","cats","totw","ln","wv"],`<div class="sheet"><i class="hd"></i><div class="shh"><b>4 new stories</b><span>Swipe up</span></div><div class="shr">${ST.map(s=>`<div class="sc" style="background:linear-gradient(150deg,${s.c},${s.c2})"><b>${s.s}</b></div>`).join("")}</div></div>`));
/* 9 */add("Floating bubble","One bubble bottom-right, Messenger chat-head style","A single ringed bubble floats over everything. Tap to play all 4; the count shows what's left.",
page(["hdr","tabs","mc","cats","totw","ln","wv"],`<div class="fab">${ring(ST[0],60)}<em>4</em></div>`));
/* 10 */add("Side rail","A vertical column on the right edge","Rings stack down the right edge like a sidebar. Visible while you scroll, without taking a row.",
page(["hdr","tabs","mc","cats","totw","ln","wv"],`<div class="rail">${ST.map(s=>ring(s,40)).join("")}</div>`,"railed"));
/* 11 */add("Morning splash","Full screen when you open the app","The first open of the day greets you with the 4 stories. Watch them, or skip to Home.",
`<div class="scr splash"><div class="sgm">GOOD MORNING, EMRE</div><div class="sgh">Here's your<br>fantasy day.</div><div class="sgg">${ST.map(s=>`<div class="sgc" style="background:linear-gradient(150deg,${s.c},${s.c2})">${im(s)}<small>${s.n.toUpperCase()}</small><b>${s.h}</b></div>`).join("")}</div><div class="sgb"><span class="pl">▶ Play all · 2 min</span><span class="sk">Skip to Home</span></div></div>`);
/* 12 */add("Next to each section","Each section title has its own story","The story sits beside the section it belongs to: Matchup Pulse by the matchup, Recap by Last Night, Waivers by Hot on Waivers.",
page(["hdr","tabs",`<div class="ctx">${ring(ST[2],26)}<span>Matchup Pulse</span></div>`,"mc","cats",`<div class="sec"><div class="sh">${ring(ST[0],24)} LAST NIGHT <span>Recap ›</span></div><div class="lnr"><div class="lc" style="background:#7a1d24"><b>Reed</b><small>16 PTS · 4 REB</small></div><div class="lc" style="background:#8a2a2a"><b>Wiggins</b><small>10 PTS · 4 REB</small></div></div></div>`,`<div class="sec"><div class="sh">${ring(ST[1],24)} HOT ON WAIVERS <span>See all ›</span></div><div class="wr"><b>C. Johnson</b><span>13.8 · 4.2 · 2.9</span></div><div class="wr"><b>A. Nesmith</b><span>13.8 · 4.3 · 1.6</span></div></div>`]));
/* 13 */add("Sticky ticker","A scrolling headline strip above the nav","A thin live ticker above the nav cycles through every story's headline. Tap to open that one.",
page(["hdr","tabs","mc","cats","totw","ln","wv"],`<div class="tick"><span class="lv">STORIES</span><div class="tw"><div class="mv">${[...ST,...ST].map(s=>`<span><b style="color:${s.c}">${s.i} ${s.s}</b> ${s.h}</span>`).join("")}</div></div></div>`));
/* 14 */add("Divider banner","A wide banner between sections","One wide card splits Home in two. It shows 4 progress segments and the next story's headline.",
page(["hdr","tabs","mc","cats",`<div class="ban"><div class="bs">${ST.map(s=>`<i style="background:${s.new?s.c:"#3a3b40"}"></i>`).join("")}</div><div class="bc">${im(ST[0])}<small>UP NEXT · DAILY RECAP</small><b>${ST[0].h}</b><span>▶ Watch 4 stories</span></div></div>`,"ln","wv"]));
/* 15 */add("Stories tab in the top tabs","Next to Overview / Team / Matchup","A \"Stories\" tab in the top tab bar with a dot. Opens a vertical feed of all 4 on the same screen.",
`<div class="scr"><div class="body">${H.hdr}<div class="tabs"><span>Overview</span><span>Team</span><span>Matchup</span><span class="on">Stories<em></em></span><span>League</span></div><div class="feed">${ST.map(s=>`<div class="fr" style="background:linear-gradient(110deg,${s.c}40,#141518 60%)">${im(s)}<i style="background:${s.c}">${s.i}</i><div><small>${s.n.toUpperCase()}</small><b>${s.h}</b></div></div>`).join("")}</div></div>${H.nav}</div>`);
/* 16 */add("Stacked avatars by search","A tiny cluster top-right","Overlapping mini avatars next to the search icon with a \"4\". Takes almost no space.",
page([`<div class="hdr"><span class="lg">MM</span><b>Home</b><span class="stk">${ST.map(s=>`<span style="border-color:${s.c}">${im(s)}</span>`).join("")}<em>4</em></span><span class="sr">⌕</span></div>`,"tabs","mc","cats","totw","ln","wv"]));
/* 17 */add("Hero carousel","Stories take over the top hero spot","The top of Home becomes a swipeable hero. The matchup is card 1, and the stories are cards 2–5.",
page(["hdr","tabs",`<div class="hero"><div class="hc mcc">${H.mc}</div><div class="hc" style="background:linear-gradient(150deg,${ST[0].c},${ST[0].c2})">${im(ST[0])}<small>DAILY RECAP</small><b>${ST[0].h}</b></div></div><div class="hdots"><i class="on"></i>${ST.map(s=>`<i style="background:${s.c}"></i>`).join("")}</div>`,"cats","ln","wv"]));
/* 18 */add("End-of-page catch-up","At the bottom of Home","Scroll to the end and you land on a \"Catch up\" grid of the 4 stories, like a newspaper's back page.",
page(["mc","cats","ln","wv",`<div class="end"><div class="eh">Caught up on Home. <b>4 stories left</b></div><div class="eg">${ST.map(s=>`<div class="ec">${icon(s,30,9)}<b>${s.n}</b><small>${s.h}</small></div>`).join("")}</div></div>`],"","endview"));
/* 19 */add("Top toast","Slides down from the top when a new one drops","When a story is ready, a toast drops in under the header: \"Daily Recap is ready\". Tap to watch, swipe it away.",
page(["hdr","tabs","mc","cats","totw","ln","wv"],`<div class="toast">${ring(ST[0],38)}<div><b>Daily Recap is ready</b><small>Wemby 36-14-5 · +3 more stories</small></div><span>▶</span></div>`));
/* 20 */add("Inside More","Stories as rows in the More menu","The quiet option: no story UI on Home. More gets a \"Stories\" section with a row per story and its headline.",
`<div class="scr"><div class="body"><div class="hdr"><span class="lg">MM</span><b>More</b><span class="sr">⌕</span></div><div class="mh">STORIES</div><div class="ml">${ST.map(s=>`<div class="mr">${ring(s,36)}<div><b>${s.n}</b><small>${s.h}</small></div>${s.new?'<em>NEW</em>':""}<span>›</span></div>`).join("")}</div><div class="mh">APP</div><div class="ml"><div class="mr"><div><b>League rules</b></div><span>›</span></div><div class="mr"><div><b>Week setup</b></div><span>›</span></div><div class="mr"><div><b>Sign out</b></div><span>›</span></div></div></div><div class="nav"><span>⌂<small>Home</small></span><span>☰<small>Overview</small></span><span>🏀<small>NBA</small></span><span>📰<small>News</small></span><span class="on">•••<small>More</small></span></div></div>`);
