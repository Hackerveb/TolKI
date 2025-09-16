# PRP: OpenAI Realtime API Translation Integration

## Feature Overview
Implement real-time voice-to-voice translation using OpenAI's Realtime API in the TolKI React Native app. The main record button will connect users to a WebSocket session with OpenAI's GPT Realtime API, enabling bidirectional translation between two selected languages.

## Context and Research

### Codebase Structure
- **Project Location**: `/d/APP/TolKI/` - React Native Expo app with TypeScript
- **Key Files to Reference**:
  - `/d/APP/TolKI/src/screens/MainScreen.tsx` - Main screen with recording logic
  - `/d/APP/TolKI/src/components/RecordButton.tsx` - Button state management
  - `/d/APP/TolKI/src/components/AudioVisualizer.tsx` - Audio visualization logic
  - `/d/APP/TolKI/src/components/LanguageDropdown.tsx` - Language selection
  - `/d/APP/TolKI/src/constants/languages.ts` - 54 supported languages
  - `/d/APP/TolKI/src/styles/` - Design system (neumorphic)

### Current Implementation Patterns
1. **State Management**: Local useState in components (no Context providers yet)
2. **Audio Handling**: expo-av with metering for visualization
3. **Recording States**: 'off' | 'connecting' | 'recording'
4. **Animation System**: react-native-reanimated for smooth transitions
5. **TypeScript**: Strong typing with interfaces in `/src/types/index.ts`

### OpenAI Realtime API Requirements
- **Documentation**:
  - https://platform.openai.com/docs/guides/realtime
  - https://platform.openai.com/docs/guides/realtime-websocket
  - https://github.com/openai/openai-realtime-api-beta
- **Audio Format**: PCM16, 24kHz sample rate, mono, little-endian
- **Protocol**: WebSocket with JSON event messages
- **Authentication**: API key via Authorization header
- **Session Limits**: 15 minutes max, 128k token context

### Technical Considerations
1. **Audio Conversion**: expo-av records in various formats, needs PCM16 conversion
2. **Base64 Encoding**: Audio chunks must be base64-encoded for WebSocket transmission
3. **Voice Activity Detection**: Use server_vad mode for automatic speech detection
4. **State Management**: Need centralized context for connection and recording states
5. **Error Handling**: WebSocket reconnection, API errors, permission failures

## Implementation Blueprint

### Architecture Overview
```
User Interface Layer
    ├── MainScreen.tsx (orchestrator)
    ├── RecordButton.tsx (UI control)
    └── LanguageDropdown.tsx (language selection)
            ↓
Context Layer (NEW)
    └── TranslationContext.tsx
            ↓
Service Layer (NEW)
    ├── openai-realtime.ts (WebSocket management)
    └── audioService.ts (audio recording/playback)
            ↓
API Layer
    └── OpenAI Realtime WebSocket API
```

### Pseudocode Implementation

```typescript
// 1. TranslationContext.tsx
interface TranslationState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  recordingState: 'idle' | 'connecting' | 'recording'
  sourceLanguage: string
  targetLanguage: string
  minutesUsed: number
  error: string | null
}

// 2. openai-realtime.ts
class OpenAIRealtimeService {
  private ws: WebSocket
  private audioQueue: string[] = []

  async connect(apiKey: string, systemPrompt: string) {
    this.ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview')
    // Set Authorization header
    // Send session.update with system prompt
    // Handle events: conversation.item.created, audio.delta, error, etc.
  }

  sendAudioChunk(base64Audio: string) {
    // Send input_audio_buffer.append event
  }

  commitAudioBuffer() {
    // Send input_audio_buffer.commit event
  }
}

// 3. audioService.ts
class AudioService {
  private recording: Audio.Recording | null
  private sound: Audio.Sound | null

  async startRecording(onDataAvailable: (chunk: string) => void) {
    // Configure expo-av for recording
    // Set up interval to read audio chunks
    // Convert to PCM16 format
    // Base64 encode
    // Call onDataAvailable callback
  }

  async playAudioChunk(base64Audio: string) {
    // Decode base64
    // Convert from PCM16 to playable format
    // Queue for playback
  }
}

// 4. MainScreen.tsx integration
function MainScreen() {
  const { startSession, endSession, sendAudio } = useTranslation()

  const handleRecordingStateChange = async (state) => {
    if (state === 'connecting') {
      await startSession(sourceLanguage, targetLanguage)
    } else if (state === 'recording') {
      audioService.startRecording((chunk) => sendAudio(chunk))
    } else if (state === 'idle') {
      await endSession()
    }
  }
}
```

## Implementation Tasks

### Phase 1: Foundation Setup
1. **Create TranslationContext.tsx**
   - Set up React Context with TypeScript interfaces
   - Define state management for connection, recording, languages
   - Implement provider wrapper with error boundaries
   - Reference pattern: Standard React Context API

2. **Create openai-realtime.ts Service**
   - Implement WebSocket connection with authentication
   - Handle session configuration with dynamic prompt generation
   - Set up event listeners for all message types
   - Implement audio queue management for smooth playback
   - Add reconnection logic with exponential backoff

3. **Create audioService.ts**
   - Set up expo-av recording configuration
   - Implement PCM16 conversion utilities
   - Create base64 encoding/decoding functions
   - Implement audio playback queue
   - Add voice activity detection integration

