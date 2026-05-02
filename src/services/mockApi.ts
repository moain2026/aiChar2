/**
 * Mock API service.
 *
 * Simulates the backend so the frontend can be developed end-to-end
 * before the real API exists. When the real backend is ready, replace
 * the implementation of each method here (or swap this module out
 * entirely) without changing the rest of the app.
 */
import type {
  AuthSession,
  Document,
  FileType,
  LoginCredentials,
  Message,
  SignupCredentials,
  Source,
  StreamEvent,
} from '@/types';
import { detectFileType } from '@/utils/formatters';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const uuid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;

// ---------------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------------
const SEED_USER = {
  id: 'user-demo',
  email: 'demo@company.com',
  name: 'Ahmed',
  password: 'demo123',
};

function makeSession(user: { id: string; email: string; name: string }): AuthSession {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return {
    user: { ...user, createdAt: new Date().toISOString() },
    token: `mock-token-${uuid()}`,
    expiresAt,
  };
}

export async function mockLogin(credentials: LoginCredentials): Promise<AuthSession> {
  await wait(900);
  const { email, password } = credentials;
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Demo seeded credentials
  if (email.toLowerCase() === SEED_USER.email && password === SEED_USER.password) {
    return makeSession({ id: SEED_USER.id, email: SEED_USER.email, name: SEED_USER.name });
  }

  // Any other valid-looking combination "works" (simulated signup-on-login)
  if (password.length < 4) {
    throw new Error('Invalid email or password');
  }
  const fallbackName = email.split('@')[0]!.replace(/[^a-zA-Z]/g, ' ').trim() || 'New User';
  const cleanedName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);
  return makeSession({ id: `user-${uuid()}`, email, name: cleanedName });
}

export async function mockSignup(credentials: SignupCredentials): Promise<AuthSession> {
  await wait(1000);
  const { email, password, name } = credentials;
  if (!email || !password || !name) {
    throw new Error('All fields are required');
  }
  return makeSession({ id: `user-${uuid()}`, email, name });
}

export async function mockLogout(): Promise<void> {
  await wait(200);
}

// ---------------------------------------------------------------------------
// DOCUMENTS
// ---------------------------------------------------------------------------
const SEED_DOCUMENTS: Document[] = [
  {
    id: 'doc-seed-1',
    name: 'Employee Handbook 2025.pdf',
    fileType: 'pdf',
    fileSize: 2_419_200,
    status: 'ready',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    chunkCount: 47,
  },
  {
    id: 'doc-seed-2',
    name: 'Q4 Financial Report.xlsx',
    fileType: 'xlsx',
    fileSize: 845_120,
    status: 'ready',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    chunkCount: 18,
  },
  {
    id: 'doc-seed-3',
    name: 'Service Agreement Template.docx',
    fileType: 'docx',
    fileSize: 312_540,
    status: 'ready',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    chunkCount: 24,
  },
];

export function getSeedDocuments(): Document[] {
  return SEED_DOCUMENTS.map((doc) => ({ ...doc }));
}

interface UploadCallbacks {
  onProgress?: (progress: number) => void;
  onStatus?: (status: Document['status']) => void;
}

/**
 * Simulate the full upload + processing pipeline.
 * Resolves with the final, ready-state document.
 */
export async function mockUploadDocument(
  file: File,
  callbacks: UploadCallbacks = {},
): Promise<Document> {
  const fileType = detectFileType(file);
  if (!fileType) {
    throw new Error('Unsupported file type');
  }

  const id = `doc-${uuid()}`;
  callbacks.onStatus?.('uploading');

  // Phase 1 — upload (0..100% over ~2s)
  const totalSteps = 20;
  for (let step = 1; step <= totalSteps; step++) {
    await wait(100);
    callbacks.onProgress?.(Math.round((step / totalSteps) * 100));
  }

  // Phase 2 — processing
  callbacks.onStatus?.('processing');
  await wait(2200 + Math.random() * 1000);

  // Phase 3 — ready
  const chunkCount = 10 + Math.floor(Math.random() * 41);
  const final: Document = {
    id,
    name: file.name,
    fileType,
    fileSize: file.size,
    status: 'ready',
    uploadedAt: new Date().toISOString(),
    chunkCount,
  };
  callbacks.onStatus?.('ready');
  return final;
}

// ---------------------------------------------------------------------------
// CHAT — streaming AI responses
// ---------------------------------------------------------------------------
interface ChatStreamArgs {
  question: string;
  documents: Document[];
  onEvent: (event: StreamEvent) => void;
  signal?: AbortSignal;
}

