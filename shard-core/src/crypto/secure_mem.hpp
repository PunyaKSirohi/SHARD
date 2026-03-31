#pragma once
#include <vector>
#include <cstring>
#include <cstdint>

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// SECURE MEMORY HANDLING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Helper to securely wipe memory (prevent compiler optimization)
inline void secure_wipe(void* ptr, size_t len) {
    volatile unsigned char* p = (volatile unsigned char*)ptr;
    while (len--) *p++ = 0;
}

// A wrapper for sensitive data (Keys) that wipes itself on destruction
struct SecureBuffer {
    std::vector<uint8_t> data;

    SecureBuffer(size_t size) : data(size) {}
    SecureBuffer(const std::vector<uint8_t>& d) : data(d) {}
    
    ~SecureBuffer() {
        if (!data.empty()) {
            secure_wipe(data.data(), data.size());
        }
    }
};