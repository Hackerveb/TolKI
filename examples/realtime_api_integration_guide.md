# OpenAI Realtime API with React Native Expo: Complete implementation guide for 2025

The OpenAI Realtime API reached General Availability in September 2025 with the **gpt-realtime-2025-08-28** model, offering native speech-to-speech processing at ~500ms latency. However, **the official SDK does not support React Native**, requiring developers to implement WebRTC-based solutions or backend proxy patterns for secure, functional integration with Expo applications.

## Core API specifications and connection architecture

The Realtime API operates through WebSocket connections at `wss://api.openai.com/v1/realtime` with the model parameter `gpt-realtime-2025-08-28`. Audio must be transmitted as **PCM 16-bit mono at 24kHz**, Base64-encoded for WebSocket transport. The API processes audio natively without transcription chains, supporting features like image input, function calling with 33.8% improved accuracy, and automatic voice activity detection. Session durations extend to 60 minutes with a 32,768 token context window.

Authentication requires Bearer tokens in headers along with `"OpenAI-Beta": "realtime=v1"` for beta features. The bidirectional event protocol handles messages through types like `session.update`, `input_audio_buffer.append`, and `response.audio.delta`. Pricing runs approximately **$0.40 per minute** for audio input with 80% cache hit rates, making cost optimization through context truncation and silent audio filtering essential.

## React Native Expo integration approach

Since OpenAI's Realtime SDK targets Node.js and browser environments exclusively, React Native developers must use alternative approaches. The **WebRTC method** proves most reliable, utilizing `react-native-webrtc` (v118.0.0+) with Supabase Edge Functions or custom proxy servers. This architecture avoids direct API key exposure while maintaining real-time performance.

For Expo SDK 52+, the new `expo-audio` module replaces the deprecated `expo-av`, offering improved audio session management. Required dependencies include `react-native-webrtc` for peer connections, `expo-audio` for recording/playback, and `react-native-sse` for server-sent events. The implementation requires specific platform configurations: iOS needs `NSMicrophoneUsageDescription` and `UIBackgroundModes` audio in Info.plist, while Android requires `RECORD_AUDIO` and `INTERNET` permissions in AndroidManifest.xml.

Critical Expo-specific limitations include WebSocket implementation differences from browser/Node.js, requiring `react-native-polyfill-globals` for missing APIs. The native WebSocket API must be used instead of the `ws` package, which throws "does not work in browser" errors despite running on mobile. Expo Go doesn't support native WebRTC, necessitating development builds via `expo-dev-client`.

## Audio streaming implementation with expo-audio

The audio recording and streaming pipeline begins with permission requests and session configuration. Audio must be configured with `allowsRecordingIOS: true` and `playsInSilentModeIOS: true` for iOS compatibility. The recording process uses `RecordingPresets.HIGH_QUALITY` with the `useAudioRecorder` hook from expo-audio.

For real-time streaming, audio chunks require conversion to PCM16 format before Base64 encoding. The implementation involves creating WAV headers programmatically, managing audio buffer queues to handle streaming chunks, and using `FileSystem.writeAsStringAsync` for temporary storage. Playback utilizes the `useAudioPlayer` hook with proper cleanup to prevent memory leaks. Audio feedback loops, a common issue with AI voice interactions, require echo cancellation through `audioTrack.applyConstraints()` with `echoCancellation: true`.

Buffer management proves critical for smooth playback. The system must queue incoming Base64 audio data, convert to Uint8Array buffers, combine chunks into playable audio blobs, and handle platform-specific file URI requirements. Android emulators need `10.0.2.2` instead of `localhost` for connections, while iOS simulators don't support audio recording, requiring physical device testing.

## WebSocket connection lifecycle management

WebSocket connections to OpenAI's Realtime API require robust state management and error recovery. The connection establishes through `new WebSocket(url, [], { headers })` with authorization headers. Upon connection, a `session.update` message configures modalities, voice selection (Cedar or Marin for highest quality), and Voice Activity Detection parameters.

Message handling involves parsing JSON events like `response.audio.delta` for streaming audio and `session.created` for initialization confirmation. The connection lifecycle implements exponential backoff for reconnections, starting at 1 second and capping at 30 seconds. Network state monitoring through `@react-native-community/netinfo` enables intelligent reconnection when connectivity returns.

Heartbeat mechanisms prevent silent connection drops through periodic ping messages every 30 seconds with 5-second pong timeouts. Message queueing ensures data isn't lost during temporary disconnections, with automatic retry logic for failed sends. The state machine pattern tracks connection states (disconnected, connecting, connected, error) with appropriate transitions and listener notifications.

## Security and authentication best practices

**API keys must never exist in React Native code**, as mobile app bundles can be decompiled to extract embedded secrets. The backend proxy pattern provides the only secure approach: your server holds OpenAI credentials, the mobile app authenticates with your backend using JWT tokens, and the proxy forwards requests to OpenAI with proper authentication.

