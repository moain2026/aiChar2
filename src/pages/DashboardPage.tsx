import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  MessageSquare,
  CheckCircle2,
  Upload,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { FileTypeIcon } from '@/components/documents/FileTypeIcon';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useDocumentStore } from '@/stores/documentStore';
import { ROUTES } from '@/utils/constants';
import { formatRelativeTime, truncate } from '@/utils/formatters';
import type { DocumentStatus } from '@/types';

const STATUS_VARIANTS: Record<DocumentStatus, 'success' | 'warning' | 'info' | 'error'> = {
  ready: 'success',
  processing: 'warning',
  uploading: 'info',
  error: 'error',
};

const STATUS_LABELS: Record<DocumentStatus, string> = {
  ready: 'Ready',
  processing: 'Processing',
  uploading: 'Uploading',
  error: 'Error',
};

export function DashboardPage(): JSX.Element {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const documents = useDocumentStore((s) => s.documents);
  const ensureSeed = useDocumentStore((s) => s.ensureSeed);
  const conversations = useChatStore((s) => s.conversations);
  const createConversation = useChatStore((s) => s.createConversation);

  useEffect(() => {
    ensureSeed();
  }, [ensureSeed]);

  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 3);

  const recentChats = [...conversations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  function handleStartChat(): void {
    createConversation();
    navigate(ROUTES.chat);
  }

  return (
    <PageWrapper maxWidth="xl">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <p className="text-sm text-muted-foreground">
          {greetForHour(new Date().getHours())}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Welcome back, <span className="text-gradient">{user?.name ?? 'there'}</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your workspace today.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard
          icon={<FileText className="h-5 w-5" />}
          label="Documents"
          value={documents.length}
          helper={
            documents.filter((d) => d.status === 'ready').length === documents.length
              ? 'All processed and ready'
              : `${documents.filter((d) => d.status === 'ready').length} ready to chat with`
          }
          tone="primary"
          delay={0}
        />
        <StatsCard
          icon={<MessageSquare className="h-5 w-5" />}
          label="Conversations"
          value={conversations.length}
          helper={
            conversations.length > 0 ? 'Across your workspace' : 'Start your first chat'
          }
          tone="info"
          delay={0.05}
        />
        <StatsCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="System Status"
          value="All systems ready"
          helper="No outages reported"
          tone="success"
          delay={0.1}
        />
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="mb-6"
      >
        <Card variant="gradient" padding="md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Quick actions</h2>
              <p className="text-sm text-muted-foreground">
                Jump straight into your most common workflows.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={handleStartChat}
              >
                Start new chat
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Upload className="h-4 w-4" />}
                onClick={() => navigate(ROUTES.documents)}
              >
                Upload document
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent documents */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <Card padding="md" className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent documents</CardTitle>
                  <CardDescription>Latest uploads to your workspace</CardDescription>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.documents)}
                  className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardHeader>
            {recentDocs.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No documents yet. Upload your first one to get started.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentDocs.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <FileTypeIcon fileType={doc.fileType} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(doc.uploadedAt)}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANTS[doc.status]} size="sm">
                      {STATUS_LABELS[doc.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </motion.div>

        {/* Recent chats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
        >
          <Card padding="md" className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent conversations</CardTitle>
                  <CardDescription>Pick up where you left off</CardDescription>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.chat)}
                  className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardHeader>
            {recentChats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-3">
                  No conversations yet.
                </p>
                <Button size="sm" onClick={handleStartChat}>
                  Start chatting
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentChats.map((conv) => (
                  <li key={conv.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`${ROUTES.chat}/${conv.id}`)}
                      className="w-full flex items-center gap-3 py-3 first:pt-0 last:pb-0 text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {truncate(conv.title, 40)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(conv.updatedAt)} ·{' '}
                          {conv.messages.length}{' '}
                          {conv.messages.length === 1 ? 'message' : 'messages'}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </motion.div>
      </div>
    </PageWrapper>
  );
}

function greetForHour(hour: number): string {
  if (hour < 5) return 'Working late?';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
