#!/bin/bash
set -e

echo "Cleaning up node_modules and lock files..."
rm -rf node_modules
rm -f package-lock.json yarn.lock

echo "Installing dependencies..."
npm install

echo "Installing TypeScript and types..."
npm install --save-dev typescript @types/react @types/react-native @types/expo

echo "Adding Jest for testing..."
npm install --save-dev jest @testing-library/react-native

echo "Ensuring Expo modules are installed and correct for your SDK..."
npx expo install

echo "Clearing Expo/Metro cache..."
npx expo start -c

echo "Setup complete! You can now run your app with:"
echo "  npx expo start"
echo "To run tests: npm test"
echo "To check types: npx tsc --noEmit"

