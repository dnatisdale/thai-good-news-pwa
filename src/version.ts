// Build-time import of package.json (works with your tsconfig "resolveJsonModule": true)
import pkg from '../package.json';

export const APP_VERSION = (pkg as any).version as string;
