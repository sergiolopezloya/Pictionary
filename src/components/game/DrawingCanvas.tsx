import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Button } from '../common/Button';

interface DrawingCanvasProps {
  enabled: boolean;
  onDrawingChange?: (pathData: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CANVAS_WIDTH = Math.min(screenWidth * 0.45, 320); // Optimized canvas width
const CANVAS_HEIGHT = Math.min(screenHeight * 0.35, 160); // Reduced canvas height

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ enabled, onDrawingChange }) => {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const pathRef = useRef<string>('');

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => enabled,
    onMoveShouldSetPanResponder: () => enabled,

    onPanResponderGrant: event => {
      if (!enabled) return;

      const { locationX, locationY } = event.nativeEvent;
      const newPath = `M${locationX},${locationY}`;
      pathRef.current = newPath;
      setCurrentPath(newPath);
    },

    onPanResponderMove: event => {
      if (!enabled) return;

      const { locationX, locationY } = event.nativeEvent;
      const updatedPath = `${pathRef.current} L${locationX},${locationY}`;
      pathRef.current = updatedPath;
      setCurrentPath(updatedPath);
    },

    onPanResponderRelease: () => {
      if (!enabled || !pathRef.current) return;

      const newPath = pathRef.current;
      setPaths(prev => {
        const updatedPaths = [...prev, newPath];
        // Notify parent of drawing change with updated paths
        onDrawingChange?.(updatedPaths.join(' '));
        return updatedPaths;
      });
      setCurrentPath('');
      pathRef.current = '';
    },
  });

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath('');
    pathRef.current = '';
    onDrawingChange?.('');
  };

  const undoLastStroke = () => {
    setPaths(prev => prev.slice(0, -1));
    onDrawingChange?.(paths.slice(0, -1).join(' '));
  };

  if (!enabled) {
    return (
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledText}>🎨 Waiting for your turn to draw...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={styles.canvas}>
          {/* Render completed paths */}
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path}
              stroke='#000'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
              fill='none'
            />
          ))}

          {/* Render current path being drawn */}
          {currentPath && (
            <Path
              d={currentPath}
              stroke='#000'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
              fill='none'
            />
          )}
        </Svg>
      </View>

      <View style={styles.controls}>
        <Button
          title='Undo'
          onPress={undoLastStroke}
          variant='outline'
          size='small'
          disabled={paths.length === 0}
        />
        <Button
          title='Clear'
          onPress={clearCanvas}
          variant='outline'
          size='small'
          disabled={paths.length === 0 && !currentPath}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  canvasContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  canvas: {
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  disabledContainer: {
    height: CANVAS_HEIGHT + 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginVertical: 16,
  },
  disabledText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default DrawingCanvas;
