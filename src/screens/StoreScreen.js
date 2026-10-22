import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllProducts } from '../database/db';

export default function StoreScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // States tìm kiếm, lọc & sắp xếp (Task 4)
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [stockStatus, setStockStatus] = useState('All'); // All | in_stock | low_stock | out_of_stock
  const [ramFilter, setRamFilter] = useState('All'); // All | 8 | 16 | 32
  const [priceRange, setPriceRange] = useState('All'); // All | low | mid | high
  const [sortBy, setSortBy] = useState('none'); // price_asc | price_desc | sold_asc | sold_desc

  // Tự động load lại dữ liệu mỗi khi màn hình được active
  const loadData = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Lỗi lấy danh sách sản phẩm:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Lấy danh sách các thương hiệu có trong kho để tạo nút lọc
  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
    return ['All', ...list];
  }, [products]);

  // Logic Lọc, Tìm kiếm và Sắp xếp (Task 4)
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        // 4.1 Search real-time theo tên
        const matchName = item.product_name.toLowerCase().includes(searchQuery.toLowerCase());

        // 4.2 Filter Brand & Category & Featured
        const matchBrand = selectedBrand === 'All' || item.brand === selectedBrand;
        const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchFeatured = !onlyFeatured || item.is_featured === 1;

        // 4.3 Stock Status
        let matchStock = true;
        if (stockStatus === 'in_stock') matchStock = item.stock > 0;
        else if (stockStatus === 'low_stock') matchStock = item.stock > 0 && item.stock < 5;
        else if (stockStatus === 'out_of_stock') matchStock = item.stock === 0;

        // 4.4 RAM & Price filters
        let matchRam = true;
        if (ramFilter === '8') matchRam = item.ram === 8;
        else if (ramFilter === '16') matchRam = item.ram === 16;
        else if (ramFilter === '32+') matchRam = item.ram >= 32;

        let matchPrice = true;
        if (priceRange === 'low') matchPrice = item.price < 500;
        else if (priceRange === 'mid') matchPrice = item.price >= 500 && item.price <= 1000;
        else if (priceRange === 'high') matchPrice = item.price > 1000;

        return matchName && matchBrand && matchCategory && matchFeatured && matchStock && matchRam && matchPrice;
      })
      .sort((a, b) => {
        // 4.5 Sort
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'sold_asc') return a.sold_quantity - b.sold_quantity;
        if (sortBy === 'sold_desc') return b.sold_quantity - a.sold_quantity;
        return 0;
      });
  }, [products, searchQuery, selectedBrand, selectedCategory, onlyFeatured, stockStatus, ramFilter, priceRange, sortBy]);

  // 4.6 Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setOnlyFeatured(false);
    setStockStatus('All');
    setRamFilter('All');
    setPriceRange('All');
    setSortBy('none');
  };

  const renderProductItem = ({ item }) => {
    // Stock Status Icon logic theo trang 9 của PDF
    const stockIcon =
      item.stock === 0
        ? { name: 'close-circle', color: '#B00020', text: 'Hết hàng' }
        : item.stock < 5
        ? { name: 'alert-circle', color: '#FF9800', text: `Sắp hết (${item.stock})` }
        : { name: 'checkmark-circle', color: '#4CAF50', text: `Còn hàng (${item.stock})` };

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.productName}>{item.product_name}</Text>
              {item.is_featured === 1 && (
                <Ionicons name="flame" size={20} color="#FF5722" style={{ marginLeft: 6 }} />
              )}
            </View>
            <Text style={styles.brandCategory}>
              {item.brand} • {item.category}
            </Text>
          </View>
          <Text style={styles.priceText}>${item.price.toLocaleString()}</Text>
        </View>

        {/* Cấu hình CPU, RAM, Ổ cứng */}
        <View style={styles.specRow}>
          <View style={styles.specItem}>
            <Ionicons name="hardware-chip-outline" size={16} color="#6200EE" />
            <Text style={styles.specText}>{item.cpu || 'N/A'}</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="flash-outline" size={16} color="#6200EE" />
            <Text style={styles.specText}>{item.ram} GB</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="save-outline" size={16} color="#6200EE" />
            <Text style={styles.specText}>{item.storage} GB</Text>
          </View>
        </View>

        {/* Tình trạng tồn kho & số lượng đã bán */}
        <View style={styles.cardFooter}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={stockIcon.name} size={18} color={stockIcon.color} />
            <Text style={[styles.stockText, { color: stockIcon.color }]}>{stockIcon.text}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="bar-chart-outline" size={16} color="#757575" />
            <Text style={styles.soldText}>Đã bán: {item.sold_quantity}</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" style={{ marginLeft: 6 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#757575" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên máy tính..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#757575" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.filterToggleBtn, showFilterModal && styles.filterToggleBtnActive]}
          onPress={() => setShowFilterModal(!showFilterModal)}
        >
          <Ionicons name="options-outline" size={20} color={showFilterModal ? '#FFF' : '#6200EE'} />
        </TouchableOpacity>
      </View>

      {/* Filter & Sort Panels (Task 4) */}
      {showFilterModal && (
        <View style={styles.filterDrawer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40, marginBottom: 8 }}>
            {/* Category Filter */}
            {['All', 'Laptop', 'Desktop', 'Component'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, selectedCategory === cat && styles.chipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
                  {cat === 'All' ? 'Tất cả loại' : cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40, marginBottom: 8 }}>
            {/* Sort Filter (4.5) */}
            <TouchableOpacity
              style={[styles.chip, sortBy === 'price_asc' && styles.chipActive]}
              onPress={() => setSortBy(sortBy === 'price_asc' ? 'none' : 'price_asc')}
            >
              <Text style={[styles.chipText, sortBy === 'price_asc' && styles.chipTextActive]}>Giá ↑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, sortBy === 'price_desc' && styles.chipActive]}
              onPress={() => setSortBy(sortBy === 'price_desc' ? 'none' : 'price_desc')}
            >
              <Text style={[styles.chipText, sortBy === 'price_desc' && styles.chipTextActive]}>Giá ↓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, sortBy === 'sold_desc' && styles.chipActive]}
              onPress={() => setSortBy(sortBy === 'sold_desc' ? 'none' : 'sold_desc')}
            >
              <Text style={[styles.chipText, sortBy === 'sold_desc' && styles.chipTextActive]}>Bán chạy ↓</Text>
            </TouchableOpacity>

            {/* Toggle Featured */}
            <TouchableOpacity
              style={[styles.chip, onlyFeatured && styles.chipActiveFeatured]}
              onPress={() => setOnlyFeatured(!onlyFeatured)}
            >
              <Ionicons name="flame" size={14} color={onlyFeatured ? '#FFF' : '#FF5722'} style={{ marginRight: 4 }} />
              <Text style={[styles.chipText, onlyFeatured && styles.chipTextActive]}>Nổi bật</Text>
            </TouchableOpacity>

            {/* Reset button */}
            <TouchableOpacity style={[styles.chip, { backgroundColor: '#F0E5FF' }]} onPress={resetFilters}>
              <Ionicons name="refresh-outline" size={14} color="#6200EE" style={{ marginRight: 4 }} />
              <Text style={{ color: '#6200EE', fontSize: 13, fontWeight: 'bold' }}>Reset bộ lọc</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* FlatList danh sách sản phẩm */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200EE']} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="laptop-outline" size={80} color="#CCC" />
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 12,
    marginBottom: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    height: 48,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  filterToggleBtn: { marginLeft: 10, padding: 6, borderRadius: 8, backgroundColor: '#F0E5FF' },
  filterToggleBtnActive: { backgroundColor: '#6200EE' },
  filterDrawer: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#6200EE' },
  chipActiveFeatured: { backgroundColor: '#FF5722' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#FFF', fontWeight: 'bold' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productName: { fontSize: 17, fontWeight: 'bold', color: '#1A1A1A' },
  brandCategory: { fontSize: 13, color: '#757575', marginTop: 2 },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#6200EE' },
  specRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F5FA',
    borderRadius: 8,
    padding: 8,
    marginVertical: 10,
    justifyContent: 'space-around',
  },
  specItem: { flexDirection: 'row', alignItems: 'center' },
  specText: { marginLeft: 4, fontSize: 13, color: '#444' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  stockText: { marginLeft: 5, fontSize: 13, fontWeight: '500' },
  soldText: { marginLeft: 4, fontSize: 13, color: '#757575' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#888' },
});
