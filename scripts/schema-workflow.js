#!/usr/bin/env node

// Comprehensive GraphQL Schema Development Workflow Tool
// Usage: node scripts/schema-workflow.js [command]
// Commands: introspect, generate-types, validate, all, watch

import { spawn, exec } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, watch } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMMANDS = {
  introspect: 'Introspect Supabase GraphQL schema',
  'generate-types': 'Generate TypeScript types from schema',
  validate: 'Validate existing GraphQL queries',
  all: 'Run all schema operations (introspect → generate-types → validate)',
  watch: 'Watch for schema changes and auto-regenerate types',
  help: 'Show this help message'
};

class SchemaWorkflow {
  constructor() {
    this.outputDir = join(__dirname, '..', 'schema-output');
    this.typesDir = join(__dirname, '..', 'src', 'types');
  }

  async runCommand(command) {
    console.log(`🚀 Running GraphQL Schema Workflow: ${command}\n`);

    switch (command) {
      case 'introspect':
        return this.introspectSchema();
      case 'generate-types':
        return this.generateTypes();
      case 'validate':
        return this.validateQueries();
      case 'all':
        return this.runAll();
      case 'watch':
        return this.watchMode();
      case 'help':
      default:
        return this.showHelp();
    }
  }

  async introspectSchema() {
    console.log('📡 Introspecting Supabase GraphQL schema...');
    return this.executeScript('introspect-schema');
  }

  async generateTypes() {
    console.log('🔧 Generating TypeScript types...');
    return this.executeScript('generate-types');
  }

  async validateQueries() {
    console.log('🔍 Validating GraphQL queries...');
    return this.executeScript('validate-queries');
  }

  async runAll() {
    console.log('🔄 Running complete schema workflow...\n');
    
    try {
      console.log('Step 1/3: Schema Introspection');
      await this.introspectSchema();
      console.log('✅ Schema introspection completed\n');

      console.log('Step 2/3: Type Generation');
      await this.generateTypes();
      console.log('✅ Type generation completed\n');

      console.log('Step 3/3: Query Validation');
      await this.validateQueries();
      console.log('✅ Query validation completed\n');

      this.generateWorkflowReport();
      console.log('🎉 Complete schema workflow finished successfully!');

    } catch (error) {
      console.error('❌ Workflow failed:', error.message);
      process.exit(1);
    }
  }

  async watchMode() {
    console.log('👀 Starting schema watch mode...');
    console.log('Watching for changes in:');
    console.log('  - GraphQL service files');
    console.log('  - Schema configuration');
    console.log('  - Environment variables\n');

    const watchPaths = [
      // removed legacy supabase-graphql.ts
      join(__dirname, '..', '.env'),
      join(__dirname, '..', 'src', 'tools')
    ];

    let isRunning = false;

    const runWorkflow = async () => {
      if (isRunning) return;
      
      isRunning = true;
      console.log('🔄 Change detected, running workflow...');
      
      try {
        await this.runAll();
        console.log('✅ Workflow completed, watching for changes...\n');
      } catch (error) {
        console.error('❌ Workflow failed:', error.message);
      } finally {
        isRunning = false;
      }
    };

    // Watch for file changes
    watchPaths.forEach(path => {
      if (existsSync(path)) {
        watch(path, { recursive: true }, (eventType, filename) => {
          if (filename && (filename.endsWith('.ts') || filename.endsWith('.js') || filename === '.env')) {
            console.log(`📝 File changed: ${filename}`);
            setTimeout(runWorkflow, 1000); // Debounce
          }
        });
      }
    });

    // Initial run
    await runWorkflow();

    console.log('Press Ctrl+C to stop watching...');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping schema watch mode...');
      process.exit(0);
    });
  }

  executeScript(scriptName) {
    return new Promise((resolve, reject) => {
      const child = spawn('npm', ['run', scriptName], {
        stdio: 'inherit',
        cwd: join(__dirname, '..')
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Script ${scriptName} failed with code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  generateWorkflowReport() {
    const report = {
      timestamp: new Date().toISOString(),
      workflow: 'complete',
      steps: [
        {
          name: 'Schema Introspection',
          status: 'completed',
          output: this.getFileStats(join(this.outputDir, 'schema.json'))
        },
        {
          name: 'Type Generation',
          status: 'completed',
          output: this.getFileStats(join(this.typesDir, 'supabase-schema.ts'))
        },
        {
          name: 'Query Validation',
          status: 'completed',
          output: 'All queries validated successfully'
        }
      ]
    };

    // Save workflow report
    const reportPath = join(this.outputDir, 'workflow-report.json');
    mkdirSync(this.outputDir, { recursive: true });
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Workflow report saved to: ${reportPath}`);
  }

  getFileStats(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      return {
        exists: true,
        size: content.length,
        lines: content.split('\n').length
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
  }

  showHelp() {
    console.log('GraphQL Schema Development Workflow\n');
    console.log('Usage: npm run schema-workflow [command]\n');
    console.log('Available commands:');
    
    Object.entries(COMMANDS).forEach(([cmd, desc]) => {
      console.log(`  ${cmd.padEnd(15)} ${desc}`);
    });

    console.log('\nExamples:');
    console.log('  npm run schema-workflow all          # Run complete workflow');
    console.log('  npm run schema-workflow introspect   # Just introspect schema');
    console.log('  npm run schema-workflow watch        # Watch mode for development');
    console.log('');

    console.log('Files generated:');
    console.log('  schema-output/schema.json            # Raw GraphQL schema');
    console.log('  schema-output/schema-report.md       # Human-readable schema report');
    console.log('  schema-output/collections.json       # Collection metadata');
    console.log('  src/types/supabase-schema.ts         # TypeScript type definitions');
    console.log('  schema-output/workflow-report.json   # Workflow execution report');
  }
}

// Parse command line arguments
const command = process.argv[2] || 'help';

if (!Object.keys(COMMANDS).includes(command)) {
  console.error(`❌ Unknown command: ${command}`);
  console.error(`Available commands: ${Object.keys(COMMANDS).join(', ')}`);
  process.exit(1);
}

// Run the workflow
const workflow = new SchemaWorkflow();
workflow.runCommand(command).catch(error => {
  console.error('❌ Workflow failed:', error.message);
  process.exit(1);
});
