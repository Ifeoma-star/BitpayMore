/**
 * Quick script to verify a stream was created on-chain
 * Usage: node scripts/verify-stream.js <stream-id>
 */

const fetch = require('node-fetch');

const DEPLOYER = process.env.NEXT_PUBLIC_BITPAY_DEPLOYER_ADDRESS || 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7';
const CONTRACT = 'bitpay-core-v2';
const API_URL = 'https://api.testnet.hiro.so';

async function verifyStream(streamId) {
  console.log(`\n🔍 Checking stream #${streamId} on blockchain...\n`);

  const url = `${API_URL}/v2/contracts/call-read/${DEPLOYER}/${CONTRACT}/get-stream`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: DEPLOYER,
        arguments: [`0x${BigInt(streamId).toString(16).padStart(32, '0')}`],
      }),
    });

    const data = await response.json();

    if (data.okay) {
      const stream = data.result;
      console.log('✅ STREAM FOUND ON BLOCKCHAIN!\n');
      console.log('Stream Data:', JSON.stringify(stream, null, 2));
    } else {
      console.log('❌ Stream not found or error:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Get stream ID from command line
const streamId = process.argv[2] || '1';
verifyStream(streamId);
