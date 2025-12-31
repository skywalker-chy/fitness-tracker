import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BillRecognitionResult, recognizeFromText } from '@/services/ai-recognition';
import { useRouter } from 'expo-router';
import { Sparkles, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuickInputScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BillRecognitionResult | null>(null);

  const handleRecognize = async () => {
    if (!inputText.trim()) {
      Alert.alert('提示', '请输入运动信息');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const recognized = await recognizeFromText(inputText);
      if (recognized) {
        setResult(recognized);
      } else {
        Alert.alert('识别失败', '无法识别运动信息，请重新输入');
      }
    } catch (error) {
      Alert.alert('错误', '识别过程中出错');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (result) {
      // 跳转到添加运动记录页面，并携带预填数据
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

  const examples = [
    '今天跑步30分钟',
    '做了一小时力量训练',
    '游泳45分钟',
    '瑜伽课60分钟',
    '骑车上班20分钟',
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>快速输入</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.inputCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            输入运动描述，AI 将自动识别
          </Text>
          <TextInput
            style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="例如：今天跑步30分钟"
            placeholderTextColor={colors.textSecondary}
            multiline
            value={inputText}
            onChangeText={setInputText}
          />

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

        {/* 示例 */}
        <View style={styles.examplesSection}>
          <Text style={[styles.examplesTitle, { color: colors.textSecondary }]}>
            示例输入：
          </Text>
          <View style={styles.examplesWrap}>
            {examples.map((example, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.exampleItem, { backgroundColor: colors.card }]}
                onPress={() => setInputText(example)}
              >
                <Text style={[styles.exampleText, { color: colors.text }]}>{example}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>置信度</Text>
              <Text style={[styles.resultValue, { color: colors.textSecondary }]}>
                {(result.confidence * 100).toFixed(0)}%
              </Text>
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
  inputCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  inputLabel: { fontSize: 14, marginBottom: 12 },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
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
  examplesSection: { marginBottom: 20 },
  examplesTitle: { fontSize: 14, marginBottom: 8 },
  examplesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  exampleItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  exampleText: { fontSize: 13 },
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
