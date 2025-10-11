import { useMemo } from 'react';
import { useUserStreams as useContractStreams } from './use-bitpay-read';

export interface StreamWithRole {
  stream: any;
  userRole: 'sender' | 'recipient';
}

export function useUserStreamsByRole(userAddress: string | null) {
  const { data: allStreams, isLoading, refetch } = useContractStreams(userAddress);

  const streamsByRole = useMemo(() => {
    if (!allStreams || !userAddress) {
      return {
        outgoingStreams: [],
        incomingStreams: [],
        hasOutgoing: false,
        hasIncoming: false,
        totalOutgoing: 0,
        totalIncoming: 0,
      };
    }

    const normalizedAddress = userAddress.toLowerCase();

    // Streams where user is the sender
    const outgoingStreams = allStreams.filter(stream =>
      stream.sender.toLowerCase() === normalizedAddress
    );

    // Streams where user is the recipient
    const incomingStreams = allStreams.filter(stream =>
      stream.recipient.toLowerCase() === normalizedAddress
    );

    return {
      outgoingStreams,
      incomingStreams,
      hasOutgoing: outgoingStreams.length > 0,
      hasIncoming: incomingStreams.length > 0,
      totalOutgoing: outgoingStreams.length,
      totalIncoming: incomingStreams.length,
    };
  }, [allStreams, userAddress]);

  return {
    ...streamsByRole,
    isLoading,
    refetch,
    allStreams: allStreams || [],
  };
}

// Helper to determine user's role in a specific stream
export function getUserRoleInStream(stream: any, userAddress: string): 'sender' | 'recipient' | null {
  if (!stream || !userAddress) return null;

  const normalized = userAddress.toLowerCase();

  if (stream.sender.toLowerCase() === normalized) return 'sender';
  if (stream.recipient.toLowerCase() === normalized) return 'recipient';

  return null;
}
