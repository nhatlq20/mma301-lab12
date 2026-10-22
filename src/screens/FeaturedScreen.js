import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getFeaturedProducts, getFeaturedStatistics } from '../database/db';

export default function FeaturedScreen({ navigation }) {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [stats, setStats] = useState(null);

  const loadFeaturedData = async () => {
    try {
      const items = await getFeaturedProducts();
      const st = await getFeaturedStatistics();
      setFeaturedItems(items);
      setStats(st);
    } catch (error) {
      console.error('Lỗi nạp sản phẩm nổi bật:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFeaturedData();
    }, [])
  );

  const renderHeader = () => {
    if (!stats) return null;
    return (
      <View>
        <View style={styles.header}>
          <Ionicons name="flame" size={48} color="#FF5722" />
          <Text style={styles.headerTitle}>Sản phẩm Nổi bật</Text>
        </View>

        {/* Featured Statistics (Task 6) */}
        <View style={styles.statsCard}>
          <Text style={styles.statsCardTitle}>Thống kê nhóm nổi bật</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Ionicons name="star" size={20} color="#FFC107" />
              <Text style={styles.statNumber}>{stats.totalFeatured}</Text>
              <Text style={styles.statLabel}>Sản phẩm</Text>
            </View>
            <View style={styles.statCol}>
              <Ionicons name="cash" size={20} color="#4CAF50" />
              <Text style={[styles.statNumber, { color: '#2E7D32' }]}>
                ${Math.round(stats.featuredRevenue).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Doanh thu</Text>
            </View>
            <View style={styles.statCol}>
              <Ionicons name="stats-chart" size={20} color="#6200EE" />
              <Text style={[styles.statNumber, { color: '#6200EE' }]}>{stats.totalSold}</Text>
              <Text style={styles.statLabel}>Đã bán</Text>
            </View>
          </View>

          {/* Phân bổ theo Category */}
          <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="grid-outline" size={16} color="#757575" />
              <Text style={{ marginLeft: 6, fontSize: 13, color: '#666', fontWeight: '500' }}>
                Phân loại theo danh mục:
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {stats.categoryStats.map((c, i) => (
                <Text key={i} style={styles.catBadge}>
                  {c.category}: {c.count}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.listHeading}>Danh sách nổi bật</Text>
      </View>
    );
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('StoreTab', { screen: 'ProductDetail', params: { productId: item.id } })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="flame" size={24} color="#FF5722" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{item.product_name}</Text>
          <Text style={styles.productBrand}>{item.brand} • {item.category}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.price}>${item.price.toLocaleString()}</Text>
          <Text style={styles.sold}>Đã bán: {item.sold_quantity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={featuredItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>
            Chưa có sản phẩm nào được đánh dấu nổi bật.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { alignItems: 'center', marginVertical: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginTop: 4 },
  statsCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  statsCardTitle: { fontSize: 15, fontWeight: 'bold', color: '#E65100', marginBottom: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statCol: { alignItems: 'center' },
  statNumber: { fontSize: 16, fontWeight: 'bold', marginVertical: 4 },
  statLabel: { fontSize: 12, color: '#757575' },
  catBadge: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    marginRight: 6,
    marginTop: 4,
  },
  listHeading: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  card: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  productBrand: { fontSize: 13, color: '#757575', marginTop: 2 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#6200EE' },
  sold: { fontSize: 12, color: '#757575', marginTop: 2 },
});
