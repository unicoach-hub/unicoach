import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Input, Tooltip, message } from 'antd';
import {
  PhoneOutlined, PhoneFilled, CloseOutlined, AudioMutedOutlined, AudioOutlined, NumberOutlined,
} from '@ant-design/icons';
import API from '../api/axios';

/**
 * Team softphone: call students from the browser on the team's Vobiz number, and take calls to it.
 * Logs in with this user's Vobiz SIP endpoint (GET /admin/softphone/me). Calls are recorded and
 * transcribed by Vobiz and show up in AI Calls → Call history.
 * Other pages open it with: window.dispatchEvent(new CustomEvent('softphone:dial', { detail: { phone, leadId, name } }))
 * Once switched on it stays online (localStorage) so incoming calls ring on every admin page.
 */
const ONLINE_KEY = 'softphone_online';
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

const readOnline = () => { try { return localStorage.getItem(ONLINE_KEY) === '1'; } catch { return false; } };
const writeOnline = (on) => { try { localStorage.setItem(ONLINE_KEY, on ? '1' : '0'); } catch { /* private mode */ } };

const toE164 = (v) => {
  const digits = String(v || '').replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return String(v || '').trim().startsWith('+') ? `+${digits}` : '';
};

const fmtClock = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const Softphone = () => {
  const clientRef = useRef(null);
  const [open, setOpen] = useState(false);
  // off | connecting | ready | calling | ringing | incoming | in-call | error | unavailable
  const [state, setState] = useState('off');
  const [error, setError] = useState('');
  const [number, setNumber] = useState('');
  const [target, setTarget] = useState(null); // { leadId, name }
  const [caller, setCaller] = useState('');
  const [muted, setMuted] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [teamNumber, setTeamNumber] = useState('');

  const connect = useCallback(async () => {
    if (clientRef.current) return;
    setState('connecting');
    setError('');
    try {
      const { data } = await API.get('/admin/softphone/me');
      if (!data.enabled) { setState('unavailable'); return; }
      setTeamNumber(data.teamNumber || '');
      const { default: Vobiz } = await import('vobiz-webrtc-sdk');
      const vobiz = new Vobiz({
        debug: 'ERROR', permOnClick: true, enableTracking: false, enableQualityTracking: 'NONE', closeProtection: true,
      });
      const client = vobiz.client;
      clientRef.current = client;

      client.on('onLogin', () => { setState('ready'); writeOnline(true); });
      client.on('onLoginFailed', (cause) => { setState('error'); setError(`Login failed${cause ? `: ${cause}` : ''}`); clientRef.current = null; });
      client.on('onConnectionChange', (info) => { if (info?.state === 'disconnected') setState((s) => (s === 'in-call' ? s : 'connecting')); });
      client.on('onCalling', () => setState('calling'));
      client.on('onCallRemoteRinging', () => setState('ringing'));
      client.on('onCallAnswered', () => { setState('in-call'); setSeconds(0); });
      client.on('onIncomingCall', (callerName) => {
        setCaller(String(callerName || '').replace(/^sip:/, '').split('@')[0]);
        setState('incoming');
        setOpen(true);
      });
      const done = () => { setState('ready'); setMuted(false); setShowKeys(false); setCaller(''); };
      client.on('onIncomingCallCanceled', done);
      client.on('onCallTerminated', done);
      client.on('onCallFailed', (cause) => { done(); if (cause && !/cancel/i.test(String(cause))) message.warning(`Call failed: ${cause}`); });
      client.on('onPermissionDenied', () => message.error('Allow microphone access in the browser to use the phone'));

      client.login(data.username, data.password);
    } catch (e) {
      clientRef.current = null;
      setState('error');
      setError(e?.response?.data?.message || e.message || 'Could not start the phone');
    }
  }, []);

  const disconnect = () => {
    try { clientRef.current?.logout(); } catch { /* already gone */ }
    clientRef.current = null;
    writeOnline(false);
    setState('off');
  };

  // Stay online across reloads once switched on, so incoming calls ring
  useEffect(() => { if (readOnline()) connect(); }, [connect]);

  // "Call from browser" buttons elsewhere in admin
  useEffect(() => {
    const onDial = (e) => {
      const { phone, leadId, name } = e.detail || {};
      setNumber(phone || '');
      setTarget(leadId || name ? { leadId, name } : null);
      setOpen(true);
      connect();
    };
    window.addEventListener('softphone:dial', onDial);
    return () => window.removeEventListener('softphone:dial', onDial);
  }, [connect]);

  useEffect(() => {
    if (state !== 'in-call') return undefined;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  const call = () => {
    const to = toE164(number);
    if (!/^\+91\d{10}$/.test(to)) { message.warning('Enter an Indian number, e.g. 98xxxxxxxx'); return; }
    clientRef.current?.call(to, target?.leadId ? { 'X-PH-LeadId': target.leadId } : {});
  };
  const hangup = () => clientRef.current?.hangup();
  const answer = () => clientRef.current?.answer();
  const reject = () => clientRef.current?.reject();
  const toggleMute = () => {
    if (muted) clientRef.current?.unmute(); else clientRef.current?.mute();
    setMuted(!muted);
  };

  const busy = ['calling', 'ringing', 'in-call'].includes(state);
  const statusText = {
    off: 'Off', connecting: 'Connecting…', ready: `Online${teamNumber ? ` · ${teamNumber}` : ''}`,
    calling: 'Calling…', ringing: 'Ringing…', incoming: 'Incoming call', 'in-call': fmtClock(seconds),
    error: error || 'Error', unavailable: 'Not set up on the server',
  }[state];
  const dotColor = state === 'ready' || state === 'in-call' ? '#16a34a' : state === 'error' ? '#dc2626' : state === 'off' ? '#9ca3af' : '#f59e0b';

  return (
    <>
      <audio id="remoteAudio" autoPlay hidden />
      {!open && (
        <Tooltip title="Phone" placement="left">
          <button
            type="button"
            aria-label="Open phone"
            onClick={() => { setOpen(true); if (state === 'off') connect(); }}
            style={{
              position: 'fixed', right: 20, bottom: 20, zIndex: 1000, width: 52, height: 52, borderRadius: '50%',
              border: 'none', cursor: 'pointer', background: state === 'incoming' ? '#16a34a' : '#ea580c', color: '#fff',
              fontSize: 22, boxShadow: '0 6px 20px rgba(0,0,0,.18)',
            }}
          >
            <PhoneFilled />
            {state !== 'off' && <span style={{ position: 'absolute', top: 4, right: 4, width: 10, height: 10, borderRadius: '50%', background: dotColor, border: '2px solid #fff' }} />}
          </button>
        </Tooltip>
      )}
      {open && (
        <div
          role="dialog"
          aria-label="Phone"
          className="nx-card"
          style={{
            position: 'fixed', right: 16, bottom: 16, zIndex: 1000, width: 'min(300px, calc(100vw - 32px))', padding: 14,
            boxShadow: '0 12px 32px rgba(0,0,0,.18)', display: 'grid', gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor }} />
            <strong style={{ flex: 1 }}>Phone</strong>
            <span style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{statusText}</span>
            <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setOpen(false)} aria-label="Close phone" />
          </div>

          {state === 'incoming' && (
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{caller || 'Unknown caller'}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button type="primary" icon={<PhoneOutlined />} onClick={answer} style={{ flex: 1, background: '#16a34a' }}>Answer</Button>
                <Button danger onClick={reject} style={{ flex: 1 }}>Decline</Button>
              </div>
            </div>
          )}

          {state !== 'incoming' && (
            <>
              {target?.name && <div style={{ fontSize: 13 }}>Calling <strong>{target.name}</strong></div>}
              <Input
                value={number}
                onChange={(e) => { setNumber(e.target.value); setTarget(null); }}
                onPressEnter={() => !busy && state === 'ready' && call()}
                placeholder="98xxxxxxxx"
                prefix={<PhoneOutlined />}
                disabled={busy}
                inputMode="tel"
              />
              {!busy ? (
                <Button type="primary" icon={<PhoneOutlined />} onClick={call} disabled={state !== 'ready'} block>Call</Button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button icon={muted ? <AudioMutedOutlined /> : <AudioOutlined />} onClick={toggleMute} disabled={state !== 'in-call'}>{muted ? 'Unmute' : 'Mute'}</Button>
                  <Button icon={<NumberOutlined />} onClick={() => setShowKeys((v) => !v)} disabled={state !== 'in-call'} aria-label="Keypad" />
                  <Button danger type="primary" onClick={hangup} style={{ flex: 1 }}>Hang up</Button>
                </div>
              )}
              {showKeys && state === 'in-call' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {KEYS.map((k) => <Button key={k} onClick={() => clientRef.current?.sendDtmf(k)}>{k}</Button>)}
                </div>
              )}
            </>
          )}

          {['off', 'error', 'unavailable'].includes(state) ? (
            <Button size="small" onClick={connect} disabled={state === 'unavailable'}>Go online</Button>
          ) : (
            !busy && state !== 'incoming' && <Button size="small" type="text" onClick={disconnect}>Go offline (stop incoming calls)</Button>
          )}
          <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)' }}>Calls are recorded and transcribed. They show up in AI Calls → Call history.</div>
        </div>
      )}
    </>
  );
};

export default Softphone;
