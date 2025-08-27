/**
 * Environment Configuration Tests
 * Tests for environment variable loading and configuration management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getEnvironmentConfig, isLocalEnvironment, getSupabaseUrl, getSupabaseAnonKey } from '../utils/environment';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules and environment before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getEnvironmentConfig', () => {
    it('should return local configuration when VITE_SUPABASE_URL points to localhost', () => {
      process.env.VITE_SUPABASE_URL = 'http://localhost:8075';
      process.env.VITE_SUPABASE_ANON_KEY = 'local-anon-key';

      const config = getEnvironmentConfig();

      expect(config.supabaseUrl).toBe('http://localhost:8075');
      expect(config.supabaseAnonKey).toBe('local-anon-key');
      expect(config.isLocal).toBe(true);
      expect(config.environment).toBe('local');
    });

    it('should return production configuration when VITE_SUPABASE_URL points to remote', () => {
      process.env.VITE_SUPABASE_URL = 'https://akwhptzlqgtlcpzvcnjl.supabase.co';
      process.env.VITE_SUPABASE_ANON_KEY = 'production-anon-key';

      const config = getEnvironmentConfig();

      expect(config.supabaseUrl).toBe('https://akwhptzlqgtlcpzvcnjl.supabase.co');
      expect(config.supabaseAnonKey).toBe('production-anon-key');
      expect(config.isLocal).toBe(false);
      expect(config.environment).toBe('production');
    });

    it('should handle missing environment variables gracefully', () => {
      delete process.env.VITE_SUPABASE_URL;
      delete process.env.VITE_SUPABASE_ANON_KEY;

      const config = getEnvironmentConfig();

      expect(config.supabaseUrl).toBe('');
      expect(config.supabaseAnonKey).toBe('');
      expect(config.isLocal).toBe(false);
      expect(config.environment).toBe('production');
    });

    it('should detect local environment from various localhost formats', () => {
      const localUrls = [
        'http://localhost:8075',
        'https://localhost:8075',
        'http://127.0.0.1:8075',
        'http://0.0.0.0:8075',
        'http://localhost:54321', // Default Supabase local port
      ];

      localUrls.forEach(url => {
        process.env.VITE_SUPABASE_URL = url;
        const config = getEnvironmentConfig();
        expect(config.isLocal).toBe(true);
        expect(config.environment).toBe('local');
      });
    });
  });

  describe('isLocalEnvironment', () => {
    it('should return true for localhost URLs', () => {
      process.env.VITE_SUPABASE_URL = 'http://localhost:8075';
      expect(isLocalEnvironment()).toBe(true);
    });

    it('should return false for remote URLs', () => {
      process.env.VITE_SUPABASE_URL = 'https://akwhptzlqgtlcpzvcnjl.supabase.co';
      expect(isLocalEnvironment()).toBe(false);
    });

    it('should return false when URL is not set', () => {
      delete process.env.VITE_SUPABASE_URL;
      expect(isLocalEnvironment()).toBe(false);
    });
  });

  describe('getSupabaseUrl', () => {
    it('should return the configured Supabase URL', () => {
      process.env.VITE_SUPABASE_URL = 'http://localhost:8075';
      expect(getSupabaseUrl()).toBe('http://localhost:8075');
    });

    it('should return empty string when not configured', () => {
      delete process.env.VITE_SUPABASE_URL;
      expect(getSupabaseUrl()).toBe('');
    });

    it('should handle URLs with trailing slashes', () => {
      process.env.VITE_SUPABASE_URL = 'http://localhost:8075/';
      expect(getSupabaseUrl()).toBe('http://localhost:8075');
    });
  });

  describe('getSupabaseAnonKey', () => {
    it('should return the configured anonymous key', () => {
      process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
      expect(getSupabaseAnonKey()).toBe('test-anon-key');
    });

    it('should return empty string when not configured', () => {
      delete process.env.VITE_SUPABASE_ANON_KEY;
      expect(getSupabaseAnonKey()).toBe('');
    });
  });

  describe('Environment validation', () => {
    it('should validate required environment variables are present', () => {
      process.env.VITE_SUPABASE_URL = 'http://localhost:8075';
      process.env.VITE_SUPABASE_ANON_KEY = 'test-key';

      const config = getEnvironmentConfig();
      expect(config.isValid).toBe(true);
      expect(config.errors).toHaveLength(0);
    });

    it('should report missing required environment variables', () => {
      delete process.env.VITE_SUPABASE_URL;
      delete process.env.VITE_SUPABASE_ANON_KEY;

      const config = getEnvironmentConfig();
      expect(config.isValid).toBe(false);
      expect(config.errors).toContain('VITE_SUPABASE_URL is not configured');
      expect(config.errors).toContain('VITE_SUPABASE_ANON_KEY is not configured');
    });

    it('should validate URL format', () => {
      process.env.VITE_SUPABASE_URL = 'not-a-valid-url';
      process.env.VITE_SUPABASE_ANON_KEY = 'test-key';

      const config = getEnvironmentConfig();
      expect(config.isValid).toBe(false);
      expect(config.errors).toContain('VITE_SUPABASE_URL is not a valid URL');
    });
  });

  describe('GraphQL endpoint resolution', () => {
    it('should construct correct GraphQL endpoint for local environment', () => {
      process.env.VITE_SUPABASE_URL = 'http://localhost:8075';
      
      const config = getEnvironmentConfig();
      expect(config.graphqlEndpoint).toBe('http://localhost:8075/graphql/v1');
    });

    it('should construct correct GraphQL endpoint for production', () => {
      process.env.VITE_SUPABASE_URL = 'https://akwhptzlqgtlcpzvcnjl.supabase.co';
      
      const config = getEnvironmentConfig();
      expect(config.graphqlEndpoint).toBe('https://akwhptzlqgtlcpzvcnjl.supabase.co/graphql/v1');
    });
  });

  describe('Storage URL resolution', () => {
    it('should construct correct storage URL for local environment', () => {
      process.env.VITE_SUPABASE_URL = 'http://localhost:8075';
      
      const config = getEnvironmentConfig();
      expect(config.storageUrl).toBe('http://localhost:8075/storage/v1');
    });

    it('should construct correct storage URL for production', () => {
      process.env.VITE_SUPABASE_URL = 'https://akwhptzlqgtlcpzvcnjl.supabase.co';
      
      const config = getEnvironmentConfig();
      expect(config.storageUrl).toBe('https://akwhptzlqgtlcpzvcnjl.supabase.co/storage/v1');
    });
  });
});