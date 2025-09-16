name: "React Native Translation App - Full Frontend Implementation"
description: |
  Complete implementation of a React Native translation app with Expo, featuring real-time voice recording, 
  audio visualization, and neumorphic design matching existing HTML/CSS prototypes.

## Purpose
Build a complete React Native mobile app frontend for real-time voice-to-voice translation with 6 screens, 
audio recording capabilities, and neumorphic design aesthetic matching the provided HTML designs exactly.

## Core Principles
1. **100% Design Fidelity**: Match HTML/CSS designs exactly
2. **No Backend Logic**: Frontend only, prepare for future backend integration
3. **Expo SDK 54**: Use latest Expo with React Native 0.81
4. **Component-Based**: Reusable components with clear separation
5. **Global rules**: Follow all rules in CLAUDE.md

---

## Goal
Create a fully functional React Native app with:
- Voice recording with visual feedback
- 54 language support with dropdown selection
- Navigation between 6 screens
- Neumorphic design system
- Smooth animations and transitions
- Audio visualization during recording

## Why
- Mobile-first experience for voice translation
- Native performance for audio recording
- Cross-platform iOS/Android support
- Professional UI matching design specifications

## What
A React Native app with:
- Main translation screen with record button
- Settings with user profile
- Subscription management
- Payment methods
- Billing history  
- Edit profile
- All screens matching HTML designs exactly

### Success Criteria
- [ ] All 6 screens implemented and navigable
- [ ] Audio recording works with permissions
- [ ] Visual feedback during recording (audio dots)
- [ ] Language dropdown with 54 languages
- [ ] Neumorphic shadows and design match HTML
- [ ] Smooth animations on all interactions
- [ ] App runs on Expo Go

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://docs.expo.dev/versions/latest/sdk/audio/
  why: Audio recording API, permissions, formats
  
- url: https://docs.expo.dev/versions/latest/sdk/av/
  why: expo-av Recording class, metering for visualization
  
- url: https://reactnavigation.org/docs/getting-started
  why: Navigation setup, stack navigator patterns
  
- url: https://reactnative.dev/docs/animated
  why: Animation API for record button states, audio dots

- file: .superdesign/design_iterations/Main_page.html
  why: Main screen design reference
  
- file: .superdesign/design_iterations/settings_page.html
  why: Settings screen and navigation pattern
  
- file: .superdesign/design_iterations/theme_1.css
  why: Color system, shadows, spacing values

- file: TolKI/package.json
  why: Current dependencies and scripts
```

### Current Codebase Structure
```bash
TolKI/
├── App.tsx                 # Basic expo starter
├── index.ts               # Entry point
├── package.json           # Dependencies (expo 54)
├── tsconfig.json          # TypeScript config
└── assets/               # Static assets

.superdesign/design_iterations/
├── Main_page.html        # Main translation UI
├── settings_page.html    # Settings screen
├── manage_plan.html      # Subscription management
├── payment_methods.html  # Payment cards UI
├── billing_history.html  # Transaction history
├── edit_profile.html     # Profile editing
└── theme_1.css          # Design system
```

### Desired Codebase Structure
```bash
TolKI/
├── App.tsx                    # Main app with navigation
├── index.ts                   # Entry point with gesture handler
├── babel.config.js            # Babel config for reanimated
├── src/
│   ├── screens/              
│   │   ├── MainScreen.tsx        # Voice translation screen
│   │   ├── SettingsScreen.tsx    # Settings menu
│   │   ├── ManagePlanScreen.tsx  # Subscription management
│   │   ├── PaymentMethodsScreen.tsx  # Payment cards
│   │   ├── BillingHistoryScreen.tsx  # Transaction history
│   │   └── EditProfileScreen.tsx     # Profile editing
│   ├── components/
│   │   ├── RecordButton.tsx      # Animated record button
│   │   ├── AudioVisualizer.tsx   # Audio level dots
│   │   ├── LanguageDropdown.tsx  # Language selector
│   │   ├── NeumorphicButton.tsx  # Reusable button
│   │   ├── NeumorphicCard.tsx    # Card component
│   │   └── Header.tsx            # Screen headers
│   ├── navigation/
│   │   └── AppNavigator.tsx      # Stack navigator setup
│   ├── styles/
│   │   ├── colors.ts             # Color constants
│   │   ├── shadows.ts            # Neumorphic shadows
│   │   ├── typography.ts         # Font styles
│   │   └── global.ts             # Global styles
│   ├── constants/
│   │   └── languages.ts          # 54 language list
│   └── types/
│       └── index.ts              # TypeScript types
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: expo-av requires specific setup
// 1. Permissions must be requested before recording
// 2. Audio mode must be configured for playAndRecord
// 3. Metering must be enabled for visualization

