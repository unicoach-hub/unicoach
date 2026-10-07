import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ContactsOutlined,
  ApartmentOutlined,
  BranchesOutlined,
  FormOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';

const crmNavLinks = [
  { path: '/leads', label: 'All Leads', icon: <ContactsOutlined /> },
  { path: '/crm/board', label: 'Pipeline Board', icon: <ApartmentOutlined /> },
  { path: '/crm/pipelines', label: 'CRM Pipelines', icon: <BranchesOutlined /> },
  { path: '/crm/forms', label: 'Form Builder', icon: <FormOutlined /> },
  { path: '/crm/calendar', label: 'Booking Calendar', icon: <CalendarOutlined /> },
  { path: '/users', label: 'Users & Staff', icon: <UserOutlined /> }
];

const CrmSubNav = () => {
  return (
    <div className="crm-nav-pills-bar">
      {crmNavLinks.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) => `crm-nav-pill ${isActive ? 'crm-nav-pill--active' : ''}`}
        >
          <span className="crm-nav-pill-icon">{link.icon}</span>
          <span>{link.label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default CrmSubNav;
