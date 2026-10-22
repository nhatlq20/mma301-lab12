import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProductById, deleteProduct, updateProduct } from '../database/db';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);

  // States cho modal Chỉnh sửa (Edit)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editSold, setEditSold] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);

  const fetchDetail = async () => {
    try {
      const data = await getProductById(productId);
      if (data) {
        setProduct(data);
        // Điền sẵn dữ liệu form edit (Pre-fill)
        setEditName(data.product_name);
        setEditPrice(data.price.toString());
        setEditStock(data.stock.toString());
        setEditSold(data.sold_quantity.toString());
        setEditFeatured(data.is_featured === 1);
      }
    } catch (error) {
      console.error('Lỗi lấy chi tiết:', error);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [productId]);

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Đang tải thông tin...</Text>
      </View>
    );
  }

  // 3 Công thức tính toán theo Task 3
  const revenue = product.price * product.sold_quantity;
  const inventoryValue = product.price * product.stock;
  const totalUnits = product.stock + product.sold_quantity;

  // Xử lý Xóa (Delete)
  const handleDelete = () => {
    Alert.alert('Xác nhận xóa', 'Are you sure you want to delete this product?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(product.id);
            Alert.alert('Thành công', 'Đã xóa sản phẩm khỏi cơ sở dữ liệu!');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa sản phẩm: ' + error.message);
          }
        },
      },
    ]);
  };

  // Xử lý Cập nhật (Edit)
  const handleUpdate = async () => {
    if (!editName.trim() || !editPrice || !editStock) {
      Alert.alert('Lỗi', 'Tên, Giá và Tồn kho không được để trống!');
      return;
    }

    try {
      await updateProduct(product.id, {
        ...product,
        product_name: editName.trim(),
        price: parseFloat(editPrice),
        stock: parseInt(editStock, 10),
        sold_quantity: parseInt(editSold, 10) || 0,
        is_featured: editFeatured,
      });

      setIsEditModalVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật sản phẩm!');
      await fetchDetail();
    } catch (error) {
      Alert.alert('Lỗi cập nhật', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Info Card */}
      <View style={styles.headerCard}>
        <Ionicons name="desktop-outline" size={64} color="#6200EE" style={{ alignSelf: 'center' }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
          <Text style={styles.title}>{product.product_name}</Text>
          {product.is_featured === 1 && (
            <Ionicons name="flame" size={24} color="#FF5722" style={{ marginLeft: 8 }} />
          )}
        </View>
        <Text style={styles.subtitle}>
          {product.brand} • {product.category}
        </Text>
        <Text style={styles.priceTag}>${product.price.toLocaleString()}</Text>
      </View>

      {/* 3 Thẻ chỉ số tài chính (Task 3 Formulas) */}
      <Text style={styles.sectionTitle}>Chỉ số kinh doanh</Text>
      <View style={styles.kpiContainer}>
        <View style={[styles.kpiCard, { backgroundColor: '#E8F5E9' }]}>
          <Ionicons name="stats-chart-outline" size={24} color="#4CAF50" />
          <Text style={styles.kpiLabel}>Doanh thu (Revenue)</Text>
          <Text style={[styles.kpiValue, { color: '#2E7D32' }]}>${revenue.toLocaleString()}</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: '#EDE7F6' }]}>
          <Ionicons name="cube" size={24} color="#6200EE" />
          <Text style={styles.kpiLabel}>Giá trị kho (Inventory)</Text>
          <Text style={[styles.kpiValue, { color: '#6200EE' }]}>${inventoryValue.toLocaleString()}</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: '#FFF3E0' }]}>
          <Ionicons name="add-circle-outline" size={24} color="#FF9800" />
          <Text style={styles.kpiLabel}>Tổng máy nhập (Units)</Text>
          <Text style={[styles.kpiValue, { color: '#E65100' }]}>{totalUnits} máy</Text>
        </View>
      </View>

      {/* Chi tiết phần cứng */}
      <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
      <View style={styles.detailBox}>
        <View style={styles.detailRow}>
          <Ionicons name="hardware-chip" size={20} color="#6200EE" />
          <Text style={styles.detailLabel}>Vi xử lý (CPU):</Text>
          <Text style={styles.detailValue}>{product.cpu || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="flash-outline" size={20} color="#6200EE" />
          <Text style={styles.detailLabel}>RAM:</Text>
          <Text style={styles.detailValue}>{product.ram} GB</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="server-outline" size={20} color="#6200EE" />
          <Text style={styles.detailLabel}>Ổ cứng (Storage):</Text>
          <Text style={styles.detailValue}>{product.storage} GB</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={20} color="#6200EE" />
          <Text style={styles.detailLabel}>Tồn kho:</Text>
          <Text style={styles.detailValue}>{product.stock}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="bar-chart" size={20} color="#6200EE" />
          <Text style={styles.detailLabel}>Đã bán:</Text>
          <Text style={styles.detailValue}>{product.sold_quantity}</Text>
        </View>
      </View>

      {/* Nút Edit & Delete */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditModalVisible(true)}>
          <Ionicons name="create-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.btnText}>Chỉnh sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.btnText}>Xóa sản phẩm</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Chỉnh sửa nhanh */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cập nhật thông tin</Text>

            <Text style={styles.modalLabel}>Tên sản phẩm</Text>
            <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} />

            <Text style={styles.modalLabel}>Giá bán ($)</Text>
            <TextInput style={styles.modalInput} value={editPrice} onChangeText={setEditPrice} keyboardType="numeric" />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.modalLabel}>Tồn kho</Text>
                <TextInput style={styles.modalInput} value={editStock} onChangeText={setEditStock} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.modalLabel}>Đã bán</Text>
                <TextInput style={styles.modalInput} value={editSold} onChangeText={setEditSold} keyboardType="numeric" />
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 }}>
              <Text style={{ fontSize: 15 }}>Sản phẩm nổi bật (Featured)</Text>
              <Switch value={editFeatured} onValueChange={setEditFeatured} />
            </View>

            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#757575', marginRight: 8 }]} onPress={() => setIsEditModalVisible(false)}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#6200EE', flex: 2 }]} onPress={handleUpdate}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
  headerCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#757575', marginTop: 4 },
  priceTag: { fontSize: 24, fontWeight: 'bold', color: '#6200EE', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, marginTop: 8 },
  kpiContainer: { marginBottom: 16 },
  kpiCard: { padding: 14, borderRadius: 12, marginBottom: 8 },
  kpiLabel: { fontSize: 13, color: '#555', marginTop: 4 },
  kpiValue: { fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  detailBox: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  detailLabel: { marginLeft: 8, fontSize: 14, color: '#555', flex: 1 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  actionRow: { flexDirection: 'row', marginBottom: 40 },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#6200EE',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#B00020',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 14, textAlign: 'center' },
  modalLabel: { fontSize: 13, color: '#555', marginTop: 8, marginBottom: 4 },
  modalInput: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, fontSize: 15 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
});
