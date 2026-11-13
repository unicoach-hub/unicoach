import React, { useState } from 'react';
import { Button, Tooltip, message } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, CopyOutlined } from '@ant-design/icons';

/**
 * Shows a bank account number, UPI ID or PAN masked, with one click to reveal it.
 *
 * The admin needs these to make the actual transfer, so they are never hidden for good: they are
 * just not left on screen by default, where a screenshot, a shared screen or someone walking past
 * would pick them up. Revealing is per value and resets as soon as the page re-renders from the
 * server, so nothing stays open by accident.
 */

const maskTail = (value, keep = 4) => {
  const s = String(value || '').replace(/\s/g, '');
  if (!s) return '';
  if (s.length <= keep) return '•'.repeat(s.length);
  return `${'•'.repeat(Math.min(8, s.length - keep))}${s.slice(-keep)}`;
};

// name@bank -> ••••ar@okaxis, so the bank is still recognisable
const maskUpi = (value) => {
  const s = String(value || '').trim();
  if (!s.includes('@')) return maskTail(s, 3);
  const [handle, bank] = s.split('@');
  return `${maskTail(handle, 2)}@${bank}`;
};

export const maskSecret = (value, kind = 'account') => {
  if (!value) return '';
  if (kind === 'upi') return maskUpi(value);
  if (kind === 'pan') {
    const s = String(value).trim().toUpperCase();
    return s.length <= 3 ? '•'.repeat(s.length) : `${s.slice(0, 2)}${'•'.repeat(s.length - 3)}${s.slice(-1)}`;
  }
  return maskTail(value);
};

const SecretValue = ({ value, kind = 'account', copyLabel, style, placeholder = '—' }) => {
  const [shown, setShown] = useState(false);
  if (!value) return <span style={{ opacity: 0.6, ...style }}>{placeholder}</span>;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...style }}>
      <span style={{ fontFamily: 'monospace' }}>{shown ? value : maskSecret(value, kind)}</span>
      <Tooltip title={shown ? 'Hide' : 'Show'}>
        <Button
          size="small"
          type="text"
          shape="circle"
          aria-label={shown ? 'Hide' : 'Show'}
          icon={shown ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          onClick={(e) => { e.stopPropagation(); setShown((v) => !v); }}
        />
      </Tooltip>
      {copyLabel && (
        <Tooltip title={`Copy ${copyLabel}`}>
          <Button
            size="small"
            type="text"
            shape="circle"
            aria-label={`Copy ${copyLabel}`}
            icon={<CopyOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(String(value));
              message.success(`${copyLabel} copied`);
            }}
          />
        </Tooltip>
      )}
    </span>
  );
};

export default SecretValue;
