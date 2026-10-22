import { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Spin, Switch, Tag, message } from 'antd';
import { LeftOutlined, RightOutlined, LockOutlined, CheckOutlined } from '@ant-design/icons';
import API from '../api/axios';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first
const HOURS = Array.from({ length: 16 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`); // 7 am … 10 pm, one-hour calls
const DEFAULT_HOURS = ['13:00', '14:00', '20:00'];

const to12h = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h >= 12 ? 'PM' : 'AM'}`;
};
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayYmd = () => ymd(new Date());
const dowOf = (date) => new Date(`${date}T12:00:00`).getDay();
const prettyDay = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

const overrideOf = (avail, date) => (avail?.overrides || []).find((x) => x.date === date);
export const slotsForDate = (avail, date) => {
  if (!avail) return [];
  const o = overrideOf(avail, date);
  if (o) return o.closed ? [] : o.slots || [];
  return avail.weekly?.[String(dowOf(date))] || [];
};

const useAvailability = () => {
  const [avail, setAvail] = useState(null);
  useEffect(() => {
    API.get('/admin/consultations/availability').then(({ data }) => setAvail(data)).catch(() => message.error('Could not load your hours'));
  }, []);
  const save = async (next, okText = 'Saved') => {
    const { data } = await API.put('/admin/consultations/availability', { weekly: next.weekly, overrides: next.overrides });
    setAvail((a) => ({ ...a, ...data }));
    message.success(okText);
    return data;
  };
  return [avail, setAvail, save];
};

// Row of hour toggles. Booked hours are locked (and stay open) so a paid call is never dropped.
const HourToggles = ({ value = [], onChange, booked = {} }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: 6 }}>
    {HOURS.map((h) => {
      const call = booked[h];
      const on = value.includes(h) || Boolean(call);
      return (
        <button key={h} type="button" disabled={Boolean(call)} title={call ? `Booked: ${call.name}` : on ? 'Open: tap to close' : 'Closed: tap to open'}
          onClick={() => onChange(on ? value.filter((x) => x !== h) : [...value, h].sort())}
          style={{
            height: 36, borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: call ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            border: `1px solid ${call ? '#F3C9B6' : on ? '#16a34a' : 'var(--ux-line-2)'}`,
            background: call ? '#FFF4EE' : on ? '#ECFDF5' : '#fff',
            color: call ? '#C04A1D' : on ? '#047857' : 'var(--ux-text-3)',
          }}>
          {call ? <LockOutlined /> : on ? <CheckOutlined /> : null}{to12h(h)}
        </button>
      );
    })}
  </div>
);

const Legend = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12, color: 'var(--ux-text-2)' }}>
    {[['#ECFDF5', '#16a34a', 'Open slots'], ['#DE5C2B', '#DE5C2B', 'Booked calls'], ['var(--ux-surface-2)', 'var(--ux-line)', 'Day off'], ['#fff', '#7c3aed', 'Custom hours for that date']].map(([bg, bd, t]) => (
      <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 4, background: bg, border: `2px solid ${bd}` }} />{t}</span>
    ))}
  </div>
);

