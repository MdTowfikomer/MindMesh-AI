import React, { useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  StatusBar,
  BackHandler,
} from 'react-native';
import { X } from './Icons';
import { useMemoryStore } from '../stores/memoryStore';
import { CyberTheme } from '../theme/cyberLuxury';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const FullScreenImageViewerModal: React.FC = () => {
  const { fullScreenImageUrl, closeFullScreenImage } = useMemoryStore();

  useEffect(() => {
    const onBackPress = () => {
      if (fullScreenImageUrl) {
        closeFullScreenImage();
        return true;
      }
      return false;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSub.remove();
  }, [fullScreenImageUrl, closeFullScreenImage]);

  if (!fullScreenImageUrl) return null;

  return (
    <Modal
      visible={!!fullScreenImageUrl}
      transparent={false}
      animationType="fade"
      onRequestClose={closeFullScreenImage}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <StatusBar hidden />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          maximumZoomScale={4.0}
          minimumZoomScale={1.0}
          centerContent={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bouncesZoom={true}
        >
          <Image
            source={{ uri: fullScreenImageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        </ScrollView>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => {
            CyberTheme.haptics.light();
            closeFullScreenImage();
          }}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  scrollContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});
