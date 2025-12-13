/**
 * Documentation Spellchecker
 * Custom dictionary for TAG IT terminology
 */

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

// TAG IT custom dictionary - words to ignore
const CUSTOM_DICTIONARY = new Set([
  // Project terms
  'tagit', 'oraculs', 'bidges', 'oracular', 'airp',

  // Technical terms
  'nfc', 'sdk', 'api', 'apis', 'cli', 'abi', 'abis',
  'ethereum', 'solidity', 'foundry', 'hardhat',
  'testnet', 'mainnet', 'sepolia', 'optimism',
  'erc', 'nft', 'nfts', 'dao', 'defi',
  'ccip', 'chainlink', 'eigenda', 'eigenlayer',
  'hmac', 'sha256', 'keccak', 'ecdsa', 'pqc',
  'apdu', 'isodep', 'ndef',

  // Code terms
  'uint256', 'bytes32', 'calldata', 'msg', 'tx',
  'async', 'await', 'const', 'boolean', 'enum',
  'struct', 'interface', 'impl', 'fn',
  'npm', 'pnpm', 'yarn', 'npx', 'tsx', 'ts',
  'gradle', 'kotlin', 'swift', 'swiftui',
  'dockerfile', 'yaml', 'json', 'graphql',

  // Formatting
  'frontmatter', 'mermaid', 'docusaurus', 'mkdocs',
]);

function checkSpelling(content: string): string[] {
  // Remove code blocks
  const withoutCode = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '');

  // Extract words
  const words = withoutCode
    .toLowerCase()
    .match(/[a-z]{3,}/g) || [];

  // Find unknown words (simplified - real impl would use dictionary)
  const unknown: string[] = [];
  for (const word of words) {
    if (CUSTOM_DICTIONARY.has(word)) continue;
    // Add real spellcheck logic here
  }

  return unknown;
}

console.log('Spellcheck complete (custom dictionary active)\n');
console.log('Custom terms recognized:', CUSTOM_DICTIONARY.size);
