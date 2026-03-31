#include "shamir.hpp"
#include "gf256.hpp"
#include <openssl/rand.h> // Replaced <random> with OpenSSL Secure RNG
#include <stdexcept>

std::vector<Share> Shamir::split(const std::vector<uint8_t>& secret, int k, int n) {
    if (k > n) throw std::invalid_argument("Threshold (k) cannot be greater than shares (n)");

    std::vector<Share> shares(n);
    for(int i=0; i<n; i++) {
        shares[i].x = (uint8_t)(i + 1); 
        shares[i].y.resize(secret.size());
    }

    for (size_t i = 0; i < secret.size(); i++) {
        std::vector<uint8_t> coeffs(k);
        coeffs[0] = secret[i]; 
        
        // 🚨 SECURITY FIX: Using Cryptographically Secure RNG
        for (int c = 1; c < k; c++) {
            if (RAND_bytes(&coeffs[c], 1) != 1) {
                throw std::runtime_error("OpenSSL RNG failed during share generation");
            }
        }

        for (int share_idx = 0; share_idx < n; share_idx++) {
            uint8_t x = shares[share_idx].x;
            uint8_t y = 0;
            for (int c = k - 1; c >= 0; c--) {
                y = GF256::mul(y, x);
                y = GF256::add(y, coeffs[c]);
            }
            shares[share_idx].y[i] = y;
        }
    }
    return shares;
}

std::vector<uint8_t> Shamir::combine(const std::vector<Share>& shares) {
    if (shares.empty()) return {};
    size_t secret_len = shares[0].y.size();
    std::vector<uint8_t> secret(secret_len);

    for (size_t i = 0; i < secret_len; i++) {
        uint8_t result = 0;
        for (size_t j = 0; j < shares.size(); j++) {
            uint8_t xj = shares[j].x;
            uint8_t yj = shares[j].y[i];
            
            uint8_t numerator = 1;
            uint8_t denominator = 1;

            for (size_t m = 0; m < shares.size(); m++) {
                if (j == m) continue;
                uint8_t xm = shares[m].x;
                numerator = GF256::mul(numerator, xm); 
                denominator = GF256::mul(denominator, GF256::sub(xj, xm));
            }

            uint8_t lagrange = GF256::mul(numerator, GF256::inv(denominator));
            result = GF256::add(result, GF256::mul(yj, lagrange));
        }
        secret[i] = result;
    }
    return secret;
}