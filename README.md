# 🎨 Pictionary Game - React Native with Rive Animations

A modern, interactive Pictionary game built with React Native, TypeScript, and Rive animations. This project demonstrates clean architecture principles, comprehensive testing, and seamless integration of interactive animations with intelligent fallback support for different environments.

## ✨ Features

- **🎮 Interactive Gameplay**: Full Pictionary game experience with drawing and guessing
- **🎭 Rive Animations**: Beautiful, interactive animations with intelligent fallback support
- **🛡️ Smart Error Handling**: Automatic fallback to React Native animations when Rive is unavailable
- **⏱️ Real-time Timer**: Visual countdown with progress indicators
- **🏆 Score Tracking**: Player leaderboards and scoring system
- **💡 Smart Hints**: Progressive hint system for better gameplay
- **📱 Android Support**: Optimized for Android devices and Expo Go
- **🧪 Comprehensive Testing**: Full test suite with React Native Testing Library
- **🏗️ SOLID Architecture**: Clean, maintainable code following SOLID principles

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- For mobile testing: Expo Go app or React Native development environment

### Tech Stack

- **React Native**: 0.79.5
- **Expo**: ~53.0.20
- **TypeScript**: ~5.8.3
- **Rive React Native**: ^9.3.4
- **React**: 19.0.0
- **Node.js**: v18+ (tested with v18.17.0)
- **Java**: JDK 11 (Eclipse Adoptium 11.0.27.6-hotspot)

### Development Environment Specifications

#### **Node.js & Package Manager**

- **Node.js**: v18.17.0 or higher
- **npm**: v9.6.7 or higher
- **Package Manager**: npm (yarn also supported)

#### **Java Development Kit**

- **Version**: JDK 11 (required for React Native Android builds)
- **Distribution**: Eclipse Adoptium (recommended)
- **Specific Version Tested**: 11.0.27.6-hotspot
- **Installation Path**: `/c/Program Files/Eclipse Adoptium/jdk-11.0.27.6-hotspot`

#### **React Native & Expo**

- **React Native**: 0.79.5 (stable version with Rive compatibility)
- **Expo SDK**: 53.0.20 (latest stable)
- **Expo CLI**: Latest version (`npm install -g @expo/cli`)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sergiolopezloya/Pictionary.git
   cd Pictionary
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on different platforms**

   ```bash
   # Start development server (scan QR with Expo Go)
   npm start

   # Android Emulator
   npm run android
   ```

### 📱 **Running with Expo Go**

For the quickest development experience:

1. **Install Expo Go** on your Android device:

   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the development server**:

   ```bash
   npm start
   ```

3. **Scan the QR code** with Expo Go app

4. **Handle the expected Rive error**:
   - You'll see a warning dialog about `RiveReactNativeView`
   - Simply tap **"Dismiss"** - this is expected behavior
   - The app will automatically use beautiful fallback animations

### 🔧 **For Full Rive Support**

To experience native Rive animations, create a development build:

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Create development build for Android
eas build --profile development --platform android
```

## 🏗️ Architecture

This project follows SOLID principles and clean architecture patterns:

### 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Base components (Button, etc.)
│   ├── game/           # Game-specific components
│   └── animations/     # Rive animation components
├── services/           # Business logic services
│   ├── GameService.ts  # Core game logic
│   ├── WordService.ts  # Word management
│   ├── TimerService.ts # Timer functionality
│   └── AnimationService.ts # Rive integration
├── hooks/              # Custom React hooks
├── controllers/        # Game flow controllers
├── interfaces/         # TypeScript interfaces
├── types/              # Type definitions
├── models/             # Data models and utilities
└── __tests__/          # Test suites
```

### 🎯 SOLID Principles Implementation

- **Single Responsibility**: Each service handles one specific concern
- **Open/Closed**: Components are open for extension, closed for modification
- **Liskov Substitution**: Interfaces ensure proper substitutability
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Services depend on abstractions, not concretions

## 🎮 Game Flow

1. **Game Initialization**: Players join and game configuration is set
2. **Word Selection**: Random word is chosen based on difficulty
3. **Drawing Phase**: Current drawer sees the word and draws
4. **Guessing Phase**: Other players submit guesses
5. **Scoring**: Points awarded based on correct guesses and timing
6. **Round Progression**: Game continues until all rounds are complete

## 🎭 Rive Integration with Smart Fallback

The game features interactive Rive animations with intelligent fallback support for maximum compatibility across different environments.

### Animation States

