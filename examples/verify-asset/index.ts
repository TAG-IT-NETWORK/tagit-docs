/**
 * Verify Asset Example
 *
 * Demonstrates the challenge-response verification flow for TAG IT assets.
 */

import { TagIt } from '@tagit/sdk';
import 'dotenv/config';

// Configuration
const TOKEN_ID = 123n; // Asset to verify

// In production, this signature comes from the actual NFC chip
// For this example, we use a mock signature
const MOCK_CHIP_SIGNATURE = '0xmocksignature...';

async function main() {
  // Initialize SDK
  const tagit = new TagIt({
    apiKey: process.env.TAGIT_API_KEY!,
    network: (process.env.TAGIT_NETWORK as 'testnet' | 'mainnet') || 'testnet'
  });

  console.log('TAG IT Asset Verification Example\n');

  // Step 1: Check asset exists and is verifiable
  console.log('Step 1: Checking asset state...');

  const asset = await tagit.assets.get(TOKEN_ID);

  console.log(`  Token ID: ${asset.tokenId}`);
  console.log(`  Current State: ${asset.state}`);
  console.log(`  Owner: ${asset.owner}`);

  if (asset.state === 'FLAGGED') {
    console.log('\n  Asset is FLAGGED and cannot be verified.');
    return;
  }

  if (asset.state === 'MINTED') {
    console.log('\n  Asset is not yet bound to an NFC chip.');
    return;
  }

  console.log('');

  // Step 2: Generate verification challenge
  console.log('Step 2: Generating verification challenge...');

  const challenge = await tagit.verify.createChallenge(TOKEN_ID);

  console.log(`  Challenge ID: ${challenge.challengeId}`);
  console.log(`  Challenge: ${challenge.data.slice(0, 20)}...`);
  console.log(`  Expires: ${challenge.expiresAt}`);
  console.log('');

  // Step 3: Get chip response
  // In production, this would involve:
  // 1. Sending challenge to NFC chip via mobile app
  // 2. Chip signs the challenge with its secure element
  // 3. App returns the signature
  console.log('Step 3: Getting chip response...');
  console.log('  (In production, this comes from NFC chip)');

  const chipResponse = await simulateChipResponse(challenge.data);
  console.log(`  Response: ${chipResponse.slice(0, 20)}...`);
  console.log('');

  // Step 4: Submit verification
  console.log('Step 4: Submitting verification...');

  try {
    const result = await tagit.verify.submit({
      challengeId: challenge.challengeId,
      tokenId: TOKEN_ID,
      response: chipResponse
    });

    if (result.verified) {
      console.log('  Result: VERIFIED');
      console.log(`  Transaction: ${result.txHash}`);
      console.log('');
      console.log('  Asset Details:');
      console.log(`    State: ${result.asset.state}`);
      console.log(`    Owner: ${result.asset.owner}`);
      console.log(`    Verified At: ${result.timestamp}`);
    } else {
      console.log('  Result: FAILED');
      console.log(`  Reason: ${result.reason}`);
    }
  } catch (error: any) {
    console.log('  Verification failed:', error.message);
  }

  console.log('\nDone!');
}

/**
 * Simulates an NFC chip response.
 * In production, this would come from the actual hardware.
 */
async function simulateChipResponse(challenge: string): Promise<string> {
  // This is a placeholder - real implementation would:
  // 1. Send challenge to NFC chip
  // 2. Chip signs with its secure element private key
  // 3. Return the signature

  // For demo purposes, return mock signature
  return MOCK_CHIP_SIGNATURE;
}

// Error handling wrapper
main().catch((error) => {
  console.error('Error:', error.message);
  if (error.code) {
    console.error('Code:', error.code);
  }
  process.exit(1);
});
