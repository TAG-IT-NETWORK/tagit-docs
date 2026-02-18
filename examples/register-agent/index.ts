/**
 * Register Agent Example
 *
 * Demonstrates registering an AI agent on the Technosphere
 * using TAGITAgentIdentity (ERC-8004).
 */

import { ethers } from 'ethers';
import 'dotenv/config';

// TAGITAgentIdentity on OP Sepolia
const AGENT_IDENTITY_ADDRESS = '0xA7f34FD595eBc397Fe04DcE012dbcf0fbbD2A78D';

// Minimal ABI for registration
const AgentIdentityABI = [
  'function register(address wallet, string uri) payable returns (uint256)',
  'function setMetadata(uint256 agentId, string key, string value)',
  'function getAgent(uint256 agentId) view returns (address registrant, address wallet, uint64 registeredAt, bool active)',
  'function getAgentStatus(uint256 agentId) view returns (uint8)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function totalAgents() view returns (uint256)',
  'event AgentRegistered(uint256 indexed agentId, address indexed registrant, address indexed wallet, string uri)',
  'event AgentMetadataSet(uint256 indexed agentId, string key, string value)',
];

// Configuration from environment
const AGENT_WALLET = process.env.AGENT_WALLET!;
const AGENT_URI = process.env.AGENT_URI || 'ipfs://QmAgentMetadata';

async function main() {
  // Connect to OP Sepolia
  const provider = new ethers.JsonRpcProvider(process.env.OP_SEPOLIA_RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const agentIdentity = new ethers.Contract(AGENT_IDENTITY_ADDRESS, AgentIdentityABI, signer);

  console.log('TAG IT Agent Registration Example\n');
  console.log(`Registrant: ${signer.address}`);
  console.log(`Agent Wallet: ${AGENT_WALLET}`);
  console.log(`Agent URI: ${AGENT_URI}\n`);

  // Step 1: Register agent
  console.log('Step 1: Registering agent...');

  const tx = await agentIdentity.register(AGENT_WALLET, AGENT_URI);
  const receipt = await tx.wait();

  // Parse AgentRegistered event to get agent ID
  const event = receipt.logs
    .map((log: ethers.Log) => {
      try { return agentIdentity.interface.parseLog(log); } catch { return null; }
    })
    .find((e: ethers.LogDescription | null) => e?.name === 'AgentRegistered');

  const agentId = event!.args.agentId;

  console.log(`  Transaction: ${receipt.hash}`);
  console.log(`  Agent ID: ${agentId}`);
  console.log(`  Status: ACTIVE\n`);

  // Step 2: Set metadata
  console.log('Step 2: Setting metadata...');

  const metadata: Record<string, string> = {
    name: 'My Agent',
    model: 'claude-opus-4-6',
    version: '1.0.0',
    type: 'analysis',
    description: 'Example AI agent for the Technosphere',
  };

  for (const [key, value] of Object.entries(metadata)) {
    const metaTx = await agentIdentity.setMetadata(agentId, key, value);
    await metaTx.wait();
    console.log(`  ${key} = ${value}`);
  }

  console.log('');

  // Step 3: Verify registration
  console.log('Step 3: Verifying registration...');

  const [registrant, wallet, registeredAt, active] = await agentIdentity.getAgent(agentId);
  const tokenURI = await agentIdentity.tokenURI(agentId);
  const totalAgents = await agentIdentity.totalAgents();

  console.log(`  Agent ID: ${agentId}`);
  console.log(`  Registrant: ${registrant}`);
  console.log(`  Wallet: ${wallet}`);
  console.log(`  Registered At: ${new Date(Number(registeredAt) * 1000).toISOString()}`);
  console.log(`  Active: ${active}`);
  console.log(`  Token URI: ${tokenURI}`);
  console.log(`  Total Agents: ${totalAgents}`);

  console.log('\nDone! Agent is registered and ready for feedback and validation.');
}

// Error handling wrapper
main().catch((error) => {
  console.error('Error:', error.message);
  if (error.data) {
    console.error('Revert data:', error.data);
  }
  process.exit(1);
});
