# 💬 Feature 7: UniBot — 24/7 AI Study Abroad Counselor Chat

---

## 📌 1. Purpose & Business Value
Website visitors aur registered students ke queries ko 24/7 bina kisi delay ke solve karne ke liye **UniBot** banaya gaya hai.

UniBot:
- Multi-turn conversational memory maintain karta hai.
- Country comparisons (*"USA vs Germany for MS in CS under ₹25 Lakhs"*), visa queries, post-study work visa (PSW) rules, aur scholarship advice deta hai.
- Conversations ke dauran student se unka name/phone puchkar automatically **Lead capture** karta hai.

---

## 🔄 2. How It Works (Step-by-Step Data Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant Chat as UniBotChat.jsx (Floating Widget / Full Page)
    participant API as /api/ai/chat
    participant AI as aiService.js (studyAbroadChat)

    Student->>Chat: Asks "What are post study work visa rules in Ireland vs UK?"
    Chat->>API: POST /api/ai/chat { message, conversationHistory }
    API->>AI: studyAbroadChat()
    AI->>AI: Groq LLM evaluates study abroad policies & visa regulations
    AI-->>API: Returns intelligent markdown response + suggested follow-up chips
    API-->>Chat: Render formatted response
    Chat-->>Student: Displays answer with clickable follow-up questions!
```

---

## 📂 3. Connected Files & Code Architecture

| Component | Path | Responsibility |
| :--- | :--- | :--- |
| **Frontend Chat Widget** | `frontend/src/components/UniBotFloatingChat.jsx` / `ChatbotModal.jsx` | Floating launcher, message bubble layout, quick action pills |
| **Backend API Route** | `backend/routes/ai.js` | Endpoint `POST /api/ai/chat` |
| **AI Prompt Engine** | `backend/utils/aiService.js` | `studyAbroadChat()` with expert counselor persona and lead capture cues |

---

## 💼 4. Client Pitch & Demo Talking Points
1. **"Instant 24/7 Support":** Night ya weekend par bhi leads drop nahi hoti; bot student ko engage karke call book kar leta hai.
2. **"Trained on Latest 2026 Regulations":** UK graduate route, Canadian work permits, aur German opportunity card (Chancenkarte) sab updated hain.
