# PRP: UI Improvements and Dark Mode Implementation

## Overview
Implement three UI improvements for the TranslatorApp React Native application:
1. Enhance main button visibility with darker shadow
2. Rebuild Edit Profile screen to match design specifications  
3. Implement functional dark mode with theme switching

## Context for AI Agent

### Codebase Structure
```
TranslatorApp/
├── src/
│   ├── components/
│   │   ├── RecordButton.js      # Main button needing darker shadow
│   │   └── LanguageDropdown.js  # Reference for dropdown component
│   ├── screens/
│   │   ├── MainScreen.js        # Main screen with record button
│   │   ├── SettingsScreen.js    # Settings with dark mode toggle location
│   │   └── EditProfileScreen.js # TO BE CREATED
│   ├── navigation/
│   │   └── AppNavigator.js      # Stack navigator configuration
│   └── styles/
│       ├── colors.js            # Color system - needs dark theme
│       ├── shadows.js           # Shadow presets - needs darker variant
│       └── globalStyles.js      # Global styles
├── App.js                       # Main app - needs theme provider
└── package.json                 # Dependencies
```

### Design Reference
HTML design for Edit Profile: `C:\Users\vebjo\.cursor\nettside04\.superdesign\design_iterations\edit_profile.html`

## Implementation Tasks

### Task 1: Darker Button Shadow

**Files to modify:**
- `src/styles/shadows.js` - Add darker shadow variant
- `src/components/RecordButton.js` - Apply darker shadow

**Current shadow implementation (shadows.js:10-17):**
```javascript
elevated: {
  shadowColor: colors.silver,
  shadowOffset: { width: 8, height: 8 },
  shadowOpacity: 0.4,
  shadowRadius: 16,
  elevation: 8,
}
```

**Implementation approach:**
1. Add new `elevatedDark` shadow preset with increased opacity (0.6) and darker color
2. Update RecordButton.js line 480 to use `shadows.elevatedDark`

### Task 2: Edit Profile Screen

**Files to create/modify:**
- Create: `src/screens/EditProfileScreen.js`
- Modify: `src/navigation/AppNavigator.js` line 26

**Key design elements from HTML (edit_profile.html):**
1. Avatar section with edit overlay (lines 115-172)
2. Form sections with neumorphic styling (lines 175-531)
3. Dropdown components matching main page style (lines 232-331)
4. Save button with animation (lines 359-393)

**Component structure:**
```javascript
// EditProfileScreen.js structure
- Header with back navigation
- ScrollView container
- Avatar section (100x100, initials display)
- Personal Information form section
  - First Name, Last Name, Email, Phone inputs
- Preferences section  
  - Source/Target language dropdowns
  - Account ID (disabled)
- Save Changes button (sticky bottom)
```

**Reusable components from existing codebase:**
- Use `LanguageDropdown` component pattern for dropdowns
- Apply existing `colors` and `shadows` systems
- Follow `SettingsScreen` structure for consistency

### Task 3: Dark Mode Implementation

**Files to create:**
- `src/contexts/ThemeContext.js` - Theme provider and hook

**Files to modify:**
- `src/styles/colors.js` - Add dark theme colors
- `App.js` - Wrap with ThemeProvider
- `src/screens/SettingsScreen.js` - Add functional toggle
- All screens/components - Use theme colors dynamically

**Theme Context Implementation:**
```javascript
// ThemeContext.js structure
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? darkColors : lightColors;
  
  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

**Dark theme colors to add (colors.js):**
```javascript
export const darkColors = {
  background: '#1a1a1a',
  foreground: '#fdfdff',
  primary: '#62929e',
  onyx: '#fdfdff',
  white: '#1a1a1a',
  silver: '#4a4a4a',
  // ... alpha variants
};
```

**Update pattern for components:**
```javascript
// Before
import { colors } from '../styles/colors';
style={{ backgroundColor: colors.background }}

// After  
const { theme } = useTheme();
style={{ backgroundColor: theme.background }}
```

## Validation Gates

```bash
# Navigate to app directory
cd TranslatorApp

# 1. Check syntax and imports
npx react-native lint

# 2. Start development server
npx expo start --clear

# 3. Test on device/simulator
# - Verify darker button shadow is visible
# - Navigate to Edit Profile and test all form inputs
# - Toggle dark mode in Settings and verify theme changes
# - Check all screens adapt to dark mode

# 4. Verify no console errors
# Check Metro bundler output for errors

# 5. Test navigation flow
# Settings → Edit Profile → Save Changes → Back
# Settings → Dark Mode Toggle → Verify persistence
```

## Implementation Order

1. **Phase 1: Button Shadow (5 min)**
   - Modify shadows.js
   - Update RecordButton.js
   - Test visibility improvement

2. **Phase 2: Edit Profile Screen (30 min)**
   - Create EditProfileScreen.js component
   - Implement form sections matching HTML
   - Add to navigation stack
   - Test form interactions

3. **Phase 3: Dark Mode (20 min)**
   - Create ThemeContext
   - Add dark colors
   - Wrap App with provider
   - Update SettingsScreen toggle
   - Migrate components to use theme
   - Test theme switching

## Error Handling Considerations

1. **Form Validation (Edit Profile)**
   - Email format validation
   - Required field indicators
   - Save button disabled state during save

2. **Theme Persistence**
   - Use AsyncStorage to save theme preference
   - Load saved theme on app start

3. **Component Migration**
   - Update components gradually
   - Maintain backward compatibility during migration

## Testing Approach

**Manual Testing Checklist:**
- [ ] Main button more visible with darker shadow
- [ ] Edit Profile matches HTML design exactly
- [ ] All form inputs functional
- [ ] Dropdowns animate correctly
- [ ] Dark mode toggles all screens
- [ ] Theme persists across app restarts
- [ ] No visual glitches during theme switch
- [ ] StatusBar adapts to theme

## External Resources

- React Native Dark Mode Guide: https://reactnative.dev/docs/appearance
- AsyncStorage for persistence: https://react-native-async-storage.github.io/async-storage/docs/usage
- React Context Best Practices: https://react.dev/reference/react/useContext
- Neumorphic Design in React Native: https://github.com/tienph6/react-native-neumorphic

## Code References from Codebase

- Current button shadow: `src/components/RecordButton.js:480`
- Navigation setup: `src/navigation/AppNavigator.js:26`
- Color system: `src/styles/colors.js:1-47`
- Shadow system: `src/styles/shadows.js:1-33`
- Settings screen: `src/screens/SettingsScreen.js:1-280`
- Dropdown pattern: `src/components/LanguageDropdown.js:1-180`

## Known Issues to Address

1. **Rotation problem** mentioned in INITIAL.md - Research indicates no rotation issues in current RecordButton implementation, may be resolved
2. **Missing EditProfile screen** - Currently routes to SettingsScreen
3. **No theme system** - Static color imports throughout

## Success Criteria

1. Button shadow visibly darker, improving contrast
2. Edit Profile screen pixel-perfect match to HTML design
3. Dark mode switches all UI elements consistently
4. Theme preference persists between sessions
5. Smooth animations during theme transitions
6. No console errors or warnings

## Confidence Score: 9/10

High confidence due to:
- Clear existing patterns to follow
- Comprehensive design reference (HTML)
- Well-structured codebase
- Standard React Native patterns

Minor uncertainty:
- AsyncStorage implementation details for Expo
- Potential performance impact of theme context on large component tree

---
*This PRP provides complete context for one-pass implementation. The AI agent has all file paths, code snippets, and implementation details needed to execute these features successfully.*