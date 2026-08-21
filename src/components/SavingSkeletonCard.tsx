import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export const SavingSkeletonCard: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.boxPlaceholder}>
        <Text style={styles.statusText}>Saving to mind...</Text>
      </View>
      <View style={styles.titlePlaceholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  boxPlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    backgroundColor: '#181A20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  titlePlaceholder: {
    width: '70%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#1E2028',
    marginTop: 8,
  },
});
