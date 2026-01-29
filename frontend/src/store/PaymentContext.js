import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentContext = createContext();

export const usePayment = () => useContext(PaymentContext);

const STORAGE_KEY = 'paymentSettings';

export const PaymentProvider = ({ children }) => {
  const [mode, setMode] = useState('pago'); // 'pago' ou 'gratuito'
  const [hourValue, setHourValue] = useState('10');
  const [dayValue, setDayValue] = useState('50');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setMode(parsed.mode || 'pago');
          setHourValue(parsed.hourValue || '10');
          setDayValue(parsed.dayValue || '50');
        }
      } catch (e) {
        // erro ao carregar
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveSettings = async (newMode, newHourValue, newDayValue) => {
    setMode(newMode);
    setHourValue(newHourValue);
    setDayValue(newDayValue);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mode: newMode, hourValue: newHourValue, dayValue: newDayValue })
    );
  };

  return (
    <PaymentContext.Provider value={{ mode, hourValue, dayValue, setMode, setHourValue, setDayValue, saveSettings, loading }}>
      {children}
    </PaymentContext.Provider>
  );
};