// CRITICAL: React Native shadows 
// iOS uses shadowColor/shadowOffset/shadowOpacity/shadowRadius
// Android uses elevation only
// Use both for cross-platform neumorphic effect

// CRITICAL: react-native-reanimated
// Must be last in babel.config.js plugins array
// Required for smooth animations

// CRITICAL: Navigation
// gesture-handler must be imported first in index.js
// Stack navigator needs screenOptions for transitions
```

## Implementation Blueprint

### Data Models and Types
```typescript
// types/index.ts
export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface RecordingState {
  status: 'idle' | 'connecting' | 'recording';
  duration: number;
  audioLevel: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export interface Subscription {
  plan: 'Free' | 'Pro' | 'Premium';
  price: number;
  features: string[];
}
```

### List of Tasks to Complete (in order)

```yaml
Task 1: Setup and Dependencies
MODIFY TolKI/package.json:
  - ADD react-navigation dependencies
  - ADD react-native-reanimated
  - ADD react-native-gesture-handler
  - ADD react-native-safe-area-context
  - ADD react-native-screens
  - ADD @react-navigation/native
  - ADD @react-navigation/stack
  - RUN npm install

CREATE TolKI/babel.config.js:
  - Setup for react-native-reanimated
  - Plugin must be last in array

MODIFY TolKI/index.ts:
  - Import gesture-handler first
  - Register root component

Task 2: Design System Setup
CREATE TolKI/src/styles/colors.ts:
  - Define color constants from theme_1.css
  - onyx: #393d3f, white: #fdfdff, silver: #c6c5b9, blue: #62929e

CREATE TolKI/src/styles/shadows.ts:
  - Neumorphic shadow presets for iOS/Android
  - elevated, pressed, subtle, hover states

CREATE TolKI/src/styles/typography.ts:
  - Font families and sizes
  - Inter font weights 300-600

CREATE TolKI/src/styles/global.ts:
  - Container styles, spacing system
  - Screen backgrounds

Task 3: Core Components
CREATE TolKI/src/components/NeumorphicButton.tsx:
  - Pressable with shadow states
  - Animation on press/release
  - Props: onPress, title, style, disabled

CREATE TolKI/src/components/NeumorphicCard.tsx:
  - Container with elevated shadows
  - Padding and border radius
  - Props: children, style

CREATE TolKI/src/components/Header.tsx:
  - Back button, title, right action
  - Consistent height and padding
  - Props: title, onBack, rightElement

Task 4: Language System
CREATE TolKI/src/constants/languages.ts:
  - Array of 54 languages with codes/names
  - Include flags/emojis for each

CREATE TolKI/src/components/LanguageDropdown.tsx:
  - ScrollView with all languages
  - Animated expand/collapse
  - Selection highlighting
  - Search functionality

Task 5: Audio Components
CREATE TolKI/src/components/RecordButton.tsx:
  - Three states: idle, connecting (3s), recording
  - Animated.View with rotation during connecting
  - Pulse rings animation
  - Haptic feedback on press
  - Color changes: blue (idle/connecting), red (recording)

CREATE TolKI/src/components/AudioVisualizer.tsx:
  - 13 dots in horizontal row
  - Animated based on audio level
  - Uses expo-av metering
  - Speech detection threshold -40dB

Task 6: Main Screen
CREATE TolKI/src/screens/MainScreen.tsx:
  - Header with language dropdowns and swap button
  - Center area with audio visualizer
  - Record button at bottom
  - Translation text display areas
  - Integrate audio recording with expo-av

Task 7: Settings Screens
CREATE TolKI/src/screens/SettingsScreen.tsx:
  - Profile section with avatar
  - Menu items list
  - Navigation to sub-screens
  - Logout button

CREATE TolKI/src/screens/EditProfileScreen.tsx:
  - Form inputs for name, email
  - Avatar upload placeholder
  - Save/cancel buttons

Task 8: Subscription Screens
CREATE TolKI/src/screens/ManagePlanScreen.tsx:
  - Current plan display
  - Available plans grid
  - Feature comparison
  - Upgrade/downgrade buttons

CREATE TolKI/src/screens/PaymentMethodsScreen.tsx:
  - Credit card list
  - Add new card button
  - Card visualization component
  - Default payment selection

CREATE TolKI/src/screens/BillingHistoryScreen.tsx:
  - Transaction list
  - Date, amount, status
  - Download invoice buttons
  - Filter by date range

Task 9: Navigation Setup
CREATE TolKI/src/navigation/AppNavigator.tsx:
  - Stack navigator with all screens
  - Screen transitions
  - Header configuration
  - Deep linking preparation

MODIFY TolKI/App.tsx:
  - Wrap with NavigationContainer
  - Include AppNavigator
  - Setup SafeAreaProvider
  - StatusBar configuration

Task 10: Audio Implementation
IMPLEMENT in MainScreen.tsx:
  - Audio permissions request
  - Recording start/stop logic
  - Audio level monitoring
  - File management
  - Error handling
```

### Per Task Implementation Details

```typescript
// Task 5: RecordButton.tsx pseudocode
const RecordButton = ({ onStateChange }) => {
  const [state, setState] = useState('idle');
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePress = () => {
    if (state === 'idle') {
      // Start connecting animation (3 seconds)
      setState('connecting');
      Animated.parallel([
        // Rotation animation
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          })
        ),
        // Scale pulse
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.05 }),
          Animated.timing(scaleAnim, { toValue: 1.08 }),
          Animated.timing(scaleAnim, { toValue: 1.05 }),
          Animated.timing(scaleAnim, { toValue: 1 }),
        ])
      ]).start();
      
      // After 3 seconds, switch to recording
      setTimeout(() => {
        setState('recording');
        onStateChange('recording');
      }, 3000);
    } else if (state === 'recording') {
      // Stop recording
      setState('idle');
      onStateChange('idle');
    }
  };
  
  // Render button with animations
};

