import { BlurView } from '@/components/ui/BlurView';
import { Center } from '@/components/ui/Center';
import { HStack } from '@/components/ui/HStack';
import { Text } from '@/components/ui/Text';
import { VStack } from '@/components/ui/VStack';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent, TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    FadeIn,
    Layout,
    SlideInRight,
    interpolateColor,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const window = Dimensions.get('window');
const GRID_ITEM_WIDTH = (window.width - 48) / 2;
const SUBMIT_ZONE_HEIGHT = 180;
const SUBMITTED_AVATAR_SIZE = 40;
const HEADER_HEIGHT = 120;
const DELETE_THRESHOLD = -80;

interface User {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

const USERS: User[] = [
  { id: 1, name: 'John Doe', role: 'Designer', avatar: 'https://i.pravatar.cc/100?img=1' },
  { id: 2, name: 'Jane Smith', role: 'Developer', avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: 3, name: 'Mike Johnson', role: 'Manager', avatar: 'https://i.pravatar.cc/100?img=3' },
  { id: 4, name: 'Sarah Wilson', role: 'Artist', avatar: 'https://i.pravatar.cc/100?img=4' },
  { id: 5, name: 'Tom Brown', role: 'Engineer', avatar: 'https://i.pravatar.cc/100?img=5' },
  { id: 6, name: 'Emma Davis', role: 'Writer', avatar: 'https://i.pravatar.cc/100?img=6' },
];

interface UserCardProps {
  user: User;
  onDragSuccess: (userId: number) => void;
}

type GestureContext = {
  startX: number;
  startY: number;
};

const Header = () => {
  return (
    <Animated.View 
      entering={FadeIn}
      style={styles.header}
    >
      <BlurView intensity={40} tint="dark" style={styles.headerBlur} />
      <VStack style={styles.headerContent}>
        <Text preset="heading" style={styles.headerTitle}>
          Team Members
        </Text>
        <Text preset="caption" style={styles.headerSubtitle}>
          Drag members to submit
        </Text>
      </VStack>
    </Animated.View>
  );
};

interface SubmittedUserItemProps {
  user: User;
  index: number;
  onRemove: (userId: number) => void;
  layoutWidth: number;
}

const SubmittedUserItem = ({ user, index, onRemove, layoutWidth }: SubmittedUserItemProps) => {
  const translateX = useSharedValue(0);
  const itemWidth = useSharedValue(60);
  const itemHeight = useSharedValue(60);
  const opacity = useSharedValue(1);
  const isDeletionActive = useSharedValue(false);
  
  React.useEffect(() => {
    // Use full width instead of percentage
    itemWidth.value = withSpring(layoutWidth - 32, {
      mass: 1,
      damping: 15,
      stiffness: 100
    });
  }, [layoutWidth]);

  const deleteGestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, GestureContext>({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      // Only allow swiping left (negative values)
      translateX.value = Math.min(0, context.startX + event.translationX);
      
      // Set isDeletionActive based on swipe progress
      isDeletionActive.value = translateX.value < -20;
    },
    onEnd: (event) => {
      if (translateX.value < DELETE_THRESHOLD) {
        // Delete the item with animation
        translateX.value = withTiming(-layoutWidth, { duration: 300 });
        itemHeight.value = withTiming(0, { duration: 300 }, () => {
          opacity.value = 0;
          runOnJS(onRemove)(user.id);
        });
      } else {
        // Return to original position
        translateX.value = withSpring(0);
        isDeletionActive.value = false;
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: itemWidth.value,
    height: itemHeight.value,
    opacity: opacity.value,
  }));

  // Background danger effect that appears from the right side (drag point)
  const backgroundDangerStyle = useAnimatedStyle(() => {
    const deleteProgress = Math.min(1, Math.abs(translateX.value) / DELETE_THRESHOLD);
    
    // This will create a width that increases as you drag further
    const dangerWidth = Math.abs(translateX.value);
    
    return {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      width: dangerWidth,
      backgroundColor: interpolateColor(
        deleteProgress,
        [0, 0.5, 1],
        ['rgba(244, 63, 94, 0.3)', 'rgba(244, 63, 94, 0.6)', 'rgba(244, 63, 94, 0.9)']
      ),
      borderTopRightRadius: 30,
      borderBottomRightRadius: 30,
      zIndex: 0,
    };
  });

  const deleteIndicatorStyle = useAnimatedStyle(() => {
    const opacity = Math.min(1, Math.abs(translateX.value) / 100);
    return {
      opacity,
      right: 16,
      transform: [{ scale: opacity * 1.2 }],
    };
  });

  return (
    <Animated.View 
      entering={SlideInRight.delay(index * 100)}
      layout={Layout.springify()}
      style={styles.submittedUserItemContainer}
    >
      <Animated.View style={[styles.deleteIndicator, deleteIndicatorStyle]}>
        <Text style={styles.deleteText}>Delete</Text>
      </Animated.View>
      
      <PanGestureHandler onGestureEvent={deleteGestureHandler}>
        <Animated.View style={[styles.submittedUserItem, animatedStyle]}>
          <Animated.View style={backgroundDangerStyle} />
          <BlurView intensity={20} tint="light" style={styles.submittedItemBlur} />
          
          <HStack style={styles.submittedUserContent}>
            <Image source={{ uri: user.avatar }} style={styles.submittedAvatar} />
            <VStack style={styles.submittedUserInfo}>
              <Text preset="subheading" style={styles.submittedUserName}>{user.name}</Text>
              <Text preset="caption" style={styles.submittedUserRole}>{user.role}</Text>
            </VStack>
          </HStack>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

const UserCard = ({ user, onDragSuccess }: UserCardProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const zIndex = useSharedValue(1);
  const isInSubmitZone = useSharedValue(false);
  const { height: windowHeight } = useWindowDimensions();

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, GestureContext>({
    onStart: () => {
      scale.value = withSpring(1.1);
      zIndex.value = 999;
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      if (event.absoluteY > windowHeight - SUBMIT_ZONE_HEIGHT - 100) {
        if (!isInSubmitZone.value) {
          scale.value = withSpring(0.8);
          isInSubmitZone.value = true;
        }
      } else if (isInSubmitZone.value) {
        scale.value = withSpring(1.1);
        isInSubmitZone.value = false;
      }
    },
    onEnd: () => {
      if (isInSubmitZone.value) {
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(onDragSuccess)(user.id);
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        zIndex.value = 1;
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
    zIndex: zIndex.value,
    elevation: zIndex.value,
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View entering={FadeIn} style={[styles.userCard, animatedStyle]}>
        <BlurView intensity={5} tint="light" style={styles.cardBlur} />
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text preset="subheading" style={styles.userName}>{user.name}</Text>
        <Text preset="caption" style={styles.userRole}>{user.role}</Text>
      </Animated.View>
    </PanGestureHandler>
  );
};

const SubmittedUsersList = ({ 
  submittedUsers, 
  onRemoveUser 
}: { 
  submittedUsers: User[];
  onRemoveUser: (userId: number) => void;
}) => {
  const { width: windowWidth } = useWindowDimensions();
  
  return (
    <ScrollView 
      contentContainerStyle={styles.submittedListContent}
      showsVerticalScrollIndicator={false}
    >
      {submittedUsers.map((user, index) => (
        <SubmittedUserItem 
          key={user.id}
          user={user} 
          index={index} 
          onRemove={onRemoveUser} 
          layoutWidth={windowWidth}
        />
      ))}
    </ScrollView>
  );
};

const SuccessOverlay = ({ 
  isVisible, 
  onAnimationComplete 
}: { 
  isVisible: boolean; 
  onAnimationComplete: () => void;
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const blurIntensity = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const checkmarkOpacity = useSharedValue(0);
  const overlayRadius = useSharedValue(0);

  React.useEffect(() => {
    if (isVisible) {
      // Start the success animation sequence
      opacity.value = withTiming(1, { duration: 300 });
      blurIntensity.value = withTiming(80, { duration: 400 });
      scale.value = withSequence(
        withTiming(1, { 
          duration: 600,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
        }),
        withTiming(1.2, { 
          duration: 200,
          easing: Easing.bezier(0.33, 1, 0.68, 1)
        }),
        withTiming(1, { 
          duration: 200,
          easing: Easing.bezier(0.33, 1, 0.68, 1)
        })
      );
      
      // Morph from circle to rounded square
      overlayRadius.value = withSequence(
        withTiming(50, { duration: 600 }),
        withTiming(20, { duration: 400 })
      );

      // Animate checkmark
      checkmarkScale.value = withDelay(400, 
        withSpring(1, {
          mass: 1,
          damping: 12,
          stiffness: 100
        })
      );
      checkmarkOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));

      // Reset and cleanup
      const timeout = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        blurIntensity.value = withTiming(0, { duration: 300 }, () => {
          scale.value = 0;
          overlayRadius.value = 0;
          checkmarkScale.value = 0;
          checkmarkOpacity.value = 0;
          runOnJS(onAnimationComplete)();
        });
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    borderRadius: overlayRadius.value + '%',
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkOpacity.value,
  }));

  const blurStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!isVisible) return null;

  return (
    <View style={styles.fullScreenOverlayContainer}>
      <BlurView 
        intensity={80} 
        tint="light" 
        isAbsolute
        style={blurStyle} 
      />
      <Animated.View style={[styles.successOverlay, overlayStyle]}>
        <Animated.Text style={[styles.checkmark, checkStyle]}>
          ✓
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

const SubmitButton = ({ onSubmit, disabled }: { onSubmit: () => void; disabled: boolean }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const buttonScale = useSharedValue(1);

  const handlePress = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    setShowOverlay(true);
  };

  const handleAnimationComplete = () => {
    setShowOverlay(false);
    onSubmit();
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  return (
    <>
      <TouchableOpacity onPress={handlePress} disabled={disabled}>
        <Animated.View style={[styles.submitButton, buttonStyle]}>
          <BlurView intensity={60} tint="dark" style={styles.buttonBlur} />
          <Text style={styles.submitButtonText}>Send</Text>
        </Animated.View>
      </TouchableOpacity>
      <SuccessOverlay 
        isVisible={showOverlay} 
        onAnimationComplete={handleAnimationComplete}
      />
    </>
  );
};

export default function UsersScreen() {
  const [users, setUsers] = useState(USERS);
  const [submittedUsers, setSubmittedUsers] = useState<User[]>([]);
  const submitZoneScale = useSharedValue(1);

  const handleDragSuccess = (userId: number) => {
    submitZoneScale.value = withSpring(1.1, {}, () => {
      submitZoneScale.value = withSpring(1);
    });

    const submittedUser = users.find(user => user.id === userId);
    if (submittedUser) {
      setSubmittedUsers(current => [submittedUser, ...current]);
    }
    setUsers(current => current.filter(user => user.id !== userId));
  };
  
  const handleRemoveUser = (userId: number) => {
    // Find the user to be removed
    const userToRemove = submittedUsers.find(user => user.id === userId);
    
    // Remove from submitted users
    setSubmittedUsers(current => current.filter(user => user.id !== userId));
    
    // Add back to available users
    if (userToRemove) {
      setUsers(current => [...current, userToRemove]);
    }
  };

  const submitZoneStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitZoneScale.value }],
  }));

  const handleSubmitTeam = () => {
    // Handle team submission here
    setSubmittedUsers([]);
    setUsers(USERS);
  };

  return (
    <ScrollView style={styles.container} bounces={false}>
      <Header />
      
      <View style={styles.contentContainer}>
        <View style={styles.gridContainer}>
          {users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onDragSuccess={handleDragSuccess}
            />
          ))}
        </View>

