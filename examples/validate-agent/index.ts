/**
 * Validate Agent Example
 *
 * Demonstrates the full validation flow for an AI agent
 * using TAGITAgentValidation (ERC-8004).
 */

import { ethers } from 'ethers';
import 'dotenv/config';

// TAGITAgentValidation on OP Sepolia
const AGENT_VALIDATION_ADDRESS = '0x9806919185F98Bd07a64F7BC7F264e91939e86b7';

// Minimal ABI for validation
const AgentValidationABI = [
  'function validationRequest(uint256 agentId, bool isDefense) returns (uint256)',
  'function validationResponse(uint256 requestId, uint8 score, string justification)',
  'function getRequest(uint256 requestId) view returns (tuple(uint256 agentId, address requester, uint8 quorum, uint8 responseCount, uint64 createdAt, uint8 status, bool isDefense))',
  'function getResponses(uint256 requestId) view returns (tuple(address validator, uint8 score, string justification, uint64 timestamp)[])',
  'function getValidationStatus(uint256 agentId) view returns (bool isValidated, uint256 latestScore, uint64 lastValidatedAt)',
  'function getSummary(uint256 agentId) view returns (tuple(uint256 totalRequests, uint256 passedCount, uint256 failedCount, uint256 latestScore, uint64 lastValidatedAt, bool isValidated))',
  'function getValidatorStats(address validator) view returns (tuple(uint256 totalResponses, uint256 accurateResponses, uint64 lastResponseAt))',
  'event ValidationRequested(uint256 indexed requestId, uint256 indexed agentId, address indexed requester, bool isDefense)',
  'event ValidationResponseSubmitted(uint256 indexed requestId, uint256 indexed agentId, address indexed validator, uint8 score)',
  'event ValidationFinalized(uint256 indexed requestId, uint256 indexed agentId, bool passed, uint256 finalScore)',
];

// Request status enum
const STATUS_NAMES: Record<number, string> = {
  0: 'PENDING',
  1: 'IN_PROGRESS',
  2: 'VALIDATED',
  3: 'REJECTED',
  4: 'EXPIRED',
};

// Configuration from environment
const AGENT_ID = BigInt(process.env.AGENT_ID || '1');

async function main() {
  // Connect to OP Sepolia
  const provider = new ethers.JsonRpcProvider(process.env.OP_SEPOLIA_RPC_URL);
  const requester = new ethers.Wallet(process.env.REQUESTER_PRIVATE_KEY!, provider);
  const validator = new ethers.Wallet(process.env.VALIDATOR_PRIVATE_KEY!, provider);

  const validationAsRequester = new ethers.Contract(AGENT_VALIDATION_ADDRESS, AgentValidationABI, requester);
  const validationAsValidator = new ethers.Contract(AGENT_VALIDATION_ADDRESS, AgentValidationABI, validator);

  console.log('TAG IT Agent Validation Example\n');
  console.log(`Requester: ${requester.address}`);
  console.log(`Validator: ${validator.address}`);
  console.log(`Agent ID: ${AGENT_ID}\n`);

  // Step 1: Create validation request (standard mode)
  console.log('Step 1: Creating validation request...');

  const isDefense = false;
  const requestTx = await validationAsRequester.validationRequest(AGENT_ID, isDefense);
  const requestReceipt = await requestTx.wait();

  // Parse ValidationRequested event to get request ID
  const requestEvent = requestReceipt.logs
    .map((log: ethers.Log) => {
      try { return validationAsRequester.interface.parseLog(log); } catch { return null; }
    })
    .find((e: ethers.LogDescription | null) => e?.name === 'ValidationRequested');

  const requestId = requestEvent!.args.requestId;

  console.log(`  Transaction: ${requestReceipt.hash}`);
  console.log(`  Request ID: ${requestId}`);
  console.log(`  Mode: ${isDefense ? 'Defense (3-of-5)' : 'Standard (1-of-1)'}\n`);

  // Step 2: Submit validator response
  console.log('Step 2: Submitting validator response...');

  const score = 85;
  const justification = 'Agent demonstrates strong analysis accuracy and timely responses. Data quality meets standards.';

  const responseTx = await validationAsValidator.validationResponse(requestId, score, justification);
  const responseReceipt = await responseTx.wait();

  console.log(`  Transaction: ${responseReceipt.hash}`);
  console.log(`  Score: ${score}/100`);
  console.log(`  Justification: ${justification.slice(0, 60)}...\n`);

  // Step 3: Check finalization (quorum met for standard = 1 response)
  console.log('Step 3: Checking finalization...');

  const request = await validationAsRequester.getRequest(requestId);

  console.log(`  Status: ${STATUS_NAMES[request.status]}`);
  console.log(`  Responses: ${request.responseCount}/${request.quorum}`);

  // Check if finalized event was emitted
  const finalizeEvent = responseReceipt.logs
    .map((log: ethers.Log) => {
      try { return validationAsRequester.interface.parseLog(log); } catch { return null; }
    })
    .find((e: ethers.LogDescription | null) => e?.name === 'ValidationFinalized');

  if (finalizeEvent) {
    console.log(`  Final Score: ${finalizeEvent.args.finalScore}`);
    console.log(`  Passed: ${finalizeEvent.args.passed}\n`);
  }

  // Step 4: Query agent validation summary
  console.log('Step 4: Querying agent validation summary...');

  const [isValidated, latestScore, lastValidatedAt] =
    await validationAsRequester.getValidationStatus(AGENT_ID);
  const summary = await validationAsRequester.getSummary(AGENT_ID);

  console.log(`  Is Validated: ${isValidated}`);
  console.log(`  Latest Score: ${latestScore}`);
  console.log(`  Total Requests: ${summary.totalRequests}`);
  console.log(`  Passed: ${summary.passedCount} | Failed: ${summary.failedCount}\n`);

  // Step 5: Check validator stats
  console.log('Step 5: Checking validator stats...');

  const stats = await validationAsRequester.getValidatorStats(validator.address);

  console.log(`  Total Responses: ${stats.totalResponses}`);
  console.log(`  Accurate Responses: ${stats.accurateResponses}`);
  console.log(`  Last Response: ${new Date(Number(stats.lastResponseAt) * 1000).toISOString()}`);

  console.log('\nDone! Agent has been validated.');
}

// Error handling wrapper
main().catch((error) => {
  console.error('Error:', error.message);
  if (error.data) {
    console.error('Revert data:', error.data);
  }
  process.exit(1);
});
