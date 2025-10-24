import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

interface ChangeEntry {
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  message: string;
  commit: string;
}

interface ParsedChangelog {
  version: string;
  date: string;
  changes: {
    added: string[];
    changed: string[];
    deprecated: string[];
    removed: string[];
    fixed: string[];
    security: string[];
  };
}

/**
 * Get the latest git tag
 */
async function getLatestTag(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('git describe --tags --abbrev=0 2>/dev/null || echo ""');
    const tag = stdout.trim();
    return tag || null;
  } catch {
    return null;
  }
}

/**
 * Get commits since a specific tag or all commits
 */
async function getCommitsSince(tag: string | null): Promise<string[]> {
  try {
    const range = tag ? `${tag}..HEAD` : 'HEAD';
    const { stdout } = await execAsync(`git log ${range} --oneline --no-merges`);
    return stdout.trim().split('\n').filter(line => line.length > 0);
  } catch (error) {
    console.error('Failed to get git commits:', error);
    return [];
  }
}

/**
 * Parse conventional commit to determine change type
 */
function parseCommit(commitLine: string): ChangeEntry | null {
  const match = commitLine.match(/^([a-f0-9]+)\s+(.+)$/);
  if (!match || !match[1] || !match[2]) return null;

  const commit = match[1];
  const fullMessage = match[2];
  
  // Parse conventional commit format: type(scope): message
  const conventionalMatch = fullMessage.match(/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security|breaking|BREAKING CHANGE)(\(.+\))?!?:\s*(.+)$/i);
  
  if (conventionalMatch && conventionalMatch[1] && conventionalMatch[3]) {
    const type = conventionalMatch[1];
    const message = conventionalMatch[3];
    const lowerType = type.toLowerCase();
    
    // Map conventional commit types to changelog categories
    let changeType: ChangeEntry['type'];
    if (lowerType === 'feat') changeType = 'added';
    else if (lowerType === 'fix') changeType = 'fixed';
    else if (lowerType === 'security') changeType = 'security';
    else if (lowerType === 'breaking' || fullMessage.includes('BREAKING CHANGE')) changeType = 'changed';
    else if (lowerType === 'refactor' || lowerType === 'perf') changeType = 'changed';
    else if (lowerType === 'chore' || lowerType === 'build' || lowerType === 'ci') changeType = 'changed';
    else changeType = 'changed';
    
    return {
      type: changeType,
      message: message.trim(),
      commit: commit.substring(0, 7),
    };
  }
  
  // Fallback: try to infer from message content
  const lowerMessage = fullMessage.toLowerCase();
  if (lowerMessage.startsWith('add') || lowerMessage.includes('new feature')) {
    return { type: 'added', message: fullMessage, commit: commit.substring(0, 7) };
  } else if (lowerMessage.startsWith('fix') || lowerMessage.includes('bug')) {
    return { type: 'fixed', message: fullMessage, commit: commit.substring(0, 7) };
  } else if (lowerMessage.startsWith('remove') || lowerMessage.includes('delete')) {
    return { type: 'removed', message: fullMessage, commit: commit.substring(0, 7) };
  } else if (lowerMessage.includes('security') || lowerMessage.includes('vulnerability')) {
    return { type: 'security', message: fullMessage, commit: commit.substring(0, 7) };
  } else if (lowerMessage.startsWith('deprecate')) {
    return { type: 'deprecated', message: fullMessage, commit: commit.substring(0, 7) };
  }
  
  // Default to 'changed'
  return { type: 'changed', message: fullMessage, commit: commit.substring(0, 7) };
}

/**
 * Bump version number based on change types
 */
