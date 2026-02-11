#!/bin/bash
# Script para compilar e instalar APP VALET no Android

cd "/e/TRABALHOS/Estacionamento/APP VALLET/frontend"

echo "📦 Compilando APP VALET para Android..."
echo "Aguarde - isso pode levar 5-10 minutos..."

npm run android -- --no-packager

if [ $? -eq 0 ]; then
  echo "✅ App compilado e instalado com sucesso!"
  
  # Iniciar app
  adb -s 192.168.0.33:38779 shell am start -n com.app.valet/.MainActivity
  
  echo "✅ App iniciado!"
  echo ""
  echo "📱 Verifique no smartphone:"
  echo "  - Primeira tela: Código da Chave"
  echo "  - Segunda tela: Login (deve ter chave pré-preenchida)"
else
  echo "❌ Erro ao compilar. Verifique logs."
fi
