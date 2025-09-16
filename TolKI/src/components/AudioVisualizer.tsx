import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { colors } from '../styles/colors';
import { spacing } from '../styles/global';

interface AudioVisualizerProps {
  isActive: boolean;
  onAudioLevel?: (level: number) => void;
}

const NUM_DOTS = 13;
const SPEECH_THRESHOLD = -40; // dB threshold for speech detection

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  onAudioLevel,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const dotAnimations = useRef(
    Array.from({ length: NUM_DOTS }, () => new Animated.Value(1))
  ).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [isActive]);

  const startMonitoring = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Audio permission not granted');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create and start recording for metering only
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: '.aac',
          outputFormat: Audio.AndroidOutputFormat.AAC_ADTS,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
        isMeteringEnabled: true,
      });

      await newRecording.startAsync();
      setRecording(newRecording);

      // Monitor audio levels every 100ms
      intervalRef.current = setInterval(async () => {
        if (newRecording) {
          try {
            const status = await newRecording.getStatusAsync();
            if (status.isRecording && status.metering !== undefined) {
              const level = status.metering;
              onAudioLevel?.(level);
              animateDots(level);
            }
          } catch (error) {
            console.warn('Error getting recording status:', error);
          }
        }
      }, 100);
    } catch (error) {
      console.error('Failed to start audio monitoring:', error);
    }
  };

  const stopMonitoring = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      } catch (error) {
        console.warn('Error stopping recording:', error);
      }
    }

    // Reset dots to default position
    dotAnimations.forEach(anim => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const animateDots = (level: number) => {
    // Normalize audio level (-160 to 0 dB range)
    const normalizedLevel = Math.max(0, Math.min(1, (level + 160) / 160));
    
    // Check if speech is detected
    const isSpeaking = level > SPEECH_THRESHOLD;
    
    if (isSpeaking) {
      // Animate dots based on audio level
      dotAnimations.forEach((anim, index) => {
        // Create wave effect from center
        const centerIndex = Math.floor(NUM_DOTS / 2);
        const distance = Math.abs(index - centerIndex);
        const delay = distance * 30;
        const amplitude = normalizedLevel * (1 - distance * 0.1);
        
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1 + amplitude * 2, // Scale up based on amplitude
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Subtle idle animation
      dotAnimations.forEach((anim, index) => {
        const phase = (Date.now() / 1000 + index * 0.2) % (Math.PI * 2);
        const scale = 1 + Math.sin(phase) * 0.1;
        
        Animated.timing(anim, {
          toValue: scale,
          duration: 100,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  return (
    <View style={styles.container}>
      {dotAnimations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              transform: [{ scale: anim }],
              opacity: isActive ? 1 : 0.3,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blueMunsell,
  },
});