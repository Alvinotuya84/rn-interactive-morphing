import { Center } from '@/components/ui/Center';
import { HStack } from '@/components/ui/HStack';
import { Text } from '@/components/ui/Text';
import { VStack } from '@/components/ui/VStack';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
    FadeIn,
    Layout,
    SlideInRight,
    interpolateColor,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
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
    itemWidth.value = withSpring(layoutWidth - 32);
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
          {/* Background danger effect that grows from the right */}
          <Animated.View style={backgroundDangerStyle} />
          
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
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text preset="subheading" style={styles.userName}>{user.name}</Text>
        <Text preset="caption" style={styles.userRole}>{user.role}</Text>
      </Animated.View>
    </PanGestureHandler>
  );
};

const SubmittedList = ({ 
  submittedUsers, 
  onRemoveUser 
}: { 
  submittedUsers: User[];
  onRemoveUser: (userId: number) => void;
}) => {
  const { width: windowWidth } = useWindowDimensions();
  
  const renderItem = ({ item, index }: { item: User; index: number }) => (
    <SubmittedUserItem 
      user={item} 
      index={index} 
      onRemove={onRemoveUser} 
      layoutWidth={windowWidth}
    />
  );

  return (
    <FlatList
      data={submittedUsers}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.submittedListContent}
      showsVerticalScrollIndicator={false}
    />
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
          <VStack style={styles.submitZoneContent}>
            {submittedUsers.length === 0 ? (
              <Center style={styles.emptySubmitZone}>
                <Text preset="subheading" style={styles.emptySubmitText}>
                  Drop to Submit
                </Text>
              </Center>
            ) : (
              <SubmittedList 
                submittedUsers={submittedUsers} 
                onRemoveUser={handleRemoveUser}
              />
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
  },
  headerContent: {
    paddingHorizontal: 20,
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
    backgroundColor: '#4f46e5',
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
  },
  emptySubmitText: {
    color: '#fff',
    opacity: 0.8,
  },
  submittedListContent: {
    gap: 8,
    paddingVertical: 8,
  },
  submittedUserItemContainer: {
    position: 'relative',
    height: 60,
    marginBottom: 8,
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
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
    zIndex: 1,
    position: 'relative',
  },
  submittedUserContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
    zIndex: 2,
  },
  submittedAvatar: {
    width: SUBMITTED_AVATAR_SIZE,
    height: SUBMITTED_AVATAR_SIZE,
    borderRadius: SUBMITTED_AVATAR_SIZE / 2,
    borderWidth: 2,
  },
  submittedUserInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  submittedUserName: {
    fontSize: 16,
  },
  submittedUserRole: {
    fontSize: 12,
  },
  userCard: {
    width: GRID_ITEM_WIDTH,
    padding: 16,
    backgroundColor: '#fff',
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
});