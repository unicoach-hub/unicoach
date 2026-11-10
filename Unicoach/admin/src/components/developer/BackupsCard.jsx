import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Alert, Tooltip, message } from 'antd';
import { CloudUploadOutlined, DownloadOutlined, SafetyOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import API from '../../api/axios';

// Admin → Developer → Backups (owner only): download the database, back it up to Cloudinary now,
// and see the nightly off-site backups. Backend: controllers/backupController.js, services/dbBackup.js.
const mb = (b) => (b == null ? '—' : `${(b / 1048576).toFixed(1)} MB`);
const when = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—');
const stampDate = (s) => {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s || '');
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])) : null;
};

const Check = ({ ok, children, hint }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 13 }}>
    {ok ? <CheckCircleFilled style={{ color: '#16a34a' }} /> : <CloseCircleFilled style={{ color: '#dc2626' }} />}
    <span>{children}{!ok && hint ? <span style={{ color: 'var(--ux-text-2)' }}> · {hint}</span> : null}</span>
  </div>
);

const BackupsCard = ({ Card }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [starting, setStarting] = useState(false);

  const load = () => API.get('/admin/dev/backups').then((r) => { setData(r.data); setError(''); }, () => setError('Could not load backups'));
  useEffect(() => { load(); }, []);
  // While a backup runs, check every 5 seconds
  useEffect(() => {
    if (!data?.running) return undefined;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [data?.running]);

  const download = async () => {
    setDownloading(true);
    try {
      const r = await API.get('/admin/dev/backups/download', { responseType: 'blob', timeout: 10 * 60 * 1000 });
      const name = /filename="([^"]+)"/.exec(r.headers['content-disposition'] || '')?.[1] || 'unicoach-db.jsonl.gz';
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      message.success(`Downloaded ${name} (${mb(r.data.size)})`);
      load();
    } catch {
      message.error('Backup download failed');
    } finally {
      setDownloading(false);
    }
  };

  const runNow = async () => {
    setStarting(true);
    try {
      await API.post('/admin/dev/backups/run');
      message.info('Backup started. It takes a minute or two.');
      setData((d) => ({ ...d, running: true }));
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not start the backup');
    } finally {
      setStarting(false);
    }
  };

  const setup = data?.setup;
  const offsite = data?.offsite || [];
  const lastOffsite = (data?.runs || []).find((r) => r.kind === 'offsite');

  return (
    <Card
      title="Database backups"
      icon={<SafetyOutlined />}
      extra={(
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button icon={<DownloadOutlined />} loading={downloading} onClick={download}>Download backup</Button>
          <Tooltip title={setup && !setup.encryptionKey ? 'Set BACKUP_ENCRYPTION_KEY in Coolify first' : 'Encrypt and upload a backup to Cloudinary now'}>
            <Button type="primary" icon={<CloudUploadOutlined />} loading={starting || data?.running} disabled={setup && (!setup.encryptionKey || !setup.cloudinary)} onClick={runNow}>
              {data?.running ? 'Backing up…' : 'Back up to Cloudinary now'}
            </Button>
          </Tooltip>
        </div>
      )}
    >
      {error && <Alert type="error" showIcon message={error} />}
      {setup && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          <div style={{ display: 'grid', gap: 6, alignContent: 'start' }}>
            <Check ok={setup.encryptionKey} hint="add BACKUP_ENCRYPTION_KEY in Coolify">Encryption key set</Check>
            <Check ok={setup.cloudinary} hint="Cloudinary keys missing">Cloudinary connected</Check>
            <Check ok={setup.scheduleOn} hint="runs only on the live server">{setup.schedule}, keeps the last {setup.keepDays}</Check>
            <Check ok={Boolean(lastOffsite?.ok)} hint={lastOffsite ? lastOffsite.error : 'no off-site backup yet'}>
              Last off-site backup {lastOffsite?.ok ? `${when(lastOffsite.at)}, ${mb(lastOffsite.bytes)}, ${lastOffsite.docs?.toLocaleString('en-IN')} records` : ''}
            </Check>
            <div style={{ fontSize: 12, color: 'var(--ux-text-3)', marginTop: 4 }}>
              Coolify also keeps its own nightly backup on the server. "Download backup" gives you a readable .jsonl.gz file for your laptop or Google Drive.
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>On Cloudinary (private, encrypted)</div>
            {data.offsiteError && <Alert type="warning" showIcon message={data.offsiteError} style={{ marginBottom: 8 }} />}
            <Table
              size="small"
              rowKey="stamp"
              pagination={false}
              dataSource={offsite}
              locale={{ emptyText: 'No off-site backups yet' }}
              columns={[
                { title: 'Taken', dataIndex: 'stamp', render: (s) => when(stampDate(s)) },
                { title: 'Size', dataIndex: 'bytes', align: 'right', render: mb },
                { title: 'Parts', dataIndex: 'parts', align: 'right' },
              ]}
            />
          </div>
        </div>
      )}
      {data?.runs?.length > 0 && (
        <Table
          style={{ marginTop: 14 }}
          size="small"
          rowKey="_id"
          pagination={{ pageSize: 5, showSizeChanger: false }}
          dataSource={data.runs}
          scroll={{ x: 640 }}
          columns={[
            { title: 'When', dataIndex: 'at', render: when },
            { title: 'Kind', dataIndex: 'kind', render: (k) => (k === 'offsite' ? 'Cloudinary' : 'Download') },
            { title: 'By', dataIndex: 'trigger', render: (t) => <span style={{ fontSize: 12 }}>{t === 'schedule' ? 'Nightly' : t}</span> },
            { title: 'Result', key: 'ok', render: (_, r) => (r.ok ? <Tag color="green">OK</Tag> : <Tooltip title={r.error}><Tag color="red">Failed</Tag></Tooltip>) },
            { title: 'Size', dataIndex: 'bytes', align: 'right', render: mb },
            { title: 'Records', dataIndex: 'docs', align: 'right', render: (x) => (x == null ? '—' : x.toLocaleString('en-IN')) },
          ]}
        />
      )}
    </Card>
  );
};

export default BackupsCard;
