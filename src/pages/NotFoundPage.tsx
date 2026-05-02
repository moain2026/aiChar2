import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';

export function NotFoundPage(): JSX.Element {
  return (
    <div className="relative min-h-screen w-full bg-background flex items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-60" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 text-center max-w-md"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow mb-6">
          <Compass className="h-8 w-8 text-white" />
        </div>
        <p className="text-sm font-medium text-primary-500 mb-2">Error 404</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          We couldn&apos;t find that page
        </h1>
        <p className="text-muted-foreground mb-6">
          The link may be broken, or the page may have moved. Let&apos;s get you back on track.
        </p>
        <Link to={ROUTES.dashboard}>
          <Button leftIcon={<Home className="h-4 w-4" />}>Go home</Button>
        </Link>
      </motion.div>
    </div>
  );
}
