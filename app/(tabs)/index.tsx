import { MorphingDemo } from '@/components/MorphingDemo';
import { ShapeMorph } from '@/components/ShapeMorph';
import { Center } from '@/components/ui/Center';
import { Text } from '@/components/ui/Text';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

export default function HomeScreen() {
  return (
      <AnimatedSafeAreaView 
        entering={FadeInDown.duration(1000)}
        style={styles.container}
      >
        <StatusBar barStyle="dark-content" />
        
        {/* Header Section */}
        <Center style={styles.header}>
          <Text preset="heading" style={styles.title}>
            Interactive Morphing
          </Text>
          <Text preset="subheading" style={styles.subtitle}>
            Explore fluid shape transformations
          </Text>
        </Center>

        {/* Main Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Shape Morph Section */}
          <Animated.View 
            entering={FadeInDown.delay(200).duration(1000)}
            style={styles.section}
          >
            <Text preset="heading" style={styles.sectionTitle}>
              Tap Morphing
            </Text>
            <Text preset="caption" style={styles.sectionSubtitle}>
              Experience smooth shape transitions with a simple tap
            </Text>
            <ShapeMorph />
          </Animated.View>

          {/* Interactive Demo Section */}
          <Animated.View 
            entering={FadeInDown.delay(400).duration(1000)}
            style={styles.section}
          >
            <Text preset="heading" style={styles.sectionTitle}>
              Interactive Demos
            </Text>
            <Text preset="caption" style={styles.sectionSubtitle}>
              Scroll and drag to see dynamic morphing in action
            </Text>
            <MorphingDemo />
          </Animated.View>
        </ScrollView>
      </AnimatedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  title: {
    fontSize: 32,
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: '#64748b',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 24,
    color: '#334155',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#64748b',
    marginBottom: 16,
  },
});