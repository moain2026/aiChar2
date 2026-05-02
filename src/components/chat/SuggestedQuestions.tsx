import { motion } from 'framer-motion';
import { Sparkles, List, Shield, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SUGGESTED_QUESTIONS } from '@/utils/constants';
import { cn } from '@/utils/cn';

const ICONS: Record<string, typeof Sparkles> = {
  sparkles: Sparkles,
  list: List,
  shield: Shield,
  search: Search,
};

const ICON_TONES = [
  'from-primary-500/15 to-primary-500/5 text-primary-500 ring-primary-500/20',
  'from-purple-500/15 to-purple-500/5 text-purple-500 ring-purple-500/20',
  'from-info-500/15 to-info-500/5 text-info-500 ring-info-500/20',
  'from-success-500/15 to-success-500/5 text-success-500 ring-success-500/20',
];

interface SuggestedQuestionsProps {
  onSelect: (text: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full mx-auto">
      {SUGGESTED_QUESTIONS.map((q, idx) => {
        const Icon = ICONS[q.icon] ?? Sparkles;
        return (
          <motion.div
            key={q.text}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.06 }}
          >
            <Card
              variant="outline"
              padding="sm"
              interactive
              role="button"
              tabIndex={0}
              onClick={() => onSelect(q.text)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(q.text);
                }
              }}
              className="cursor-pointer hover:border-primary-500/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ring-1',
                    ICON_TONES[idx % ICON_TONES.length],
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm leading-snug">{q.text}</p>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
