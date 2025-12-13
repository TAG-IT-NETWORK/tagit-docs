/**
 * Cross-Link Validator
 * Checks all internal markdown links resolve correctly
 */

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface LinkResult {
  file: string;
  line: number;
  link: string;
  status: 'ok' | 'broken' | 'external';
  target?: string;
}

const DOCS_DIR = path.join(__dirname, '../docs');
const LINK_REGEX = /\[([^\]]*)\]\(([^)]+)\)/g;
const HEADING_REGEX = /^#{1,6}\s+(.+)$/gm;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

function extractHeadings(content: string): Set<string> {
  const headings = new Set<string>();
  let match;
  while ((match = HEADING_REGEX.exec(content)) !== null) {
    headings.add(slugify(match[1]));
  }
  return headings;
}

function validateLinks(): LinkResult[] {
  const results: LinkResult[] = [];
  const files = glob.sync('**/*.md', { cwd: DOCS_DIR });

  for (const file of files) {
    const filePath = path.join(DOCS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let lineNum = 0;
    for (const line of lines) {
      lineNum++;
      let match;
      LINK_REGEX.lastIndex = 0;

      while ((match = LINK_REGEX.exec(line)) !== null) {
        const [, , link] = match;

        // Skip external links
        if (link.startsWith('http://') || link.startsWith('https://')) {
          results.push({ file, line: lineNum, link, status: 'external' });
          continue;
        }

        // Parse link and anchor
        const [linkPath, anchor] = link.split('#');
        const targetPath = linkPath
          ? path.resolve(path.dirname(filePath), linkPath)
          : filePath;

        // Check file exists
        if (linkPath && !fs.existsSync(targetPath)) {
          results.push({ file, line: lineNum, link, status: 'broken', target: targetPath });
          continue;
        }

        // Check anchor exists
        if (anchor) {
          const targetContent = fs.readFileSync(targetPath, 'utf-8');
          const headings = extractHeadings(targetContent);
          if (!headings.has(anchor)) {
            results.push({ file, line: lineNum, link, status: 'broken', target: `#${anchor}` });
            continue;
          }
        }

        results.push({ file, line: lineNum, link, status: 'ok' });
      }
    }
  }

  return results;
}

// Run validation
console.log('Validating documentation links...\n');

const results = validateLinks();
const broken = results.filter(r => r.status === 'broken');
const ok = results.filter(r => r.status === 'ok');
const external = results.filter(r => r.status === 'external');

console.log(`Results:`);
console.log(`   Valid: ${ok.length}`);
console.log(`   External: ${external.length}`);
console.log(`   Broken: ${broken.length}\n`);

if (broken.length > 0) {
  console.log('Broken Links:\n');
  for (const result of broken) {
    console.log(`   ${result.file}:${result.line}`);
    console.log(`   -> ${result.link} => ${result.target}\n`);
  }
  process.exit(1);
} else {
  console.log('All links valid!\n');
  process.exit(0);
}
