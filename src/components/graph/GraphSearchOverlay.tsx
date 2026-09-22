import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, X } from '../Icons';

interface GraphSearchOverlayProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

export const GraphSearchOverlay: React.FC<GraphSearchOverlayProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
}) => {
  return (
    <View style={styles.searchContainer}>
      <Search size={14} color="#94A3B8" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search thoughts, tags or spaces..."
        placeholderTextColor="#64748B"
        value={searchQuery}
        onChangeText={onSearchChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {searchQuery.length > 0 ? (
        <TouchableOpacity style={styles.clearBtn} onPress={onClearSearch}>
          <X size={14} color="#94A3B8" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 36,
    marginTop: 6,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#F8FAFC',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
});
