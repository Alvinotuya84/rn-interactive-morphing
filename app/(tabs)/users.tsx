import { Center } from '@/components/ui/Center';
import { HStack } from '@/components/ui/HStack';
import { Text } from '@/components/ui/Text';
import { VStack } from '@/components/ui/VStack';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
    FadeIn,
    Layout,
    SlideInRight,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const window = Dimensions.get('window');
const GRID_ITEM_WIDTH = (window.width - 48) / 2;
const SUBMIT_ZONE_HEIGHT = 180; // Increased height for submitted users list
const SUBMITTED_AVATAR_SIZE = 40;
const HEADER_HEIGHT = 120;

interface User {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

// Mock user data
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

const SubmittedUserItem = ({ user, index }: { user: User; index: number }) => {
  const itemWidth = useSharedValue(60);
  
  React.useEffect(() => {
    // Animate width expansion when item is added
    itemWidth.value = withSpring(window.width - 32);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    width: itemWidth.value,
  }));

  return (
    <Animated.View 
      entering={SlideInRight.delay(index * 100)}
      layout={Layout.springify()}
      style={[styles.submittedUserItem, animatedStyle]}
    >
      <HStack style={styles.submittedUserContent}>
        <Image source={{ uri: user.avatar }} style={styles.submittedAvatar} />
        <VStack style={styles.submittedUserInfo}>
          <Text preset="subheading" style={styles.submittedUserName}>{user.name}</Text>
          <Text preset="caption" style={styles.submittedUserRole}>{user.role}</Text>
        </VStack>
      </HStack>
    </Animated.View>
  );
};

const UserCard = ({ user, onDragSuccess }: UserCardProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const isInSubmitZone = useSharedValue(false);
  const { height: windowHeight } = useWindowDimensions();

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, GestureContext>({
    onStart: () => {
      scale.value = withSpring(1.1);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      // Check if in submit zone using shared windowHeight
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
      setSubmittedUsers(current => [submittedUser, ...current]); // Add to start of array
    }
    setUsers(current => current.filter(user => user.id !== userId));
  };

  const submitZoneStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitZoneScale.value }],
  }));

  return (
    <VStack style={styles.container}>
      <Header />
      
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
            <VStack style={styles.submittedList}>
              {submittedUsers.map((user, index) => (
                <SubmittedUserItem 
                  key={user.id} 
                  user={user}
                  index={index}
                />
              ))}
            </VStack>
          )}
        </VStack>
      </Animated.View>
    </VStack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  submitZone: {
    height: SUBMIT_ZONE_HEIGHT,
    backgroundColor: '#4f46e5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  submittedList: {
    gap: 8,
  },
  submittedUserItem: {
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    overflow: 'hidden',
  },
  submittedUserContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
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
    marginLeft: 12,
    justifyContent: 'center',
  },
  submittedUserName: {
    color: '#fff',
    fontSize: 16,
  },
  submittedUserRole: {
    color: 'rgba(255, 255, 255, 0.7)',
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