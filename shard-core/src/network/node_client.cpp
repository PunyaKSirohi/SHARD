#include "network/node_client.hpp"
#undef _WIN32_WINNT
#define _WIN32_WINNT 0x0A00
#include "api/httplib.h"
#include <sstream>
#include <stdexcept>
#include <iomanip>

static std::string to_hex(const std::vector<uint8_t>& data) {
    std::ostringstream oss;
    for (auto b : data)
        oss << std::hex << std::setw(2) << std::setfill('0') << (int)b;
    return oss.str();
}

static std::vector<uint8_t> from_hex(const std::string& hex) {
    std::vector<uint8_t> out;
    for (size_t i = 0; i + 1 < hex.size(); i += 2)
        out.push_back((uint8_t)std::stoi(hex.substr(i, 2), nullptr, 16));
    return out;
}

// Parse host and port from URL like "http://localhost:5001"
static std::pair<std::string, int> parse_url(const std::string& url) {
    auto host_start = url.find("://") + 3;
    auto colon = url.rfind(':');
    std::string host = url.substr(host_start, colon - host_start);
    int port = std::stoi(url.substr(colon + 1));
    return {host, port};
}

bool NodeClient::send_share(const std::string& node_url,
                             const std::string& vault_id,
                             const Share& share) {
    auto [host, port] = parse_url(node_url);
    httplib::Client cli(host, port);
    cli.set_connection_timeout(3);

    std::ostringstream body;
    body << "{\"vault_id\":\"" << vault_id << "\","
         << "\"share\":{\"x\":" << (int)share.x
         << ",\"y\":\"" << to_hex(share.y) << "\"}}";

    auto res = cli.Post("/share", body.str(), "application/json");
    return res && res->status == 201;
}

Share NodeClient::get_share(const std::string& node_url,
                             const std::string& vault_id) {
    auto [host, port] = parse_url(node_url);
    httplib::Client cli(host, port);
    cli.set_connection_timeout(3);

    auto res = cli.Get("/share/" + vault_id);
    if (!res || res->status != 200)
        throw std::runtime_error("Node unreachable: " + node_url);

    // Parse {"share":{"x":N,"y":"hex"}}
    auto& body = res->body;
    auto xpos = body.find("\"x\":") + 4;
    auto xend = body.find_first_of(",}", xpos);
    uint8_t x = (uint8_t)std::stoi(body.substr(xpos, xend - xpos));

    auto ypos = body.find("\"y\":\"") + 5;
    auto yend = body.find("\"", ypos);
    std::string yhex = body.substr(ypos, yend - ypos);

    Share s;
    s.x = x;
    s.y = from_hex(yhex);
    return s;
}