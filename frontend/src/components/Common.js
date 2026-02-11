import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

export const Button = ({ onPress, title, loading, disabled, variant = 'primary', style, ...props }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`${variant}Button`],
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#000'} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export const Card = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

import { TextInput as RNTextInput } from 'react-native';
export const TextInput = ({ placeholder, value, onChangeText, secureTextEntry, inputKey, style, children, ...props }) => {
  return (
    <View style={styles.inputContainer}>
      {placeholder && <Text style={styles.inputPlaceholder}>{placeholder}</Text>}
      <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', paddingRight: 8 }, style]}>
        <RNTextInput
          key={inputKey}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          style={{ flex: 1, fontSize: 16, padding: 0, color: '#222', minWidth: 0 }}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          {...props}
        />
        {children && (
          <View style={{ marginLeft: 4, zIndex: 2 }}>{children}</View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#000',
  },
  dangerText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginVertical: 8,
  },
  inputPlaceholder: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
