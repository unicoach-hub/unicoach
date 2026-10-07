import React, { useEffect, useState, useRef } from 'react';
import { 
  Table, Tag, Popconfirm, message, Input, Button, 
  Tabs, Modal, Form, Select, Row, Col, Space, Tooltip, Upload,
  Radio, Alert, Spin, Drawer, InputNumber, Switch, Checkbox, Divider
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, BankOutlined, GlobalOutlined, 
  UploadOutlined, CheckCircleOutlined, SyncOutlined,
  DownloadOutlined, BookOutlined, ThunderboltOutlined, CheckOutlined,
  ClockCircleOutlined, SafetyCertificateOutlined, CalendarOutlined,
  ExportOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import API from '../api/axios';
import { getCachedData, invalidateCache, fetchWithCache } from '../utils/cache';
import { exportUniversitiesToExcel } from '../utils/excelExporter';

const { TabPane } = Tabs;
const { TextArea } = Input;

const Universities = () => {
  // State for tabs and tables
  const cachedCountries = getCachedData('/admin/universities-manage/countries');
  const cachedUniversities = getCachedData('/admin/universities-manage/universities:all');
  
  const [countries, setCountries] = useState(cachedCountries || []);
  const [universities, setUniversities] = useState(cachedUniversities || []);
  const [loadingCountries, setLoadingCountries] = useState(!cachedCountries);
  const [loadingUniversities, setLoadingUniversities] = useState(!cachedUniversities);

  // Search & Filter state for Universities
  const [uniSearch, setUniSearch] = useState('');
  const [uniCountryFilter, setUniCountryFilter] = useState(null);
  const [uniCityFilter, setUniCityFilter] = useState(null);
  const [uniTypeFilter, setUniTypeFilter] = useState(null);

  // Search state for Countries
  const [countrySearch, setCountrySearch] = useState('');

  // Modals state
  const [isUniModalOpen, setIsUniModalOpen] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [currentUni, setCurrentUni] = useState(null); // for editing
  const [currentCountry, setCurrentCountry] = useState(null); // for editing

  // Form references
  const [uniForm] = Form.useForm();
  const [countryForm] = Form.useForm();

  // Selected country in University Form (for dynamic city list)
  const [selectedFormCountry, setSelectedFormCountry] = useState(null);

  // Image Upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  // Extracted Courses State
  const [coursesList, setCoursesList] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseTotal, setCourseTotal] = useState(0);
  const [courseSearch, setCourseSearch] = useState('');
  const [coursePage, setCoursePage] = useState(1);

  // Autonomous Course Update Scheduler State
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [loadingScheduler, setLoadingScheduler] = useState(false);
  const [triggeringSweep, setTriggeringSweep] = useState(false);

  // Auto-Crawl Modal state
  const [isCrawlModalOpen, setIsCrawlModalOpen] = useState(false);
  const [crawlTargetUni, setCrawlTargetUni] = useState(null);
  const [crawlMode, setCrawlMode] = useState('catalog'); // 'catalog' or 'single'
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawlLimit, setCrawlLimit] = useState(5);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlResult, setCrawlResult] = useState(null);

  // KC-Style University Courses Manager State
  const [isCoursesManagerOpen, setIsCoursesManagerOpen] = useState(false);
  const [selectedUniForCourses, setSelectedUniForCourses] = useState(null);
  const [uniDetailedCourses, setUniDetailedCourses] = useState([]);
  const [loadingUniCourses, setLoadingUniCourses] = useState(false);

  // Single Course Add/Edit Modal
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm] = Form.useForm();
  const [savingCourse, setSavingCourse] = useState(false);

  // Fetch all countries
  const fetchCountries = async (force = false) => {
    if (!getCachedData('/admin/universities-manage/countries') || force) {
      setLoadingCountries(true);
    }
    try {
      const { data } = await fetchWithCache(
        '/admin/universities-manage/countries',
        async () => (await API.get('/admin/universities-manage/countries')).data,
        {
          forceRefresh: force,
          onBackgroundUpdate: (fresh) => {
            setCountries(Array.isArray(fresh) ? fresh : []);
          }
        }
      );
      setCountries(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error('Failed to load countries');
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fetch all universities
  const fetchUniversities = async (force = false) => {
    const isDefaultFilter = !uniCountryFilter && !uniCityFilter && !uniTypeFilter && !uniSearch;
    const cacheKey = isDefaultFilter 
      ? '/admin/universities-manage/universities:all' 
      : `/admin/universities-manage/universities:${uniCountryFilter || ''}:${uniCityFilter || ''}:${uniTypeFilter || ''}:${uniSearch || ''}`;

    if (!getCachedData(cacheKey) || force) {
      setLoadingUniversities(true);
    }
    try {
      const params = {};
      if (uniCountryFilter) params.country = uniCountryFilter;
      if (uniCityFilter) params.city = uniCityFilter;
      if (uniTypeFilter) params.type = uniTypeFilter;
      if (uniSearch) params.search = uniSearch;

      const { data } = await fetchWithCache(
        cacheKey,
        async () => (await API.get('/admin/universities-manage/universities', { params })).data,
        {
          forceRefresh: force,
          onBackgroundUpdate: (fresh) => {
            setUniversities(Array.isArray(fresh) ? fresh : []);
          }
        }
      );
      setUniversities(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error('Failed to load universities');
    } finally {
      setLoadingUniversities(false);
    }
  };

  // Fetch live AI-synced courses
  const fetchCourses = async (page = 1, search = '') => {
    setLoadingCourses(true);
    try {
      const { data } = await API.get('/courses', {
        params: { page, limit: 15, search: search || undefined }
      });
      if (data?.success) {
        setCoursesList(data.courses || []);
        setCourseTotal(data.total || 0);
        setCoursePage(page);
      }
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Fetch Autonomous Scheduler Status
  const fetchSchedulerStatus = async () => {
    setLoadingScheduler(true);
    try {
      const res = await API.get('/courses/scheduler-status');
      if (res.data?.success) {
        setSchedulerStatus(res.data.scheduler);
      }
    } catch (err) {
      console.error('Failed to get scheduler status:', err);
    } finally {
      setLoadingScheduler(false);
    }
  };

  // Trigger Manual Update Sweep
  const handleTriggerManualSweep = async () => {
    setTriggeringSweep(true);
    try {
      const res = await API.post('/courses/trigger-scheduler', { limit: 100 });
      message.success(res.data?.message || 'Course update sweep initiated in background!');
      setTimeout(() => {
        fetchSchedulerStatus();
        fetchCourses(1);
      }, 3500);
    } catch (err) {
      message.error(err.response?.data?.error || err.message || 'Failed to start sweep');
    } finally {
      setTriggeringSweep(false);
    }
  };

  // Open Auto-Crawl Modal
  const openCrawlModal = (uni) => {
    setCrawlTargetUni(uni);
    setCrawlResult(null);
    setCrawlMode('catalog');
    setCrawlLimit(5);
    let initialUrl = uni.website || '';
    if (initialUrl && !initialUrl.endsWith('/')) initialUrl += '/';
    if (uni.name?.toLowerCase().includes('trinity')) {
      initialUrl = 'https://www.tcd.ie/courses/postgraduate/a-z-of-pg-courses/';
    }
    setCrawlUrl(initialUrl);
    setIsCrawlModalOpen(true);
  };

  // Start Autonomous AI Crawl
  const handleStartCrawl = async () => {
    if (!crawlUrl || !crawlTargetUni) {
      message.error('Please enter a target URL');
      return;
    }
    setIsCrawling(true);
    setCrawlResult(null);
    try {
      if (crawlMode === 'single') {
        const res = await API.post('/courses/sync-url', {
          courseUrl: crawlUrl.trim(),
          universityId: crawlTargetUni._id
        });
        message.success(`Extracted: ${res.data?.course?.courseName}`);
        setCrawlResult({ type: 'single', course: res.data?.course });
      } else {
        const res = await API.post('/courses/batch-sync-catalog', {
          catalogUrl: crawlUrl.trim(),
          universityId: crawlTargetUni._id,
          limit: crawlLimit
        });
        message.success(res.data?.message || 'Batch crawl complete');
        setCrawlResult({ type: 'batch', results: res.data?.results });
      }
      invalidateCache('/admin/universities-manage');
      fetchUniversities(true);
      fetchCourses(1);
    } catch (err) {
      message.error(err.response?.data?.error || err.message || 'Crawl failed');
    } finally {
      setIsCrawling(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (id) => {
    try {
      await API.delete(`/courses/${id}`);
      message.success('Course deleted');
      fetchCourses(1);
      fetchUniversities(true);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to delete course');
    }
  };

  // Country Flag Helper for KC-Style UI
  const getCountryFlag = (countryName) => {
    if (!countryName) return '🌍';
    const name = countryName.toLowerCase();
    if (name.includes('singapore')) return '🇸🇬';
    if (name.includes('ireland')) return '🇮🇪';
    if (name.includes('united states') || name.includes('usa')) return '🇺🇸';
    if (name.includes('united kingdom') || name.includes('uk')) return '🇬🇧';
    if (name.includes('australia')) return '🇦🇺';
    if (name.includes('canada')) return '🇨🇦';
    if (name.includes('germany')) return '🇩🇪';
    if (name.includes('france')) return '🇫🇷';
    if (name.includes('italy')) return '🇮🇹';
    if (name.includes('switzerland')) return '🇨🇭';
    if (name.includes('new zealand')) return '🇳🇿';
    if (name.includes('netherlands')) return '🇳🇱';
    if (name.includes('dubai') || name.includes('emirates')) return '🇦🇪';
    return '🌍';
  };

  // Open KC-Style University Courses Manager
  const openCoursesManager = async (uni) => {
    setSelectedUniForCourses(uni);
    setIsCoursesManagerOpen(true);
    setLoadingUniCourses(true);
    try {
      const res = await API.get(`/courses/university/${uni._id}`);
      if (res.data?.success) {
        setUniDetailedCourses(res.data.courses || []);
      }
    } catch (err) {
      console.error('Failed to load courses for university', err);
      message.error('Failed to load university courses');
    } finally {
      setLoadingUniCourses(false);
    }
  };

  // Open Course Add/Edit Modal
  const openCourseFormModal = (course = null) => {
    setEditingCourse(course);
    if (course) {
      courseForm.setFieldsValue({
        courseName: course.courseName,
        courseCode: course.courseCode,
        degreeLevel: course.degreeLevel || "Master's",
        discipline: course.discipline || '',
        duration: course.duration || '1 Year',
        tuitionAmount: course.annualFee?.amount || 0,
        tuitionCurrency: course.annualFee?.currency || 'EUR',
        appFeeAmount: course.applicationFee?.amount || 0,
        appFeeCurrency: course.applicationFee?.currency || 'EUR',
        appFeeWaived: Boolean(course.applicationFee?.isWaived),
        intakes: course.intakes || ['Open', 'Sep 2026'],
        minIeltsScore: course.minIeltsScore || 6.5,
        ieltsRequirement: course.ieltsRequirement || '',
        academicRequirement: course.academicRequirement || '',
        applicationDeadline: course.applicationDeadline || '',
        isStem: Boolean(course.isStem),
        hasInternship: Boolean(course.hasInternship),
        sourceUrl: course.sourceUrl || ''
      });
    } else {
      const uniCountryName = selectedUniForCourses?.country?.name || '';
      let defaultCurrency = 'EUR';
      if (uniCountryName.toLowerCase().includes('singapore') || selectedUniForCourses?.city?.toLowerCase().includes('singapore')) defaultCurrency = 'SGD';
      else if (uniCountryName.toLowerCase().includes('states') || uniCountryName.toLowerCase().includes('usa')) defaultCurrency = 'USD';
      else if (uniCountryName.toLowerCase().includes('kingdom') || uniCountryName.toLowerCase().includes('uk')) defaultCurrency = 'GBP';
      else if (uniCountryName.toLowerCase().includes('australia')) defaultCurrency = 'AUD';
      else if (uniCountryName.toLowerCase().includes('canada')) defaultCurrency = 'CAD';

      courseForm.resetFields();
      courseForm.setFieldsValue({
        degreeLevel: "Master's",
        duration: '1 Year',
        tuitionCurrency: defaultCurrency,
        tuitionAmount: selectedUniForCourses?.tuitionFeeUSD || 0,
        appFeeCurrency: defaultCurrency,
        appFeeAmount: 0,
        appFeeWaived: false,
        intakes: ['Open', 'Sep 2026'],
        minIeltsScore: 6.5,
        isStem: false,
        hasInternship: false
      });
    }
    setIsCourseFormOpen(true);
  };

  // Save Single Course (Create or Update)
  const handleSaveCourse = async () => {
    try {
      const values = await courseForm.validateFields();
      setSavingCourse(true);

      const payload = {
        universityId: selectedUniForCourses?._id,
        courseName: values.courseName,
        courseCode: values.courseCode,
        degreeLevel: values.degreeLevel,
        discipline: values.discipline,
        duration: values.duration,
        annualFee: {
          amount: Number(values.tuitionAmount) || 0,
          currency: values.tuitionCurrency || 'EUR'
        },
        applicationFee: {
          amount: Number(values.appFeeAmount) || 0,
          currency: values.appFeeCurrency || values.tuitionCurrency || 'EUR',
          isWaived: Boolean(values.appFeeWaived)
        },
        intakes: values.intakes || ['Open'],
        minIeltsScore: Number(values.minIeltsScore) || 6.5,
        ieltsRequirement: values.ieltsRequirement,
        academicRequirement: values.academicRequirement,
        applicationDeadline: values.applicationDeadline,
        isStem: Boolean(values.isStem),
        hasInternship: Boolean(values.hasInternship),
        sourceUrl: values.sourceUrl
      };

      if (editingCourse) {
        await API.put(`/courses/${editingCourse._id}`, payload);
        message.success('Course details updated successfully!');
      } else {
        await API.post('/courses', payload);
        message.success('Course added successfully!');
      }

      setIsCourseFormOpen(false);
      if (selectedUniForCourses) {
        const res = await API.get(`/courses/university/${selectedUniForCourses._id}`);
        setUniDetailedCourses(res.data?.courses || []);
      }
      fetchCourses(1);
      fetchUniversities(true);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.error || err.message || 'Failed to save course');
    } finally {
      setSavingCourse(false);
    }
  };

  // Delete Course inside Manager
  const handleDeleteCourseInManager = async (courseId) => {
    try {
      await API.delete(`/courses/${courseId}`);
      message.success('Course deleted');
      if (selectedUniForCourses) {
        const res = await API.get(`/courses/university/${selectedUniForCourses._id}`);
        setUniDetailedCourses(res.data?.courses || []);
      }
      fetchCourses(1);
      fetchUniversities(true);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to delete course');
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchUniversities();
    fetchCourses();
    fetchSchedulerStatus();
  }, []);

  // Trigger search on filter changes
  useEffect(() => {
    fetchUniversities();
  }, [uniCountryFilter, uniCityFilter, uniTypeFilter]);

  // Helper to format logo URL
  const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = API.defaults.baseURL.replace('/api', '');
    return `${base}${url}`;
  };

  // Handle Logo Upload
  const handleLogoUpload = async (info) => {
    const file = info.file;
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploadingLogo(true);

    try {
      const { data } = await API.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLogoUrl(data.url);
      uniForm.setFieldsValue({ logo: data.url });
      message.success('Logo uploaded successfully!');
    } catch (err) {
      message.error('Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Delete Country
  const handleDeleteCountry = async (id) => {
    try {
      await API.delete(`/admin/universities-manage/countries/${id}`);
      message.success('Country deleted successfully');
      invalidateCache('/admin/universities-manage');
      invalidateCache('/admin/stats');
      fetchCountries(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Delete University
  const handleDeleteUniversity = async (id) => {
    try {
      await API.delete(`/admin/universities-manage/universities/${id}`);
      message.success('University deleted successfully');
      invalidateCache('/admin/universities-manage');
      invalidateCache('/admin/stats');
      fetchUniversities(true);
    } catch (err) {
      message.error('Delete failed');
    }
  };

  // Open Country Modal (Create/Edit)
  const openCountryModal = (record = null) => {
    setCurrentCountry(record);
    if (record) {
      countryForm.setFieldsValue({
        name: record.name,
        code: record.code,
        cities: record.cities || [],
        visaLinks: record.visaLinks || [],
        courseLinks: record.courseLinks || []
      });
    } else {
      countryForm.resetFields();
    }
    setIsCountryModalOpen(true);
  };

  // Save Country
  const handleCountrySubmit = async () => {
    try {
      const values = await countryForm.validateFields();
      if (currentCountry) {
        // Edit mode
        await API.put(`/admin/universities-manage/countries/${currentCountry._id}`, values);
        message.success('Country updated successfully');
      } else {
        // Create mode
        await API.post('/admin/universities-manage/countries', values);
        message.success('Country created successfully');
      }
      invalidateCache('/admin/universities-manage');
      invalidateCache('/admin/stats');
      setIsCountryModalOpen(false);
      fetchCountries(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save country');
    }
  };

  // Open University Modal (Create/Edit)
  const openUniModal = (record = null) => {
    setCurrentUni(record);
    if (record) {
      const countryId = record.country?._id || record.country;
      setSelectedFormCountry(countryId);
      setLogoUrl(record.logo || '');
      
      uniForm.setFieldsValue({
        name: record.name,
        country: countryId,
        city: record.city,
        logo: record.logo || '',
        website: record.website || '',
        rank: record.rank || '',
        tuition: record.tuition || '',
        type: record.type || 'PUBLIC',
        description: record.description || '',
        eligibility: record.eligibility || '',
        courses: Array.isArray(record.courses) ? record.courses : [],
        degreeLevels: Array.isArray(record.degreeLevels) && record.degreeLevels.length > 0 ? record.degreeLevels : ["Bachelor's", "Master's"],
        categoryTags: record.categoryTags || [],
        minScore: record.minScore || (record.minGpaPercent ? `${record.minGpaPercent}%` : 'GPA 3.0+'),
        ieltsScore: record.ieltsScore || (record.minIeltsScore ? `IELTS ${record.minIeltsScore}+` : 'IELTS 6.0+'),
        greExam: record.greExam || (record.greRequired ? (record.minGreScore ? `${record.minGreScore}+` : 'GRE Required') : 'GRE Waived'),
        workExp: record.workExp || 'Freshers Eligible',
        acceptanceRate: record.acceptanceRate ? (typeof record.acceptanceRate === 'number' ? `${record.acceptanceRate}%` : record.acceptanceRate) : '66%'
      });
    } else {
      uniForm.resetFields();
      uniForm.setFieldsValue({ 
        type: 'PUBLIC',
        courses: [],
        degreeLevels: ["Bachelor's", "Master's"],
        minScore: 'GPA 3.0+',
        ieltsScore: 'IELTS 6.0+',
        greExam: 'GRE Waived',
        workExp: 'Freshers Eligible',
        acceptanceRate: '66%'
      });
      setLogoUrl('');
      setSelectedFormCountry(null);
    }
    setIsUniModalOpen(true);
  };

  // Save University
  const handleUniSubmit = async () => {
    try {
      const values = await uniForm.validateFields();
      if (values.courses && Array.isArray(values.courses)) {
        values.courses = values.courses.map(s => String(s).trim()).filter(Boolean);
      }
      if (currentUni) {
        // Edit mode
        await API.put(`/admin/universities-manage/universities/${currentUni._id}`, values);
        message.success('University updated successfully');
      } else {
        // Create mode
        await API.post('/admin/universities-manage/universities', values);
        message.success('University created successfully');
      }
      invalidateCache('/admin/universities-manage');
      invalidateCache('/admin/stats');
      setIsUniModalOpen(false);
      fetchUniversities(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save university');
    }
  };

  // Find cities list for selected country in form
  const getFormCitiesList = () => {
    if (!selectedFormCountry) return [];
    const country = countries.find(c => c._id === selectedFormCountry);
    return country ? country.cities : [];
  };

  // Table Columns - Countries
  const countryColumns = [
    { 
      title: 'Country Name', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text) => <span style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{text}</span>
    },
    {
      title: 'Slug Code',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <span className="nx-status nx-status--neutral">{text}</span>
    },
    {
      title: 'Cities',
      dataIndex: 'cities',
      key: 'cities',
      render: (cities) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {(cities || []).map(city => <span className="nx-status nx-status--neutral" key={city}>{city}</span>)}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size={4}>
          <Button type="text" shape="circle" icon={<EditOutlined />} onClick={() => openCountryModal(record)} />
          <Popconfirm title="Delete this country?" onConfirm={() => handleDeleteCountry(record._id)} okText="Yes" cancelText="No">
            <Button type="text" shape="circle" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Table Columns - Universities
  const universityColumns = [
    { 
      title: 'Logo', 
      dataIndex: 'logo', 
      key: 'logo', 
      width: 70,
      render: (logo, record) => (
        <div style={{ width: 44, height: 44, background: 'var(--ux-surface-2)', borderRadius: 12, padding: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '1px solid var(--ux-line-2)' }}>
          {logo ? (
            <img 
              src={getAbsoluteUrl(logo)} 
              alt={record.name} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
              onError={(e) => { 
                e.target.style.display = 'none'; 
                if (e.target.parentNode) e.target.parentNode.innerHTML = '<span style="color:#DE5C2B;font-size:18px;font-weight:bold;">🏛️</span>'; 
              }} 
            />
          ) : (
            <BankOutlined style={{ color: 'var(--ux-text-3)', fontSize: 18 }} />
          )}
        </div>
      )
    },
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text, record) => (
        <span style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>
          {text}
          {record.isActive === false && (
            <span className="nx-status nx-status--neutral" style={{ marginLeft: 8 }} title="Hidden from the public site by a data sync">
              Hidden
            </span>
          )}
        </span>
      )
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      render: (c) => <span style={{ color: 'var(--ux-text-2)', fontWeight: 500 }}>{c?.name || 'Unknown'}</span>
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: (text) => <span style={{ color: 'var(--ux-text-2)' }}>{text || '--'}</span>
    },
    {
      title: 'QS Rank',
      dataIndex: 'rank',
      key: 'rank',
      // Only ranks imported from an official ranking file (rankingSource) are shown on the site
      render: (text, record) => record.rankingSource
        ? <span className="nx-status nx-status--neutral" title={record.rankingSource}>#{String(text || record.rankingNum).replace(/^=/, '')}</span>
        : <span className="nx-muted" style={{ fontSize: 12.5 }} title="Not from an official ranking file; hidden on the site">Unverified</span>
    },
    {
      title: 'Fees',
      dataIndex: 'tuition',
      key: 'tuition',
      render: (text) => <span style={{ color: text ? 'var(--ux-ink)' : 'var(--ux-text-3)', fontWeight: 500 }}>{text || '--'}</span>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (
        <span
          className={`nx-status ${String(text).toUpperCase() === 'PUBLIC' ? 'nx-status--neutral' : 'nx-status--accent'}`}
          style={{ textTransform: 'capitalize' }}
        >
          {String(text).toLowerCase()}
        </span>
      )
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (url) => url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="nx-btn nx-btn--light nx-btn--sm"
          style={{ height: 28, padding: '0 12px', fontSize: 12, gap: 6 }}
        >
          Visit <ExportOutlined style={{ fontSize: 11 }} />
        </a>
      ) : <span className="nx-muted">--</span>
    },
    { 
      title: 'Programs / Courses', 
      dataIndex: 'courses', 
      key: 'courses', 
      width: 220,
      render: (coursesList, record) => {
        const list = Array.isArray(coursesList) && coursesList.length > 0 ? coursesList : [];
        if (list.length === 0) {
          return (
            <Button 
              type="dashed" 
              size="small" 
              icon={<PlusOutlined />} 
              onClick={() => openCoursesManager(record)}
              style={{ fontSize: 12 }}
            >
              Add Courses
            </Button>
          );
        }
        const visible = list.slice(0, 2);
        const remaining = list.length - 2;
        return (
          <div
            onClick={() => openCoursesManager(record)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', cursor: 'pointer' }}
            title="Click to view & edit in KC-style Courses Manager"
          >
            {visible.map((c, i) => (
              <span
                key={i}
                className="nx-status nx-status--neutral"
                style={{ display: 'inline-block', lineHeight: '24px', fontWeight: 500, maxWidth: '190px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {c}
              </span>
            ))}
            {remaining > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ux-brand)', paddingLeft: 2 }}>
                +{remaining} more (Manage All)
              </span>
            )}
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 165,
      render: (_, record) => (
        <Space size={2}>
          <Tooltip title="Manage Courses (KC-Style: Fees, Duration & Intakes)">
            <Button
              type="text"
              shape="circle"
              icon={<BookOutlined />}
              onClick={() => openCoursesManager(record)}
            />
          </Tooltip>
          <Tooltip title="AI Auto-Crawl Courses">
            <Button
              type="text"
              shape="circle"
              icon={<ThunderboltOutlined />}
              onClick={() => openCrawlModal(record)}
            />
          </Tooltip>
          <Button type="text" shape="circle" icon={<EditOutlined />} onClick={() => openUniModal(record)} />
          <Popconfirm title="Delete this university?" onConfirm={() => handleDeleteUniversity(record._id)} okText="Yes" cancelText="No">
            <Button type="text" shape="circle" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Table Columns - Real-Time AI Synced Courses
  const courseColumns = [
    {
      title: 'Course / Degree Name',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 280,
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: '13px' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--ux-text-3)', marginTop: 2 }}>
            {record.discipline ? `${record.discipline} • ` : ''}{record.duration || '1 Year'}
          </div>
        </div>
      )
    },
    {
      title: 'University & Country',
      key: 'university',
      width: 220,
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
          <div style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>{record.universityName}</div>
          <span className="nx-status nx-status--neutral">{record.countryName}</span>
        </div>
      )
    },
    {
      title: 'Degree Level',
      dataIndex: 'degreeLevel',
      key: 'degreeLevel',
      width: 110,
      render: (level) => <span className="nx-status nx-status--neutral">{level || "Master's"}</span>
    },
    {
      title: 'Annual Tuition Fee',
      key: 'fee',
      width: 160,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>
            {record.annualFee?.currency} {record.annualFee?.amount?.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ux-text-3)' }}>
            ₹{record.annualFee?.inrAmount?.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      title: 'Min IELTS',
      dataIndex: 'minIeltsScore',
      key: 'minIeltsScore',
      width: 110,
      render: (score) => <span className="nx-status nx-status--neutral">{score ? `IELTS ${score}` : '6.5'}</span>
    },
    {
      title: 'Perks & Tags',
      key: 'tags',
      width: 180,
      render: (_, record) => (
        <Space size={[4, 4]} wrap>
          {record.isStem && <span className="nx-status nx-status--accent">STEM</span>}
          {record.hasInternship && <span className="nx-status nx-status--neutral">Internship</span>}
          {record.intakes?.slice(0, 1).map((it, i) => (
            <span key={i} className="nx-status nx-status--neutral">{it}</span>
          ))}
        </Space>
      )
    },
    {
      title: 'Source Page',
      dataIndex: 'sourceUrl',
      key: 'sourceUrl',
      width: 120,
      render: (url) => url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="nx-btn nx-btn--light nx-btn--sm"
          style={{ height: 28, padding: '0 12px', fontSize: 12, gap: 6 }}
        >
          Official <ExportOutlined style={{ fontSize: 11 }} />
        </a>
      ) : <span className="nx-muted">--</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Popconfirm title="Delete this course?" onConfirm={() => handleDeleteCourse(record._id)} okText="Yes" cancelText="No">
          <Button type="text" shape="circle" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  // Filters Country Cities options
  const getFilterCities = () => {
    if (!uniCountryFilter) return [];
    const country = countries.find(c => c._id === uniCountryFilter);
    return country ? country.cities : [];
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const [syncingDataset, setSyncingDataset] = useState(false);

  const handleSyncDataset = async () => {
    setSyncingDataset(true);
    try {
      const { data } = await API.post('/admin/universities-manage/seed-dataset');
      if (data.success) {
        message.success(data.message || 'Database synchronized with 500+ normalized university datasets!');
        fetchCountries();
        fetchUniversities();
      }
    } catch {
      message.error('Failed to sync dataset to database');
    } finally {
      setSyncingDataset(false);
    }
  };

  return (
    <div>
      <Header 
        title="Universities & Target Countries Directory" 
        subtitle="Manage 500+ Top Universities, QS Rankings, Tuition Fees & Country Profiles" 
        extra={
          <Space wrap size="small">
            <Button
              icon={<SyncOutlined spin={syncingDataset} />}
              onClick={handleSyncDataset}
              aria-label="Sync directory"
            >
              <span className="hidden sm:inline">Sync directory</span>
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openUniModal()}
              aria-label="Add university"
            >
              <span className="hidden sm:inline">Add University</span>
            </Button>
          </Space>
        }
      />
      <div className="dashboard-content">
        
        {/* Statistics Grid */}
        <div className="page-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <StatsCard icon={<BankOutlined />} label="Total Universities" value={universities.length} color="indigo" loading={loadingUniversities} />
          <StatsCard icon={<BookOutlined />} label="Live Synced Courses" value={courseTotal} color="emerald" loading={loadingCourses} />
          <StatsCard icon={<GlobalOutlined />} label="Active Countries" value={countries.length} color="purple" loading={loadingCountries} />
          <StatsCard icon={<CheckCircleOutlined />} label="Public Universities" value={universities.filter(u => String(u.type).toUpperCase() === 'PUBLIC').length} color="cyan" loading={loadingUniversities} />
        </div>

        {/* Tabbed Panel */}
        <div className="page-table-card p-4 sm:p-6">
          <Tabs defaultActiveKey="1" className="admin-tabs">
            
            {/* ========================================== */}
            {/* UNIVERSITIES TAB */}
            {/* ========================================== */}
            <TabPane tab={<span><BankOutlined /> Universities</span>} key="1">

              {/* Toolbar */}
              <div className="nx-toolbar" style={{ justifyContent: 'space-between', background: 'var(--ux-surface-2)' }}>
                <Space wrap size={10}>
                  <Input
                    prefix={<SearchOutlined style={{ color: 'var(--ux-text-3)' }} />}
                    placeholder="Search by university name..."
                    value={uniSearch}
                    onChange={(e) => setUniSearch(e.target.value)}
                    style={{ width: 240, maxWidth: '100%' }}
                    onPressEnter={fetchUniversities}
                  />
                  <Select
                    placeholder="Filter by Country"
                    style={{ width: 160 }}
                    allowClear
                    value={uniCountryFilter}
                    onChange={(val) => {
                      setUniCountryFilter(val);
                      setUniCityFilter(null); // Reset city filter
                    }}
                  >
                    {countries.map(c => <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>)}
                  </Select>
                  <Select 
                    placeholder="Filter by City" 
                    style={{ width: 140 }} 
                    allowClear
                    disabled={!uniCountryFilter}
                    value={uniCityFilter}
                    onChange={setUniCityFilter}
                  >
                    {getFilterCities().map(city => <Select.Option key={city} value={city}>{city}</Select.Option>)}
                  </Select>
                  <Select 
                    placeholder="Filter by Type" 
                    style={{ width: 130 }} 
                    allowClear
                    value={uniTypeFilter}
                    onChange={setUniTypeFilter}
                  >
                    <Select.Option value="PUBLIC">PUBLIC</Select.Option>
                    <Select.Option value="PRIVATE">PRIVATE</Select.Option>
                  </Select>
                  <Button type="primary" icon={<SearchOutlined />} onClick={fetchUniversities}>Search</Button>
                </Space>

                <Space wrap size={10}>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => exportUniversitiesToExcel(universities)}
                  >
                    Export to Excel
                  </Button>
                  <Button icon={<PlusOutlined />} onClick={() => openUniModal()}>
                    Add University
                  </Button>
                </Space>
              </div>

              {/* Table */}
              <Table 
                rowKey="_id" 
                columns={universityColumns} 
                dataSource={universities} 
                loading={loadingUniversities} 
                scroll={{ x: 900 }}
                pagination={{ pageSize: 10 }} 
              />
            </TabPane>

            {/* ========================================== */}
            {/* REAL-TIME AI-SYNCED COURSES TAB */}
            {/* ========================================== */}
            <TabPane tab={<span><BookOutlined /> Extracted Courses <span className="nx-tab-count" style={{ marginLeft: 4 }}>{courseTotal}</span></span>} key="2">
              {/* Autonomous Course & Fee Revision Engine Card */}
              <div className="nx-card nx-card--soft" style={{
                borderRadius: 18,
                padding: '20px 22px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ maxWidth: '680px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ux-ink)', letterSpacing: '-0.02em', marginRight: 4 }}>
                        Autonomous Course & Tuition Revision Engine
                      </span>
                      {schedulerStatus?.activeSeason === 'PEAK_FALL_FEE_REVISION' && (
                        <span className="nx-status nx-status--accent">
                          Fall Fee Revision Window (Aug – Oct)
                        </span>
                      )}
                      {schedulerStatus?.activeSeason === 'SPRING_INTAKE_AND_DEADLINES' && (
                        <span className="nx-status nx-status--accent">
                          Spring Intake & Deadlines (Jan – Feb)
                        </span>
                      )}
                      {schedulerStatus?.activeSeason === 'SUMMER_FINAL_ADMISSIONS' && (
                        <span className="nx-status nx-status--accent">
                          Summer Deposit & Final Round (May – Jun)
                        </span>
                      )}
                      {schedulerStatus?.activeSeason === 'OFF_PEAK_MONITORING' && (
                        <span className="nx-status nx-status--neutral" style={{ background: '#fff' }}>
                          Baseline Intake Monitor
                        </span>
                      )}
                      {schedulerStatus?.isRunning ? (
                        <span className="nx-status nx-status--warning">
                          <SyncOutlined spin /> Sweep in Progress
                        </span>
                      ) : (
                        <span className="nx-status nx-status--success">
                          <CheckCircleOutlined /> Active & Armed
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, color: 'var(--ux-text-2)', fontSize: '13px', lineHeight: '1.6' }}>
                      {schedulerStatus?.seasonDescription || 'Monitors official university course portals & fee tables during actual global intake revision months.'}
                      <span style={{ color: 'var(--ux-text-3)', marginLeft: 6 }}>
                        • Uses SHA-256 web diffing (0 LLM tokens wasted when pages remain unchanged).
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <Space size={10} wrap>
                    <Button
                      icon={<SyncOutlined spin={loadingScheduler} />}
                      onClick={fetchSchedulerStatus}
                    >
                      Status
                    </Button>
                    <Button
                      type="primary"
                      icon={<ThunderboltOutlined />}
                      loading={triggeringSweep || schedulerStatus?.isRunning}
                      onClick={handleTriggerManualSweep}
                    >
                      Run Update Sweep Now
                    </Button>
                  </Space>
                </div>

                {/* Status Badges Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                  marginTop: '18px'
                }}>
                  <div style={{ background: '#fff', padding: '12px 14px', borderRadius: 16 }}>
                    <div style={{ fontSize: '12px', color: 'var(--ux-text-3)' }}>
                      Current Cadence
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ux-ink)', marginTop: 4 }}>
                      <CalendarOutlined style={{ marginRight: 6, color: 'var(--ux-text-3)' }} />
                      {schedulerStatus?.scheduleCadence || 'Weekly (Sundays 02:00 AM IST)'}
                    </div>
                  </div>

                  <div style={{ background: '#fff', padding: '12px 14px', borderRadius: 16 }}>
                    <div style={{ fontSize: '12px', color: 'var(--ux-text-3)' }}>
                      Last Sweep
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ux-ink)', marginTop: 4 }}>
                      <ClockCircleOutlined style={{ marginRight: 6, color: 'var(--ux-text-3)' }} />
                      {schedulerStatus?.lastRunAt
                        ? new Date(schedulerStatus.lastRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
                        : 'Scheduled for next cycle'}
                    </div>
                  </div>

                  <div style={{ background: '#fff', padding: '12px 14px', borderRadius: 16 }}>
                    <div style={{ fontSize: '12px', color: 'var(--ux-text-3)' }}>
                      Verification Efficiency
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ux-ink)', marginTop: 4 }}>
                      <SafetyCertificateOutlined style={{ marginRight: 6, color: 'var(--ux-text-3)' }} />
                      {schedulerStatus?.lastRunSummary
                        ? `${schedulerStatus.lastRunSummary.unchangedCount} verified unchanged (0 tokens)`
                        : 'SHA-256 Zero-Token Diffing Active'}
                    </div>
                  </div>

                  <div style={{ background: '#fff', padding: '12px 14px', borderRadius: 16 }}>
                    <div style={{ fontSize: '12px', color: 'var(--ux-text-3)' }}>
                      Revisions Found
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ux-ink)', marginTop: 4 }}>
                      {schedulerStatus?.lastRunSummary?.updatedCount !== undefined
                        ? `${schedulerStatus.lastRunSummary.updatedCount} courses updated`
                        : 'Catalog up to date'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="nx-toolbar" style={{ justifyContent: 'space-between', background: 'var(--ux-surface-2)' }}>
                <Space size={10} wrap>
                  <Input
                    prefix={<SearchOutlined style={{ color: 'var(--ux-text-3)' }} />}
                    placeholder="Search courses, degrees, disciplines..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    style={{ width: 280, maxWidth: '100%' }}
                    onPressEnter={() => fetchCourses(1, courseSearch)}
                  />
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => fetchCourses(1, courseSearch)}
                  >
                    Search
                  </Button>
                </Space>
                <Button
                  icon={<SyncOutlined spin={loadingCourses} />}
                  onClick={() => fetchCourses(coursePage, courseSearch)}
                >
                  Refresh Courses
                </Button>
              </div>

              <Table 
                rowKey="_id" 
                columns={courseColumns} 
                dataSource={coursesList} 
                loading={loadingCourses} 
                scroll={{ x: 1050 }}
                pagination={{ 
                  current: coursePage, 
                  total: courseTotal, 
                  pageSize: 15,
                  onChange: (p) => fetchCourses(p, courseSearch) 
                }} 
              />
            </TabPane>

            {/* ========================================== */}
            {/* COUNTRIES TAB */}
            {/* ========================================== */}
            <TabPane tab={<span><GlobalOutlined /> Countries & Cities</span>} key="3">
              
              {/* Toolbar */}
              <div className="nx-toolbar" style={{ justifyContent: 'space-between', background: 'var(--ux-surface-2)' }}>
                <Input
                  prefix={<SearchOutlined style={{ color: 'var(--ux-text-3)' }} />}
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  style={{ width: 280, maxWidth: '100%' }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openCountryModal()}>
                  Add Country
                </Button>
              </div>

              {/* Table */}
              <Table 
                rowKey="_id" 
                columns={countryColumns} 
                dataSource={filteredCountries} 
                loading={loadingCountries} 
                scroll={{ x: 750 }}
                pagination={{ pageSize: 10 }} 
              />
            </TabPane>
          </Tabs>
        </div>
      </div>

      {/* ========================================== */}
      {/* COUNTRY FORM MODAL */}
      {/* ========================================== */}
      <Modal
        className="premium-modal"
        title={currentCountry ? "Edit Country" : "Add Country"}
        open={isCountryModalOpen}
        onOk={handleCountrySubmit}
        onCancel={() => setIsCountryModalOpen(false)}
        okText="Save"
        width={600}
        style={{ maxWidth: 'calc(100vw - 24px)', top: 20 }}
        centered
        destroyOnHidden
        styles={{
          body: {
            maxHeight: 'calc(85vh - 120px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '8px'
          }
        }}
      >
        <Form form={countryForm} layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item name="name" label="Country Name" rules={[{ required: true, message: 'Please enter country name' }]}>
            <Input placeholder="e.g. United States or Spain" />
          </Form.Item>
          <Form.Item name="code" label="Slug Code (Optional)" tooltip="Auto-generated if left blank. e.g. 'usa' or 'spain'">
            <Input placeholder="e.g. spain" />
          </Form.Item>
          <Form.Item name="cities" label="Cities" tooltip="Type a city name and press Enter to add multiple cities" rules={[{ required: true, message: 'Please enter at least one city' }]}>
            <Select mode="tags" style={{ width: '100%' }} placeholder="e.g. Madrid, Barcelona" tokenSeparators={[',']} />
          </Form.Item>
          <Form.Item name="visaLinks" label="Admissions & Visa Links" tooltip="Type a link title and press Enter to add. E.g. 'India Intakes', 'India Student Visa'">
            <Select mode="tags" style={{ width: '100%' }} placeholder="e.g. India Intakes, India Student Visa" tokenSeparators={[',']} />
          </Form.Item>
          <Form.Item name="courseLinks" label="Top Courses Links" tooltip="Type a link title and press Enter to add. E.g. 'Masters in India', 'MBA in India'">
            <Select mode="tags" style={{ width: '100%' }} placeholder="e.g. Masters in India, MBA in India" tokenSeparators={[',']} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ========================================== */}
      {/* UNIVERSITY FORM MODAL */}
      {/* ========================================== */}
      <Modal
        className="premium-modal university-form-modal"
        title={currentUni ? "Edit University" : "Add University"}
        open={isUniModalOpen}
        onOk={handleUniSubmit}
        onCancel={() => setIsUniModalOpen(false)}
        okText="Save"
        width={820}
        style={{ maxWidth: 'calc(100vw - 24px)', top: 20 }}
        centered
        destroyOnHidden
        styles={{
          body: {
            maxHeight: 'calc(85vh - 120px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '8px'
          }
        }}
      >
        <Form form={uniForm} layout="vertical" style={{ marginTop: '16px' }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="University Name" rules={[{ required: true, message: 'Please enter name' }]}>
                <Input placeholder="e.g. Boston University" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="country" label="Country" rules={[{ required: true, message: 'Please select country' }]}>
                <Select 
                  placeholder="Select destination country"
                  onChange={(val) => {
                    setSelectedFormCountry(val);
                    uniForm.setFieldsValue({ city: undefined }); // Reset city
                  }}
                >
                  {countries.map(c => <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="city" label="City" rules={[{ required: true, message: 'Please select or enter city' }]}>
                <Select 
                  showSearch
                  placeholder="Select city"
                  disabled={!selectedFormCountry}
                  popupRender={(menu) => (
                    <div>
                      {menu}
                    </div>
                  )}
                >
                  {getFormCitiesList().map(city => <Select.Option key={city} value={city}>{city}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="type" label="Institution Type" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="PUBLIC">PUBLIC</Select.Option>
                  <Select.Option value="PRIVATE">PRIVATE</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="rank" label="QS / Global Rank" tooltip="e.g. '108 QS Rankings' or '80th Global'">
                <Input placeholder="e.g. 108 QS Rankings" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="tuition" label="Tuition Fees (Annual)" tooltip="e.g. '₹62 Lakh INR/yr' or 'Free' or '€1,500/sem'">
                <Input placeholder="e.g. ₹62 Lakh INR/yr" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="logo" label="Logo Image URL">
                <Input 
                  placeholder="Image URL or upload below" 
                  value={logoUrl} 
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    uniForm.setFieldsValue({ logo: e.target.value });
                  }} 
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ color: 'var(--ux-text-2)', fontWeight: 600, fontSize: '13px' }}>Upload Logo File</span>
                <span className="nx-status nx-status--neutral" style={{ height: 22, fontSize: 11 }}>
                  400 × 400 px (1:1 PNG)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={() => false} // Do not auto-upload before custom upload triggers
                  onChange={handleLogoUpload}
                >
                  <Button icon={<UploadOutlined />} loading={uploadingLogo}>
                    Select File
                  </Button>
                </Upload>
                {logoUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '140px', background: 'var(--ux-surface-2)', padding: '5px 10px', borderRadius: '12px', border: '1px solid var(--ux-line-2)' }}>
                    <img src={getAbsoluteUrl(logoUrl)} alt="Preview" style={{ width: 28, height: 28, objectFit: 'contain', background: '#fff', borderRadius: 8, padding: 2, border: '1px solid var(--ux-line-2)', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--ux-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{logoUrl}</span>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <Form.Item name="website" label="Website URL">
            <Input placeholder="e.g. https://www.bu.edu" />
          </Form.Item>

          <Form.Item name="categoryTags" label="Category Tags" tooltip="Used to filter universities by category (e.g. 'best', 'affordable', 'engineering' for Germany/France pages)">
            <Select mode="tags" style={{ width: '100%' }} placeholder="Select or type tags (e.g. best, affordable, engineering)" tokenSeparators={[',']}>
              <Select.Option value="best">best</Select.Option>
              <Select.Option value="affordable">affordable</Select.Option>
              <Select.Option value="engineering">engineering</Select.Option>
              <Select.Option value="top-masters">top-masters</Select.Option>
              <Select.Option value="public">public</Select.Option>
            </Select>
          </Form.Item>

          {/* ========================================== */}
          {/* ACADEMIC COURSES & PROGRAMS SECTION (CRUD) */}
          {/* ========================================== */}
          <div style={{
            margin: '18px 0',
            padding: '16px',
            background: 'var(--ux-surface-2)',
            borderRadius: '18px',
            border: '1px solid var(--ux-line-2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
              <h4 style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: 'var(--ux-ink)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <BookOutlined style={{ color: 'var(--ux-text-3)' }} /> Available Degree Programs & Courses
              </h4>
              <span style={{ fontSize: '11px', color: 'var(--ux-text-3)' }}>
                Type course name and press Enter (or comma) to add
              </span>
            </div>

            {/* Quick Link to KC-Style Structured Courses Manager */}
            {currentUni && (
              <div style={{
                background: '#fff',
                border: '1px solid var(--ux-line-2)',
                borderRadius: 16,
                padding: '12px 14px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOutlined /> KC-Style Course Offerings & Financials
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ux-text-2)', marginTop: 2 }}>
                    Manage individual course durations, tuition fees, application fees & intakes
                  </div>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<BookOutlined />}
                  onClick={() => {
                    setIsUniModalOpen(false);
                    openCoursesManager(currentUni);
                  }}
                >
                  Open Courses Manager
                </Button>
              </div>
            )}

            <Form.Item 
              name="courses" 
              label={<span style={{ color: 'var(--ux-text-2)', fontSize: '12px', fontWeight: 600 }}>Active Degree Programs (Visible on Frontend & Shortlister)</span>}
              tooltip="Add all degree programs offered by this institution. Type a program name and press Enter. Click 'x' on any tag to remove it."
            >
              <Select 
                mode="tags" 
                style={{ width: '100%' }} 
                placeholder="e.g. MSc Computer Science, MBA, MSc Data Analytics (Press Enter after typing)" 
                tokenSeparators={[',']} 
              />
            </Form.Item>

            {/* Quick Add In-Demand Shortcuts */}
            <div style={{ marginTop: '4px', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--ux-text-3)', marginRight: '6px', fontWeight: 600 }}>Quick Add Popular:</span>
              <Space size={[4, 6]} wrap>
                {[
                  'MSc Computer Science', 
                  'MSc Data Science & Analytics', 
                  'MBA (Master in Business Administration)', 
                  'MSc Software Engineering', 
                  'MSc Artificial Intelligence', 
                  'MSc Biomedical Engineering', 
                  'MSc Finance', 
                  'MSc Cybersecurity'
                ].map(suggestedCourse => (
                  <Tag 
                    key={suggestedCourse} 
                    style={{ cursor: 'pointer', fontSize: '11px', background: '#fff', borderColor: 'var(--ux-line)', color: 'var(--ux-text-2)' }}
                    onClick={() => {
                      const current = uniForm.getFieldValue('courses') || [];
                      if (!current.includes(suggestedCourse)) {
                        uniForm.setFieldsValue({ courses: [...current, suggestedCourse] });
                      }
                    }}
                  >
                    + {suggestedCourse}
                  </Tag>
                ))}
              </Space>
            </div>

            <Row gutter={[16, 0]}>
              <Col span={24}>
                <Form.Item 
                  name="degreeLevels" 
                  label={<span style={{ color: 'var(--ux-text-2)', fontSize: '12px', fontWeight: 600 }}>Degree Levels Offered</span>}
                  tooltip="Specify the degree awards available at this institution."
                >
                  <Select mode="multiple" placeholder="Select degree levels offered">
                    <Select.Option value="Bachelor's">Bachelor's</Select.Option>
                    <Select.Option value="Master's">Master's</Select.Option>
                    <Select.Option value="PhD">PhD / Doctorate</Select.Option>
                    <Select.Option value="Diploma">Diploma / Associate</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* ========================================== */}
          {/* ADMISSION ELIGIBILITY CRITERIA SECTION */}
          {/* ========================================== */}
          <div style={{
            margin: '18px 0',
            padding: '16px',
            background: 'var(--ux-surface-2)',
            borderRadius: '18px',
            border: '1px solid var(--ux-line-2)'
          }}>
            <h4 style={{
              margin: '0 0 14px 0',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: 'var(--ux-ink)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <SafetyCertificateOutlined style={{ color: 'var(--ux-text-3)' }} /> Admission Eligibility Criteria (Cards & Shortlist)
            </h4>
            <Row gutter={[12, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item 
                  name="minScore" 
                  label={<span style={{ color: 'var(--ux-text-2)', fontSize: '12px', fontWeight: 600 }}>Min Score / GPA</span>}
                  tooltip="e.g. 'GPA 3.0+' or '60%'"
                >
                  <Input placeholder="e.g. GPA 3.0+ or 60%" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  name="ieltsScore" 
                  label={<span style={{ color: 'var(--ux-text-2)', fontSize: '12px', fontWeight: 600 }}>IELTS / English</span>}
                  tooltip="e.g. 'IELTS 6.0+' or '6.5 Band' or 'Duolingo 110+'"
                >
                  <Input placeholder="e.g. IELTS 6.0+ or 6.5 Band" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[12, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item 
                  name="greExam" 
                  label={<span style={{ color: 'var(--ux-text-2)', fontSize: '12px', fontWeight: 600 }}>GRE Exam</span>}
                  tooltip="e.g. 'GRE Waived' or '310+' or 'Required'"
                >
                  <Input placeholder="e.g. GRE Waived or 310+" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  name="workExp" 
                  label={<span style={{ color: 'var(--ux-text-2)', fontSize: '12px', fontWeight: 600 }}>Work Experience</span>}
                  tooltip="e.g. 'Freshers Eligible' or '1-2 Yrs Preferred'"
                >
                  <Input placeholder="e.g. Freshers Eligible" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[12, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item 
                  name="acceptanceRate" 
                  label={<span style={{ color: 'var(--ux-text-2)', fontSize: '12px', fontWeight: 600 }}>Acceptance Rate</span>}
                  tooltip="e.g. '66%' or '55%'"
                >
                  <Input placeholder="e.g. 66%" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Form.Item name="description" label="Highlights / Description">
            <TextArea rows={3} placeholder="Provide a brief summary or key highlights of the university..." />
          </Form.Item>

          <Form.Item name="eligibility" label="Eligibility Overview (Paragraph)">
            <TextArea rows={2} placeholder="e.g. Bachelor's degree with 3.0+ GPA, IELTS 6.5+" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ========================================== */}
      {/* AUTO-CRAWL COURSES MODAL */}
      {/* ========================================== */}
      <Modal
        className="premium-modal"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="nx-icon-circle">
              <ThunderboltOutlined />
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--ux-ink)' }}>AI Course Crawler & Extractor</div>
              <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)', fontWeight: 500 }}>
                Target: {crawlTargetUni?.name}
              </div>
            </div>
          </div>
        }
        open={isCrawlModalOpen}
        onCancel={() => !isCrawling && setIsCrawlModalOpen(false)}
        footer={null}
        width={680}
        style={{ maxWidth: 'calc(100vw - 24px)', top: 20 }}
        centered
        destroyOnHidden
        styles={{
          body: {
            maxHeight: 'calc(85vh - 120px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '8px'
          }
        }}
      >
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Alert
            type="info"
            showIcon
            icon={<InfoCircleOutlined style={{ color: 'var(--ux-ink)' }} />}
            style={{ background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)', borderRadius: 16 }}
            message="Autonomous University Website Scraper & AI Extractor"
            description="UniCoach bot connects directly to the institution's official site, discovers accredited course offerings, and uses AI to extract tuition fees, minimum IELTS cutoffs, application deadlines, and STEM eligibility."
          />

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
              Crawl Strategy:
            </label>
            <Radio.Group 
              value={crawlMode} 
              onChange={(e) => setCrawlMode(e.target.value)}
              disabled={isCrawling}
            >
              <Radio.Button value="catalog">Batch Crawl from Catalog / A-Z Directory</Radio.Button>
              <Radio.Button value="single">Single Course URL Extraction</Radio.Button>
            </Radio.Group>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
              {crawlMode === 'catalog' ? 'University Course Catalog / A-Z Directory URL:' : 'Official Course / Degree Webpage URL:'}
            </label>
            <Input 
              value={crawlUrl} 
              onChange={(e) => setCrawlUrl(e.target.value)} 
              placeholder={crawlMode === 'catalog' ? 'https://university.edu/courses/postgraduate/a-z/' : 'https://university.edu/courses/msc-computer-science'}
              disabled={isCrawling}
            />
          </div>

          {crawlMode === 'catalog' && (
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                Number of Courses to Discover & Extract:
              </label>
              <Select 
                value={crawlLimit} 
                onChange={setCrawlLimit} 
                style={{ width: 160 }}
                disabled={isCrawling}
              >
                <Select.Option value={3}>3 Courses</Select.Option>
                <Select.Option value={5}>5 Courses (Recommended)</Select.Option>
                <Select.Option value={10}>10 Courses</Select.Option>
                <Select.Option value={20}>20 Courses</Select.Option>
              </Select>
            </div>
          )}

          {isCrawling && (
            <div style={{
              padding: 24, textAlign: 'center', background: 'var(--ux-surface-2)',
              borderRadius: 16, border: '1px dashed var(--ux-line)'
            }}>
              <Spin indicator={<SyncOutlined spin style={{ fontSize: 28, color: 'var(--ux-ink)' }} />} />
              <div style={{ marginTop: 12, fontWeight: 600, color: 'var(--ux-ink)' }}>
                Crawling & AI Extracting Course Data...
              </div>
              <div style={{ fontSize: 12, color: 'var(--ux-text-2)', marginTop: 4 }}>
                Fetching university pages, parsing HTML, extracting admission criteria & fees via Groq LLM
              </div>
            </div>
          )}

          {crawlResult && (
            <div style={{
              padding: 16, background: '#e8f6ec',
              borderRadius: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#15803d', fontWeight: 600 }}>
                <CheckCircleOutlined style={{ fontSize: 18 }} />
                <span>Extraction Succeeded!</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--ux-text)' }}>
                {crawlResult.type === 'single' ? (
                  <div>
                    <strong>{crawlResult.course?.courseName}</strong> - {crawlResult.course?.annualFee?.currency} {crawlResult.course?.annualFee?.amount?.toLocaleString()} (₹{crawlResult.course?.annualFee?.inrAmount?.toLocaleString()})
                  </div>
                ) : (
                  <div>
                    Synced <strong>{crawlResult.results?.successful?.length || 0}</strong> new courses out of <strong>{crawlResult.results?.totalDiscovered || 0}</strong> discovered in catalog!
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Button onClick={() => setIsCrawlModalOpen(false)} disabled={isCrawling}>
              Close
            </Button>
            <Button 
              type="primary" 
              icon={<ThunderboltOutlined />} 
              onClick={handleStartCrawl}
              loading={isCrawling}
            >
              Start Autonomous AI Crawl
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* KC OVERSEAS STYLE UNIVERSITY COURSES MANAGER DRAWER */}
      {/* ======================================================== */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 24, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selectedUniForCourses?.logo ? (
                  <img src={getAbsoluteUrl(selectedUniForCourses.logo)} alt={selectedUniForCourses.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <BankOutlined style={{ fontSize: 20, color: 'var(--ux-ink)' }} />
                )}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)' }}>
                  {selectedUniForCourses?.name}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--ux-text-2)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span>{selectedUniForCourses?.city ? `${selectedUniForCourses.city}, ` : ''}{selectedUniForCourses?.country?.name || 'International'}</span>
                  <span>{getCountryFlag(selectedUniForCourses?.country?.name)}</span>
                </div>
              </div>
            </div>

            <Space size={10} wrap>
              <Button
                icon={<ThunderboltOutlined />}
                onClick={() => openCrawlModal(selectedUniForCourses)}
              >
                AI Auto-Crawl
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openCourseFormModal()}
              >
                Add Course
              </Button>
            </Space>
          </div>
        }
        open={isCoursesManagerOpen}
        onClose={() => setIsCoursesManagerOpen(false)}
        width={typeof window !== 'undefined' && window.innerWidth < 800 ? '100%' : 780}
        destroyOnHidden
        styles={{ body: { background: 'var(--ux-canvas)', padding: '16px' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#ffffff', borderRadius: 16, border: '1px solid var(--ux-line-2)', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 18, borderRadius: 6, border: '1.5px solid var(--ux-line)', display: 'inline-block' }}></span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ux-ink)' }}>
                Course Offerings ({uniDetailedCourses.length})
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--ux-text-3)' }}>
              All fees and deadlines synchronized in real-time
            </span>
          </div>

          {loadingUniCourses ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Spin indicator={<SyncOutlined spin style={{ fontSize: 32, color: 'var(--ux-ink)' }} />} />
              <div style={{ marginTop: 12, color: 'var(--ux-text-2)', fontWeight: 500 }}>Loading official courses...</div>
            </div>
          ) : uniDetailedCourses.length === 0 ? (
            <div style={{ padding: '56px 20px', textAlign: 'center', background: '#ffffff', borderRadius: 24, border: '1px dashed var(--ux-line)' }}>
              <span className="nx-icon-circle" style={{ margin: '0 auto', width: 52, height: 52, fontSize: 20 }}>
                <BookOutlined />
              </span>
              <h4 style={{ marginTop: 14, fontWeight: 600, color: 'var(--ux-ink)', fontSize: 16, letterSpacing: '-0.02em' }}>No Courses Found for this University</h4>
              <p style={{ color: 'var(--ux-text-2)', fontSize: 13, maxWidth: 440, margin: '8px auto 20px' }}>
                Add courses manually with tuition fees, duration, and intake statuses, or use AI Auto-Crawl to scrape them directly from {selectedUniForCourses?.name}'s website.
              </p>
              <Space size={10} wrap style={{ justifyContent: 'center' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openCourseFormModal()}>
                  Add First Course
                </Button>
                <Button icon={<ThunderboltOutlined />} onClick={() => openCrawlModal(selectedUniForCourses)}>
                  AI Auto-Crawl
                </Button>
              </Space>
            </div>
          ) : (
            uniDetailedCourses.map((c) => (
              <div
                key={c._id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--ux-line-2)',
                  borderRadius: 18,
                  padding: '18px 20px',
                  boxShadow: '0 1px 2px rgba(17,17,17,0.03)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Course Card Top Row: Checkbox + Title + Edit/Delete Actions */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
                    <span style={{ marginTop: 3, width: 16, height: 16, borderRadius: 5, border: '1.5px solid var(--ux-line)', display: 'inline-block', flexShrink: 0 }}></span>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--ux-ink)', lineHeight: 1.4, letterSpacing: '-0.01em' }}>
                        {c.courseName}
                      </h4>
                      {c.discipline && (
                        <div style={{ fontSize: '12px', color: 'var(--ux-text-2)', fontWeight: 500, marginTop: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                          <span className="nx-status nx-status--neutral" style={{ height: 22, fontSize: 11 }}>{c.degreeLevel || "Master's"}</span>
                          <span>{c.discipline}</span>
                          {c.faculty && <span> • {c.faculty}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <Space size={2}>
                    <Tooltip title="Edit Course Details">
                      <Button
                        type="text"
                        size="small"
                        shape="circle"
                        icon={<EditOutlined />}
                        onClick={() => openCourseFormModal(c)}
                      />
                    </Tooltip>
                    <Popconfirm title="Delete this course?" onConfirm={() => handleDeleteCourseInManager(c._id)} okText="Yes" cancelText="No">
                      <Button type="text" size="small" shape="circle" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                </div>

                {/* Course Card Middle Row: Intakes Badges (Open, Mar, May, etc.) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                  <span className="nx-status nx-status--success">
                    Open
                  </span>
                  {(c.intakes && c.intakes.length > 0 ? c.intakes : ['Sep 2026']).map((intake, idx) => (
                    <Tooltip key={idx} title={`Intake: ${intake}`}>
                      <span className="nx-status nx-status--neutral" style={{ gap: 5 }}>
                        {intake} <InfoCircleOutlined style={{ color: 'var(--ux-text-3)', fontSize: 10 }} />
                      </span>
                    </Tooltip>
                  ))}
                  {c.isStem && <span className="nx-status nx-status--accent">STEM</span>}
                  {c.hasInternship && <span className="nx-status nx-status--neutral">Internship Included</span>}
                </div>

                {/* Course Card Bottom 3-Column Stats Row: Duration | Tuition/yr | Application Fee */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 16,
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: '1px solid var(--ux-line-2)'
                }}>
                  <div>
                    <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)', fontWeight: 500 }}>Duration</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ux-ink)', marginTop: 2 }}>
                      {c.duration || '12 months'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)', fontWeight: 500 }}>Tuition/yr</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ux-ink)', marginTop: 2 }}>
                      {c.annualFee?.currency || 'EUR'} {c.annualFee?.amount ? c.annualFee.amount.toLocaleString() : '0'}
                      {c.annualFee?.inrAmount > 0 && (
                        <span style={{ fontSize: 11.5, color: 'var(--ux-text-3)', fontWeight: 500, marginLeft: 6 }}>
                          (₹{c.annualFee.inrAmount.toLocaleString()})
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)', fontWeight: 500 }}>Application Fee</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ux-ink)', marginTop: 2 }}>
                      {c.applicationFee?.isWaived ? (
                        <span style={{ color: '#15803d' }}>Waived (Free)</span>
                      ) : (
                        `${c.applicationFee?.currency || c.annualFee?.currency || 'EUR'} ${c.applicationFee?.amount || 0}`
                      )}
                    </div>
                  </div>
                </div>

                {/* Entry Criteria & Official Link */}
                <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--ux-text-2)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {c.minIeltsScore && (
                    <span><strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>IELTS:</strong> {c.minIeltsScore} ({c.ieltsRequirement || 'Standard'})</span>
                  )}
                  {c.academicRequirement && (
                    <span><strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>Academic:</strong> {c.academicRequirement}</span>
                  )}
                  {c.applicationDeadline && (
                    <span><strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>Deadline:</strong> {c.applicationDeadline}</span>
                  )}
                  {c.sourceUrl && (
                    <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ux-brand)', marginLeft: 'auto', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      Official Course Webpage <ExportOutlined style={{ fontSize: 11 }} />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Drawer>

      {/* ======================================================== */}
      {/* SINGLE COURSE ADD / EDIT MODAL */}
      {/* ======================================================== */}
      <Modal
        className="premium-modal"
        title={editingCourse ? "Edit Course Details" : `Add New Course to ${selectedUniForCourses?.name || 'University'}`}
        open={isCourseFormOpen}
        onOk={handleSaveCourse}
        onCancel={() => !savingCourse && setIsCourseFormOpen(false)}
        confirmLoading={savingCourse}
        okText={editingCourse ? "Save Changes" : "Create Course"}
        width={780}
        style={{ maxWidth: 'calc(100vw - 24px)', top: 20 }}
        centered
        destroyOnHidden
        styles={{ body: { maxHeight: 'calc(85vh - 120px)', overflowY: 'auto', overflowX: 'hidden', paddingRight: '8px' } }}
      >
        <Form form={courseForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item 
            name="courseName" 
            label="Full Course / Degree Title" 
            rules={[{ required: true, message: 'Please enter course title' }]}
            tooltip="Official degree name, e.g. 'OTHM Level 7 Diploma in Strategic Management and Leadership...'"
          >
            <Input placeholder="e.g. MSc Computer Science or OTHM Level 7 Diploma in Strategic Management" />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="degreeLevel" label="Degree Award Level" rules={[{ required: true }]}>
                <Select placeholder="Select degree award">
                  <Select.Option value="Master's">Master's (MS/MSc/MA/MBA)</Select.Option>
                  <Select.Option value="Bachelor's">Bachelor's (BS/BSc/BA/BBA)</Select.Option>
                  <Select.Option value="Diploma">Diploma / Post-Grad Diploma</Select.Option>
                  <Select.Option value="PhD">Doctorate / PhD</Select.Option>
                  <Select.Option value="Other">Certificate / Associate</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="discipline" label="Academic Discipline / Field" tooltip="e.g. Management, Computer Science, Finance">
                <Input placeholder="e.g. Strategic Management & Leadership" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="duration" label="Course Duration" rules={[{ required: true, message: 'Enter duration' }]} tooltip="e.g. '8 months', '12 months', '1 Year Full-Time'">
                <Input placeholder="e.g. 8 months or 12 months" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="courseCode" label="Course / CRICOS / UCAS Code">
                <Input placeholder="e.g. CS-901 or 089421A" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '14px 0 18px', fontSize: 13, fontWeight: 600, color: 'var(--ux-ink)' }}>
            Tuition Fees & Financials
          </Divider>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={14}>
              <Form.Item name="tuitionAmount" label="Annual Tuition Fee Amount" rules={[{ required: true, message: 'Enter fee amount' }]} tooltip="Annual non-EU / international tuition fee">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 10800" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item name="tuitionCurrency" label="Currency" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="SGD">SGD (Singapore Dollar)</Select.Option>
                  <Select.Option value="EUR">EUR (€ Euro)</Select.Option>
                  <Select.Option value="USD">USD ($ US Dollar)</Select.Option>
                  <Select.Option value="GBP">GBP (£ British Pound)</Select.Option>
                  <Select.Option value="CAD">CAD (Canadian Dollar)</Select.Option>
                  <Select.Option value="AUD">AUD (Australian Dollar)</Select.Option>
                  <Select.Option value="INR">INR (₹ Indian Rupee)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item name="appFeeAmount" label="Application Fee Amount">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 109" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item name="appFeeCurrency" label="Currency">
                <Select>
                  <Select.Option value="SGD">SGD</Select.Option>
                  <Select.Option value="EUR">EUR</Select.Option>
                  <Select.Option value="USD">USD</Select.Option>
                  <Select.Option value="GBP">GBP</Select.Option>
                  <Select.Option value="CAD">CAD</Select.Option>
                  <Select.Option value="AUD">AUD</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item name="appFeeWaived" label="Fee Waived?" valuePropName="checked">
                <Switch checkedChildren="Waived" unCheckedChildren="Paid" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '14px 0 18px', fontSize: 13, fontWeight: 600, color: 'var(--ux-ink)' }}>
            Intakes & Admissions Criteria
          </Divider>

          <Form.Item 
            name="intakes" 
            label="Intake Months / Sessions" 
            tooltip="Type intake badge and press Enter, e.g. Open, Mar, May, Jul, Sep, Nov"
          >
            <Select mode="tags" placeholder="e.g. Open, Mar, May, Jul, Sep, Nov" style={{ width: '100%' }} tokenSeparators={[',']} />
          </Form.Item>

          <div style={{ marginTop: -8, marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: 'var(--ux-text-3)', marginRight: 8, fontWeight: 600 }}>Quick Presets:</span>
            <Space size={[4, 6]} wrap>
              {[
                { label: 'KC Bimonthly (Open, Mar, May, Jul, Sep, Nov)', val: ['Open', 'Mar', 'May', 'Jul', 'Sep', 'Nov'] },
                { label: 'Standard Fall (Sep 2026)', val: ['Open', 'Sep 2026'] },
                { label: 'Spring & Fall (Jan 2027, Sep 2026)', val: ['Open', 'Jan 2027', 'Sep 2026'] }
              ].map(preset => (
                <Tag 
                  key={preset.label} 
                  style={{ cursor: 'pointer', fontSize: 11, background: '#fff', borderColor: 'var(--ux-line)', color: 'var(--ux-text-2)' }}
                  onClick={() => courseForm.setFieldsValue({ intakes: preset.val })}
                >
                  + {preset.label}
                </Tag>
              ))}
            </Space>
          </div>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item name="minIeltsScore" label="Min IELTS Cutoff" tooltip="e.g. 6.0 or 6.5">
                <InputNumber style={{ width: '100%' }} step={0.5} min={4.0} max={9.0} placeholder="6.0" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="ieltsRequirement" label="IELTS Band Requirement" tooltip="e.g. '6.0 (no band < 5.5)'">
                <Input placeholder="e.g. 6.0 (no individual band below 5.5)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item name="academicRequirement" label="Academic Requirement">
                <Input placeholder="e.g. Bachelor's degree or Level 6 qualification" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="applicationDeadline" label="Application Deadline">
                <Input placeholder="e.g. Rolling Admission or 31 July 2026" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={12} sm={12}>
              <Form.Item name="isStem" label="STEM Designated?" valuePropName="checked">
                <Switch checkedChildren="Yes (STEM)" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={12}>
              <Form.Item name="hasInternship" label="Internship Included?" valuePropName="checked">
                <Switch checkedChildren="Yes (Internship)" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="sourceUrl" label="Official Course Webpage URL">
            <Input placeholder="https://university.edu/courses/..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Universities;
