/**
 * Main App component for Pictionary game
 * Entry point for the React Native application
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { PictionaryApp } from './src/PictionaryApp';

/**
 * Root App component
 * @returns JSX element for the main application
 */
export default function App(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <StatusBar style='auto' />
      <PictionaryApp />
    </View>
  );
}

/**
 * Styles for the root App component
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    ...Platform.select({
      web: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
});
