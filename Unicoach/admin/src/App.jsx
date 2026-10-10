import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, App as AntdApp, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLayout from './layouts/AdminLayout';
import './index.css';

// ── Lazy-loaded Pages for High-Performance Route-based Code Splitting ──
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ContentHub = lazy(() => import('./pages/ContentHub'));
const Blogs = lazy(() => import('./pages/Blogs'));
const BlogForm = lazy(() => import('./pages/BlogForm'));
const News = lazy(() => import('./pages/News'));
const NewsForm = lazy(() => import('./pages/NewsForm'));
const Events = lazy(() => import('./pages/Events'));
const EventForm = lazy(() => import('./pages/EventForm'));
const Digest = lazy(() => import('./pages/Digest'));
const DigestForm = lazy(() => import('./pages/DigestForm'));
const Users = lazy(() => import('./pages/Users'));
const Leads = lazy(() => import('./pages/Leads'));
const Settings = lazy(() => import('./pages/Settings'));
const Universities = lazy(() => import('./pages/Universities'));
const Scholarships = lazy(() => import('./pages/Scholarships'));
const Templates = lazy(() => import('./pages/Templates'));
const BulkMessaging = lazy(() => import('./pages/BulkMessaging'));
const WhatsAppHub = lazy(() => import('./pages/WhatsAppHub'));
const Workflows = lazy(() => import('./pages/Workflows'));
const EmailHub = lazy(() => import('./pages/EmailHub'));
const PipelineManager = lazy(() => import('./pages/PipelineManager'));
const PipelineBoard = lazy(() => import('./pages/PipelineBoard'));
const FormBuilder = lazy(() => import('./pages/FormBuilder'));
const BookingCalendar = lazy(() => import('./pages/BookingCalendar'));
const SupportRequests = lazy(() => import('./pages/SupportRequests'));
const UniCoachAdminHub = lazy(() => import('./pages/UniCoachAdminHub'));
const Staff = lazy(() => import('./pages/Staff'));
const StudentInbox = lazy(() => import('./pages/StudentInbox'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Campaign = lazy(() => import('./pages/Campaign'));

// Sleek centered loader for async route transitions matching UniCoach brand
const PageFallback = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', width: '100%', gap: '12px' }}>
    <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: '#DE5C2B' }} spin />} />
    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Loading admin module...</span>
  </div>
);

const App = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#DE5C2B',
          colorLink: '#DE5C2B',
          colorLinkHover: '#C04A1D',
          // Base stays white so dropdowns/popovers (derived from it) stay white; the canvas is colorBgLayout
          colorBgBase: '#ffffff',
          colorBgLayout: '#f3f2ee',
          colorBgContainer: '#ffffff',
          colorText: '#18181b',
          colorTextSecondary: '#5f5e58',
          colorBorder: '#e6e4dd',
          colorBorderSecondary: '#eeede8',
          borderRadius: 12,
          borderRadiusLG: 20,
          controlHeight: 40,
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          // Ink-black pill buttons (orange stays the accent for links, switches, selections)
          Button: {
            colorPrimary: '#111111',
            colorPrimaryHover: '#2a2a28',
            colorPrimaryActive: '#000000',
            borderRadius: 999,
            borderRadiusLG: 999,
            borderRadiusSM: 999,
            fontWeight: 600,
            primaryShadow: 'none',
            defaultShadow: 'none',
          },
          Card: { borderRadiusLG: 24 },
          Modal: { borderRadiusLG: 24 },
          Table: { headerBg: '#f7f6f2', rowHoverBg: '#fbfaf7', borderColor: '#eeede8' },
          Tabs: { inkBarColor: '#111111', itemSelectedColor: '#111111', itemHoverColor: '#111111' },
          Segmented: { itemSelectedBg: '#111111', itemSelectedColor: '#ffffff', borderRadius: 999, borderRadiusSM: 999 },
        },
      }}
    >
      <AntdApp>
        <AuthProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  {/* Public */}
                  <Route path="/login" element={<Login />} />

                  {/* Protected Admin Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AdminLayout />}>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/requests" element={<SupportRequests />} />
                      <Route path="/students/inbox" element={<StudentInbox />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/content" element={<ContentHub />} />
                      {/* Blogs */}
                      <Route path="/blogs" element={<Blogs />} />
                      <Route path="/blogs/create" element={<BlogForm />} />
                      <Route path="/blogs/edit/:id" element={<BlogForm />} />
                      {/* News */}
                      <Route path="/news" element={<News />} />
                      <Route path="/news/create" element={<NewsForm />} />
                      <Route path="/news/edit/:id" element={<NewsForm />} />
                      {/* Events */}
                      <Route path="/events" element={<Events />} />
                      <Route path="/events/create" element={<EventForm />} />
                      <Route path="/events/edit/:id" element={<EventForm />} />
                      {/* Digest */}
                      <Route path="/digest" element={<Digest />} />
                      <Route path="/digest/create" element={<DigestForm />} />
                      <Route path="/digest/edit/:id" element={<DigestForm />} />
                      {/* Universities & Scholarships */}
                      <Route path="/universities" element={<Universities />} />
                      <Route path="/scholarships" element={<Scholarships />} />
                      {/* CRM — Pipelines, Board, Forms, Calendar */}
                      <Route path="/crm/pipelines" element={<PipelineManager />} />
                      <Route path="/crm/board" element={<PipelineBoard />} />
                      <Route path="/crm/forms" element={<FormBuilder />} />
                      <Route path="/crm/calendar" element={<BookingCalendar />} />
                      {/* Legacy Leads & Users */}
                      <Route path="/users" element={<Users />} />
                      <Route path="/leads" element={<Leads />} />
                      {/* Automation & Outreach */}
                      <Route path="/automation/email" element={<EmailHub />} />
                      <Route path="/automation/campaign" element={<Campaign />} />
                      <Route path="/automation/whatsapp" element={<WhatsAppHub />} />
                      <Route path="/automation/workflows" element={<Workflows />} />
                      <Route path="/templates" element={<Templates />} />
                      <Route path="/bulk-messaging" element={<BulkMessaging />} />
                      {/* UniCoach Creator Network & Revenue Suite */}
                      <Route path="/unicoach" element={<UniCoachAdminHub />} />
                      {/* Staff accounts & roles (owner only) */}
                      <Route path="/staff" element={<Staff />} />
                      {/* Settings */}
                      <Route path="/settings" element={<Settings />} />
                    </Route>
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
