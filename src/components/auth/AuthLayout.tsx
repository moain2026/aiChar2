import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Two-column layout used by the Login and Signup pages.
 * Left = brand panel, right = form card. Single column on mobile.
 */
export function AuthLayout({ children }: AuthLayoutProps): JSX.Element {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="relative min-h-dvh w-full bg-background flex flex-col md:flex-row overflow-hidden safe-px">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[24rem] w-[24rem] rounded-full bg-purple-500/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 h-72 w-72 -translate-y-1/2 rounded-full bg-info-500/15 blur-3xl" />

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="absolute z-20 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/60 backdrop-blur text-muted-foreground hover:text-foreground active:bg-muted transition-colors"
        style={{
          top: 'max(env(safe-area-inset-top, 0px), 1rem)',
          right: 'max(env(safe-area-inset-right, 0px), 1rem)',
        }}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Left brand panel */}
      <div className="relative z-10 hidden md:flex md:w-1/2 lg:w-[55%] flex-col justify-between p-10 lg:p-14">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <p className="font-semibold leading-tight">DocuMind AI</p>
            <p className="text-xs text-muted-foreground leading-tight">
              Document Intelligence
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-lg"
        >
          <h1 className="text-3xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
            Have a conversation with your{' '}
            <span className="text-gradient">documents.</span>
          </h1>
          <p className="mt-5 text-base lg:text-lg text-muted-foreground leading-relaxed">
            Upload PDFs, contracts, and spreadsheets — then ask anything. Get
            instant, source-grounded answers that cite the original document.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-foreground/85">
            {[
              'Source-cited answers from your own documents',
              'Encrypted, private, and never used to train models',
              'Works with PDF, DOCX, XLSX, and TXT',
            ].map((feat, idx) => (
              <motion.li
                key={feat}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1, duration: 0.4 }}
                className="flex items-start gap-2.5"
              >
                <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-primary-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                </span>
                {feat}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} DocuMind AI. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div
        className="relative z-10 flex flex-1 items-center justify-center px-4 sm:px-6 md:p-10"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 4rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)',
        }}
      >
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
