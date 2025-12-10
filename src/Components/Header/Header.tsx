// components/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type HeaderProps = {
  title: string;
  onBack?: () => void; 
};

export default function Header({ title, onBack }: HeaderProps) {
  return (
    <View style={styles.header}>
            {onBack ? (
        <TouchableOpacity onPress={onBack}>
          <Icon name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 26 }} />
      )}

      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 26 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 55,
    backgroundColor: '#e68725',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});
