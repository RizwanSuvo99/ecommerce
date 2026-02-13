import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const API_URL = process.env.E2E_API_URL || 'http://localhost:4000/api';

async function globalTeardown(config: FullConfig) {
  console.log('Starting e2e global teardown...');

  // Clean up test data
  try {
    await fetch(`${API_URL}/health/cleanup-test-data`, { method: 'POST' });
    console.log('Test data cleaned up');
  } catch (error) {
    console.warn('Could not clean up test data:', error);
  }

  // Remove auth state files
  const authDir = path.join(process.cwd(), 'e2e', '.auth');
  if (fs.existsSync(authDir)) {
    fs.rmSync(authDir, { recursive: true, force: true });
    console.log('Auth state files removed');
  }

  console.log('Global teardown complete');
}

export default globalTeardown;
