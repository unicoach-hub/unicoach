#!/usr/bin/env python3
"""HeyGen helper for the tutorial voice-overs (Nitya).

Reads HEYGEN_API_KEY from graphics/product-video/.env (gitignored, shared with the product film) and never prints it.

  python3 heygen.py check                       # key works? avatar + voice found? credits left?
  python3 heygen.py gen OUT.mp4 "text" [--bg "#F6F3EC"] [--kind avatar|talking_photo]
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ENV = os.path.join(HERE, '..', 'product-video', '.env')
API = 'https://api.heygen.com'
AVATAR_ID = 'a0f494cbd0284f5090f066786520a7f9'  # Nitya
VOICE_ID = 'a290b34fafdb4b578df4bbaa256d7b57'   # Nitya's voice


def key():
    with open(ENV) as f:
        for line in f:
            line = line.strip()
            if line.startswith('HEYGEN_API_KEY='):
                return line.split('=', 1)[1].strip().strip('\'"')
    sys.exit('HEYGEN_API_KEY not found in graphics/product-video/.env')


def call(path, body=None):
    req = urllib.request.Request(
        API + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers={'X-Api-Key': key(), 'Content-Type': 'application/json', 'Accept': 'application/json'},
        method='POST' if body is not None else 'GET',
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return {'http_error': e.code, 'body': e.read().decode()[:600]}


def find_avatar():
    d = call(f'/v2/avatar/{AVATAR_ID}/details')
    if isinstance(d.get('data'), dict) and d['data']:
        return d['data'].get('type') or 'avatar', d['data']
    lists = call('/v2/avatars').get('data') or {}
    for a in lists.get('avatars', []):
        if a.get('avatar_id') == AVATAR_ID:
            return 'avatar', a
    for t in lists.get('talking_photos', []):
        if t.get('talking_photo_id') == AVATAR_ID:
            return 'talking_photo', t
    stream = call('/v1/streaming/avatar.list')
    for a in stream.get('data') or []:
        if a.get('avatar_id') == AVATAR_ID:
            return 'interactive', a
    return None, d


def check():
    q = call('/v2/user/remaining_quota')
    print('quota:', json.dumps(q.get('data', q))[:400])
    kind, info = find_avatar()
    keep = {k: v for k, v in (info or {}).items() if k in ('type', 'id', 'avatar_id', 'talking_photo_id', 'name', 'avatar_name', 'talking_photo_name', 'gender', 'premium', 'default_voice_id', 'http_error', 'body')}
    print('avatar kind:', kind, json.dumps(keep)[:400])
    voices = (call('/v2/voices').get('data') or {}).get('voices', [])
    match = [{k: v.get(k) for k in ('voice_id', 'name', 'language', 'gender', 'support_pause')} for v in voices if v.get('voice_id') == VOICE_ID]
    print('voice:', json.dumps(match) if match else f'not in /v2/voices ({len(voices)} voices listed)')


def quota():
    print('quota:', json.dumps(call('/v2/user/remaining_quota').get('data'))[:300], flush=True)


def gen(out, text, bg='#F6F3EC', kind='avatar', style='normal', w='720', h='1280', test='0'):
    character = ({'type': 'talking_photo', 'talking_photo_id': AVATAR_ID} if kind == 'talking_photo'
                 else {'type': 'avatar', 'avatar_id': AVATAR_ID, 'avatar_style': style})
    body = {
        'title': f'UniCoach tutorial: {os.path.basename(out)}',
        'caption': False,
        'test': test == '1',  # free watermarked preview, no credits used
        'dimension': {'width': int(w), 'height': int(h)},
        'video_inputs': [{
            'character': character,
            'voice': {'type': 'text', 'input_text': text, 'voice_id': VOICE_ID, 'speed': 1.0},
            'background': {'type': 'color', 'value': bg},
        }],
    }
    r = call('/v2/video/generate', body)
    vid = (r.get('data') or {}).get('video_id')
    if not vid:
        sys.exit(f'generate failed: {json.dumps(r)[:600]}')
    print('video_id:', vid, flush=True)
    for _ in range(180):  # up to 30 minutes
        time.sleep(10)
        s = call(f'/v1/video_status.get?video_id={vid}')
        d = s.get('data') or {}
        st = d.get('status')
        if st == 'completed':
            urllib.request.urlretrieve(d['video_url'], out)
            print('saved', out, 'duration', d.get('duration'), flush=True)
            return
        if st == 'failed':
            sys.exit(f'failed: {json.dumps(d.get("error"))[:400]}')
    sys.exit('timed out waiting for HeyGen')


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args or args[0] == 'check':
        check()
    elif args[0] == 'quota':
        quota()
    elif args[0] == 'gen':
        opts = {'bg': '#F6F3EC', 'kind': 'avatar', 'style': 'normal'}
        rest = []
        i = 3
        while i < len(args):
            if args[i].startswith('--'):
                opts[args[i][2:]] = args[i + 1]
                i += 2
            else:
                rest.append(args[i])
                i += 1
        gen(args[1], args[2], **opts)
