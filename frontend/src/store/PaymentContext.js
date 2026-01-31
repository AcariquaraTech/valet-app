import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentContext = createContext();

export const usePayment = () => useContext(PaymentContext);

const STORAGE_KEY = 'paymentSettings';



export const PaymentProvider = ({ children }) => {
  const [mode, setMode] = useState();
  const [hourValue, setHourValue] = useState();
  const [dayValue, setDayValue] = useState();
  const [loading, setLoading] = useState(true);

  // Função para carregar configurações do AsyncStorage
  const loadPaymentSettings = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMode(parsed.mode ?? 'pago');
        setHourValue(parsed.hourValue ?? '10');
        setDayValue(parsed.dayValue ?? '50');
        Alert.alert('DEBUG', `Modo carregado: ${parsed.mode ?? 'pago'}\nHora: ${parsed.hourValue ?? '10'}\nDia: ${parsed.dayValue ?? '50'}`);
      } else {
        setMode('pago');
        setHourValue('10');
        setDayValue('50');
        Alert.alert('DEBUG', 'AsyncStorage vazio, usando valores padrão');
      }
    } catch (e) {
      setMode('pago');
      setHourValue('10');
      setDayValue('50');
      Alert.alert('ERRO', 'Erro ao ler AsyncStorage: ' + (e?.message || e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega ao montar
  useEffect(() => {
    loadPaymentSettings();
  }, [loadPaymentSettings]);

  // Expor função para forçar recarregamento externo (ex: após login)

  const [saving, setSaving] = useState(false);
  const saveSettings = async (newMode, newHourValue, newDayValue) => {
    setSaving(true);
    try {
      const data = { mode: newMode, hourValue: newHourValue, dayValue: newDayValue };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setMode(newMode);
      setHourValue(newHourValue);
      setDayValue(newDayValue);
    } catch (e) {
      alert('Erro ao salvar configurações de pagamento!');
    } finally {
      setSaving(false);
    }
  };

  // Só renderiza filhos quando terminar de carregar
  if (loading) return null;
  return (
    <PaymentContext.Provider value={{ mode, hourValue, dayValue, setMode, setHourValue, setDayValue, saveSettings, loading, saving, reloadPaymentSettings: loadPaymentSettings }}>
      {children}
    </PaymentContext.Provider>
  );
};
