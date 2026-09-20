import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CyberTheme } from '../theme/cyberLuxury';
import {
  X,
  FlashOn,
  FlashOff,
  CameraFlip,
  MagicWand,
  PhotoLibrary,
} from './Icons';

interface CameraCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

type CaptureMode = 'Video' | 'Photo' | 'Doc Scan';

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  visible,
  onClose,
  onCapture,
}) => {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [activeMode, setActiveMode] = useState<CaptureMode>('Photo');
  const [isAiEnhanced, setIsAiEnhanced] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [recentAssets, setRecentAssets] = useState<MediaLibrary.Asset[]>([]);

  // Load recent gallery thumbnails when modal opens
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    const fetchRecentPhotos = async () => {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          const res = await MediaLibrary.getAssetsAsync({
            first: 20,
            mediaType: ['photo'],
            sortBy: ['creationTime'],
          });
          if (isMounted && res.assets) {
            setRecentAssets(res.assets);
          }
        }
      } catch (err) {
        console.warn('[CameraCaptureModal] Failed to fetch gallery thumbnails:', err);
      }
    };

    fetchRecentPhotos();
    return () => {
      isMounted = false;
    };
  }, [visible]);

  // Flash toggle
  const toggleFlash = () => {
    CyberTheme.haptics.light();
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  // Flip camera
  const toggleFacing = () => {
    CyberTheme.haptics.light();
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  // Magic wand toggle
  const toggleAiMode = () => {
    CyberTheme.haptics.light();
    setIsAiEnhanced((prev) => !prev);
  };

  // Take photo
  const handleShutter = async () => {
    if (!cameraRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      CyberTheme.haptics.medium();

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.88,
        skipProcessing: false,
      });

      if (photo && photo.uri) {
        onCapture(photo.uri);
        onClose();
      }
    } catch (e: any) {
      console.error('[CameraCaptureModal] Take picture error:', e);
      CyberTheme.haptics.warning();
    } finally {
      setIsCapturing(false);
    }
  };

  // Pick from system gallery
  const handleOpenSystemGallery = async () => {
    CyberTheme.haptics.light();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.88,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        onCapture(result.assets[0].uri);
        onClose();
      }
    } catch (e) {
      console.error('[CameraCaptureModal] Gallery launch error:', e);
    }
  };

  // Select photo from thumbnail carousel
  const handleSelectThumbnail = (uri: string) => {
    CyberTheme.haptics.light();
    onCapture(uri);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Camera Viewfinder or Permission Fallback */}
        {permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            flash={flash}
          />
        ) : (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>Camera Permission</Text>
            <Text style={styles.permissionSubtitle}>
              MindMesh uses your camera to capture whiteboards, book snippets, notes, and visual inspirations.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
              activeOpacity={0.8}
            >
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Top Control Bar */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <X size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleFlash}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            {flash === 'on' ? (
              <FlashOn size={22} color="#FFD700" />
            ) : (
              <FlashOff size={22} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Control Overlay */}
        <View style={[styles.bottomOverlay, { paddingBottom: Math.max(insets.bottom, 16) + 10 }]}>
          {/* Subtle Grab Handle */}
          <View style={styles.grabHandle} />

          {/* Recent Gallery Carousel */}
          {recentAssets.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailCarousel}
            >
              {recentAssets.map((asset) => (
                <TouchableOpacity
                  key={asset.id}
                  style={styles.thumbnailWrapper}
                  onPress={() => handleSelectThumbnail(asset.uri)}
                  activeOpacity={0.75}
                >
                  <Image source={{ uri: asset.uri }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Action Row */}
          <View style={styles.actionRow}>
            {/* Gallery Button */}
            <TouchableOpacity
              style={styles.actionCircleButton}
              onPress={handleOpenSystemGallery}
              activeOpacity={0.75}
            >
              <PhotoLibrary size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* AI Enhancement Wand */}
            <TouchableOpacity
              style={[
                styles.actionCircleButton,
                isAiEnhanced && styles.aiActiveButton,
              ]}
              onPress={toggleAiMode}
              activeOpacity={0.75}
            >
              <MagicWand size={22} color={isAiEnhanced ? '#00E5FF' : '#FFFFFF'} />
            </TouchableOpacity>

            {/* Shutter Button */}
            <TouchableOpacity
              style={styles.shutterOuter}
              onPress={handleShutter}
              disabled={isCapturing}
              activeOpacity={0.8}
            >
              <View style={[styles.shutterInner, isCapturing && styles.shutterCapturing]}>
                {isCapturing && <ActivityIndicator size="small" color="#000000" />}
              </View>
            </TouchableOpacity>

            {/* Empty spacer or balance for layout */}
            <View style={{ width: 12 }} />

            {/* Flip Camera */}
            <TouchableOpacity
              style={styles.actionCircleButton}
              onPress={toggleFacing}
              activeOpacity={0.75}
            >
              <CameraFlip size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Mode Selector Tabs */}
          <View style={styles.modeRow}>
            {(['Video', 'Photo', 'Doc Scan'] as CaptureMode[]).map((mode) => {
              const isActive = activeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modeTab, isActive && styles.modeTabActive]}
                  onPress={() => {
                    CyberTheme.haptics.light();
                    setActiveMode(mode);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modeText, isActive && styles.modeTextActive]}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#0A0A0E',
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingTop: 12,
  },
  grabHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  thumbnailCarousel: {
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 18,
  },
  thumbnailWrapper: {
    width: 62,
    height: 62,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    marginBottom: 16,
  },
  actionCircleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiActiveButton: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterCapturing: {
    backgroundColor: '#C7C7CC',
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  modeTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  modeTabActive: {
    backgroundColor: '#262626',
  },
  modeText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
