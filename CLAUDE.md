# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This workspace contains a React Native translation app built with Expo. The app features real-time voice recording, audio visualization, and support for 54 languages with a neumorphic design aesthetic.

## Project Structure
```
nettside04/
├── TranslatorApp/          # React Native app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── screens/       # Screen components  
│   │   ├── navigation/    # Navigation setup
│   │   └── styles/        # Design system
│   ├── App.js             # Main app component
│   ├── index.js           # Entry point
│   └── package.json       # Dependencies
└── .superdesign/          # HTML/CSS design prototypes
    └── design_iterations/ # Original design files
```

## Development Commands

### React Native App (TranslatorApp/)
```bash
cd TranslatorApp

# Install dependencies
npm install

# Start development server
npx expo start

# Clear cache and start (use for build issues)
npx expo start --clear

# Run on specific platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser

# Run on specific port
npx expo start --port 8084
```

## Architecture

### Core Components Flow
1. **RecordButton** (`src/components/RecordButton.js`):
   - Manages three states: `idle` → `connecting` (3s) → `recording` → `idle`
   - Triggers `onStateChange` callback to notify parent
   - Animations: Button rotation/scale during connecting, pulse rings during recording

2. **AudioVisualizer** (`src/components/AudioVisualizer.js`):
   - Creates expo-av recording instance when active
   - Monitors microphone levels every 100ms
   - Speech detection threshold: -40 dB
   - 13 dots animate based on speech amplitude

3. **LanguageDropdown** (`src/components/LanguageDropdown.js`):
   - Supports 54 languages with ScrollView
   - Bounce animation on expand/collapse
   - Selected language highlighting

### Navigation Structure
Stack Navigator (`src/navigation/AppNavigator.js`):
- MainScreen (default)
- SettingsScreen → ManagePlanScreen
- SettingsScreen → PaymentMethodsScreen
- SettingsScreen → BillingHistoryScreen

### Design System (`src/styles/`)
- **colors.js**: Primary (#00aaff), onyx, white, silver with alpha variants
- **shadows.js**: Neumorphic shadow presets (soft, elevated, pressed)
- **typography.js**: System font hierarchy

## Critical Configuration

### babel.config.js
```javascript
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin'] // Must be last
};
```

### index.js Entry Point
```javascript
import 'react-native-gesture-handler'; // Must be first import
import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
```

## Key Implementation Details

### Microphone Integration
- Uses expo-av for audio recording
- Permissions requested via `Audio.requestPermissionsAsync()`
- Recording formats: AAC (Android), MPEG4AAC (iOS), WebM (Web)
- Metering updates every 100ms for real-time visualization

### Animation Specifications
**Connecting State (3 seconds):**
- Button rotation: 360° linear (1.2s loop)
- Button scale: 1 → 1.05 → 1.08 → 1.05 → 1
- Blue pulse rings with fade

**Recording State:**
- Button gentle pulse: 1 → 1.02 → 1 (2s loop)
- Icon changes to red square (no rotation/scale)
- Red pulse rings: 3 layers with staggered expansion

### Package Compatibility
Critical versions for Expo SDK 53:
- expo: ~53.0.22
- react-native: 0.79.6
- react-native-reanimated: ~3.17.4
- expo-av: ^15.1.7

## Common Tasks

### Adding New Language
1. Update languages array in `src/components/LanguageDropdown.js:8`
2. Add translation API endpoint when implementing backend

### Modifying Animations
1. Edit configs in `src/components/RecordButton.js:145-222`
2. Maintain 3-second connecting duration
3. Test haptic feedback alignment

### Adding New Screen
1. Create in `src/screens/`
2. Import in `src/navigation/AppNavigator.js`
3. Add to Stack.Navigator

## Troubleshooting

### App Crashes on Launch
```bash
npx expo start --clear
```

### Microphone Not Working
Check device permissions. For production, add to app.json:
```json
"plugins": [
  ["expo-av", { "microphonePermission": "Allow $(PRODUCT_NAME) to access microphone." }]
]
```

### Animation Performance
- Ensure all Animated values use `useNativeDriver: true`
- Avoid animating layout properties
- Use transform and opacity only

## Design References
Original HTML/CSS designs are in `.superdesign/design_iterations/`:
- Main_page.html - Main translation interface
- settings_page.html - User settings
- manage_plan.html - Subscription management
- payment_methods.html - Payment cards
- billing_history.html - Transaction history
- theme_1.css - Design system variables

These files define the exact visual specifications that the React Native app replicates.

### 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
  For agents this looks like:
    - `agent.py` - Main agent definition and execution logic 
    - `tools.py` - Tool functions used by the agent 
    - `prompts.py` - System prompts
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Use python_dotenv and load_env()** for environment variables.

### 🧪 Testing & Reliability
- **Always create Pytest unit tests for new features** (functions, classes, routes, etc).
- **After updating any logic**, check whether existing unit tests need to be updated. If so, do it.
- **Tests should live in a `/tests` folder** mirroring the main app structure.
  - Include at least:
    - 1 test for expected use
    - 1 edge case
    - 1 failure case

### ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a “Discovered During Work” section.

### 📚 Documentation & Explainability
- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified Python packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `TASK.md`.