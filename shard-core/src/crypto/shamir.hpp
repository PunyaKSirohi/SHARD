#pragma once
#include <vector>
#include <cstdint>
#include "secure_mem.hpp"

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// SHAMIR'S SECRET SHARING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

struct Share {
    uint8_t x; // Node ID
    std::vector<uint8_t> y; // Share Value
};

class Shamir {
public:
    static std::vector<Share> split(const std::vector<uint8_t>& secret, int k, int n);
    static std::vector<uint8_t> combine(const std::vector<Share>& shares);
};