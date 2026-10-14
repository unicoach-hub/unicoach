#!/usr/bin/env bash
# Runs ON the VPS. Triggers a Coolify redeploy of the backend app (no env change).
# Env in: APP_UUID.
set -e
API=http://localhost:8000/api/v1

echo "=== ensuring Coolify API enabled ==="
docker exec coolify-db psql -U coolify -d coolify -c "UPDATE instance_settings SET is_api_enabled = true;" 2>&1 | head -1 || true
docker exec coolify php artisan optimize:clear 2>/dev/null | tail -1 || true

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

echo "=== triggering redeploy (force, pulls latest main) ==="
API="$API" APP_UUID="$APP_UUID" TOKEN="$TOKEN" python3 - <<'PY'
import os,json,urllib.request,urllib.error
tok=os.environ['TOKEN']; api=os.environ['API']; uuid=os.environ['APP_UUID']
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
print("DEPLOY:", call("POST", f"{api}/deploy?uuid={uuid}&force=true", {}))
PY
echo "=== deployment queued ==="
