import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BillRecognitionResult, createSpeechRecognition, recognizeFromVoice } from '@/services/ai-recognition';
import { useRouter } from 'expo-router';
import { Mic, MicOff, Sparkles, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VoiceInputScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BillRecognitionResult | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // 检查浏览器是否支持语音识别
    if (Platform.OS === 'web') {
      const recognition = createSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        
        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const text = result[0].transcript;
          setTranscript(text);
          
          if (result.isFinal) {
            setIsListening(false);
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error('[Speech] Error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            Alert.alert('权限被拒绝', '请允许使用麦克风');
          }
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
      } else {
        setIsSupported(false);
      }
    } else {
      setIsSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      Alert.alert('不支持', '当前浏览器不支持语音识别，请使用 Chrome 浏览器');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResult(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleRecognize = async () => {
    if (!transcript.trim()) {
      Alert.alert('提示', '请先进行语音输入');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const recognized = await recognizeFromVoice(transcript);
      if (recognized) {
        setResult(recognized);
      } else {
        Alert.alert('识别失败', '无法识别运动信息，请重新录入');
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
        <Text style={[styles.title, { color: colors.text }]}>语音记录</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {!isSupported ? (
          <View style={[styles.unsupportedCard, { backgroundColor: colors.card }]}>
            <MicOff size={48} color={colors.textSecondary} />
            <Text style={[styles.unsupportedText, { color: colors.text }]}>
              当前环境不支持语音识别
            </Text>
            <Text style={[styles.unsupportedHint, { color: colors.textSecondary }]}>
              请使用 Chrome 浏览器访问，或尝试快速输入功能
            </Text>
            <TouchableOpacity
              style={[styles.fallbackBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.replace('/quick-input')}
            >
              <Text style={styles.fallbackBtnText}>使用快速输入</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* 录音按钮 */}
            <View style={styles.micSection}>
              <TouchableOpacity
                style={[
                  styles.micButton,
                  { backgroundColor: isListening ? colors.expense : colors.primary },
                ]}
                onPress={toggleListening}
              >
                {isListening ? (
                  <View style={styles.micPulse}>
                    <Mic size={48} color="#FFF" />
                  </View>
                ) : (
                  <Mic size={48} color="#FFF" />
                )}
              </TouchableOpacity>
              <Text style={[styles.micHint, { color: colors.textSecondary }]}>
                {isListening ? '正在聆听...' : '点击开始语音输入'}
              </Text>
            </View>

            {/* 语音转文字结果 */}
            {transcript && (
              <View style={[styles.transcriptCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.transcriptLabel, { color: colors.textSecondary }]}>
                  识别到的语音：
                </Text>
                <Text style={[styles.transcriptText, { color: colors.text }]}>
                  "{transcript}"
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
                      <Text style={styles.recognizeBtnText}>智能识别运动</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

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
          </>
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
  unsupportedCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
  },
  unsupportedText: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  unsupportedHint: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  fallbackBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  fallbackBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  micSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micPulse: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micHint: { fontSize: 14, marginTop: 16 },
  transcriptCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  transcriptLabel: { fontSize: 14, marginBottom: 8 },
  transcriptText: { fontSize: 18, fontWeight: '500', lineHeight: 26 },
  recognizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
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