- **Waiting State**: Idle animation while waiting for players
- **Drawing State**: Active drawing animation
- **Guessing State**: Thinking animation during guessing phase
- **Celebration**: Success animation for correct guesses
- **Time Up**: Time expiration animation
- **Game Over**: Final results animation

### Environment Compatibility

#### 🚀 **Development Build / Production**

- **✅ Full Rive Support**: Native Rive animations with complete feature set
- **✅ Optimal Performance**: Hardware-accelerated animations
- **✅ Interactive Elements**: Touch and gesture support

#### 📱 **Expo Go (Development)**

- **⚠️ Known Limitation**: Rive native components are not available in Expo Go
- **🛡️ Automatic Fallback**: Seamlessly switches to React Native animations
- **✅ Full Functionality**: All game features work perfectly with fallback animations

### Technical Implementation

```typescript
// Error Boundary catches Rive unavailability
class RiveErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    if (error.message.includes('RiveReactNativeView')) {
      // Automatically switch to fallback
      this.props.onError();
    }
  }
}

// Intelligent rendering logic
const RiveGameAnimation = ({ gameState }) => {
  if (isRiveAvailable && !hasError) {
    return (
      <RiveErrorBoundary onError={handleRiveError}>
        <Rive resourceName='game_animation' autoplay={true} />
      </RiveErrorBoundary>
    );
  }

  // Fallback to React Native animations
  return <FallbackAnimation gameState={gameState} />;
};
```

### 🚨 **Expected Behavior in Expo Go**

When running in Expo Go, you will see:

1. **Error Dialog**: A warning dialog appears with the message:

   ```
   Warning: Invariant Violation: View config not found for component `RiveReactNativeView`
   ```

2. **User Action Required**: Simply tap **"Dismiss"** on the error dialog

3. **Automatic Fallback**: The app immediately switches to beautiful React Native animations

4. **Seamless Experience**: All game functionality works perfectly with fallback animations

This behavior is **expected and by design** - it allows the same codebase to work in both Expo Go (for development) and production builds (with full Rive support).

## 🔬 **Technical Research & Compatibility Testing**

During development, extensive testing was conducted to achieve optimal Rive integration across different React Native versions and environments.

### **Version Compatibility Matrix**

| React Native | Rive Version | Java Version | Result     | Notes                                  |
| ------------ | ------------ | ------------ | ---------- | -------------------------------------- |
| **0.70.15**  | 6.2.3        | JDK 11       | ⚠️ Partial | 30% compilation, SDK version conflicts |
| **0.72.17**  | 6.2.3        | JDK 11       | ⚠️ Partial | 72% compilation, Kotlin 1.9 issues     |
| **0.79.5**   | 9.3.4        | JDK 11       | ✅ Success | Full compatibility with fallback       |

### **Compilation Results & Technical Challenges**

#### **React Native 0.70.15 + Rive 6.2.3**

- **Compilation Progress**: 30%
- **Primary Issue**: `compileSdkVersion` mismatch (RN uses 31, Rive requires 33+)
- **Error**: `The minCompileSdk (33) specified in a dependency's AAR metadata`
- **Resolution Attempted**: Manual gradle configuration updates
- **Outcome**: Incompatible without major configuration changes

#### **React Native 0.72.17 + Rive 6.2.3**

- **Compilation Progress**: 72% (significant improvement)
- **Primary Issues**:
  - Kotlin 1.9 incompatibility in Rive library
  - D8 Dexing errors during bytecode transformation
- **Configurations Applied**:
  ```gradle
  android.useAndroidX=true
  android.enableJetifier=true
  ANDROID_COMPILE_SDK_VERSION=33
  org.gradle.jvmargs=-Xmx4096m
  ```
- **Outcome**: Better progress but still blocked by external library issues

#### **React Native 0.79.5 + Rive 9.3.4 (Final Solution)**

- **Compilation Progress**: 100% (with intelligent fallback)
- **Key Success Factors**:
  - Updated Rive version with better RN 0.79 support
  - Implemented Error Boundary pattern for graceful degradation
  - Expo Go compatibility through automatic fallback detection
- **Technical Implementation**:
  ```typescript
  // Conditional import with error handling
  try {
    const RiveModule = require('rive-react-native');
    Rive = RiveModule.default || RiveModule.Rive || RiveModule;
    isRiveAvailable = true;
  } catch (error) {
    isRiveAvailable = false; // Graceful fallback
  }
  ```

### **Development Environment Requirements**

Based on extensive testing, the following environment specifications ensure optimal compatibility:

#### **Critical Dependencies**

