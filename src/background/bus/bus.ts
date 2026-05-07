import { EventEmitter } from '@/lib/shared/utils/EventEmitter';

import type { AppCommands } from './commands';

export const bus = new EventEmitter<AppCommands>();