// Main screen: the month, and the selected day's hours you can switch on/off right there
export const ConsultCalendar = ({ items = [], onOpen }) => {
  const [avail, setAvail, save] = useAvailability();
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [day, setDay] = useState(todayYmd());
  const [draft, setDraft] = useState(null); // { working, hours } for the selected day while editing
  const [saving, setSaving] = useState(false);

  const byDate = useMemo(() => {
    const m = {};
    items.filter((c) => c.status !== 'cancelled' && c.status !== 'payment_pending').forEach((c) => { (m[c.date] = m[c.date] || []).push(c); });
    return m;
  }, [items]);

  const cells = useMemo(() => {
    const lead = (cursor.getDay() + 6) % 7;
    const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => ymd(new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)))];
  }, [cursor]);

  // Reset the editor whenever another day is picked or hours reload
  useEffect(() => {
    if (!avail) return;
    const hours = slotsForDate(avail, day);
    setDraft({ working: hours.length > 0, hours: hours.length ? hours : avail.weekly?.[String(dowOf(day))]?.length ? avail.weekly[String(dowOf(day))] : DEFAULT_HOURS });
  }, [day, avail]);

  if (!avail || !draft) return <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>;

  const past = day < todayYmd();
  const calls = byDate[day] || [];
  const booked = Object.fromEntries(calls.map((c) => [c.time, c]));
  const weeklyHours = avail.weekly?.[String(dowOf(day))] || [];
  const override = overrideOf(avail, day);
  const finalHours = draft.working ? [...new Set([...draft.hours, ...Object.keys(booked)])].sort() : Object.keys(booked);
  const savedHours = slotsForDate(avail, day);
  const changed = JSON.stringify(finalHours) !== JSON.stringify([...savedHours].sort());

  const saveDay = async () => {
    setSaving(true);
    try {
      const sameAsWeekly = JSON.stringify(finalHours) === JSON.stringify([...weeklyHours].sort());
      const rest = (avail.overrides || []).filter((o) => o.date !== day);
      const overrides = sameAsWeekly ? rest : [...rest, finalHours.length ? { date: day, closed: false, slots: finalHours } : { date: day, closed: true, slots: [] }];
      await save({ ...avail, overrides }, finalHours.length ? `Saved: ${finalHours.length} slot${finalHours.length === 1 ? '' : 's'} open on ${prettyDay(day)}` : `${prettyDay(day)} is now a day off`);
    } catch (e) {
      message.error(e.response?.data?.message || 'Could not save');
    } finally { setSaving(false); }
  };
  const saveEveryWeek = async () => {
    setSaving(true);
    try {
      const dow = String(dowOf(day));
      const overrides = (avail.overrides || []).filter((o) => o.date !== day);
      await save({ weekly: { ...avail.weekly, [dow]: draft.working ? [...draft.hours].sort() : [] }, overrides }, draft.working ? `Every ${DOW_LONG[dow]}: ${draft.hours.length} slots` : `Every ${DOW_LONG[dow]} is now off`);
    } catch (e) {
      message.error(e.response?.data?.message || 'Could not save');
    } finally { setSaving(false); }
  };
  const resetDay = async () => {
    setSaving(true);
    try { await save({ ...avail, overrides: (avail.overrides || []).filter((o) => o.date !== day) }, 'Back to your weekly hours'); } catch { message.error('Could not save'); } finally { setSaving(false); }
  };

  const monthDays = cells.filter(Boolean);
  const monthCalls = monthDays.reduce((t, d) => t + (byDate[d]?.length || 0), 0);
  const monthOpen = monthDays.reduce((t, d) => (d < todayYmd() ? t : t + Math.max(0, slotsForDate(avail, d).length - (byDate[d]?.length || 0))), 0);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="page-table-card" style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 18, fontSize: 13 }}>
        <span><b>1.</b> Click a date</span>
        <span><b>2.</b> Turn the day on or off, and tap the hours you&apos;re free</span>
        <span><b>3.</b> Save for that date, or for that weekday every week</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(300px, 1fr)', gap: 12 }}>
        <div className="page-table-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button size="small" icon={<LeftOutlined />} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} />
              <b style={{ fontSize: 16, minWidth: 140, textAlign: 'center' }}>{cursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</b>
              <Button size="small" icon={<RightOutlined />} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Tag color="orange">{monthCalls} booked</Tag>
              <Tag color="green">{monthOpen} open slots</Tag>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 12 }}>
            {ORDER.map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 600, color: 'var(--ux-text-3)' }}>{DOW[d]}</div>)}
            {cells.map((d, i) => {
              if (!d) return <div key={`e${i}`} />;
              const n = byDate[d]?.length || 0;
              const total = slotsForDate(avail, d).length;
              const isPast = d < todayYmd();
              const off = !isPast && total === 0;
              const custom = Boolean(overrideOf(avail, d));
              const sel = d === day;
              return (
                <button key={d} type="button" onClick={() => setDay(d)}
                  style={{
                    minHeight: 74, borderRadius: 12, padding: 6, textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    border: `2px solid ${sel ? '#111' : custom ? '#7c3aed' : 'var(--ux-line-2)'}`,
                    background: isPast || off ? 'var(--ux-surface-2)' : '#fff',
                  }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isPast ? 'var(--ux-text-3)' : 'var(--ux-ink)' }}>{Number(d.slice(8))}</span>
                  {n > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#DE5C2B', borderRadius: 6, padding: '1px 6px', alignSelf: 'flex-start' }}>{n} booked</span>}
                  {!isPast && (off
                    ? <span style={{ fontSize: 11, color: 'var(--ux-text-3)' }}>Day off</span>
                    : <span style={{ fontSize: 11, fontWeight: 600, color: '#047857' }}>{Math.max(0, total - n)} open</span>)}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 12 }}><Legend /></div>
        </div>

        <div className="page-table-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{prettyDay(day)}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>
              {override ? 'Custom hours for this date' : `Using your ${DOW_LONG[dowOf(day)]} hours`}
            </div>
          </div>

          {past ? (
            <div style={{ fontSize: 13, color: 'var(--ux-text-2)' }}>This day has passed.</div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, background: draft.working ? '#ECFDF5' : 'var(--ux-surface-2)' }}>
                <div>
                  <b>{draft.working ? "I'm taking calls this day" : 'Day off'}</b>
                  <div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{draft.working ? 'Students can book the green hours below' : 'Students cannot book this day'}</div>
                </div>
                <Switch checked={draft.working} onChange={(v) => setDraft((x) => ({ ...x, working: v }))} />
              </div>

              {draft.working && (
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Tap an hour to open or close it (each call is 1 hour)</div>
                  <HourToggles value={draft.hours} booked={booked} onChange={(v) => setDraft((x) => ({ ...x, hours: v }))} />
                </div>
              )}
              {!draft.working && calls.length > 0 && <div style={{ fontSize: 12.5, color: '#C04A1D' }}>{calls.length} call{calls.length === 1 ? ' is' : 's are'} already booked; those stay on.</div>}

              <div style={{ display: 'grid', gap: 8 }}>
                <Button type="primary" block loading={saving} disabled={!changed} onClick={saveDay}>Save for {new Date(`${day}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} only</Button>
                <Button block loading={saving} onClick={saveEveryWeek}>Use these hours every {DOW_LONG[dowOf(day)]}</Button>
                {override && <Button type="link" onClick={resetDay}>Go back to my usual {DOW_LONG[dowOf(day)]} hours</Button>}
              </div>
            </>
          )}

          <div style={{ borderTop: '1px solid var(--ux-line-2)', paddingTop: 12 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Calls on this day</div>
            {calls.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No calls booked" /> : (
              <div style={{ display: 'grid', gap: 8 }}>
                {[...calls].sort((a, b) => a.time.localeCompare(b.time)).map((c) => (
                  <button key={c._id} type="button" onClick={() => onOpen?.(c)} style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid #F3C9B6', background: '#FFF4EE', borderRadius: 10, padding: '8px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{to12h(c.time)}</b><Tag color={c.status === 'completed' ? 'green' : c.status === 'no_show' ? 'orange' : 'blue'}>{c.status.replace('_', '-')}</Tag></div>
                    <div style={{ fontSize: 13 }}>{c.name} · {c.serviceLabel}</div>
                    <div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{c.phone}{c.counsellor ? ` · ${c.counsellor}` : ''}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Your normal week: one switch per day, hours only for the days you work
export const AvailabilityEditor = () => {
  const [avail, setAvail, save] = useAvailability();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  if (!avail) return <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>;

  const setDay = (d, hours) => { setAvail({ ...avail, weekly: { ...avail.weekly, [String(d)]: hours } }); setDirty(true); };
  const onSave = async () => {
    setSaving(true);
    try { await save(avail, 'Weekly schedule saved. Students see it right away.'); setDirty(false); } catch (e) { message.error(e.response?.data?.message || 'Could not save'); } finally { setSaving(false); }
  };
  const custom = (avail.overrides || []).filter((o) => o.date >= todayYmd()).length;

  return (
    <div className="page-table-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Your normal week</div>
          <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>
            Switch on the days you work and tap your free hours. To change just one date (holiday, extra hours), use the Calendar tab.
            {custom > 0 && ` ${custom} upcoming date${custom === 1 ? ' has' : 's have'} custom hours.`}
          </div>
        </div>
        <Button type="primary" onClick={onSave} loading={saving} disabled={!dirty}>Save weekly schedule</Button>
      </div>
      <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
        {ORDER.map((d) => {
          const list = avail.weekly?.[String(d)] || [];
          const working = list.length > 0;
          return (
            <div key={d} style={{ border: '1px solid var(--ux-line-2)', borderRadius: 12, padding: 12, background: working ? '#fff' : 'var(--ux-surface-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Switch checked={working} onChange={(v) => setDay(d, v ? DEFAULT_HOURS : [])} />
                <b style={{ width: 100 }}>{DOW_LONG[d]}</b>
                <span style={{ fontSize: 12.5, color: working ? '#047857' : 'var(--ux-text-3)' }}>
                  {working ? `${list.length} call${list.length === 1 ? '' : 's'}: ${list.map(to12h).join(', ')}` : 'Day off'}
                </span>
              </div>
              {working && <div style={{ marginTop: 10 }}><HourToggles value={list} onChange={(v) => setDay(d, v)} /></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
