#pragma once
#include <cstdint>

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// GALOIS FIELD (GF256) ARITHMETIC
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class GF256 {
public:
    static uint8_t add(uint8_t a, uint8_t b);
    static uint8_t sub(uint8_t a, uint8_t b);
    static uint8_t mul(uint8_t a, uint8_t b);
    static uint8_t inv(uint8_t a);
};