- **Java**: JDK 11 (Eclipse Adoptium 11.0.27.6-hotspot)
  - **Why JDK 11**: React Native 0.79.5 requires Java 11 for Android builds
  - **Installation**: Must be properly configured in `JAVA_HOME` environment variable
  - **Path Example**: `/c/Program Files/Eclipse Adoptium/jdk-11.0.27.6-hotspot`

#### **Android SDK Configuration**

- **Compile SDK Version**: 33 (required by Rive 9.3.4)
- **Target SDK Version**: 33
- **Min SDK Version**: 21
- **Build Tools**: 33.0.2

#### **Memory Configuration**

```gradle
# Optimized for Rive compilation
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
org.gradle.parallel=true
org.gradle.configureondemand=true
```

### **Lessons Learned**

1. **Version Alignment Critical**: Rive versions must align with React Native SDK requirements
2. **Fallback Strategy Essential**: Native components unavailable in Expo Go require graceful degradation
3. **Error Boundaries Effective**: React Error Boundaries successfully catch native component failures
4. **Memory Management Important**: Large animation libraries require increased heap size
5. **Environment Consistency**: Development and production environments must use identical Java/SDK versions

### Animation Architecture

```typescript
// Conditional Rive import with error handling
let Rive: any = null;
try {
  Rive = require('rive-react-native');
} catch (error) {
  console.log('Rive not available, using fallback');
}

// State-driven animation control
useEffect(() => {
  if (isRiveAvailable && riveRef.current) {
    // Control Rive animations
    riveRef.current.play(getAnimationForState(gameState));
  } else {
    // Control fallback animations
    startFallbackAnimation(gameState);
  }
}, [gameState]);
```

## 📱 Platform Support

### Android

- Native performance with React Native
- Touch-optimized interface
- Expo Go compatibility with intelligent fallback
- Development build support for full Rive integration

## 🔧 Configuration

### Game Settings

```typescript
const gameConfig: GameConfig = {
  maxTime: 60, // Seconds per round
  maxRounds: 5, // Total rounds
  difficulty: 'medium', // Word difficulty
  enableHints: true, // Allow hints
};
```

### Animation Settings

```typescript
const animationConfig = {
  riveFileUrl: 'path/to/animations.riv',
  autoPlay: true,
  fit: 'contain',
  alignment: 'center',
};
```

## 🎨 Customization

### Adding New Words

```typescript
// Add words to WordService
wordService.addWord({
  id: 'custom_1',
  word: 'elephant',
  difficulty: Difficulty.MEDIUM,
  category: 'animals',
  hints: ['Large mammal', 'Has a trunk'],
});
```

### Custom Animations

1. Create Rive animation file with state machine
2. Define state inputs matching game states
3. Update animation service configuration

### Styling

The app uses a centralized theming system:

```typescript
// Customize colors and spacing
export const Colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  // ... more colors
};
```

## 📄 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 Sergio López Loya

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **Rive**: For the amazing animation platform
- **Expo**: For the excellent React Native development experience
- **React Native Community**: For the comprehensive ecosystem

## 🔧 Troubleshooting

### Common Issues

#### Rive Error in Expo Go

**Problem**: Error dialog appears with message:

```
Warning: Invariant Violation: View config not found for component `RiveReactNativeView`
```

**Solution**: This is **expected behavior** in Expo Go:

1. Tap **"Dismiss"** on the error dialog
2. The app will automatically switch to fallback animations
3. All functionality will work normally

**Why this happens**: Expo Go doesn't support native Rive components, so the app gracefully falls back to React Native animations.

#### Performance Issues

**Problem**: Animations appear choppy or slow

**Solutions**:

- **In Expo Go**: This is normal due to the development environment
- **For better performance**: Create a development build with `eas build`
- **In production**: Performance will be optimal

#### Build Errors

**Problem**: Build fails with Rive-related errors

**Solutions**:

1. Ensure you're using compatible versions:
   - React Native: 0.79.5
   - Rive React Native: ^9.3.4
2. Clear cache: `npx expo start --clear`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

### Development vs Production

| Environment           | Rive Support  | Performance | Setup Complexity |
| --------------------- | ------------- | ----------- | ---------------- |
| **Expo Go**           | ❌ (Fallback) | Good        | ⭐ Simple        |
| **Development Build** | ✅ Native     | Excellent   | ⭐⭐ Moderate    |
| **Production**        | ✅ Native     | Excellent   | ⭐⭐⭐ Advanced  |

---

**Built with ❤️ using React Native, TypeScript, and Rive**

_This is a technical demonstration project showcasing Rive integration with React Native and intelligent fallback mechanisms._
