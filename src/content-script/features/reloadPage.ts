import { bus } from '@/lib/shared/bus';

bus.on('page.reload', () => window.location.reload());
