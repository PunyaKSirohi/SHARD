#include "gf256.hpp"
#include <stdexcept>

uint8_t GF256::add(uint8_t a, uint8_t b) { return a ^ b; }
uint8_t GF256::sub(uint8_t a, uint8_t b) { return a ^ b; }

uint8_t GF256::mul(uint8_t a, uint8_t b) {
    uint8_t p = 0;
    for (int i = 0; i < 8; i++) {
        if (b & 1) p ^= a;
        bool hi_bit_set = (a & 0x80);
        a <<= 1;
        if (hi_bit_set) a ^= 0x1B; // Rijndael's irreducible polynomial
        b >>= 1;
    }
    return p;
}

uint8_t GF256::inv(uint8_t a) {
    if (a == 0) throw std::runtime_error("Divide by zero in GF256");
    for (int x = 1; x < 256; x++) {
        if (mul(a, (uint8_t)x) == 1) return x;
    }
    return 0;
}