const RESPONSE_TEMPLATES: Array<{ keywords: RegExp; reply: string }> = [
  {
    keywords: /(policy|policies|سياسة|سياسات)/i,
    reply: `Based on your uploaded documents, the company outlines several key policies:

- **Code of Conduct** — every employee is expected to act with integrity, respect, and professionalism in all internal and external communications.
- **Information Security** — confidential information must remain inside approved company systems and may not be shared with third parties without explicit approval.
- **Remote Work** — eligible roles can work remotely up to 2 days per week, subject to manager approval and project requirements.

These policies are reviewed annually by the People team and updates are communicated through the internal handbook.`,
  },
  {
    keywords: /(leave|إجازة|vacation|holiday)/i,
    reply: `Here is a summary of the leave policy found in your documents:

- **Annual leave** — 21 working days per year, accrued monthly.
- **Sick leave** — up to 10 paid days per calendar year. A medical certificate is required for absences longer than 2 days.
- **Parental leave** — 12 weeks of paid leave for primary caregivers, 4 weeks for secondary caregivers.

Leave requests must be submitted at least **two weeks in advance** through the HR portal, except in genuine emergencies.`,
  },
  {
    keywords: /(salary|راتب|compensation|pay)/i,
    reply: `According to the compensation guidelines in your documents:

1. **Base salary** is reviewed annually based on performance and market benchmarks.
2. **Variable pay** (bonus) ranges from 8% to 20% of base salary depending on role and company performance.
3. **Stock options** vest over 4 years with a 1-year cliff for eligible roles.

All compensation details remain strictly confidential and are governed by the employee agreement.`,
  },
  {
    keywords: /(summarize|summary|key|main|ملخص|نقاط)/i,
    reply: `Here is a high-level summary across your documents:

- **Operations** — clear processes for onboarding, approvals, and incident response.
- **Finance** — Q4 results show steady growth across all major business lines, with cost discipline driving margin expansion.
- **People** — strong focus on flexibility, professional development, and employee well-being.

Let me know if you'd like a deeper dive into any specific area.`,
  },
];

const FALLBACK_REPLIES = [
  `That's a great question. Based on the documents you've uploaded, here's what I found:

The information you're looking for is covered across several sections of your files. The most relevant excerpts highlight clear processes and well-documented expectations. If you'd like, I can drill into any specific document or topic in more detail.`,
  `Looking through your documents, I can see relevant context about this topic. Your files describe the underlying processes, the people involved, and the key milestones — let me know which angle is most useful and I'll go deeper.`,
];

function pickReply(question: string): string {
  for (const template of RESPONSE_TEMPLATES) {
    if (template.keywords.test(question)) return template.reply;
  }
  return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)]!;
}

function pickSources(question: string, documents: Document[]): Source[] {
  const ready = documents.filter((d) => d.status === 'ready');
  if (ready.length === 0) return [];
  const count = Math.min(ready.length, 2 + Math.floor(Math.random() * 2));
  const shuffled = [...ready].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((doc, idx) => ({
    documentId: doc.id,
    documentName: doc.name,
    fileType: doc.fileType,
    snippet: snippetFor(question, doc.fileType, idx),
    relevance: Math.max(0.55, 1 - idx * 0.18 - Math.random() * 0.1),
    page: 1 + Math.floor(Math.random() * 12),
  }));
}

function snippetFor(question: string, fileType: FileType, idx: number): string {
  const snippets = [
    `…this section directly addresses the topic raised. The accompanying paragraphs in the ${fileType.toUpperCase()} provide additional context and concrete examples that support the response above…`,
    `…the relevant clause states that the policy applies to all permanent employees, with specific exceptions documented in the appendix at the end of the document…`,
    `…in line with the company's broader strategy, this excerpt confirms the position summarized in the answer and highlights the responsible team for follow-up questions…`,
  ];
  const trimmed = question.trim().slice(0, 40);
  return `${snippets[idx % snippets.length]} (matched: "${trimmed}…")`;
}

/**
 * Stream a fake AI response character by character.
 * Mimics the shape of a server-sent-events stream so swapping it
 * for a real implementation later is mechanical.
 */
export async function mockStreamChat({
  question,
  documents,
  onEvent,
  signal,
}: ChatStreamArgs): Promise<Message> {
  // Simulated "thinking" pause
  await wait(450);
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const reply = pickReply(question);
  const sources = pickSources(question, documents);

  let buffer = '';
  // Stream characters in small bursts for a smooth typing feel
  const chunks = chunkifyText(reply);
  for (const chunk of chunks) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    buffer += chunk;
    onEvent({ delta: chunk });
    // Slightly randomized pause between chunks for realism
    await wait(18 + Math.random() * 22);
  }

  // Sources appear after content
  await wait(150);
  if (sources.length > 0) onEvent({ sources });

  onEvent({ done: true });

  return {
    id: `msg-${uuid()}`,
    role: 'assistant',
    content: buffer,
    sources,
    createdAt: new Date().toISOString(),
  };
}

function chunkifyText(text: string): string[] {
  // Split into 1–3 character chunks while keeping multi-byte
  // safe boundaries (we keep punctuation attached to the prior char).
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const len = 1 + Math.floor(Math.random() * 3);
    chunks.push(text.slice(i, i + len));
    i += len;
  }
  return chunks;
}
