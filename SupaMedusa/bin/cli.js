#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const SCHEMA_DIR = path.join(__dirname, "..", "schema");
const FUNCTIONS_DIR = path.join(__dirname, "..", "functions");

const COMMANDS = {
  "generate-migration": generateMigration,
  "install": install,
  "deploy-functions": deployFunctions,
  "help": showHelp,
};

const args = process.argv.slice(2);
const command = args[0] || "help";

if (!COMMANDS[command]) {
  console.error(`Unknown command: ${command}`);
  showHelp();
  process.exit(1);
}

COMMANDS[command](args.slice(1));

// ─── Commands ────────────────────────────────────────────────────────

function generateMigration(args) {
  const outDir = args[0] || "./supabase/migrations";
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 14);
  const outFile = path.join(outDir, `${timestamp}_supamedusa.sql`);

  const sql = buildFullSchema();

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, sql, "utf-8");
  console.log(`✅ SupaMedusa migration written to ${outFile}`);
  console.log(`   Apply with: supabase db push`);
}

function install(args) {
  const projectDir = args[0] || ".";
  const migrationsDir = path.join(projectDir, "supabase", "migrations");
  const functionsDir = path.join(projectDir, "supabase", "functions");

  // 1. Generate migration
  generateMigration([migrationsDir]);

  // 2. Copy edge functions
  if (fs.existsSync(FUNCTIONS_DIR)) {
    copyDirRecursive(FUNCTIONS_DIR, functionsDir);
    console.log(`✅ Edge functions copied to ${functionsDir}`);
  }

  console.log("\n🎉 SupaMedusa installed into your project!");
  console.log("   Next steps:");
  console.log("   1. supabase db push        (apply schema)");
  console.log("   2. supabase functions serve (test locally)");
  console.log("   3. supabase functions deploy (deploy to production)");
}

function deployFunctions() {
  console.log("Deploy edge functions with:");
  console.log("  supabase functions deploy --project-ref <your-ref>");
  console.log("\nAvailable functions:");
  if (fs.existsSync(FUNCTIONS_DIR)) {
    const fns = fs.readdirSync(FUNCTIONS_DIR).filter((f) => {
      return fs.statSync(path.join(FUNCTIONS_DIR, f)).isDirectory();
    });
    fns.forEach((fn) => console.log(`  - ${fn}`));
  } else {
    console.log("  (none yet)");
  }
}

function showHelp() {
  console.log(`
SupaMedusa CLI — Medusa v2 commerce on Supabase

Usage:
  supamedusa <command> [options]

Commands:
  generate-migration [outDir]   Generate a single SQL migration file
                                Default: ./supabase/migrations
  install [projectDir]          Install schema + functions into a Supabase project
                                Default: current directory
  deploy-functions              Show deploy instructions for edge functions
  help                          Show this help message

Examples:
  npx supamedusa generate-migration
  npx supamedusa install ./my-project
  npx supamedusa install
`);
}

// ─── Helpers ─────────────────────────────────────────────────────────

function buildFullSchema() {
  const files = fs
    .readdirSync(SCHEMA_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const header = `-- =============================================================================
-- SupaMedusa — Medusa v2 Commerce Engine on Supabase
-- 100% data model match with Medusa v2
-- Generated: ${new Date().toISOString()}
-- =============================================================================
-- This migration creates the complete Medusa v2 data model on Supabase/Postgres.
-- Table names, column names, indexes, and constraints match Medusa v2 exactly.
-- A developer who knows Medusa can work on this without learning anything new.
-- =============================================================================

`;

  const parts = files.map((f) => {
    const content = fs.readFileSync(path.join(SCHEMA_DIR, f), "utf-8");
    return `-- ─── ${f} ${"─".repeat(Math.max(0, 60 - f.length))}─\n\n${content}`;
  });

  return header + parts.join("\n\n");
}

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
