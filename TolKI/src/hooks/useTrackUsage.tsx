import { useEffect, useRef, useState } from 'react';
import { useUser as useClerkUser } from '@clerk/clerk-expo';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

export const useTrackUsage = () => {
  const { user: clerkUser } = useClerkUser();
  const [sessionId, setSessionId] = useState<Id<"usageSessions"> | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionCreditsUsed, setSessionCreditsUsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mutations
  const startSession = useMutation(api.usageSessions.startSession);
  const endSession = useMutation(api.usageSessions.endSession);
  const incrementCredits = useMutation(api.usageSessions.incrementSessionCredits);

  // Query for active session
  const activeSession = useQuery(
    api.usageSessions.getActiveSession,
    clerkUser?.id ? { clerkId: clerkUser.id } : 'skip'
  );

  // Start tracking usage
  const startTracking = async (languageFrom: string, languageTo: string) => {
    if (!clerkUser?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // Start a new session
      const newSessionId = await startSession({
        clerkId: clerkUser.id,
        languageFrom,
        languageTo,
      });

      setSessionId(newSessionId);
      setIsTracking(true);
      setSessionCreditsUsed(0);

      // Start interval to deduct credits every minute
      intervalRef.current = setInterval(async () => {
        try {
          const result = await incrementCredits({
            clerkId: clerkUser.id,
          });
          setSessionCreditsUsed(result.sessionCreditsUsed);

          // Stop tracking if credits run out
          if (result.creditsRemaining === 0) {
            stopTracking();
          }
        } catch (error) {
          console.error('Error incrementing credits:', error);
          // Stop tracking if there's an error (likely insufficient credits)
          stopTracking();
        }
      }, 60000); // Every 60 seconds

      return newSessionId;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  };

  // Stop tracking usage
  const stopTracking = async () => {
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // End session in database
    if (sessionId) {
      try {
        const result = await endSession({ sessionId });
        console.log('Session ended:', result);
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }

    setIsTracking(false);
    setSessionId(null);
    setSessionCreditsUsed(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isTracking,
    sessionId,
    sessionCreditsUsed,
    activeSession,
    startTracking,
    stopTracking,
  };
};