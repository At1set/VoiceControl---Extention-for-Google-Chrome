import { bus } from '@/lib/shared/bus';

bus.on('stop', () => window.close());