function bumpVersion(currentVersion: string, changes: ChangeEntry[]): string {
  const hasBreaking = changes.some(c => 
    c.message.toLowerCase().includes('breaking') || 
    c.type === 'removed'
  );
  const hasFeature = changes.some(c => c.type === 'added');
  
  const parts = currentVersion.replace(/^v/, '').split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return currentVersion;
  
  let major = parts[0]!;
  let minor = parts[1]!;
  let patch = parts[2]!;
  
  if (hasBreaking) {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (hasFeature) {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  
  return `${major}.${minor}.${patch}`;
}

/**
 * Generate changelog entry from commits
 */
async function generateChangelog(options: {
  version?: string;
  dryRun?: boolean;
}): Promise<ParsedChangelog> {
  const latestTag = await getLatestTag();
  const commits = await getCommitsSince(latestTag);
  
  if (commits.length === 0) {
    console.log('ℹ️  No commits found since last release');
    process.exit(0);
  }
  
  const entries: ChangeEntry[] = commits
    .map(parseCommit)
    .filter((entry): entry is ChangeEntry => entry !== null);
  
  // Determine version
  const currentVersion = latestTag || '0.0.0';
  const version = options.version || bumpVersion(currentVersion, entries);
  
  // Group by type
  const changes = {
    added: entries.filter(e => e.type === 'added').map(e => e.message),
    changed: entries.filter(e => e.type === 'changed').map(e => e.message),
    deprecated: entries.filter(e => e.type === 'deprecated').map(e => e.message),
    removed: entries.filter(e => e.type === 'removed').map(e => e.message),
    fixed: entries.filter(e => e.type === 'fixed').map(e => e.message),
    security: entries.filter(e => e.type === 'security').map(e => e.message),
  };
  
  const date = new Date().toISOString().split('T')[0] || new Date().toISOString();
  
  return { version, date, changes };
}

/**
 * Format changelog as markdown
 */
function formatChangelogEntry(parsed: ParsedChangelog): string {
  let output = `## [${parsed.version}] - ${parsed.date}\n`;
  
  if (parsed.changes.added.length > 0) {
    output += '### Added\n';
    parsed.changes.added.forEach(msg => {
      output += `- ${msg}\n`;
    });
    output += '\n';
  }
  
  if (parsed.changes.changed.length > 0) {
    output += '### Changed\n';
    parsed.changes.changed.forEach(msg => {
      output += `- ${msg}\n`;
    });
    output += '\n';
  }
  
  if (parsed.changes.deprecated.length > 0) {
    output += '### Deprecated\n';
    parsed.changes.deprecated.forEach(msg => {
      output += `- ${msg}\n`;
    });
    output += '\n';
  }
  
  if (parsed.changes.removed.length > 0) {
    output += '### Removed\n';
    parsed.changes.removed.forEach(msg => {
      output += `- ${msg}\n`;
    });
    output += '\n';
  }
  
  if (parsed.changes.fixed.length > 0) {
    output += '### Fixed\n';
    parsed.changes.fixed.forEach(msg => {
      output += `- ${msg}\n`;
    });
    output += '\n';
  }
  
  if (parsed.changes.security.length > 0) {
    output += '### Security\n';
    parsed.changes.security.forEach(msg => {
      output += `- ${msg}\n`;
    });
    output += '\n';
  }
  
  return output;
}

/**
 * Update CHANGELOG.md file
 */
async function updateChangelogFile(entry: string): Promise<void> {
  const changelogPath = 'CHANGELOG.md';
  
  if (!existsSync(changelogPath)) {
    // Create new changelog
    const content = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

${entry}`;
    await writeFile(changelogPath, content, 'utf-8');
    console.log('✅ Created CHANGELOG.md');
    return;
  }
  
  // Update existing changelog
  const content = await readFile(changelogPath, 'utf-8');
  
  // Find the position after [Unreleased] section
  const unreleasedMatch = content.match(/## \[Unreleased\]\s*\n/);
  if (!unreleasedMatch) {
    throw new Error('Could not find [Unreleased] section in CHANGELOG.md');
  }
  
  const insertPos = unreleasedMatch.index! + unreleasedMatch[0].length;
  const newContent = 
    content.slice(0, insertPos) + 
    '\n' + entry + 
    content.slice(insertPos);
  
  await writeFile(changelogPath, newContent, 'utf-8');
  console.log('✅ Updated CHANGELOG.md');
}

/**
 * Update package.json version
 */
async function updatePackageVersion(version: string): Promise<void> {
  const packagePath = 'package.json';
  if (!existsSync(packagePath)) {
    console.warn('⚠️  package.json not found, skipping version update');
    return;
  }
  
  const content = await readFile(packagePath, 'utf-8');
  const pkg = JSON.parse(content);
  pkg.version = version;
  
  await writeFile(packagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  console.log(`✅ Updated package.json to v${version}`);
}

/**
 * CLI command: generate changelog
 */
export async function changelogGenerateCommand(options: {
  version?: string;
  dryRun?: boolean;
}) {
  try {
    console.log('📋 Generating changelog from git history...\n');
    
    const parsed = await generateChangelog(options);
    const entry = formatChangelogEntry(parsed);
    
    if (options.dryRun) {
      console.log('🔍 Preview (dry-run mode):\n');
      console.log(entry);
      console.log('\nRun without --dry-run to write to CHANGELOG.md');
      return;
    }
    
    // Write to CHANGELOG.md
    await updateChangelogFile(entry);
    
    console.log(`\n🎉 Changelog entry created for v${parsed.version}`);
    console.log('\nNext steps:');
    console.log(`  1. Review CHANGELOG.md`);
    console.log(`  2. Run: code-hq changelog release`);
  } catch (error) {
    console.error('❌ Failed to generate changelog:', error);
    process.exit(1);
  }
}

/**
 * CLI command: release (update version + create tag)
 */
export async function changelogReleaseCommand(options: {
  version?: string;
}) {
  try {
    console.log('🚀 Preparing release...\n');
    
    // Parse latest entry from CHANGELOG.md
    const changelogPath = 'CHANGELOG.md';
    if (!existsSync(changelogPath)) {
      console.error('❌ CHANGELOG.md not found. Run: code-hq changelog generate');
      process.exit(1);
    }
    
    const content = await readFile(changelogPath, 'utf-8');
    const versionMatch = content.match(/## \[(\d+\.\d+\.\d+)\]/);
    
    if (!versionMatch || !versionMatch[1]) {
      console.error('❌ No version found in CHANGELOG.md');
      process.exit(1);
    }
    
    const version = options.version || versionMatch[1];
    
    // Update package.json
    await updatePackageVersion(version);
    
    // Create git tag
    console.log(`\n📌 Creating git tag v${version}...`);
    await execAsync(`git tag -a v${version} -m "Release v${version}"`);
    console.log('✅ Git tag created');
    
    console.log(`\n🎉 Release v${version} ready!`);
    console.log('\nNext steps:');
    console.log('  1. git add CHANGELOG.md package.json');
    console.log(`  2. git commit -m "chore: release v${version}"`);
    console.log('  3. git push --follow-tags');
    console.log('  4. npm publish');
    
  } catch (error) {
    console.error('❌ Failed to prepare release:', error);
    process.exit(1);
  }
}
