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

// Lead lists by status: one pill, pick the list from its dropdown
const leadViews = [
  { path: '/leads', label: 'All Leads' },
  { path: '/leads-converted', label: 'Converted' },
  { path: '/leads-interested', label: 'Interested' },
  { path: '/leads-followup', label: 'Follow-up' },
  { path: '/leads-not-interested', label: 'Not interested' },
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

const CrmSubNav = () => {
  return (
    <div className="crm-nav-pills-bar">
      <DropdownPill icon={<ContactsOutlined />} label="All Leads" pages={leadViews} />
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
