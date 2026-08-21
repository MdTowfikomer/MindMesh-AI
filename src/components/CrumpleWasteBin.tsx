import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CrumpleWasteBinProps {
  binVisible: boolean;
  wadCount: number;
}

export const CrumpleWasteBin: React.FC<CrumpleWasteBinProps> = ({ binVisible, wadCount }) => {
  const slideAnim = useRef(new Animated.Value(150)).current;

  useEffect(() => {
    if (binVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 150,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [binVisible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.binContainer,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Wire Mesh Waste Bin */}
      <View style={styles.wireBinBody}>
        {/* Top Rim */}
        <View style={styles.binRim} />

        {/* Paper Wads Accumulated inside */}
        <View style={styles.wadsArea}>
          {Array.from({ length: Math.min(wadCount, 8) }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.paperWad,
                {
                  transform: [
                    { rotate: `${(i * 47) % 360}deg` },
                    { scale: 0.8 + ((i % 3) * 0.15) },
                  ],
                  left: 12 + ((i * 18) % 65),
                  bottom: 4 + Math.floor(i / 2) * 12,
                },
              ]}
            >
              <Text style={styles.wadTexture}>📄</Text>
            </View>
          ))}
        </View>

        {/* Wire Mesh Grid Lines Overlay */}
        <View style={styles.meshGridOverlay}>
          <View style={styles.meshLineV} />
          <View style={styles.meshLineV} />
          <View style={styles.meshLineV} />
          <View style={styles.meshLineV} />
          <View style={styles.meshLineV} />
          <View style={styles.meshLineH} />
          <View style={styles.meshLineH} />
          <View style={styles.meshLineH} />
        </View>
      </View>
      <Text style={styles.binLabel}>
        {wadCount > 0 ? `${wadCount} wads in bin` : 'Waste Basket'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  binContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  wireBinBody: {
    width: 110,
    height: 90,
    backgroundColor: 'rgba(30, 32, 40, 0.92)',
    borderWidth: 2,
    borderColor: '#94A3B8',
    borderRadius: 8,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 12,
  },
  binRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#CBD5E1',
    borderBottomWidth: 1,
    borderBottomColor: '#64748B',
  },
  wadsArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
  },
  paperWad: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  wadTexture: {
    fontSize: 12,
  },
  meshGridOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    borderTopWidth: 6,
    borderTopColor: 'transparent',
  },
  meshLineV: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  meshLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  binLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
    letterSpacing: 0.4,
  },
});
