import { useEffect, useMemo, useState } from 'react';
import { Drawer, Table, Tag, Input, Select, Button, Spin, Empty, message } from 'antd';
import { CopyOutlined, SearchOutlined } from '@ant-design/icons';
import API from '../api/axios';
import { getFrontendUrl } from '../config';
import StudentDrawer from './StudentDrawer';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderBottom: '1px solid var(--ux-border, #f0f0f0)' }}>
    <span style={{ color: 'var(--ux-text-2)', fontSize: 13 }}>{label}</span>
    <span style={{ color: 'var(--ux-ink)', fontSize: 13, fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' }}>{value || '—'}</span>
  </div>
);

// Admin → Creators: click a mentor to see their details, referral link and every student they brought in
const MentorDetailDrawer = ({ mentor, open, onClose }) => {
  const [students, setStudents] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [openStudent, setOpenStudent] = useState(null);
  const link = mentor ? `${getFrontendUrl()}/signup?ref=${mentor.handle}` : '';

  useEffect(() => {
    if (!open || !mentor?._id) return;
    setLoading(true);
    setSearch('');
    setStage('');
    API.get('/admin/students', { params: { mentor: mentor._id } })
      .then(({ data }) => { setStudents(data.students || []); setStages(data.stages || []); })
      .catch(() => message.error('Could not load this mentor\'s students'))
      .finally(() => setLoading(false));
  }, [open, mentor?._id]);

  const idx = useMemo(() => Object.fromEntries(stages.map((s, i) => [s.key, i])), [stages]);
  const count = (k) => students.filter((s) => s.journeyStage === k).length;
  const countIn = (keys) => students.filter((s) => keys.includes(s.journeyStage)).length;
  const filtered = students.filter((s) => (!stage || s.journeyStage === stage)
    && (!search.trim() || [s.name, s.email, s.phone].some((v) => String(v || '').toLowerCase().includes(search.trim().toLowerCase()))));

  return (
    <Drawer open={open} onClose={onClose} width={720} title={mentor ? `${mentor.name} (@${mentor.handle})` : 'Mentor'} destroyOnHidden>
      {!mentor ? null : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <section>
            <h4 style={{ margin: '0 0 6px', fontSize: 14 }}>Details</h4>
            <Row label="Email" value={mentor.email} />
            <Row label="Phone" value={mentor.phone} />
            <Row label="Country" value={mentor.country} />
            <Row label="University" value={mentor.university} />
            <Row label="Course" value={[mentor.course, mentor.graduationYear].filter(Boolean).join(' · ')} />
            <Row label="Status" value={<>{mentor.applicationStatus} {mentor.isVerified && <Tag color="blue">Verified</Tag>} {mentor.active === false && <Tag>Inactive</Tag>}</>} />
            <Row label="Rating" value={mentor.reviewCount ? `${Number(mentor.ratingAvg || 0).toFixed(1)} (${mentor.reviewCount} reviews)` : 'No reviews yet'} />
            <Row label="Joined" value={fmt(mentor.createdAt)} />
            <Row label="Time zone" value={mentor.ianaTimezone} />
            <Row label="Services" value={mentor.services?.length ? mentor.services.map((sv) => sv.title).join(', ') : 'None yet'} />
            <Row label="Badges" value={mentor.badges?.length ? mentor.badges.join(', ') : ''} />
            <Row label="Verification proof" value={mentor.verificationDocUrl ? <a href={mentor.verificationDocUrl} target="_blank" rel="noreferrer">Open</a> : 'Not uploaded'} />
            <Row label="Social links" value={Object.entries(mentor.socialLinks || {}).filter(([, v]) => typeof v === 'string' && v).map(([k, v]) => (
              <a key={k} href={v.startsWith('http') ? v : `https://${v}`} target="_blank" rel="noreferrer" style={{ marginLeft: 8, textTransform: 'capitalize' }}>{k}</a>
            ))} />
            <Row label="Public page" value={<a href={`${getFrontendUrl()}/@${mentor.handle}`} target="_blank" rel="noreferrer">@{mentor.handle}</a>} />
            {mentor.headline && <div style={{ marginTop: 10, fontWeight: 600, fontSize: 13 }}>{mentor.headline}</div>}
            {mentor.bio && <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ux-text-2)', whiteSpace: 'pre-wrap' }}>{mentor.bio}</div>}
            {mentor.adminNotes && <div style={{ marginTop: 10, fontSize: 12.5, background: 'var(--ux-surface-2, #f6f5f2)', padding: 10, borderRadius: 8 }}><strong>Admin notes:</strong> {mentor.adminNotes}</div>}
          </section>

          <section>
            <h4 style={{ margin: '0 0 6px', fontSize: 14 }}>Referral link</h4>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input readOnly value={link} />
              <Button icon={<CopyOutlined />} onClick={() => navigator.clipboard?.writeText(link).then(() => message.success('Link copied'))}>Copy</Button>
            </div>
          </section>

          <section>
            <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>Students referred</h4>
            {loading ? <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div> : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, marginBottom: 12 }}>
                  {[['Total', students.length], ['Applied', countIn(['applied', 'offer_received', 'offer_accepted', 'offer_rejected', 'fees_paid', 'visa_filing', 'visa_applied', 'visa_approved', 'visa_rejected'])], ['Offers', countIn(['offer_received', 'offer_accepted', 'fees_paid', 'visa_filing', 'visa_applied', 'visa_approved', 'visa_rejected'])], ['Visa approved', count('visa_approved')]].map(([l, v]) => (
                    <div key={l} style={{ border: '1px solid var(--ux-border, #eee)', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{l}</div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <Input prefix={<SearchOutlined />} placeholder="Search students" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180 }} allowClear />
                  <Select value={stage || undefined} onChange={(v) => setStage(v || '')} allowClear placeholder="All stages" style={{ width: 220 }}
                    options={stages.map((s) => ({ value: s.key, label: `${s.label} (${count(s.key)})` }))} />
                </div>
                {students.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No students from this mentor yet" /> : (
                  <Table
                    rowKey="_id"
                    size="small"
                    dataSource={filtered}
                    pagination={{ pageSize: 10 }}
                    onRow={(r) => ({ onClick: () => setOpenStudent(r._id), style: { cursor: 'pointer' } })}
                    columns={[
                      { title: 'Student', dataIndex: 'name', render: (t, r) => <div><strong>{t}</strong><div style={{ fontSize: 11.5, color: 'var(--ux-text-2)' }}>{r.email}</div></div> },
                      { title: 'Country', dataIndex: 'dreamCountry', render: (t) => t || '—' },
                      { title: 'Joined', key: 'j', render: (_, r) => fmt(r.referredAt || r.createdAt) },
                      { title: 'Stage', dataIndex: 'journeyStage', render: (k) => { const st = stages.find((s) => s.key === k); return <Tag color={st?.outcome === 'bad' ? 'red' : st?.outcome === 'good' ? 'green' : 'blue'}>{st?.label || k}</Tag>; } },
                    ]}
                  />
                )}
              </>
            )}
          </section>
        </div>
      )}
      <StudentDrawer studentId={openStudent} open={Boolean(openStudent)} onClose={() => setOpenStudent(null)} />
    </Drawer>
  );
};

export default MentorDetailDrawer;
