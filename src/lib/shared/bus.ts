import { EventEmitter } from '@/lib/shared/utils/EventEmitter';

import type { AppCommands } from './types/Commands';

export const bus = new EventEmitter<AppCommands>();
