/**
 * Mint and Bind Example
 *
 * Demonstrates minting a new asset NFT and binding an NFC chip to it.
 */

import { TagIt } from '@tagit/sdk';
import 'dotenv/config';

// Configuration
const MANUFACTURER_ADDRESS = '0x1234567890123456789012345678901234567890';
const NFC_CHIP_ID = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
const CHIP_ATTESTATION = '0x...'; // Signature from NFC chip

async function main() {
  // Initialize SDK
  const tagit = new TagIt({
    apiKey: process.env.TAGIT_API_KEY!,
    network: (process.env.TAGIT_NETWORK as 'testnet' | 'mainnet') || 'testnet'
  });

  console.log('TAG IT Mint and Bind Example\n');

  // Step 1: Mint a new asset
  console.log('Step 1: Minting new asset...');

  const mintResult = await tagit.assets.create({
    to: MANUFACTURER_ADDRESS,
    metadata: {
      name: 'Example Product',
      brand: 'Example Brand',
      sku: 'SKU-001',
      description: 'An example product for demonstration',
      category: 'Electronics',
      manufacturingDate: new Date().toISOString()
    }
  });

  console.log(`  Asset minted: tokenId=${mintResult.tokenId}`);
  console.log(`  Transaction: ${mintResult.txHash}`);
  console.log(`  State: MINTED\n`);

  // Step 2: Bind NFC chip to the asset
  console.log('Step 2: Binding NFC chip...');

  const bindResult = await tagit.assets.bind(mintResult.tokenId, {
    chipId: NFC_CHIP_ID,
    signature: CHIP_ATTESTATION
  });

  console.log(`  Asset bound: state=${bindResult.state}`);
  console.log(`  Transaction: ${bindResult.txHash}`);
  console.log(`  Chip ID: ${NFC_CHIP_ID.slice(0, 20)}...\n`);

  // Step 3: Verify the asset state
  console.log('Step 3: Verifying final state...');

  const asset = await tagit.assets.get(mintResult.tokenId);

  console.log(`  Token ID: ${asset.tokenId}`);
  console.log(`  State: ${asset.state}`);
  console.log(`  Owner: ${asset.owner}`);
  console.log(`  Chip ID: ${asset.chipId?.slice(0, 20)}...`);
  console.log(`  Created: ${asset.createdAt}`);

  console.log('\nDone! Asset is ready for activation and distribution.');
}

// Error handling wrapper
main().catch((error) => {
  console.error('Error:', error.message);
  if (error.code) {
    console.error('Code:', error.code);
  }
  process.exit(1);
});
