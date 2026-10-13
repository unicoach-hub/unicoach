#!/usr/bin/env bash
# Runs ON the VPS. Updates the Coolify-managed app's MONGO_URI to Atlas and redeploys.
# Env in: APP_UUID, MONGO_B64 (base64 of the Atlas URI), DO_FIX (true|false).
set -e
API=http://localhost:8000/api/v1

echo "=== creating team-scoped Coolify API token ==="
TOKEN=$(docker exec -i coolify php artisan tinker 2>/dev/null <<'PHP' | grep -oE 'TOKENIS:[0-9]+\|[A-Za-z0-9]+' | sed 's/TOKENIS://' | head -1
$u = \App\Models\User::first();
$tid = \DB::table('team_user')->where('user_id', $u->id)->value('team_id') ?: \App\Models\Team::first()->id;
$p = \Illuminate\Support\Str::random(48);
$id = \DB::table('personal_access_tokens')->insertGetId(['tokenable_type'=>'App\\Models\\User','tokenable_id'=>$u->id,'team_id'=>$tid,'name'=>'claude-deploy','token'=>hash('sha256',$p),'abilities'=>'["*"]','created_at'=>now(),'updated_at'=>now()]);
echo "TOKENIS:".$id."|".$p;
PHP
)
if [ -z "$TOKEN" ]; then echo "TOKEN CREATION FAILED"; exit 1; fi
echo "token acquired (len ${#TOKEN})"

echo; echo "=== current MONGO_URI (masked) ==="
curl -s -H "Authorization: Bearer $TOKEN" "$API/applications/$APP_UUID/envs" > /tmp/envs.json || true
python3 - <<'PY'
import json
try:
    d=json.load(open('/tmp/envs.json'))
    rows = d if isinstance(d,list) else d.get('data',d)
    for e in rows:
        if isinstance(e,dict) and e.get('key')=='MONGO_URI':
            v=(e.get('value') or e.get('real_value') or '')
            print('  current value starts:', v[:30])
except Exception as ex:
    print('  (parse failed)', ex)
PY

if [ "$DO_FIX" != "true" ]; then echo; echo "READ-ONLY: no changes made."; exit 0; fi

NEW=$(echo "$MONGO_B64" | base64 -d)
echo; echo "=== PATCH MONGO_URI then redeploy ==="
NEW="$NEW" API="$API" APP_UUID="$APP_UUID" TOKEN="$TOKEN" python3 - <<'PY'
import os,json,urllib.request
tok=os.environ['TOKEN']; api=os.environ['API']; uuid=os.environ['APP_UUID']; new=os.environ['NEW']
def call(method,url,body=None):
    data=json.dumps(body).encode() if body is not None else None
    req=urllib.request.Request(url,data=data,method=method,
        headers={"Authorization":f"Bearer {tok}","Content-Type":"application/json"})
    try:
        return urllib.request.urlopen(req,timeout=40).read().decode()[:300]
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}: {e.read().decode()[:300]}"
    except Exception as e:
        return f"ERR {e}"
print("PATCH:", call("PATCH", f"{api}/applications/{uuid}/envs", {"key":"MONGO_URI","value":new,"is_preview":False}))
print("DEPLOY:", call("GET", f"{api}/deploy?uuid={uuid}&force=true"))
PY
echo "=== deployment queued ==="
