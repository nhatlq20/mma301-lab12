import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getStatistics } from '../database/db';

export default function StatisticsScreen() {
  const [stats, setStats] = useState(null);

  const loadStats = async () => {
    try {
      const data = await getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Lỗi lấy thống kê:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  if (!stats) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Đang tải dữ liệu thống kê...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="analytics-outline" size={48} color="#6200EE" />
        <Text style={styles.headerTitle}>Báo cáo kinh doanh</Text>
      </View>

      {/* 3 Thẻ số liệu tổng */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Ionicons name="cube-outline" size={24} color="#6200EE" />
          <Text style={styles.summaryNumber}>{stats.totalProducts}</Text>
          <Text style={styles.summaryText}>Tổng sản phẩm</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="cash-outline" size={24} color="#4CAF50" />
          <Text style={[styles.summaryNumber, { color: '#2E7D32' }]}>
            ${Math.round(stats.totalRevenue).toLocaleString()}
          </Text>
          <Text style={styles.summaryText}>Tổng doanh thu</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="bar-chart" size={24} color="#FF9800" />
          <Text style={[styles.summaryNumber, { color: '#E65100' }]}>{stats.totalSold}</Text>
          <Text style={styles.summaryText}>Tổng đã bán</Text>
        </View>
      </View>

      {/* Thống kê theo Category */}
      <Text style={styles.sectionTitle}>Theo Danh mục (Category)</Text>
      <View style={styles.categoryBox}>
        {stats.categoryStats.length === 0 ? (
          <Text style={{ color: '#888' }}>Chưa có dữ liệu danh mục</Text>
        ) : (
          stats.categoryStats.map((item, index) => (
            <View key={index} style={styles.catRow}>
              <Text style={styles.catName}>{item.category}</Text>
              <Text style={styles.catCount}>{item.count} sản phẩm</Text>
            </View>
          ))
        )}
      </View>

      {/* Thống kê nâng cao */}
      <Text style={styles.sectionTitle}>Chỉ số nâng cao</Text>
      
      {/* Giá trung bình */}
      <View style={styles.highlightCard}>
        <Ionicons name="calculator-outline" size={24} color="#6200EE" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.hlLabel}>Giá bán trung bình (AVG)</Text>
          <Text style={styles.hlValue}>${Math.round(stats.avgPrice).toLocaleString()}</Text>
        </View>
      </View>

      {/* Best Seller */}
      <View style={styles.highlightCard}>
        <Ionicons name="trophy-outline" size={24} color="#FFC107" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.hlLabel}>Sản phẩm bán chạy nhất</Text>
          <Text style={styles.hlValue}>
            {stats.bestSeller ? `${stats.bestSeller.product_name} (${stats.bestSeller.sold_quantity} chiếc)` : 'Chưa có'}
          </Text>
        </View>
      </View>

      {/* Top Brand */}
      <View style={styles.highlightCard}>
        <Ionicons name="business-outline" size={24} color="#009688" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.hlLabel}>Hãng có doanh số cao nhất</Text>
          <Text style={styles.hlValue}>
            {stats.topBrand ? `${stats.topBrand.brand} (${stats.topBrand.total_sold} sản phẩm)` : 'Chưa có'}
          </Text>
        </View>
      </View>

      {/* Low Stock List */}
      <Text style={[styles.sectionTitle, { color: '#B00020' }]}>
        Cảnh báo tồn kho thấp (&lt; 5 chiếc)
      </Text>
      <View style={styles.lowStockBox}>
        {stats.lowStock.length === 0 ? (
          <Text style={{ color: '#4CAF50', fontStyle: 'italic' }}>Tất cả mặt hàng đều còn đủ tồn kho.</Text>
        ) : (
          stats.lowStock.map((item) => (
            <View key={item.id} style={styles.lowStockItem}>
              <Ionicons name="alert-circle-outline" size={20} color="#B00020" />
              <Text style={styles.lowStockName}>{item.product_name}</Text>
              <Text style={styles.lowStockQty}>Còn: {item.stock}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
  header: { alignItems: 'center', marginVertical: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginTop: 6 },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
  },
  summaryNumber: { fontSize: 16, fontWeight: 'bold', color: '#6200EE', marginVertical: 4 },
  summaryText: { fontSize: 11, color: '#757575', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 14, marginBottom: 8 },
  categoryBox: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, elevation: 1 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  catName: { fontSize: 14, color: '#333' },
  catCount: { fontSize: 14, fontWeight: 'bold', color: '#6200EE' },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  hlLabel: { fontSize: 12, color: '#757575' },
  hlValue: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginTop: 2 },
  lowStockBox: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 30, borderWidth: 1, borderColor: '#FFCDD2' },
  lowStockItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  lowStockName: { marginLeft: 8, flex: 1, fontSize: 14, color: '#333' },
  lowStockQty: { fontWeight: 'bold', color: '#B00020' },
});
