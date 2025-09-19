#!/bin/bash

# Life Risk Calculator - Full Stack Setup Script
# This script sets up the unified frontend + backend application

echo "🚀 Setting up Life Risk Calculator - Full Stack Application"
echo "============================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the life-risk-app directory"
    exit 1
fi

echo ""
echo "📦 Installing Node.js dependencies..."
npm install

echo ""
echo "🐍 Installing Python dependencies..."
cd backend
pip3 install -r requirements.txt
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Start the Python backend: npm run dev:backend"
echo "2. Start the Next.js frontend: npm run dev"
echo "3. Or start both together: npm run dev:fullstack"
echo ""
echo "📚 Documentation:"
echo "- Main README: README.md"
echo "- System Status: docs/FINAL_SYSTEM_STATUS.md"
echo "- Frontend Guide: docs/FRONTEND_INTEGRATION_GUIDE.md"
echo ""
echo "🔬 Testing:"
echo "- Test backend: npm run test:backend"
echo "- Lint frontend: npm run lint"
echo ""
echo "🌐 Access:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:5000"
echo ""
echo "🎉 Ready to calculate mortality risk with real data!"
