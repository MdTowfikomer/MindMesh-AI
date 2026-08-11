import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PaywallStory } from '../src/components/PaywallStory';

export default function PaywallScreen() {
  return (
    <View style={{ flex: 1 }}>
      <PaywallStory />
    </View>
  );
}