        <Animated.View style={[styles.submitZone, submitZoneStyle]}>
          <BlurView intensity={30} tint="dark" style={styles.submitZoneBlur} />
          <VStack style={styles.submitZoneContent}>
            {submittedUsers.length === 0 ? (
              <Center style={styles.emptySubmitZone}>
                <Text preset="subheading" style={styles.emptySubmitText}>
                  Drop to Submit
                </Text>
              </Center>
            ) : (
              <>
                <SubmittedUsersList 
                  submittedUsers={submittedUsers} 
                  onRemoveUser={handleRemoveUser}
                />
                <Center style={styles.submitButtonContainer}>
                  <SubmitButton 
                    onSubmit={handleSubmitTeam} 
                    disabled={submittedUsers.length === 0} 
                  />
                </Center>
              </>
            )}
          </VStack>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    flex: 1,
    minHeight: window.height - HEADER_HEIGHT,
    paddingBottom: 24,
  },
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: '#4f46e5',
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  headerBlur: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingHorizontal: 20,
    height: '100%',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  submitZone: {
    backgroundColor: 'rgba(79, 70, 229, 0.7)',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    margin: 16,
    marginTop: 24,
  },
  submitZoneBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
  submitZoneContent: {
    flex: 1,
    padding: 16,
  },
  emptySubmitZone: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 20,
    margin: 16,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySubmitText: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 18,
    marginBottom: 8,
  },
  submittedListContent: {
    paddingVertical: 8,
  },
  submittedUserItemContainer: {
    position: 'relative',
    height: 70,
    marginBottom: 12,
    width: '100%',
  },
  deleteIndicator: {
    position: 'absolute',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: '100%',
    zIndex: 0,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  submittedUserItem: {
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 1,
    position: 'relative',
    width: '100%',
  },
  submittedItemBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  submittedUserContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 2,
    height: '100%',
  },
  submittedAvatar: {
    width: SUBMITTED_AVATAR_SIZE,
    height: SUBMITTED_AVATAR_SIZE,
    borderRadius: SUBMITTED_AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  submittedUserInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  submittedUserName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  submittedUserRole: {
    fontSize: 14,
    color: '#4b5563',
  },
  userCard: {
    width: GRID_ITEM_WIDTH,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
  },
  cardBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  userName: {
    textAlign: 'center',
    marginBottom: 4,
  },
  userRole: {
    color: '#64748b',
    textAlign: 'center',
  },
  submitButtonContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  submitButton: {
    height: 56,
    width: 180,
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  buttonBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullScreenOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successOverlay: {
    width: 120,
    height: 120,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  checkmark: {
    color: '#fff',
    fontSize: 60,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});