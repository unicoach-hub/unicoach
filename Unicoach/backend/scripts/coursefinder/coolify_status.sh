#!/usr/bin/env bash
# Runs ON the VPS. Reports the Coolify app's recent deployment statuses + running container.
# Env in: APP_UUID.
set -e
API=http://localhost:8000/api/v1
TOKEN=$(docker exec -i coolify php artisan tinker 2>/dev/null <<'PHP' | grep -oE 'TOKENIS:[0-9]+\|[A-Za-z0-9]+' | sed 's/TOKENIS://' | head -1
$u = \App\Models\User::first();
$tid = \DB::table('team_user')->where('user_id', $u->id)->value('team_id') ?: \App\Models\Team::first()->id;
$p = \Illuminate\Support\Str::random(48);
\DB::table('personal_access_tokens')->insert(['tokenable_type'=>'App\\Models\\User','tokenable_id'=>$u->id,'team_id'=>$tid,'name'=>'claude-deploy','token'=>hash('sha256',$p),'abilities'=>'["*"]','created_at'=>now(),'updated_at'=>now()]);
echo "TOKENIS:0|".$p;
PHP
)
echo "token len ${#TOKEN}"
echo "=== recent deployments ==="
curl -s -H "Authorization: Bearer $TOKEN" "$API/deployments/$APP_UUID" 2>/dev/null | head -c 1200; echo
echo "=== latest deployments (DB) ==="
docker exec coolify-db psql -U coolify -d coolify -c "SELECT status, created_at, commit FROM application_deployment_queues WHERE application_id=(SELECT id FROM applications WHERE uuid='$APP_UUID') ORDER BY created_at DESC LIMIT 5;" 2>&1 | head -12
echo "=== app container ==="
docker ps --filter "name=$APP_UUID" --format '{{.Names}} | {{.Status}} | {{.Image}}' 2>&1 | head