// Task 6: Audio Recording in MainScreen
const startRecording = async () => {
  try {
    // Request permissions
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') return;
    
    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    
    // Create recording with metering
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      android: {
        extension: '.aac',
        outputFormat: AndroidOutputFormat.AAC_ADTS,
        audioEncoder: AndroidAudioEncoder.AAC,
      },
      ios: {
        extension: '.m4a',
        outputFormat: IOSOutputFormat.MPEG4AAC,
        audioQuality: IOSAudioQuality.HIGH,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
      isMeteringEnabled: true, // CRITICAL for visualization
    });
    
    await recording.startAsync();
    
    // Monitor audio levels
    setInterval(async () => {
      const status = await recording.getStatusAsync();
      if (status.isRecording && status.metering) {
        // Update audio visualizer
        setAudioLevel(status.metering);
      }
    }, 100);
  } catch (err) {
    console.error('Failed to start recording', err);
  }
};
```

### Integration Points
```yaml
NAVIGATION:
  - Stack.Navigator in AppNavigator.tsx
  - Screen registrations with proper types
  - Navigation prop typing

AUDIO:
  - expo-av configuration in app.json for production
  - Permissions in app.json plugins section
  - Audio file cleanup on unmount

STYLING:
  - Import from styles/ directory consistently
  - Use StyleSheet.create for performance
  - Platform-specific shadow handling
```

## Validation Loop

### Level 1: Dependencies & Setup
```bash
cd TolKI

# Verify all dependencies installed
npm list @react-navigation/native
npm list react-native-reanimated
npm list expo-av

# Clear cache if needed
npx expo start --clear
```

### Level 2: Component Testing
```bash
# Start Expo development server
npx expo start

# Test on device/emulator:
# 1. Launch app - should see main screen
# 2. Press record button - 3s connecting animation
# 3. Recording state - red button, audio dots
# 4. Navigate to settings - all screens accessible
# 5. Test language dropdown - smooth animations
```

### Level 3: Audio Permissions
```bash
# iOS Simulator: Settings > Privacy > Microphone
# Android: Settings > Apps > Permissions

# Test recording:
# 1. Grant permission when prompted
# 2. Verify audio level visualization
# 3. Check console for recording status
```

### Level 4: Performance Check
```javascript
// Add to MainScreen.tsx temporarily
import { useEffect } from 'react';
import { InteractionManager } from 'react-native';

useEffect(() => {
  const handle = InteractionManager.runAfterInteractions(() => {
    console.log('Screen ready - measure render time');
  });
  return () => handle.cancel();
}, []);

// Expected: <100ms for screen transitions
// Expected: 60fps for animations
```

## Final Validation Checklist
- [ ] App launches without errors: `npx expo start`
- [ ] All 6 screens render correctly
- [ ] Navigation works between all screens
- [ ] Record button has 3 states with animations
- [ ] Audio visualizer responds to sound
- [ ] Language dropdown shows 54 languages
- [ ] Neumorphic shadows visible on iOS/Android
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Smooth 60fps animations
- [ ] Audio permissions handled gracefully

---

## Anti-Patterns to Avoid
- ❌ Don't use web-specific CSS (use StyleSheet)
- ❌ Don't forget Platform-specific code for shadows
- ❌ Don't skip audio permission handling
- ❌ Don't use synchronous storage operations
- ❌ Don't animate layout properties (use transform)
- ❌ Don't forget to cleanup audio recordings
- ❌ Don't hardcode dimensions (use Dimensions API)

## Confidence Score: 9/10
High confidence due to:
- Clear HTML/CSS references to match
- Well-documented Expo APIs
- Existing project setup
- No backend complexity
- Standard navigation patterns

Minor uncertainty on exact shadow replication in React Native but manageable with Platform API.