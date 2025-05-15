import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    interpolate,
    useAnimatedGestureHandler,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { Center } from './ui/Center';
import { Text } from './ui/Text';

const { width, height } = Dimensions.get('window');

export const MorphingDemo = () => {
  // Shared values for animations
  const scrollY = useSharedValue(0);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Scroll handler for morphing on scroll
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Gesture handler for drag morphing
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = dragX.value;
      ctx.startY = dragY.value;
      scale.value = withSpring(1.1);
    },
    onActive: (event, ctx) => {
      dragX.value = ctx.startX + event.translationX;
      dragY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      dragX.value = withSpring(0);
      dragY.value = withSpring(0);
      scale.value = withSpring(1);
    },
  });

  // Animated styles for scroll morphing
  const scrollMorphStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      scrollY.value,
      [0, 100],
      [8, height / 2],
      'clamp'
    );

    const width = interpolate(
      scrollY.value,
      [0, 100],
      [300, 100],
      'clamp'
    );

    return {
      borderRadius,
      width,
      height: width,
      backgroundColor: '#6366f1',
      transform: [
        {
          rotate: `${interpolate(scrollY.value, [0, 100], [0, 360])}deg`,
        },
      ],
    };
  });

  // Animated styles for drag morphing
  const dragMorphStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: dragX.value },
        { translateY: dragY.value },
        { scale: scale.value },
      ],
      backgroundColor: '#ec4899',
      width: 100,
      height: 100,
      borderRadius: 20,
    };
  });

  return (
    <Animated.ScrollView
      style={styles.container}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >
      <Center style={styles.section}>
        <Text preset="heading" style={styles.title}>
          Scroll Morphing
        </Text>
        <Text preset="subheading" style={styles.subtitle}>
          Scroll down to see the shape morph
        </Text>
        <Animated.View style={[styles.morphBox, scrollMorphStyle]} />
      </Center>

      <Center style={styles.section}>
        <Text preset="heading" style={styles.title}>
          Drag Morphing
        </Text>
        <Text preset="subheading" style={styles.subtitle}>
          Drag the shape to see it morph
        </Text>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.morphBox, dragMorphStyle]} />
        </PanGestureHandler>
      </Center>

      <View style={styles.spacer} />
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
    color: '#666',
  },
  morphBox: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  spacer: {
    height: height * 0.2,
  },
}); 