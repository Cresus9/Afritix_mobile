#!/bin/bash

# This script helps manage service account keys securely
# It can encrypt/decrypt keys for secure storage and usage

# Check if the google-service-account.json file exists
if [ ! -f "google-service-account.json" ]; then
  echo "Error: google-service-account.json not found!"
  echo "Please place your service account key file in the project root directory."
  exit 1
fi

# Function to encrypt the service account key
encrypt_key() {
  if [ -z "$1" ]; then
    echo "Error: Please provide a password for encryption"
    exit 1
  fi
  
  echo "Encrypting service account key..."
  openssl enc -aes-256-cbc -salt -in google-service-account.json -out google-service-account.json.enc -k "$1"
  
  if [ $? -eq 0 ]; then
    echo "Encryption successful!"
    echo "The encrypted file is: google-service-account.json.enc"
    echo "You can now safely commit this encrypted file to version control."
    echo "IMPORTANT: Remember your password! You'll need it to decrypt the file."
    
    # Ask if the user wants to delete the original file
    read -p "Do you want to delete the original unencrypted file? (y/n): " delete_original
    if [ "$delete_original" = "y" ]; then
      rm google-service-account.json
      echo "Original file deleted."
    else
      echo "Original file kept. Make sure not to commit it to version control!"
    fi
  else
    echo "Encryption failed!"
  fi
}

# Function to decrypt the service account key
decrypt_key() {
  if [ ! -f "google-service-account.json.enc" ]; then
    echo "Error: Encrypted file google-service-account.json.enc not found!"
    exit 1
  fi
  
  if [ -z "$1" ]; then
    echo "Error: Please provide the decryption password"
    exit 1
  fi
  
  echo "Decrypting service account key..."
  openssl enc -d -aes-256-cbc -in google-service-account.json.enc -out google-service-account.json -k "$1"
  
  if [ $? -eq 0 ]; then
    echo "Decryption successful!"
    echo "The decrypted file is: google-service-account.json"
    echo "IMPORTANT: This file contains sensitive information. Do not commit it to version control!"
  else
    echo "Decryption failed! Check if the password is correct."
  fi
}

# Main script logic
case "$1" in
  encrypt)
    encrypt_key "$2"
    ;;
  decrypt)
    decrypt_key "$2"
    ;;
  *)
    echo "Usage: $0 {encrypt|decrypt} password"
    echo ""
    echo "Examples:"
    echo "  $0 encrypt mySecurePassword  # Encrypts the key file"
    echo "  $0 decrypt mySecurePassword  # Decrypts the key file"
    exit 1
    ;;
esac

exit 0