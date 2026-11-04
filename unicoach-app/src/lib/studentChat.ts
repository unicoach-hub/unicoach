import { Platform } from 'react-native';

import { api, ApiError } from './api';
import { API_URL } from './config';
import { getToken } from './tokenStore';

// The student's file with their counsellor: same chat + documents as the website dashboard's "Messages & Documents"
// (backend routes/studentChat.js).
export type DocStatus = 'requested' | 'uploaded' | 'approved' | 'reupload';

export type StudentDoc = {
  _id: string;
  title: string;
  status: DocStatus;
  from: 'student' | 'staff';
  note?: string;
  file: { name: string; size?: number; mime?: string } | null;
  uploadedAt?: string;
  createdAt: string;
};

export type ChatMessage = {
  _id: string;
  senderType: 'student' | 'staff';
  senderName?: string;
  kind: 'text' | 'file' | 'request';
  text?: string;
  requestTitles?: string[];
  document: StudentDoc | null;
  createdAt: string;
};

export type Counsellor = { name: string; avatar?: string; title?: string } | null;

export type MyFile = { messages: ChatMessage[]; documents: StudentDoc[]; counselor: Counsellor; docTypes: string[] };

export const MAX_FILE_MB = 5;

export function loadMyFile() {
  return api<MyFile>('/student-chat');
}

export async function unreadCount() {
  const res = await api<{ unread: number }>('/student-chat/unread');
  return res.unread;
}

export function sendText(text: string) {
  return sendMultipart({ text });
}

// A picked file, from the document picker or the camera
export type PickedFile = { uri: string; name: string; mimeType?: string; size?: number; file?: Blob };

export function sendFile(picked: PickedFile, target: { documentId: string } | { docType: string; docName?: string }) {
  return sendMultipart({ ...target, picked });
}

async function sendMultipart({
  text,
  picked,
  documentId,
  docType,
  docName,
}: {
  text?: string;
  picked?: PickedFile;
  documentId?: string;
  docType?: string;
  docName?: string;
}) {
  const form = new FormData();
  if (text) form.append('text', text);
  if (documentId) form.append('documentId', documentId);
  if (docType) form.append('docType', docType);
  if (docName) form.append('docName', docName);
  if (picked) {
    // Web gives a real File; on phones FormData takes { uri, name, type }
    if (Platform.OS === 'web' && picked.file) form.append('file', picked.file, picked.name);
    else form.append('file', { uri: picked.uri, name: picked.name, type: picked.mimeType ?? 'application/octet-stream' } as unknown as Blob);
  }

  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/student-chat/messages`, {
      method: 'POST',
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: form,
      credentials: 'omit',
    });
  } catch {
    throw new ApiError(0, 'Internet connection check karo aur dobara try karo.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, hinglish(data?.message) ?? 'Bhej nahi paaye. Dobara try karo.');
  return data.message as ChatMessage;
}

// The backend speaks English; the common upload errors get a Hinglish line.
function hinglish(message?: string) {
  if (!message) return undefined;
  if (/too large/i.test(message)) return `File bahut badi hai. ${MAX_FILE_MB} MB se chhoti bhejo.`;
  if (/Only PDF/i.test(message)) return 'Sirf PDF, JPG, PNG ya WebP file bhej sakte ho.';
  if (/Choose what this document is/i.test(message)) return 'Pehle chuno ye kaunsa document hai.';
  return message;
}

export async function documentLink(id: string) {
  const res = await api<{ url: string }>(`/student-chat/documents/${id}/file`);
  return res.url;
}

export const STATUS_LABEL: Record<DocStatus, { label: string; bg: string; fg: string }> = {
  requested: { label: 'Maanga gaya', bg: '#FFF1B8', fg: '#16130F' },
  uploaded: { label: 'Check ho raha', bg: '#D8EEEC', fg: '#0F6560' },
  approved: { label: 'Approved', bg: '#14837E', fg: '#FFF6E5' },
  reupload: { label: 'Dobara bhejo', bg: '#FCDCD2', fg: '#D0362E' },
};