Token storage leverages `react-native-keychain` for hardware-backed encryption on both platforms. iOS uses Keychain Services API while Android employs the Keystore System. Tokens store with biometric protection when available through `ACCESS_CONTROL.WHEN_UNLOCKED` and `AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS` settings.

Session tokens require refresh logic before expiration, typically implementing 1-hour access tokens with longer-lived refresh tokens. The token manager checks expiration timestamps, automatically refreshes when needed, and handles authentication failures by redirecting to login. Certificate pinning adds another security layer for production deployments.

## Required audio formats and WebSocket protocols

The Realtime API strictly requires **PCM 16-bit mono audio at 24,000 Hz sample rate**. Audio data transmits Base64-encoded through `input_audio_buffer.append` events. The uncompressed bitrate reaches ~384 kbps, with no Opus codec support unlike WebRTC standards.

WebSocket message formats follow specific schemas. Audio input uses `{ type: 'input_audio_buffer.append', audio: base64Data }` while configuration employs `{ type: 'session.update', session: { modalities: ['audio'], voice: 'alloy', input_audio_format: 'pcm16' } }`. Response handling processes `response.audio.delta` for audio chunks and `response.text.delta` for transcriptions.

The PCM to WAV conversion requires manual header construction with proper RIFF format specifications. Sample rate conversion may be needed when device recordings don't match 24kHz requirements. Chunk size optimization balances latency and efficiency, with 4096-byte buffers proving optimal for most scenarios.

## Session management patterns for real-time translation

Translation sessions require specific configuration through the `instructions` parameter: "You are a real-time translator. Translate the user's speech." The session maintains conversation context automatically with configurable truncation strategies. The API's multi-language support enables seamless mid-sentence language switching without explicit detection.

State management integrates through React Context or Redux, tracking connection status, translation history, audio buffers, and error states. The session manager handles WebSocket lifecycle, message queueing during disconnections, and automatic reconnection with state restoration. Translation-specific features include language pair configuration, custom terminology dictionaries through system prompts, and conversation history export for analysis.

Voice Activity Detection parameters tune for translation scenarios with 500ms default silence duration and 300ms prefix padding. Longer silence durations (800ms+) suit thoughtful translation responses. The turn detection system automatically handles speaker changes without manual intervention.

## Error handling and reconnection strategies

Mobile networks require sophisticated error recovery beyond simple retry logic. Error classification distinguishes between network errors (recoverable with exponential backoff), authentication errors (require token refresh), quota errors (non-recoverable, need user notification), and server errors (retry with longer delays).

The reconnection strategy implements exponential backoff with jitter, starting at 1 second with random 10% variance to prevent thundering herd problems. Maximum retry attempts cap at 10 to prevent battery drain. Network state awareness through NetInfo pauses reconnection during offline periods and resumes when connectivity returns.

Platform-specific error handling addresses iOS audio session interruptions from phone calls, Android background service limitations, and app state transitions affecting WebSocket connections. Error messages avoid exposing sensitive information while providing actionable debugging information in development builds.

## Package dependencies and configuration requirements

Essential npm packages include `react-native-webrtc@^118.0.0` for WebRTC connections, `expo-audio@^14.0.0` for audio handling (replacing expo-av), `react-native-keychain` for secure storage, and `react-native-polyfill-globals` with `web-streams-polyfill@3.3.3` for missing APIs. Network monitoring requires `@react-native-community/netinfo` while `react-native-reconnecting-websocket` provides robust connection management.

The app.json configuration must include audio plugins with microphone permission strings, iOS Info.plist entries for background audio modes, and Android manifest permissions for recording and network access. Environment variables follow Expo conventions with `EXPO_PUBLIC_` prefixes for client-accessible values, though API keys remain strictly server-side.

Development builds require `expo-dev-client` for custom native code, EAS Build configuration for production deployment, and platform-specific testing on physical devices. The Hermes JavaScript engine, default in Expo SDK 52+, provides optimal performance for real-time audio processing.

## Common implementation challenges and solutions

The "ws does not work in browser" error, despite running on mobile, stems from React Native's environment detection. Remove any `const WebSocket = require('ws')` imports and use the native WebSocket API exclusively. ReadableStream polyfill issues require `react-native-polyfill-globals/auto` import before AppRegistry initialization, specifically using web-streams-polyfill v3.3.3 as v4+ introduces breaking changes.

Audio feedback loops, where AI responds to its own output, demand echo cancellation through `echoCancellation: true` constraints, proper audio session configuration separating input/output, and headphone use during development. Memory leaks from improper audio cleanup require explicit `unloadAsync()` calls in useEffect cleanup functions.

Android-specific issues include emulator connections requiring `10.0.2.2` instead of `localhost`, release build audio failures from missing ProGuard rules, and audio permission prompts appearing delayed. iOS challenges involve simulator limitations for audio testing, background audio session management, and interruption handling from system events.

Performance optimization focuses on reducing unnecessary re-renders through proper React.memo usage, implementing message batching for high-frequency updates, and monitoring battery consumption during extended sessions. WebSocket message size limits require chunking for large audio segments while maintaining sequence ordering for proper reconstruction.