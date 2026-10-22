import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import StoreScreen from '../screens/StoreScreen';
import AddComputerScreen from '../screens/AddComputerScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import FeaturedScreen from '../screens/FeaturedScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function StoreStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="StoreList" 
        component={StoreScreen} 
        options={{ title: 'Computer Store', headerShown: false }} 
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={{ title: 'Chi tiết sản phẩm' }} 
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'StoreTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Add') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Statistics') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Featured') {
            iconName = focused ? 'flame' : 'flame-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: '#757575',
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="StoreTab" 
        component={StoreStackNavigator} 
        options={{ title: 'Cửa hàng', headerShown: false }} 
      />
      <Tab.Screen 
        name="Add" 
        component={AddComputerScreen} 
        options={{ title: 'Thêm sản phẩm' }} 
      />
      <Tab.Screen 
        name="Statistics" 
        component={StatisticsScreen} 
        options={{ title: 'Thống kê' }} 
      />
      <Tab.Screen 
        name="Featured" 
        component={FeaturedScreen} 
        options={{ title: 'Nổi bật' }} 
      />
    </Tab.Navigator>
  );
}
