import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BillRecognitionResult, recognizeFromImage } from '@/services/ai-recognition';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, Image as ImageIcon, Sparkles, Upload, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CameraInputScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [image, setImage] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BillRecognitionResult | null>(null);

  const pickImage = async () => {
    try {
      // 请求权限
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('权限被拒绝', '需要访问相册权限');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setResult(null);
      }
    } catch (error) {
      console.error('[Camera] Pick image error:', error);
      Alert.alert('错误', '选择图片失败');
    }
  };

  const takePhoto = async () => {
    try {
      // 请求相机权限
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限被拒绝', '需要相机权限');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setResult(null);
      }
    } catch (error) {
      console.error('[Camera] Take photo error:', error);
      // 在 web 上可能不支持相机
      if (Platform.OS === 'web') {
        Alert.alert('提示', '网页版暂不支持拍照，请使用上传图片功能');
      } else {
        Alert.alert('错误', '拍照失败');
      }
    }
  };

  const handleRecognize = async () => {
    // 如果有手动输入的文字，优先使用
    const textToRecognize = manualText.trim() || '运动图片';
    
    if (!image && !manualText.trim()) {
      Alert.alert('提示', '请先选择图片或输入运动信息');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      // 由于目前没有 OCR API，使用手动输入的文字进行识别
      // 实际项目中应该调用 OCR API 识别图片中的文字
      const recognized = await recognizeFromImage(textToRecognize);
      if (recognized) {
        setResult(recognized);
      } else {
        Alert.alert('识别失败', '无法识别运动信息');
      }
    } catch (error) {
      Alert.alert('错误', '识别过程中出错');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (result) {
      router.push({
        pathname: '/add-transaction',
        params: {
          prefill: JSON.stringify({
            type: result.type,
            amount: result.amount.toString(),
            category: result.category,
            description: result.description,
          }),
        },
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>拍照识别</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* 图片选择区域 */}
        <View style={[styles.imageSection, { backgroundColor: colors.card }]}>
          {image ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImage}
                onPress={() => setImage(null)}
              >
                <X size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <ImageIcon size={48} color={colors.textSecondary} />
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                选择或拍摄运动截图
              </Text>
            </View>
          )}

          <View style={styles.imageButtons}>
            <TouchableOpacity
              style={[styles.imageBtn, { backgroundColor: colors.primaryLight }]}
              onPress={takePhoto}
            >
              <Camera size={20} color={colors.primary} />
              <Text style={[styles.imageBtnText, { color: colors.primary }]}>拍照</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.imageBtn, { backgroundColor: colors.primaryLight }]}
              onPress={pickImage}
            >
              <Upload size={20} color={colors.primary} />
              <Text style={[styles.imageBtnText, { color: colors.primary }]}>相册</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 手动输入补充 */}
        <View style={[styles.manualSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.manualLabel, { color: colors.textSecondary }]}>
            输入图片中的运动信息（可选）
          </Text>
          <TextInput
            style={[styles.manualInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="例如：跑步 30分钟"
            placeholderTextColor={colors.textSecondary}
            value={manualText}
            onChangeText={setManualText}
          />
          <Text style={[styles.manualHint, { color: colors.textSecondary }]}>
            💡 提示：目前 OCR 功能开发中，请手动输入图片中的运动信息
          </Text>

          <TouchableOpacity
            style={[styles.recognizeBtn, { backgroundColor: colors.primary }]}
            onPress={handleRecognize}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Sparkles size={20} color="#FFF" />
                <Text style={styles.recognizeBtnText}>智能识别</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 识别结果 */}
        {result && (
          <View style={[styles.resultCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.resultTitle, { color: colors.text }]}>识别结果</Text>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>类型</Text>
              <Text style={[styles.resultValue, { color: colors.primary }]}>
                {result.type === 'income' ? '训练部位' : '运动类型'}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>时长</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{result.amount} 分钟</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>类别</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{result.category}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>描述</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{result.description}</Text>
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmBtnText}>确认并记录</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 18, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 20 },
  imageSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  imagePlaceholder: {
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 14, marginTop: 8 },
  imagePreview: {
    position: 'relative',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  imageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  imageBtnText: { fontSize: 14, fontWeight: '500' },
  manualSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  manualLabel: { fontSize: 14, marginBottom: 8 },
  manualInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  manualHint: { fontSize: 12, marginTop: 8 },
  recognizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  recognizeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  resultCard: {
    borderRadius: 16,
    padding: 16,
  },
  resultTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resultLabel: { fontSize: 14 },
  resultValue: { fontSize: 14, fontWeight: '500' },
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
