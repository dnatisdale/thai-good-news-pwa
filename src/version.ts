// Always works: import version from package.json at build-time
import pkg from '../package.json';

export const APP_VERSION = pkg.version as string;
