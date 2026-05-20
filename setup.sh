#!/bin/bash
# Quick Setup Script for Momentum

echo "🚀 Momentum Quick Setup"
echo "======================"

# 1. Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local no existe"
    echo "✅ Creando .env.local desde .env.example..."
    cp .env.example .env.local
    echo ""
    echo "⚠️  IMPORTANTE: Edita .env.local con tus credenciales:"
    echo "   - DATABASE_URL (PostgreSQL)"
    echo "   - NEXTAUTH_SECRET (generate: openssl rand -base64 32)"
    echo "   - Stripe keys"
    echo "   - Supabase credentials"
    echo ""
    exit 1
fi

# 2. Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.local; then
    echo "❌ DATABASE_URL no está en .env.local"
    echo "✅ Abre .env.local y configura tu PostgreSQL URL"
    exit 1
fi

echo "✅ .env.local existe"

# 3. Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# 4. Run Prisma migrations
echo "🗄️  Ejecutando migrations..."
npx prisma migrate dev --name init || true

# 5. Done
echo ""
echo "✅ Setup completado!"
echo "🏃 Ejecuta: npm run dev"
