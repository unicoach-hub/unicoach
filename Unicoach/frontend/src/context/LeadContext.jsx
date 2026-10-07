import React, { createContext, useContext, useState } from 'react';
import { API_BASE_URL } from '../config';

const LeadContext = createContext(null);

export const useLead = () => useContext(LeadContext);

const API_URL = API_BASE_URL;

export const LeadProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState('check-eligibility');
  // True right after a lead form was saved: shows the "You're all set" modal (no OTP step any more)
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Contact details from an older OTP-verified session (kept so existing visitors stay recognised)
  const [verifiedLead, setVerifiedLead] = useState(() => {
    try {
      const saved = localStorage.getItem('lead_info');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const clearLead = () => {
    setVerifiedLead(null);
    setIsSubmitted(false);
    try {
      localStorage.removeItem('lead_info');
    } catch (e) {}
  };

  const openEligibilityModal = (source = 'check-eligibility') => {
    setModalSource(source);
    setIsModalOpen(true);
    setIsSubmitted(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsSubmitted(false);
  };

  // Name, email and phone are enough: the lead is saved at once (no OTP / SMS) and the success modal opens
  const submitLead = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/leads/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source: modalSource }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setIsModalOpen(false);
        setIsSubmitted(true);
        return { success: true, leadId: data.leadId };
      }
      const firstDetail = Array.isArray(data.details) && data.details[0]?.message;
      return { success: false, message: firstDetail || data.message || data.error || 'Failed to submit' };
    } catch (err) {
      return { success: false, message: 'Network error' };
    }
  };

  return (
    <LeadContext.Provider value={{
      isModalOpen, isSubmitted, modalSource, verifiedLead,
      openEligibilityModal, closeModal, submitLead, clearLead,
    }}>
      {children}
    </LeadContext.Provider>
  );
};