### Phase 2: Integration
4. **Update MainScreen.tsx**
   - Wrap with TranslationProvider
   - Connect RecordButton to translation context
   - Pass selected languages to context
   - Handle connection status UI updates
   - Display minutes used counter

5. **Enhance RecordButton.tsx**
   - Add connection status indicators
   - Update animations for WebSocket states
   - Handle error states visually
   - Maintain existing 3-second connecting animation

6. **Update LanguageDropdown.tsx**
   - Trigger prompt regeneration on language change
   - Disable changes during active recording
   - Add visual feedback for selected languages

### Phase 3: Audio Processing
7. **Implement PCM16 Conversion**
   - Create utility functions for format conversion
   - Handle platform-specific audio formats
   - Implement chunking for streaming
   - Add sample rate conversion (if needed)

8. **Implement Audio Streaming**
   - Set up continuous recording with chunks
   - Implement base64 encoding for WebSocket
   - Handle audio playback queue
   - Synchronize with AudioVisualizer component

### Phase 4: Error Handling & Polish
9. **Add Error Handling**
   - WebSocket connection failures
   - API rate limits
   - Audio permission denials
   - Network disconnections
   - Session timeout (15 minutes)

10. **Add User Feedback**
    - Connection status indicators
    - Error messages with recovery actions
    - Loading states during connection
    - Audio feedback for state changes

## Validation Gates

```bash
# 1. TypeScript compilation
cd /d/APP/TolKI
npx tsc --noEmit

# 2. Lint check
npm run lint

# 3. Start development server
npx expo start --clear

# 4. Test on simulator/device
# - Verify button states transition correctly
# - Check WebSocket connection establishment
# - Validate audio recording starts
# - Confirm language selection updates prompt
# - Test error recovery scenarios

# 5. Manual validation checklist
# [ ] Record button shows 3-second connecting animation
# [ ] WebSocket connects to OpenAI API
# [ ] Audio streams to API in PCM16 format
# [ ] Translated audio plays back correctly
# [ ] Language selection updates system prompt
# [ ] Error states display appropriately
# [ ] Minutes counter updates during usage
# [ ] Disconnection handled gracefully
```

## External Resources

### OpenAI Realtime API
- Official Docs: https://platform.openai.com/docs/guides/realtime
- WebSocket Guide: https://platform.openai.com/docs/guides/realtime-websocket
- JavaScript SDK: https://github.com/openai/openai-realtime-api-beta
- API Reference: https://platform.openai.com/docs/api-reference/realtime-client-events

### Audio Processing
- expo-av Docs: https://docs.expo.dev/versions/latest/sdk/av/
- PCM Conversion Guide: https://medium.com/developer-rants/streaming-audio-with-16-bit-mono-pcm-encoding-from-the-browser-f6a160409135
- WebSocket Audio Streaming: https://github.com/mmrech/openai_realtime_console

### React Native Resources
- expo-av Audio: https://docs.expo.dev/versions/latest/sdk/audio/
- FileSystem for Base64: https://docs.expo.dev/versions/latest/sdk/filesystem/
- WebSocket Support: https://reactnative.dev/docs/network#websocket-support

## Implementation Gotchas

1. **Audio Format Mismatch**: expo-av doesn't natively record in PCM16. Need custom conversion.
2. **Base64 Performance**: Large audio chunks can cause UI lag. Use background processing.
3. **WebSocket Reconnection**: iOS may kill WebSocket on background. Handle gracefully.
4. **API Key Security**: Never hardcode. Use environment variables or secure storage.
5. **Session Limits**: 15-minute max duration. Implement warning at 14 minutes.
6. **Platform Differences**: Audio APIs behave differently on iOS/Android/Web.
7. **Memory Management**: Audio buffers can cause memory leaks. Clean up properly.

## Code Examples from Research

### WebSocket Connection (from OpenAI SDK)
```javascript
const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview', {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'OpenAI-Beta': 'realtime=v1'
  }
});

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'session.update',
    session: {
      modalities: ['text', 'audio'],
      instructions: systemPrompt,
      voice: 'alloy',
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      input_audio_transcription: {
        model: 'whisper-1'
      },
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500
      }
    }
  }));
});
```

### Audio Chunk Sending
```javascript
// From research examples
ws.send(JSON.stringify({
  type: 'input_audio_buffer.append',
  audio: base64AudioChunk // PCM16 24kHz mono base64
}));

// Commit when done speaking
ws.send(JSON.stringify({
  type: 'input_audio_buffer.commit'
}));
```

### Base64 Conversion with expo
```javascript
import * as FileSystem from 'expo-file-system';

const base64Audio = await FileSystem.readAsStringAsync(recordingUri, {
  encoding: FileSystem.EncodingType.Base64
});
```

## Success Metrics

1. **Connection Time**: < 2 seconds to establish WebSocket
2. **Audio Latency**: < 500ms from speech to translation start
3. **Error Recovery**: Automatic reconnection within 5 seconds
4. **Memory Usage**: No leaks during 15-minute sessions
5. **User Experience**: Smooth animations, clear feedback

## Confidence Score: 8/10

**Rationale**:
- Strong understanding of existing codebase patterns ✓
- Clear API documentation and examples available ✓
- Detailed implementation plan with pseudocode ✓
- Comprehensive error handling strategy ✓
- Validation gates are executable ✓
- Some complexity in audio format conversion (-1)
- Platform-specific audio handling may require iteration (-1)

This PRP provides sufficient context and guidance for successful one-pass implementation of the OpenAI Realtime API translation feature.