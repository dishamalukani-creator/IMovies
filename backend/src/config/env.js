import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const backendRoot = path.resolve(path.dirname(__filename), '../..');

export const loadBackendEnv = () => {
  dotenv.config({ path: path.resolve(backendRoot, '.env') });
  dotenv.config();
};

export default loadBackendEnv;
