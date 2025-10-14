/**
 * useBitPayRead Hook
 * Read-only contract interactions for BitPay contracts
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  ClarityValue,
  principalCV,
  uintCV,
} from '@stacks/transactions';
import {
  getStacksNetwork,
  BITPAY_DEPLOYER_ADDRESS,
  CONTRACT_NAMES,
  CORE_FUNCTIONS,
  StreamData,
  StreamWithId,
  getStreamStatus,
  calculateVestedAmount,
  calculateWithdrawableAmount,
} from '@/lib/contracts/config';
import { useBlockHeight } from './use-block-height';

export interface UseContractReadReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for reading from BitPay contracts
 */
export function useBitPayRead<T = any>(
  contractName: string,
  functionName: string,
  functionArgs: ClarityValue[] = [],
  enabled: boolean = true
): UseContractReadReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const network = getStacksNetwork();
      const result = await fetchCallReadOnlyFunction({
        network,
        contractAddress: BITPAY_DEPLOYER_ADDRESS,
        contractName,
        functionName,
        functionArgs,
        senderAddress: BITPAY_DEPLOYER_ADDRESS,
      });

      const jsonResult = cvToJSON(result);
      setData(jsonResult.value as T);
    } catch (err) {
      console.error(`Error reading ${contractName}.${functionName}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to read contract');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractName, functionName, enabled, functionArgs.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Get a single stream by ID
 */
export function useStream(streamId: bigint | number | null): UseContractReadReturn<StreamWithId> {
  const { blockHeight } = useBlockHeight();
  const streamIdNum = streamId ? BigInt(streamId) : null;

  const { data: rawStream, isLoading, error, refetch } = useBitPayRead<StreamData | null>(
    CONTRACT_NAMES.CORE,
    CORE_FUNCTIONS.GET_STREAM,
    streamIdNum ? [uintCV(streamIdNum)] : [],
    streamIdNum !== null
  );

  const [enrichedStream, setEnrichedStream] = useState<StreamWithId | null>(null);

  useEffect(() => {
    if (!rawStream || !streamIdNum || !blockHeight) {
      setEnrichedStream(null);
      return;
    }

    const currentBlock = BigInt(blockHeight);
    const vestedAmount = calculateVestedAmount(rawStream, currentBlock);
    const withdrawableAmount = calculateWithdrawableAmount(rawStream, currentBlock);
    const status = getStreamStatus(
      rawStream['start-block'],
      rawStream['end-block'],
      currentBlock,
      rawStream.cancelled
    );

    setEnrichedStream({
      ...rawStream,
      id: streamIdNum,
      status,
      vestedAmount,
      withdrawableAmount,
    });
  }, [rawStream, streamIdNum, blockHeight]);

  return {
    data: enrichedStream,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Get all streams for a user (both sent and received)
 */
export function useUserStreams(userAddress: string | null): UseContractReadReturn<StreamWithId[]> {
  const { blockHeight } = useBlockHeight();

  // Get sender streams
  const { data: senderStreamIds } = useBitPayRead<bigint[]>(
    CONTRACT_NAMES.CORE,
    CORE_FUNCTIONS.GET_SENDER_STREAMS,
    userAddress ? [principalCV(userAddress)] : [],
    !!userAddress
  );

  // Get recipient streams
  const { data: recipientStreamIds } = useBitPayRead<bigint[]>(
    CONTRACT_NAMES.CORE,
    CORE_FUNCTIONS.GET_RECIPIENT_STREAMS,
    userAddress ? [principalCV(userAddress)] : [],
    !!userAddress
  );

  const [streams, setStreams] = useState<StreamWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllStreams = useCallback(async () => {
    if (!userAddress || !blockHeight) {
      setStreams([]);
      return;
    }

    const allStreamIds = [
      ...(senderStreamIds || []),
      ...(recipientStreamIds || []),
    ];

    // Remove duplicates
    const uniqueStreamIds = Array.from(new Set(allStreamIds.map(id => id.toString())))
      .map(id => BigInt(id));

    if (uniqueStreamIds.length === 0) {
      setStreams([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const network = getStacksNetwork();
      const currentBlock = BigInt(blockHeight);

      const streamPromises = uniqueStreamIds.map(async (streamId) => {
        try {
          const result = await fetchCallReadOnlyFunction({
            network,
            contractAddress: BITPAY_DEPLOYER_ADDRESS,
            contractName: CONTRACT_NAMES.CORE,
            functionName: CORE_FUNCTIONS.GET_STREAM,
            functionArgs: [uintCV(streamId)],
            senderAddress: BITPAY_DEPLOYER_ADDRESS,
          });

          const jsonResult = cvToJSON(result);
          const streamData = jsonResult.value as StreamData;

          if (!streamData) return null;

          const vestedAmount = calculateVestedAmount(streamData, currentBlock);
          const withdrawableAmount = calculateWithdrawableAmount(streamData, currentBlock);
          const status = getStreamStatus(
            streamData['start-block'],
            streamData['end-block'],
            currentBlock,
            streamData.cancelled
          );

          return {
            ...streamData,
            id: streamId,
            status,
            vestedAmount,
            withdrawableAmount,
          } as StreamWithId;
        } catch (err) {
          console.error(`Error fetching stream ${streamId}:`, err);
          return null;
        }
      });

      const results = await Promise.all(streamPromises);
      const validStreams = results.filter((s): s is StreamWithId => s !== null);

      setStreams(validStreams);
    } catch (err) {
      console.error('Error fetching user streams:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch streams');
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, blockHeight, senderStreamIds, recipientStreamIds]);

  useEffect(() => {
    fetchAllStreams();
  }, [fetchAllStreams]);

  return {
    data: streams,
    isLoading,
    error,
    refetch: fetchAllStreams,
  };
}

/**
 * Get next stream ID
 */
export function useNextStreamId(): UseContractReadReturn<bigint> {
  return useBitPayRead<bigint>(
    CONTRACT_NAMES.CORE,
    CORE_FUNCTIONS.GET_NEXT_STREAM_ID
  );
}

/**
 * Check if protocol is paused
 */
export function useIsProtocolPaused(): UseContractReadReturn<boolean> {
  return useBitPayRead<boolean>(
    CONTRACT_NAMES.ACCESS_CONTROL,
    'is-paused'
  );
}

/**
 * Get treasury fee in basis points
 */
export function useTreasuryFeeBps(): UseContractReadReturn<bigint> {
  return useBitPayRead<bigint>(
    CONTRACT_NAMES.TREASURY,
    'get-fee-bps'
  );
}

/**
 * Get total fees collected by treasury
 */
export function useTotalFeesCollected(): UseContractReadReturn<bigint> {
  return useBitPayRead<bigint>(
    CONTRACT_NAMES.TREASURY,
    'get-total-fees-collected'
  );
}
