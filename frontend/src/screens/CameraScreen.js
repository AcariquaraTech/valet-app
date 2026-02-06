import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../services/apiClient';

const CameraScreen = ({ navigation, route }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const { onPlateDetected } = route.params || {};

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        // Abre a câmera automaticamente ao entrar na tela
        openCamera();
      } else {
        Alert.alert(
          'Permissão Necessária',
          'Precisamos de acesso à câmera para escanear placas.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    })();
  }, []);

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('[CameraScreen] Foto capturada');
        setCapturedImage(asset.uri);

        const base64ForOcr = asset.base64;

        if (!base64ForOcr) {
          Alert.alert('Erro', 'Não foi possível ler a imagem para OCR.');
          navigation.goBack();
          return;
        }
        
        setProcessing(true);
        console.log('[CameraScreen] Enviando para OCR...');
        
        // Enviar para OCR
        const response = await apiClient.post('/ocr/recognize-plate', {
          image_base64: `data:image/jpeg;base64,${base64ForOcr}`,
        });

        const data = response.data || {};
        console.log('[CameraScreen] Resultado OCR:', data);

        if (data.plate) {
          Alert.alert(
            'Placa Detectada',
            `Placa: ${data.plate}\nConfiança: ${(data.confidence * 100).toFixed(1)}%`,
            [
              {
                text: 'Tentar Novamente',
                style: 'cancel',
                onPress: () => {
                  setCapturedImage(null);
                  setProcessing(false);
                  openCamera();
                },
              },
              {
                text: 'Usar Esta Placa',
                onPress: () => {
                  if (onPlateDetected) {
                    onPlateDetected(data.plate);
                  }
                  navigation.goBack();
                },
              },
            ]
          );
        } else {
          Alert.alert(
            'Placa Não Detectada',
            'Não foi possível identificar a placa. Tente novamente com melhor iluminação.',
            [
              {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
              {
                text: 'Tirar Outra Foto',
                onPress: () => {
                  setCapturedImage(null);
                  setProcessing(false);
                  openCamera();
                },
              },
            ]
          );
        }
        setProcessing(false);
      } else {
        // Usuário cancelou
        navigation.goBack();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Erro desconhecido';
      console.error('[CameraScreen] Erro ao processar foto:', errorMessage);
      Alert.alert(
        'Erro',
        'Erro ao processar imagem: ' + errorMessage,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Tentar Novamente',
            onPress: () => openCamera(),
          },
        ]
      );
      setProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Solicitando permissão...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Sem acesso à câmera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {capturedImage && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />
          {processing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingText}>Processando imagem...</Text>
            </View>
          )}
        </View>
      )}
      {!capturedImage && !processing && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.text}>Abrindo câmera...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    width: '100%',
  },
  preview: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default CameraScreen;
