import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, message, Popconfirm, Spin, Tooltip } from 'antd';
import { WhatsAppOutlined, CheckCircleFilled, CopyOutlined, DisconnectOutlined, ReloadOutlined } from '@ant-design/icons';
import API from '../api/axios';

// "Connect with Facebook" for the WhatsApp Business (Cloud) API — Meta's Embedded Signup.
// Facebook's popup lets the admin pick or create the WhatsApp Business account and number; the popup
// returns a one-time code and the account ids, and the backend finishes the connection.
const SDK_SRC = 'https://connect.facebook.net/en_US/sdk.js';
const GRAPH_VERSION = 'v20.0';

const loadFacebookSdk = (appId) => new Promise((resolve, reject) => {
  const init = () => {
    window.FB.init({ appId, autoLogAppEvents: true, xfbml: false, version: GRAPH_VERSION });
    resolve(window.FB);
  };
  if (window.FB) { init(); return; }
  window.fbAsyncInit = init;
  if (!document.querySelector(`script[src="${SDK_SRC}"]`)) {
    const s = document.createElement('script');
    s.src = SDK_SRC;
    s.async = true;
    s.defer = true;
    s.crossOrigin = 'anonymous';
    s.onerror = () => reject(new Error('Could not load Facebook. Check your internet or ad blocker.'));
    document.body.appendChild(s);
  }
});

const copy = (text) => {
  navigator.clipboard?.writeText(text).then(() => message.success('Copied'), () => message.error('Copy failed'));
};

