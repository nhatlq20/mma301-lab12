import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addProduct } from '../database/db';

export default function AddComputerScreen({ navigation }) {
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Laptop');
  const [cpu, setCpu] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [soldQuantity, setSoldQuantity] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);

  const resetForm = () => {
    setProductName('');
    setBrand('');
    setCategory('Laptop');
    setCpu('');
    setRam('');
    setStorage('');
    setPrice('');
    setStock('');
    setSoldQuantity('0');
    setIsFeatured(false);
  };

  const handleSave = async () => {
    // 1. Validation không để trống
    if (!productName.trim() || !brand.trim() || !cpu.trim() || !price || !ram || !storage || !stock) {
      Alert.alert('Lỗi nhập liệu', 'Vui lòng điền đầy đủ tất cả các trường bắt buộc!');
      return;
    }

    const numPrice = parseFloat(price);
    const numRam = parseInt(ram, 10);
    const numStorage = parseInt(storage, 10);
    const numStock = parseInt(stock, 10);
    const numSold = parseInt(soldQuantity, 10) || 0;

    // 2. Validation quy định giá, RAM, Storage (Task 2)
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('Lỗi nhập liệu', 'Giá sản phẩm phải lớn hơn 0 (Price > 0)!');
      return;
    }
    if (isNaN(numRam) || numRam < 4 || numRam > 128) {
      Alert.alert('Lỗi nhập liệu', 'RAM phải nằm trong khoảng từ 4 đến 128 GB!');
      return;
    }
    if (isNaN(numStorage) || numStorage < 128 || numStorage > 4096) {
      Alert.alert('Lỗi nhập liệu', 'Ổ cứng (Storage) phải từ 128 đến 4096 GB!');
      return;
    }
    if (isNaN(numStock) || numStock < 0) {
      Alert.alert('Lỗi nhập liệu', 'Số lượng tồn kho không được âm!');
      return;
    }

    try {
      await addProduct({
        product_name: productName.trim(),
        brand: brand.trim(),
        category,
        cpu: cpu.trim(),
        ram: numRam,
        storage: numStorage,
        price: numPrice,
        stock: numStock,
        sold_quantity: numSold,
        is_featured: isFeatured,
      });

      Alert.alert('Thành công', 'Đã thêm sản phẩm mới thành công!', [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            navigation.navigate('StoreTab', { screen: 'StoreList' });
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu vào SQLite: ' + error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#F8F9FA' }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBox}>
          <Ionicons name="laptop-outline" size={64} color="#6200EE" />
          <Text style={styles.headerTitle}>Thêm máy tính mới</Text>
        </View>

        {/* Product Name */}
        <Text style={styles.label}>Tên sản phẩm *</Text>
        <View style={styles.inputBox}>
          <Ionicons name="create-outline" size={20} color="#757575" />
          <TextInput
            style={styles.input}
            placeholder="VD: MacBook Pro 14 M3"
            value={productName}
            onChangeText={setProductName}
          />
        </View>

        {/* Brand */}
        <Text style={styles.label}>Hãng sản xuất *</Text>
        <View style={styles.inputBox}>
          <Ionicons name="business-outline" size={20} color="#757575" />
          <TextInput
            style={styles.input}
            placeholder="VD: Apple, Dell, Asus, HP..."
            value={brand}
            onChangeText={setBrand}
          />
        </View>

        {/* Category Selection */}
        <Text style={styles.label}>Danh mục (Category) *</Text>
        <View style={styles.categoryRow}>
          {['Laptop', 'Desktop', 'Component'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, category === cat && styles.catBtnActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catBtnText, category === cat && styles.catBtnTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CPU */}
        <Text style={styles.label}>Vi xử lý (CPU) *</Text>
        <View style={styles.inputBox}>
          <Ionicons name="hardware-chip-outline" size={20} color="#757575" />
          <TextInput
            style={styles.input}
            placeholder="VD: Apple M3, Intel Core i7 13700H"
            value={cpu}
            onChangeText={setCpu}
          />
        </View>

        {/* RAM & Storage */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>RAM (4 → 128 GB) *</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="16"
                keyboardType="numeric"
                value={ram}
                onChangeText={setRam}
              />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Ổ cứng (128 → 4096 GB) *</Text>
            <View style={styles.inputBox}>
              <Ionicons name="save-outline" size={20} color="#757575" />
              <TextInput
                style={styles.input}
                placeholder="512"
                keyboardType="numeric"
                value={storage}
                onChangeText={setStorage}
              />
            </View>
          </View>
        </View>

        {/* Price & Stock */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Giá bán ($) *</Text>
            <View style={styles.inputBox}>
              <Ionicons name="pricetag-outline" size={20} color="#757575" />
              <TextInput
                style={styles.input}
                placeholder="1500"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Tồn kho *</Text>
            <View style={styles.inputBox}>
              <Ionicons name="cube-outline" size={20} color="#757575" />
              <TextInput
                style={styles.input}
                placeholder="10"
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
              />
            </View>
          </View>
        </View>

        {/* Sold Quantity */}
        <Text style={styles.label}>Số lượng đã bán</Text>
        <View style={styles.inputBox}>
          <Ionicons name="bar-chart-outline" size={20} color="#757575" />
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={soldQuantity}
            onChangeText={setSoldQuantity}
          />
        </View>

        {/* Is Featured Switch */}
        <View style={styles.switchBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="flame" size={24} color="#FF5722" style={{ marginRight: 8 }} />
            <Text style={styles.switchLabel}>Đánh dấu là Sản phẩm Nổi bật</Text>
          </View>
          <Switch value={isFeatured} onValueChange={setIsFeatured} trackColor={{ true: '#FF5722', false: '#CCC' }} />
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={22} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.saveBtnText}>Lưu sản phẩm</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
          <Ionicons name="close-circle" size={20} color="#757575" style={{ marginRight: 6 }} />
          <Text style={styles.cancelBtnText}>Hủy / Nhập lại</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  headerBox: { alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 10 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },
  row: { flexDirection: 'row' },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  catBtnActive: { backgroundColor: '#6200EE', borderColor: '#6200EE' },
  catBtnText: { color: '#555', fontWeight: '500' },
  catBtnTextActive: { color: '#FFF', fontWeight: 'bold' },
  switchBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  switchLabel: { fontSize: 15, fontWeight: '500', color: '#333' },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#6200EE',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    elevation: 3,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelBtnText: { color: '#757575', fontSize: 15 },
});
