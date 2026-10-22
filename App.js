import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/database/db';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Khởi tạo bảng SQLite và nạp dữ liệu mẫu
    initDatabase()
      .then(() => {
        setDbReady(true);
      })
      .catch((err) => {
        console.error('Lỗi khởi tạo DB: ', err);
        setError(err.message);
      });
  }, []);

  // Màn hình chờ khi Database đang khởi tạo
  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        {error ? (
          <Text style={styles.errorText}>Lỗi khởi tạo Database: {error}</Text>
        ) : (
          <>
            <ActivityIndicator size="large" color="#6200EE" />
            <Text style={styles.loadingText}>Đang chuẩn bị cơ sở dữ liệu...</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },
  errorText: {
    color: '#B00020',
    fontSize: 15,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
});
