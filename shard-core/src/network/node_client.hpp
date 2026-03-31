#pragma once
#include <string>
#include <vector>
#include <cstdlib>
#include "crypto/shamir.hpp"

class NodeClient {
public:
    static bool send_share(const std::string& node_url,
                           const std::string& vault_id,
                           const Share& share);
    static Share get_share(const std::string& node_url,
                           const std::string& vault_id);
};

inline std::vector<std::string> get_node_urls() {
    const char* envkeys[5] = {"NODE_1","NODE_2","NODE_3","NODE_4","NODE_5"};
    const char* defaults[5] = {
        "http://localhost:5001",
        "http://localhost:5002",
        "http://localhost:5003",
        "http://localhost:5004",
        "http://localhost:5005"
    };
    std::vector<std::string> urls;
    for (int i = 0; i < 5; i++) {
        const char* v = std::getenv(envkeys[i]);
        urls.push_back(v ? v : defaults[i]);
    }
    return urls;
}

static const std::vector<std::string> NODE_URLS = get_node_urls();