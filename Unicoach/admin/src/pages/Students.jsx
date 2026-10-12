import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, Select, Input, Tag, message, Segmented } from 'antd';
import { FileTextOutlined, SearchOutlined, TeamOutlined, UserAddOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import StudentDrawer from '../components/StudentDrawer';
import StudentsBoard from '../components/StudentsBoard';
import { can } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

// /students/all: every registered student with profile + stage + referring mentor.
// /students/documents: only students who uploaded documents (open one to view or download them all).
const Students = () => {
  const location = useLocation();
  const docsMode = location.pathname.startsWith('/students/documents');
  const [rows, setRows] = useState([]);
  const [stages, setStages] = useState([]);
  const [phases, setPhases] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [mentor, setMentor] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const { user } = useAuth();
  const [view, setView] = useState(() => {
    try { return localStorage.getItem('students_view') || 'board'; } catch { return 'board'; }
  });
  const changeView = (v) => {
    setView(v);
    try { localStorage.setItem('students_view', v); } catch { /* ignore */ }
  };
  const showBoard = !docsMode && view === 'board';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/students', { params: { ...(docsMode ? { docs: 1 } : {}), ...(mentor ? { mentor } : {}) } });
      setRows(data.students || []);
      setStages(data.stages || []);
      setPhases(data.phases || []);
    } catch {
      message.error('Could not load students');
    } finally {
      setLoading(false);
    }
  }, [docsMode, mentor]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    API.get('/admin/students/mentors').then(({ data }) => setMentors(data.mentors || [])).catch(() => {});
  }, []);

  const stageIndex = useMemo(() => Object.fromEntries(stages.map((s, i) => [s.key, i])), [stages]);
  const labelOf = (k) => stages.find((s) => s.key === k)?.label || k;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      (!stage || r.journeyStage === stage)
      && (profileFilter === 'all' || (profileFilter === 'done' ? r.profileCompleted : !r.profileCompleted))
      && (!q || [r.name, r.email, r.phone, r.dreamCountry, r.dreamCourse].some((v) => String(v || '').toLowerCase().includes(q))));
  }, [rows, search, stage, profileFilter]);

  const docColumns = [
    { title: 'Documents', key: 'docs', width: 130, render: (_, r) => (
      <span>
        <strong>{r.documents.total}</strong> files
        {r.documents.toReview > 0 && <Tag color="orange" style={{ marginLeft: 6 }}>{r.documents.toReview} to review</Tag>}
      </span>
    ) },
    { title: 'Last upload', key: 'last', width: 120, render: (_, r) => fmt(r.documents.lastUploadAt),
      sorter: (a, b) => new Date(a.documents.lastUploadAt || 0) - new Date(b.documents.lastUploadAt || 0), defaultSortOrder: docsMode ? 'descend' : undefined },
  ];

  const columns = [
    { title: 'Joined', dataIndex: 'createdAt', width: 110, render: fmt, sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt), defaultSortOrder: docsMode ? undefined : 'descend' },
    { title: 'Student', dataIndex: 'name', width: 220, render: (t, r) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>{t}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ux-text-2)' }}>{r.email}{r.phone ? ` · ${r.phone}` : ''}</div>
      </div>
    ) },
    ...(docsMode ? docColumns : [
      { title: 'Country & intake', key: 'dest', width: 170, render: (_, r) => (r.dreamCountry ? <div>{r.dreamCountry}<div style={{ fontSize: 11.5, color: 'var(--ux-text-2)' }}>{r.preferredIntake || ''}</div></div> : <Tag>Profile not filled</Tag>) },
      { title: 'Course', dataIndex: 'dreamCourse', width: 170, render: (t) => t || '—' },
      { title: 'Qualification', key: 'edu', width: 160, render: (_, r) => (r.highestEducation ? <div>{r.highestEducation}<div style={{ fontSize: 11.5, color: 'var(--ux-text-2)' }}>{[r.percentage && `${r.percentage}%`, r.passoutYear].filter(Boolean).join(' · ')}</div></div> : '—') },
    ]),
    { title: 'Stage', dataIndex: 'journeyStage', width: 210, render: (k) => {
      const st = stages.find((x) => x.key === k);
      const phase = phases.find((p) => p.key === st?.phase)?.label;
      return <Tag color={st?.outcome === 'bad' ? 'red' : st?.outcome === 'good' ? 'green' : 'blue'}>{phase ? `${phase} · ` : ''}{labelOf(k)}</Tag>;
    },
      sorter: (a, b) => (stageIndex[a.journeyStage] ?? 0) - (stageIndex[b.journeyStage] ?? 0) },
    { title: 'Referred by', key: 'ref', width: 150, render: (_, r) => (r.referredBy ? <Tag color="purple">{r.referredBy.name}</Tag> : <span style={{ color: 'var(--ux-text-3)' }}>Direct</span>) },
    ...(docsMode ? [] : docColumns.slice(0, 1)),
  ];

  const completed = rows.filter((r) => r.profileCompleted).length;
  const referred = rows.filter((r) => r.referredBy).length;
  const toReview = rows.reduce((n, r) => n + (r.documents?.toReview || 0), 0);

  return (
    <div>
      <Header
        title={docsMode ? 'Student documents' : 'Students'}
        subtitle={docsMode ? 'Every student who uploaded documents. Open one to view or download all their files.' : 'Registered students, their study plans and where each one is in the journey.'}
      />
      <div className="dashboard-content" style={{ marginTop: 16 }}>
        <div className="page-stats-grid page-stats-grid--3">
          <StatsCard icon={<TeamOutlined />} label={docsMode ? 'Students with documents' : 'Students'} value={rows.length} color="brand" loading={loading} />
          {docsMode
            ? <StatsCard icon={<FileTextOutlined />} label="Files to review" value={toReview} color="brand" loading={loading} />
            : <StatsCard icon={<CheckCircleOutlined />} label="Profile completed" value={completed} color="brand" loading={loading} />}
          <StatsCard icon={<UserAddOutlined />} label="Referred by mentors" value={referred} color="brand" loading={loading} />
        </div>

        <div className="nx-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Input prefix={<SearchOutlined style={{ color: 'var(--ux-text-3)' }} />} placeholder="Search name, email, phone, country or course" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 320, maxWidth: '100%' }} allowClear />
          <Select value={stage || undefined} onChange={(v) => setStage(v || '')} allowClear placeholder="All stages" style={{ width: 210 }}
            options={phases.map((p) => ({ label: p.label, title: p.label, options: stages.filter((s) => s.phase === p.key).map((s) => ({ value: s.key, label: `${s.label} (${rows.filter((r) => r.journeyStage === s.key).length})` })) }))} />
          <Select value={mentor || undefined} onChange={(v) => setMentor(v || '')} allowClear showSearch={{ optionFilterProp: 'label' }} placeholder="Any mentor" style={{ width: 200 }}
            options={[{ value: 'none', label: 'Direct sign-ups (no mentor)' }, ...mentors.map((m) => ({ value: m._id, label: m.name }))]} />
          {!docsMode && (
            <Segmented value={view} onChange={changeView} options={[{ value: 'board', label: 'Board' }, { value: 'table', label: 'Table' }]} />
          )}
          {!docsMode && (
            <Segmented value={profileFilter} onChange={setProfileFilter} options={[{ value: 'all', label: 'All' }, { value: 'done', label: 'Profile filled' }, { value: 'missing', label: 'Not filled' }]} />
          )}
        </div>

        {showBoard ? (
          <StudentsBoard
            students={filtered}
            stages={stages}
            phases={phases}
            canEdit={can(user, 'students', 'update')}
            onOpen={setOpenId}
            onMoved={load}
          />
        ) : (
        <div className="page-table-card">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={filtered}
            loading={loading}
            scroll={{ x: 1250 }}
            pagination={{ pageSize: 25, showSizeChanger: true }}
            onRow={(r) => ({ onClick: () => setOpenId(r._id), style: { cursor: 'pointer' } })}
          />
        </div>
        )}
      </div>
      <StudentDrawer studentId={openId} open={Boolean(openId)} onClose={() => setOpenId(null)} onChanged={load} />
    </div>
  );
};

export default Students;
