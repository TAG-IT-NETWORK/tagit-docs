/**
 * Transfer Ownership Example
 *
 * Demonstrates transferring asset ownership between parties.
 */

import { TagIt } from '@tagit/sdk';
import 'dotenv/config';

// Configuration
const TOKEN_ID = 123n; // Asset to transfer
const RECIPIENT_ADDRESS = '0x4567890123456789012345678901234567890123';

async function main() {
  // Initialize SDK
  const tagit = new TagIt({
    apiKey: process.env.TAGIT_API_KEY!,
    network: (process.env.TAGIT_NETWORK as 'testnet' | 'mainnet') || 'testnet'
  });

  console.log('TAG IT Ownership Transfer Example\n');

  // Step 1: Check asset state
  console.log('Step 1: Checking asset state...');

  const asset = await tagit.assets.get(TOKEN_ID);

  console.log(`  Token ID: ${asset.tokenId}`);
  console.log(`  Current State: ${asset.state}`);
  console.log(`  Current Owner: ${asset.owner}`);

  // Validate transfer is possible
  if (asset.state === 'FLAGGED') {
    console.log('\n  Cannot transfer: Asset is FLAGGED');
    return;
  }

  if (asset.state === 'RECYCLED') {
    console.log('\n  Cannot transfer: Asset is RECYCLED');
    return;
  }

  if (asset.state !== 'ACTIVATED' && asset.state !== 'CLAIMED') {
    console.log('\n  Cannot transfer: Asset must be ACTIVATED or CLAIMED');
    return;
  }

  console.log('');

  // Step 2: Initiate transfer
  console.log(`Step 2: Initiating transfer to ${RECIPIENT_ADDRESS.slice(0, 10)}...`);

  const transfer = await tagit.transfers.initiate({
    tokenId: TOKEN_ID,
    to: RECIPIENT_ADDRESS,
    message: 'Ownership transfer via example script',
    transferType: 'direct' // or 'pending' for acceptance required
  });

  console.log(`  Transfer ID: ${transfer.transferId}`);
  console.log(`  Status: ${transfer.status}`);
  console.log(`  Transaction: ${transfer.txHash}`);
  console.log('');

  // Step 3: For pending transfers, accept would be needed
  if (transfer.status === 'PENDING') {
    console.log('Step 3: Transfer is pending acceptance...');
    console.log('  (Recipient would need to call transfers.accept())');
    console.log('');

    // In a real scenario, the recipient would run:
    // await tagit.transfers.accept(transfer.transferId);
  }

  // Step 4: Verify the transfer
  console.log('Step 4: Verifying transfer...');

  // Give time for transaction to be indexed
  await sleep(2000);

  const updatedAsset = await tagit.assets.get(TOKEN_ID);

  console.log(`  New Owner: ${updatedAsset.owner}`);
  console.log(`  State: ${updatedAsset.state}`);
  console.log(`  Updated At: ${updatedAsset.updatedAt}`);
  console.log('');

  // Check transfer history
  console.log('Step 5: Checking transfer history...');

  const history = await tagit.assets.getHistory(TOKEN_ID);
  const latestTransfer = history.find((h) => h.event === 'TRANSFERRED');

  if (latestTransfer) {
    console.log(`  From: ${latestTransfer.from}`);
    console.log(`  To: ${latestTransfer.to}`);
    console.log(`  Timestamp: ${latestTransfer.timestamp}`);
  }

  console.log('\nTransfer complete!');
}

/**
 * Helper to wait for transaction indexing
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Error handling wrapper
main().catch((error) => {
  console.error('Error:', error.message);
  if (error.code) {
    console.error('Code:', error.code);

    // Handle specific errors
    if (error.code === 'NOT_OWNER') {
      console.error('You must be the owner to transfer this asset');
    } else if (error.code === 'ASSET_FLAGGED') {
      console.error('Flagged assets cannot be transferred');
    }
  }
  process.exit(1);
});
