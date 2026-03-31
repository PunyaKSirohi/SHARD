#include "aes_gcm.hpp"
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/err.h>
#include <stdexcept>
#include <iostream>

SecureBuffer AesGcm::generate_key() {
    SecureBuffer key(32); // 256 bits
    if (RAND_bytes(key.data.data(), 32) != 1) {
        throw std::runtime_error("OpenSSL RNG failed");
    }
    return key;
}

EncryptedData AesGcm::encrypt(const SecureBuffer& key, const std::string& plaintext) {
    EncryptedData result;
    result.iv.resize(12); // Standard GCM IV size
    
    // 1. Generate Random IV
    if (RAND_bytes(result.iv.data(), 12) != 1) 
        throw std::runtime_error("Failed to generate IV");

    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    if (!ctx) throw std::runtime_error("Failed to create OpenSSL context");

    // 2. Initialize Encryption
    if (1 != EVP_EncryptInit_ex(ctx, EVP_aes_256_gcm(), NULL, NULL, NULL))
        throw std::runtime_error("Encryption init failed");

    if (1 != EVP_EncryptInit_ex(ctx, NULL, NULL, key.data.data(), result.iv.data()))
        throw std::runtime_error("Encryption key/IV setup failed");

    // 3. Encrypt Data
    result.ciphertext.resize(plaintext.size() + 16); // Allocate enough space
    int out_len = 0;
    int ciphertext_len = 0;

    if (1 != EVP_EncryptUpdate(ctx, result.ciphertext.data(), &out_len, 
                              (const unsigned char*)plaintext.data(), plaintext.size())) {
        throw std::runtime_error("Encryption update failed");
    }
    ciphertext_len = out_len;

    // 4. Finalize
    if (1 != EVP_EncryptFinal_ex(ctx, result.ciphertext.data() + out_len, &out_len)) {
        throw std::runtime_error("Encryption final failed");
    }
    ciphertext_len += out_len;
    result.ciphertext.resize(ciphertext_len); // Shrink to actual size

    // 5. Get the Auth Tag
    result.tag.resize(16);
    if (1 != EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_GET_TAG, 16, result.tag.data())) {
        throw std::runtime_error("Failed to get GCM tag");
    }

    EVP_CIPHER_CTX_free(ctx);
    return result;
}

std::string AesGcm::decrypt(const SecureBuffer& key, const EncryptedData& data) {
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    if (!ctx) throw std::runtime_error("Failed to create OpenSSL context");

    // 1. Initialize Decryption
    if (!EVP_DecryptInit_ex(ctx, EVP_aes_256_gcm(), NULL, NULL, NULL))
        throw std::runtime_error("Decryption init failed");

    if (!EVP_DecryptInit_ex(ctx, NULL, NULL, key.data.data(), data.iv.data()))
        throw std::runtime_error("Decryption key/IV setup failed");

    // 2. Decrypt Data
    std::vector<uint8_t> plaintext_buf(data.ciphertext.size() + 16);
    int out_len = 0;
    int plaintext_len = 0;

    if (!EVP_DecryptUpdate(ctx, plaintext_buf.data(), &out_len, 
                          data.ciphertext.data(), data.ciphertext.size())) {
        throw std::runtime_error("Decryption update failed");
    }
    plaintext_len = out_len;

    // 3. Set Expected Tag (Critical for Security!)
    if (!EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_TAG, 16, (void*)data.tag.data())) {
        throw std::runtime_error("Failed to set GCM tag");
    }

    // 4. Finalize (Checks the Tag)
    int ret = EVP_DecryptFinal_ex(ctx, plaintext_buf.data() + out_len, &out_len);
    
    EVP_CIPHER_CTX_free(ctx);

    if (ret > 0) {
        plaintext_len += out_len;
        return std::string(plaintext_buf.begin(), plaintext_buf.begin() + plaintext_len);
    } else {
        throw std::runtime_error("Integrity Check Failed! Data was tampered with or wrong key.");
    }
}