const MM=[
{hn:"Trakya Blazers",an:"Tralala Cafe Crown",c:["#1F7A4D","#2F4F7F"],s0:[3,6,0],s1:[4,5,0],flips:[{c:"AST",to:1,b:[36,46],a:[83,79],why:"Jokic 10 AST"}]},
{hn:"Besiktas Sompo Japan",an:"Cubuklu Fireballs",c:["#8A3E6E","#B8860B"],s0:[3,5,1],s1:[6,3,0],flips:[{c:"FT%",to:1,b:[.762,.788],a:[.827,.814],why:"Barnes 6-6 FT"},{c:"3PM",to:1,b:[21,22],a:[38,36],why:"Mobley 5 3PM"},{c:"TO",to:1,b:[30,30],a:[48,54],why:"Fireballs 24 TO"}]},
{hn:"Dimes Square SK",an:"Mastika Magics",c:["#7A5C1F","#7B5236"],me:1,s0:[3,6,0],s1:[3,6,0],flips:[]},
{hn:"Brookline Belediyespor",an:"King of New York",c:["#3D6B6B","#A23B3B"],s0:[7,2,0],s1:[8,1,0],flips:[{c:"3PM",to:1,b:[16,17],a:[33,25],why:"Miller 3 3PM"}]},
{hn:"LeTakim",an:"Chicago Belediyespor",c:["#0068A8","#6B3FA0"],s0:[2,7,0],s1:[3,6,0],flips:[{c:"FG%",to:1,b:[.497,.500],a:[.489,.474],why:"Giannis 11-18"}]}];
const CATS=["PTS","3PM","REB","AST","STL","BLK","FG%","FT%","TO"];
/* who leads each cat after last night (1 home, -1 away, 0 tie) — consistent with scores */
const WIN=[[1,-1,-1,1,-1,1,-1,-1,1],[1,1,-1,1,-1,1,-1,1,1],[-1,-1,1,-1,-1,1,-1,-1,1],[1,1,1,1,1,1,1,-1,1],[-1,-1,1,-1,1,-1,1,-1,-1]];
const P=(id,n,t,own,MIN,PTS,REB,AST,STL,BLK,TO,TPM,FGM,FGA,FTM,FTA,fv,pf,hot)=>({id,n,t,own,MIN,PTS,REB,AST,STL,BLK,TO,"3PM":TPM,FGM,FGA,FTM,FTA,fv,pf,hot});
const HOT=[P("4433405","Tyler Kolek","NY","FA",18,9,2,9,0,0,0,3,3,4,0,0,5.6,2.3,143),P("4397189","Jalen Smith","CHI","FA",30,17,11,5,0,3,0,3,7,12,0,0,9.9,5,98),P("3914044","Landry Shamet","NY","FA",32,14,1,5,0,2,0,4,5,10,0,0,6.5,3.3,97),P("3037789","Bogdan Bogdanovic","HOU","FA",15,16,2,4,2,0,1,4,5,6,2,2,6.7,3.5,91),P("5149077","Kingston Flemings","ATL","FA",28,23,5,5,1,1,2,3,9,12,2,3,8.7,4.6,89)];
const COLD=[P("4683771","Ronald Holland II","DET","FA",12,0,2,1,0,0,4,0,0,2,0,0,0,3.4,-100),P("3912848","Dean Wade","PHI","FA",17,0,1,1,0,0,1,0,0,4,0,0,0.2,3.1,-94),P("2991043","Gary Payton II","GS","FA",10,2,2,1,0,0,0,0,1,2,0,0,1.2,3.5,-66),P("4683634","Bennedict Mathurin","NO","FA",14,5,1,2,1,0,3,1,2,5,0,0,2,5.2,-62)];
const ph=id=>`https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${id}.png&w=260&h=190`;
const ini=n=>n.replace(/[^A-Za-z ]/g,"").split(" ").filter(Boolean).map(w=>w[0]).join("").slice(0,2).toUpperCase();
const ab=n=>{const w=n.split(" ");return (w.length>1?w.map(x=>x[0]).join(""):n).slice(0,3).toUpperCase()};
const sc=s=>s.join("-");
const fmt=(c,v)=>c.endsWith("%")?v.toFixed(3).replace(/^0/,""):Math.round(v);
const last=n=>n.replace(/ (II|III|Jr\.)$/,"").split(" ").slice(-1)[0];
