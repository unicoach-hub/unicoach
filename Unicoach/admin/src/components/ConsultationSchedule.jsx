import { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Empty, Popconfirm, Spin, Tag, message } from 'antd';
import { LeftOutlined, RightOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import API from '../api/axios';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first
// Hours the team can open, one-hour calls
const HOURS = Array.from({ length: 16 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`); // 7 am … 10 pm
const to12h = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h >= 12 ? 'PM' : 'AM'}`;
};
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayYmd = () => ymd(new Date());

export const slotsForDate = (avail, date) => {
  if (!avail) return [];
  const o = (avail.overrides || []).find((x) => x.date === date);
  if (o) return o.closed ? [] : o.slots || [];
  const dow = new Date(`${date}T12:00:00`).getDay();
  return avail.weekly?.[String(dow)] || [];
};

const HourChips = ({ value = [], onChange }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
    {HOURS.map((h) => {
      const on = value.includes(h);
      return (
        <button key={h} type="button" onClick={() => onChange(on ? value.filter((x) => x !== h) : [...value, h].sort())}
          style={{ height: 30, padding: '0 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: `1px solid ${on ? '#DE5C2B' : 'var(--ux-line-2)'}`, background: on ? '#DE5C2B' : '#fff', color: on ? '#fff' : 'var(--ux-text-2)' }}>
          {to12h(h)}
        </button>
      );
    })}
  </div>
);

// Weekly hours + one-off dates (open extra times, or close the day)
export const AvailabilityEditor = ({ onSaved }) => {
  const [avail, setAvail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    API.get('/admin/consultations/availability').then(({ data }) => setAvail(data)).catch(() => message.error('Could not load availability'));
  }, []);

  const change = (next) => { setAvail(next); setDirty(true); };
  const save = async () => {
    setSaving(true);
    try {
      const { data } = await API.put('/admin/consultations/availability', { weekly: avail.weekly, overrides: avail.overrides });
      setAvail((a) => ({ ...a, ...data }));
      setDirty(false);
      message.success('Saved. Students see the new slots right away.');
      onSaved?.(data);
    } catch (e) {
      message.error(e.response?.data?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  if (!avail) return <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>;
  const upcoming = (avail.overrides || []).filter((o) => o.date >= todayYmd());

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="page-table-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Weekly hours</div>
            <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>Tap the hours you take calls each day. Every call is {avail.durationMin || 60} minutes, India time.</div>
          </div>
          <Button type="primary" onClick={save} loading={saving} disabled={!dirty}>Save changes</Button>
        </div>
        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          {ORDER.map((d) => {
            const list = avail.weekly?.[String(d)] || [];
            return (
              <div key={d} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 10, alignItems: 'start', paddingBottom: 10, borderBottom: '1px solid var(--ux-line-2)' }}>
                <div style={{ paddingTop: 5 }}>
                  <b>{DOW[d]}</b>
                  <div style={{ fontSize: 11.5, color: list.length ? '#047857' : 'var(--ux-text-3)' }}>{list.length ? `${list.length} slot${list.length === 1 ? '' : 's'}` : 'Off'}</div>
                </div>
                <HourChips value={list} onChange={(v) => change({ ...avail, weekly: { ...avail.weekly, [String(d)]: v } })} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="page-table-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Specific dates</div>
            <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>Open different hours on one day, or close a day (holiday, travel). This replaces the weekly hours for that date.</div>
          </div>
          <DatePicker
            placeholder="Add a date"
            disabledDate={(d) => d && d.format('YYYY-MM-DD') < todayYmd()}
            onChange={(d) => {
              if (!d) return;
              const date = d.format('YYYY-MM-DD');
              if ((avail.overrides || []).some((o) => o.date === date)) return message.info('That date is already in the list');
              change({ ...avail, overrides: [...(avail.overrides || []), { date, closed: false, slots: slotsForDate(avail, date) }].sort((a, b) => a.date.localeCompare(b.date)) });
            }}
          />
        </div>
        {upcoming.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No special dates. Weekly hours apply every day." />
        ) : (
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {upcoming.map((o) => {
              const setO = (patch) => change({ ...avail, overrides: avail.overrides.map((x) => (x.date === o.date ? { ...x, ...patch } : x)) });
              return (
                <div key={o.date} style={{ border: '1px solid var(--ux-line-2)', borderRadius: 12, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <b>{new Date(`${o.date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</b>
                    {o.closed ? <Tag color="red">Closed</Tag> : <Tag color="green">{(o.slots || []).length} slots</Tag>}
                    <Button size="small" onClick={() => setO({ closed: !o.closed })}>{o.closed ? 'Open this day' : 'Close this day'}</Button>
                    <Popconfirm title="Remove this date? Weekly hours will apply again." onConfirm={() => change({ ...avail, overrides: avail.overrides.filter((x) => x.date !== o.date) })}>
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                  {!o.closed && <HourChips value={o.slots || []} onChange={(v) => setO({ slots: v })} />}
                </div>
              );
            })}
          </div>
        )}
        {dirty && <div style={{ marginTop: 12, textAlign: 'right' }}><Button type="primary" icon={<PlusOutlined />} onClick={save} loading={saving}>Save changes</Button></div>}
      </div>
    </div>
  );
};

// Month view: calls booked and slots still open on each day; click a day to see its calls
export const ConsultCalendar = ({ items = [], onOpen }) => {
  const [avail, setAvail] = useState(null);
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [day, setDay] = useState(todayYmd());

  useEffect(() => {
    API.get('/admin/consultations/availability').then(({ data }) => setAvail(data)).catch(() => {});
  }, []);

  const byDate = useMemo(() => {
    const m = {};
    items.filter((c) => c.status !== 'cancelled' && c.status !== 'payment_pending').forEach((c) => { (m[c.date] = m[c.date] || []).push(c); });
    Object.values(m).forEach((arr) => arr.sort((a, b) => a.time.localeCompare(b.time)));
    return m;
  }, [items]);

  const cells = useMemo(() => {
    const lead = (cursor.getDay() + 6) % 7;
    const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => ymd(new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)))];
  }, [cursor]);

  const monthCalls = cells.filter(Boolean).reduce((t, d) => t + (byDate[d]?.length || 0), 0);
  const monthOpen = cells.filter(Boolean).reduce((t, d) => (d < todayYmd() ? t : t + Math.max(0, slotsForDate(avail, d).length - (byDate[d]?.length || 0))), 0);
  const list = byDate[day] || [];
  const daySlots = slotsForDate(avail, day);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(260px, 1fr)', gap: 12 }} className="consult-cal">
      <div className="page-table-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button size="small" icon={<LeftOutlined />} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} />
            <b style={{ fontSize: 16, minWidth: 140, textAlign: 'center' }}>{cursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</b>
            <Button size="small" icon={<RightOutlined />} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Tag color="orange">{monthCalls} booked</Tag>
            <Tag color="green">{monthOpen} open slots left</Tag>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 12 }}>
          {ORDER.map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 600, color: 'var(--ux-text-3)' }}>{DOW[d]}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={`e${i}`} />;
            const booked = byDate[d]?.length || 0;
            const total = slotsForDate(avail, d).length;
            const past = d < todayYmd();
            const sel = d === day;
            return (
              <button key={d} type="button" onClick={() => setDay(d)}
                style={{ minHeight: 74, borderRadius: 12, padding: 6, textAlign: 'left', cursor: 'pointer', border: `1.5px solid ${sel ? '#DE5C2B' : 'var(--ux-line-2)'}`, background: sel ? '#FFF4EE' : past ? 'var(--ux-surface-2)' : '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: past ? 'var(--ux-text-3)' : 'var(--ux-ink)' }}>{Number(d.slice(8))}</span>
                {booked > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#DE5C2B', borderRadius: 6, padding: '1px 6px', alignSelf: 'flex-start' }}>{booked} call{booked === 1 ? '' : 's'}</span>}
                {!past && <span style={{ fontSize: 10.5, color: total ? '#047857' : 'var(--ux-text-3)' }}>{total ? `${Math.max(0, total - booked)}/${total} open` : 'Off'}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="page-table-card" style={{ padding: 16 }}>
        <b>{new Date(`${day}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</b>
        <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)', marginBottom: 10 }}>{daySlots.length ? `Open hours: ${daySlots.map(to12h).join(', ')}` : 'No hours open this day'}</div>
        {daySlots.length === 0 && list.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nothing on this day" />}
        <div style={{ display: 'grid', gap: 8 }}>
          {[...new Set([...daySlots, ...list.map((c) => c.time)])].sort().map((t) => {
            const c = list.find((x) => x.time === t);
            return c ? (
              <button key={t} type="button" onClick={() => onOpen?.(c)} style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid #F3C9B6', background: '#FFF4EE', borderRadius: 10, padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{to12h(t)}</b><Tag color={c.status === 'completed' ? 'green' : c.status === 'no_show' ? 'orange' : 'blue'}>{c.status.replace('_', '-')}</Tag></div>
                <div style={{ fontSize: 13 }}>{c.name} · {c.serviceLabel}</div>
                <div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{c.phone}{c.counsellor ? ` · ${c.counsellor}` : ''}</div>
              </button>
            ) : (
              <div key={t} style={{ border: '1px dashed var(--ux-line)', borderRadius: 10, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <b>{to12h(t)}</b><span style={{ color: '#047857' }}>Open</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
