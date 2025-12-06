#!/bin/bash

echo "🏥 ZamaHealth Backend Setup"
echo "========================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js >= 18"
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python >= 3.9"
    exit 1
fi
echo "✅ Python $(python3 --version)"

# Install Node dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Create .env if not exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration"
fi

# Create ml directory
echo ""
echo "📂 Setting up ML model directory..."
mkdir -p ml

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy trained model: cp -r ../zama_healthshield/server ml/"
echo "2. Edit .env file with your configuration"
echo "3. Run: npm start"
