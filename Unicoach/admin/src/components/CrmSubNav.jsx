import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown } from 'antd';
import {
  ContactsOutlined,
  ApartmentOutlined,
  BranchesOutlined,
  FormOutlined,
  CalendarOutlined,
  DownOutlined
} from '@ant-design/icons';
import { COLUMNS } from './LeadStageBoard';

// Lead lists by status: one pill, pick the list from its dropdown
const leadViews = [
  { path: '/leads', label: 'All Leads', count: 'all' },
  { path: '/leads-converted', label: 'Converted', count: 'converted' },
  { path: '/leads-interested', label: 'Interested', count: 'interested' },
  { path: '/leads-followup', label: 'Follow-up' },
  { path: '/leads-not-interested', label: 'Not interested', count: 'not_interested' },
];

// Pipeline pages: one pill, pick the page from its dropdown
const pipelinePages = [
  { path: '/crm/board', label: 'Pipeline Board', icon: <ApartmentOutlined /> },
  { path: '/crm/pipelines', label: 'CRM Pipelines', icon: <BranchesOutlined /> },
  { path: '/crm/forms', label: 'Form Builder', icon: <FormOutlined /> },
];

const DropdownPill = ({ icon, label, pages, fallbackLabel }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = pages.find((p) => p.path === pathname);
  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: pages.map((p) => ({ key: p.path, label: p.label, icon: p.icon })),
        selectedKeys: current ? [current.path] : [],
        onClick: ({ key }) => navigate(key),
      }}
    >
      <button type="button" className={`crm-nav-pill crm-nav-pill--menu ${current ? 'crm-nav-pill--active' : ''}`}>
        <span className="crm-nav-pill-icon">{icon}</span>
        <span>{current?.label || fallbackLabel || label}</span>
        <DownOutlined style={{ fontSize: 10 }} />
      </button>
    </Dropdown>
  );
};

const Count = ({ n }) => (n === undefined ? null : (
  <span style={{ marginLeft: 'auto', paddingLeft: 16, fontWeight: 600, color: n ? '#16130F' : '#B0A898', fontVariantNumeric: 'tabular-nums' }}>{n}</span>
));
const Row = ({ dot, label, n }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 200 }}>
    {dot && <span style={{ width: 8, height: 8, borderRadius: 999, background: dot, flexShrink: 0 }} />}
    <span>{label}</span>
    <Count n={n} />
  </span>
);

// "All Leads" pill: the lead lists, then every stage of the Stage board with how many leads sit in it.
// Counts come from the Leads page; other CRM pages show the same menu without numbers.
const LeadsPill = ({ counts }) => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const stage = pathname === '/leads' ? new URLSearchParams(search).get('stage') : null;
  const stageCol = stage && COLUMNS.find((c) => c.key === stage);
  const view = !stage && leadViews.find((p) => p.path === pathname);
  const items = [
    { type: 'group', label: 'Lists', children: leadViews.map((p) => ({ key: p.path, label: <Row label={p.label} n={p.count ? counts?.lists?.[p.count] : undefined} /> })) },
    { type: 'divider' },
    { type: 'group', label: 'Stages', children: COLUMNS.map((c) => ({ key: `stage:${c.key}`, label: <Row dot={c.color} label={c.label} n={counts?.stages?.[c.key]} /> })) },
  ];
  const label = stageCol ? `${stageCol.label}${counts?.stages ? ` · ${counts.stages[stageCol.key] || 0}` : ''}` : (view?.label || 'All Leads');
  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items,
        selectedKeys: stageCol ? [`stage:${stageCol.key}`] : view ? [view.path] : [],
        onClick: ({ key }) => navigate(key.startsWith('stage:') ? `/leads?stage=${key.slice(6)}` : key),
        style: { maxHeight: '70vh', overflowY: 'auto' },
      }}
    >
      <button type="button" className={`crm-nav-pill crm-nav-pill--menu ${view || stageCol ? 'crm-nav-pill--active' : ''}`}>
        <span className="crm-nav-pill-icon"><ContactsOutlined /></span>
        <span>{label}</span>
        <DownOutlined style={{ fontSize: 10 }} />
      </button>
    </Dropdown>
  );
};

const CrmSubNav = ({ leadCounts }) => {
  return (
    <div className="crm-nav-pills-bar">
      <LeadsPill counts={leadCounts} />
      <DropdownPill icon={<ApartmentOutlined />} label="Pipelines" pages={pipelinePages} />
      <NavLink
        to="/crm/consultations"
        className={({ isActive }) => `crm-nav-pill ${isActive ? 'crm-nav-pill--active' : ''}`}
      >
        <span className="crm-nav-pill-icon"><CalendarOutlined /></span>
        <span>Consultation Calls</span>
      </NavLink>
    </div>
  );
};

export default CrmSubNav;