const WhatsappConnect = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [configId, setConfigId] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  // Ids Facebook posts to the page while the popup runs
  const signupInfo = useRef({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/whatsapp/status');
      setStatus(data);
      setConfigId(data.configId || '');
    } catch {
      message.error('Could not load WhatsApp status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const onMessage = (event) => {
      try {
        if (!/(^|\.)facebook\.com$/.test(new URL(event.origin).hostname)) return;
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type !== 'WA_EMBEDDED_SIGNUP') return;
        if (data.event === 'FINISH' || data.event === 'FINISH_ONLY_WABA') {
          signupInfo.current = { wabaId: data.data?.waba_id, phoneNumberId: data.data?.phone_number_id };
        } else if (data.event === 'CANCEL') {
          signupInfo.current = { cancelledAt: data.data?.current_step };
        }
      } catch { /* other Facebook messages */ }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const saveConfigId = async () => {
    setSavingConfig(true);
    try {
      await API.put('/admin/settings-manage', { wabaConfigId: configId.trim() });
      message.success('Configuration ID saved');
      load();
    } catch {
      message.error('Could not save');
    } finally {
      setSavingConfig(false);
    }
  };

  const connect = async () => {
    if (window.location.protocol !== 'https:') {
      message.warning('Facebook only allows this on https. Use the live admin (admin.unicoach.com), not localhost.');
      return;
    }
    setConnecting(true);
    signupInfo.current = {};
    try {
      const FB = await loadFacebookSdk(status.appId);
      FB.login((response) => {
        const code = response?.authResponse?.code;
        if (!code) {
          setConnecting(false);
          message.info(signupInfo.current.cancelledAt ? `Cancelled at: ${signupInfo.current.cancelledAt}` : 'Facebook window closed before finishing.');
          return;
        }
        // The account ids arrive by postMessage just before or after the login callback
        const finish = async (tries = 0) => {
          const { wabaId, phoneNumberId } = signupInfo.current;
          if ((!wabaId || !phoneNumberId) && tries < 20) {
            setTimeout(() => finish(tries + 1), 250);
            return;
          }
          try {
            const { data } = await API.post('/admin/whatsapp/embedded-signup', { code, wabaId, phoneNumberId });
            message.success(`WhatsApp connected: ${data.phoneNumber || 'number added'}`);
            (data.notes || []).forEach((n) => message.warning(n, 8));
            load();
          } catch (err) {
            message.error(err.response?.data?.message || 'Could not connect WhatsApp', 8);
          } finally {
            setConnecting(false);
          }
        };
        finish();
      }, {
        config_id: status.configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, featureType: '', sessionInfoVersion: '3' },
      });
    } catch (err) {
      setConnecting(false);
      message.error(err.message);
    }
  };

  const disconnect = async () => {
    try {
      await API.post('/admin/whatsapp/disconnect');
      message.success('Disconnected');
      load();
    } catch {
      message.error('Could not disconnect');
    }
  };

  if (loading && !status) return <div className="nx-card p-6 flex justify-center"><Spin /></div>;
  if (!status) return null;

  const missing = [
    !status.appId && 'Meta App ID',
    !status.hasAppSecret && 'Meta App Secret',
    !status.configId && 'Configuration ID',
  ].filter(Boolean);

  return (
    <div className="nx-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-3">
          <span className="nx-icon-circle" style={{ color: '#16a34a' }}><WhatsAppOutlined /></span>
          <div>
            <div className="nx-section-title">WhatsApp Business</div>
            <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>Connect your number through Facebook to send and receive WhatsApp messages</div>
          </div>
        </div>
        <Button size="small" icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
      </div>

      {status.connected ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 16px', borderRadius: 14, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircleFilled style={{ color: '#16a34a', fontSize: 22 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#14532d' }}>Connected{status.displayName ? `: ${status.displayName}` : ''}</div>
              <div style={{ fontSize: 13, color: '#166534' }}>
                {status.phoneNumber || status.phoneNumberId}
                {status.connectedAt ? ` · since ${new Date(status.connectedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={connect} loading={connecting} disabled={missing.length > 0}>Reconnect</Button>
            <Popconfirm title="Disconnect WhatsApp?" description="Bulk WhatsApp stops until you connect again." okText="Disconnect" okButtonProps={{ danger: true }} onConfirm={disconnect}>
              <Button danger icon={<DisconnectOutlined />}>Disconnect</Button>
            </Popconfirm>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Tooltip title={missing.length ? `Add first: ${missing.join(', ')}` : ''}>
            <Button
              type="primary"
              size="large"
              onClick={connect}
              loading={connecting}
              disabled={missing.length > 0}
              style={{ background: missing.length ? undefined : '#1877F2', borderColor: '#1877F2', fontWeight: 700 }}
            >
              Connect with Facebook
            </Button>
          </Tooltip>
          <span style={{ fontSize: 13, color: 'var(--ux-text-2)' }}>
            {missing.length ? `Needs: ${missing.join(', ')}` : 'Opens Facebook: choose your business and WhatsApp number, then come back here.'}
          </span>
        </div>
      )}

      <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
        <div>
          <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>
            Configuration ID <span style={{ color: 'var(--ux-text-3)', fontWeight: 400 }}>(Meta app → Facebook Login for Business → Configurations, type “WhatsApp Embedded Signup”)</span>
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={configId} onChange={(e) => setConfigId(e.target.value)} placeholder="e.g. 1234567890123456" />
            <Button onClick={saveConfigId} loading={savingConfig} disabled={configId.trim() === (status.configId || '')}>Save</Button>
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>
          Meta App ID and App Secret are the ones in the Meta / Instagram section above
          ({status.appId ? 'App ID added' : 'App ID missing'}, {status.hasAppSecret ? 'App Secret added' : 'App Secret missing'}).
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)' }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Webhook (Meta app → WhatsApp → Configuration)</div>
          {[['Callback URL', status.webhookUrl], ['Verify token', status.verifyToken]].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 96, fontSize: 12.5, color: 'var(--ux-text-2)' }}>{label}</span>
              <code style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12.5 }}>{value}</code>
              <Button size="small" icon={<CopyOutlined />} onClick={() => copy(value)} />
            </div>
          ))}
          <div style={{ fontSize: 12, color: 'var(--ux-text-3)' }}>Then subscribe to the <b>messages</b> field so replies and delivery reports arrive here.</div>
        </div>
      </div>
    </div>
  );
};

export default WhatsappConnect;
