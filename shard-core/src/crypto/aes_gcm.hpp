#pragma once
#include <vector>
#include <string>
#include <cstdint>
#include "secure_mem.hpp"

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// AES-256-GCM WRAPPER (OpenSSL)
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

struct EncryptedData {
    std::vector<uint8_t> ciphertext;
    std::vector<uint8_t> iv;  // Initialization Vector (12 bytes)
    std::vector<uint8_t> tag; // Auth Tag (16 bytes)
};

class AesGcm {
public:
    // Generate a random 256-bit (32 byte) Master Key
    static SecureBuffer generate_key();

    // Encrypt plaintext using the Master Key
    static EncryptedData encrypt(const SecureBuffer& key, const std::string& plaintext);

    // Decrypt ciphertext using the Master Key
    // Throws std::runtime_error if the Tag doesn't match (Tampering detected!)
    static std::string decrypt(const SecureBuffer& key, const EncryptedData& data);
};