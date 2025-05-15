import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useDerivedValue,
    withSpring,
} from 'react-native-reanimated';
import { Center } from './ui/Center';
import { Text } from './ui/Text';

const shapes = [
  { name: 'Square', style: { borderRadius: 0 } },
  { name: 'Circle', style: { borderRadius: 100 } },
  { name: 'Star', style: { borderRadius: [20, 5, 20, 5] } },
];

export const ShapeMorph = () => {
  const [currentShape, setCurrentShape] = useState(0);

  // Animation progress value
  const progress = useDerivedValue(() => {
    return withSpring(currentShape);
  });

  // Animated style for morphing
  const morphStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      progress.value,
      [0, 1, 2],
      [0, 100, 20]
    );

    const scaleX = interpolate(
      progress.value,
      [0, 1, 2],
      [1, 1, 1.2]
    );

    const scaleY = interpolate(
      progress.value,
      [0, 1, 2],
      [1, 1, 0.8]
    );

    return {
      borderRadius,
      transform: [
        { scaleX },
        { scaleY },
        {
          rotate: `${interpolate(
            progress.value,
            [0, 1, 2],
            [0, 180, 360]
          )}deg`,
        },
      ],
    };
  });

  const handlePress = () => {
    setCurrentShape((prev) => (prev + 1) % shapes.length);
  };

  return (
    <Center style={styles.container}>
      <Text preset="heading" style={styles.title}>
        Shape Morpher
      </Text>
      <Text preset="subheading" style={styles.subtitle}>
        Tap to morph into different shapes
      </Text>
      <Pressable onPress={handlePress}>
        <Animated.View style={[styles.shape, morphStyle]} />
      </Pressable>
      <Text preset="caption" style={styles.caption}>
        Current: {shapes[currentShape].name}
      </Text>
    </Center>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 400,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
    color: '#666',
  },
  caption: {
    marginTop: 16,
    color: '#666',
  },
  shape: {
    width: 150,
    height: 150,
    backgroundColor: '#8b5cf6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 