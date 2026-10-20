"""Live ESPN matchup scores for every Fantasy Plus league -> live/<league_id>.json.
Runs on GitHub Actions. League cookies come from the LEAGUES_JSON secret (the contents of data/leagues.json)."""
import json, os, sys, time
import requests

BASE = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/{season}/segments/0/leagues/{lid}"
STAT = {0: "PTS", 1: "BLK", 2: "STL", 3: "AST", 6: "REB", 11: "TO", 13: "FGM", 14: "FGA", 15: "FTM", 16: "FTA",
        17: "3PM", 19: "FG%", 20: "FT%", 21: "3P%", 4: "OREB", 5: "DREB", 37: "DD", 38: "TD"}


def cookies(L):
    c = {}
    if L.get("swid"):
        s = L["swid"].strip()
        c["SWID"] = s if s.startswith("{") else "{" + s + "}"
    if L.get("espn_s2"):
        c["espn_s2"] = L["espn_s2"].strip()
    return c


def fetch(L):
    url = BASE.format(season=L["season"], lid=L["league_id"])
    params = [("view", v) for v in ("mMatchupScore", "mLiveScoring", "mScoreboard", "mStatus", "mTeam", "mSettings")]
    r = requests.get(url, params=params, cookies=cookies(L), timeout=30,
                     headers={"User-Agent": "Mozilla/5.0 (Fantasy Plus live)"})
    r.raise_for_status()
    return r.json()


def side(x):
    if not x:
        return None
    cs = x.get("cumulativeScore") or {}
    stats = {}
    for k, v in (cs.get("scoreByStat") or {}).items():
        n = STAT.get(int(k))
        if n and isinstance(v, dict) and v.get("score") is not None:
            stats[n] = round(v["score"], 4) if n.endswith("%") else round(v["score"], 1)
    pts = x.get("totalPointsLive")
    if pts is None:
        pts = x.get("totalPoints", 0)
    return {"id": x.get("teamId"), "pts": round(pts or 0, 1), "w": cs.get("wins", 0), "l": cs.get("losses", 0),
            "t": cs.get("ties", 0), "s": stats}


def build(raw):
    st = raw.get("status", {})
    per = st.get("currentMatchupPeriod") or 1
    teams = {}
    rec = {}
    for t in raw.get("teams", []):
        nm = (t.get("name") or (t.get("location", "") + " " + t.get("nickname", ""))).strip()
        teams[str(t["id"])] = nm
        o = (t.get("record") or {}).get("overall", {})
        rec[str(t["id"])] = [o.get("wins", 0), o.get("losses", 0), o.get("ties", 0), o.get("pointsFor", 0)]
    ms = []
    for m in raw.get("schedule", []):
        if m.get("matchupPeriodId") != per:
            continue
        ms.append({"h": side(m.get("home")), "a": side(m.get("away")), "win": m.get("winner")})
    sc = (raw.get("settings") or {}).get("scoringSettings") or {}
    return {"lid": str(raw.get("id")), "period": per, "sp": raw.get("scoringPeriodId"),
            "type": sc.get("scoringType"), "teams": teams, "rec": rec, "m": ms}


def main():
    leagues = json.loads(os.environ["LEAGUES_JSON"])
    if isinstance(leagues, dict):
        leagues = leagues.get("leagues", [])
    os.makedirs("live", exist_ok=True)
    seen, changed = set(), 0
    for L in leagues:
        lid = str(L.get("league_id"))
        if not lid or lid in seen:
            continue
        seen.add(lid)
        try:
            data = build(fetch(L))
        except Exception as e:
            print(f"{lid}: failed ({type(e).__name__})", file=sys.stderr)
            continue
        path = f"live/{lid}.json"
        old = None
        if os.path.exists(path):
            try:
                old = json.load(open(path))
                old.pop("ts", None)
            except Exception:
                old = None
        if old == data:
            print(f"{lid}: no change")
            continue
        data["ts"] = int(time.time())
        json.dump(data, open(path, "w"), ensure_ascii=False, separators=(",", ":"))
        changed += 1
        print(f"{lid}: updated, period {data['period']}, {len(data['m'])} matchups")
    print("changed", changed)


if __name__ == "__main__":
    main()
