#include "api/routes.hpp"
#include "network/node_client.hpp"
#include <iostream>
#include <sstream>
#include <iomanip>

static void add_cors(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
}

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

void register_routes(httplib::Server& svr, Database& db) {

    svr.Options(".*", [](const httplib::Request&, httplib::Response& res) {
        add_cors(res);
        res.status = 204;
    });

    // POST /api/vault/seal
    svr.Post("/api/vault/seal", [&db](const httplib::Request& req, httplib::Response& res) {
        add_cors(res);
        try {
            auto body = req.body;
            auto extract = [&](const std::string& key) -> std::string {
                std::string search = "\"" + key + "\":\"";
                auto pos = body.find(search);
                if (pos == std::string::npos) return "";
                pos += search.size();
                return body.substr(pos, body.find("\"", pos) - pos);
            };

            std::string vault_id = extract("vault_id");
            std::string secret   = extract("secret");
            std::string name     = extract("name");  // optional, empty string if not provided

            if (vault_id.empty() || secret.empty()) {
                res.status = 400;
                res.set_content("{\"message\":\"Missing vault_id or secret\"}", "application/json");
                return;
            }

            SecureBuffer master_key = AesGcm::generate_key();
            EncryptedData enc = AesGcm::encrypt(master_key, secret);

            VaultRecord record;
            record.vault_id   = vault_id;
            record.name       = name;
            record.ciphertext = enc.ciphertext;
            record.iv         = enc.iv;
            record.tag        = enc.tag;
            db.save_vault(record);

            auto shares = Shamir::split(master_key.data, 3, 5);

            int distributed = 0;
            const auto node_urls = get_node_urls();
            for (size_t i = 0; i < node_urls.size() && i < shares.size(); i++) {
                if (NodeClient::send_share(node_urls[i], vault_id, shares[i])) {
                    distributed++;
                } else {
                    std::cerr << "[SEAL] Share " << i+1 << " -> " << node_urls[i] << " FAILED\n";
                }
            }

            if (distributed < 3) {
                res.status = 503;
                res.set_content("{\"message\":\"Not enough nodes available\"}", "application/json");
                return;
            }

            std::ostringstream json;
            json << "{\"vault_id\":\"" << vault_id
                 << "\",\"status\":\"sealed\""
                 << ",\"nodes_written\":" << distributed << "}";
            res.status = 200;
            res.set_content(json.str(), "application/json");

        } catch (const std::exception& e) {
            res.status = 500;
            res.set_content(std::string("{\"message\":\"") + e.what() + "\"}", "application/json");
        }
    });

    // POST /api/vault/unseal
    svr.Post("/api/vault/unseal", [&db](const httplib::Request& req, httplib::Response& res) {
        add_cors(res);
        try {
            auto body = req.body;
            auto extract = [&](const std::string& key) -> std::string {
                std::string search = "\"" + key + "\":\"";
                auto pos = body.find(search);
                if (pos == std::string::npos) return "";
                pos += search.size();
                return body.substr(pos, body.find("\"", pos) - pos);
            };

            std::string vault_id = extract("vault_id");
            if (vault_id.empty()) {
                res.status = 400;
                res.set_content("{\"message\":\"Missing vault_id\"}", "application/json");
                return;
            }

            const auto node_urls = get_node_urls();
            std::vector<Share> shares;
            for (const auto& url : node_urls) {
                if (shares.size() >= 3) break;
                try {
                    shares.push_back(NodeClient::get_share(url, vault_id));
                } catch (...) {
                    std::cerr << "[UNSEAL] Node unreachable: " << url << "\n";
                }
            }

            if (shares.size() < 3) {
                res.status = 503;
                res.set_content("{\"message\":\"Not enough shares retrieved\"}", "application/json");
                return;
            }

            auto raw_key = Shamir::combine(shares);
            SecureBuffer master_key(raw_key);

            auto record = db.retrieve_vault(vault_id);
            if (!record) {
                res.status = 404;
                res.set_content("{\"message\":\"Vault not found\"}", "application/json");
                return;
            }

            EncryptedData enc;
            enc.ciphertext = record->ciphertext;
            enc.iv         = record->iv;
            enc.tag        = record->tag;

            std::string plaintext = AesGcm::decrypt(master_key, enc);

            std::ostringstream json;
            json << "{\"vault_id\":\"" << vault_id
                 << "\",\"secret\":\"" << plaintext
                 << "\",\"status\":\"unsealed\"}";
            res.status = 200;
            res.set_content(json.str(), "application/json");

        } catch (const std::exception& e) {
            res.status = 500;
            res.set_content(std::string("{\"message\":\"") + e.what() + "\"}", "application/json");
        }
    });

    // GET /api/vault/list
    svr.Get("/api/vault/list", [&db](const httplib::Request&, httplib::Response& res) {
        add_cors(res);
        try {
            auto records = db.list_vaults();
            std::ostringstream json;
            json << "{\"vaults\":[";
            for (size_t i = 0; i < records.size(); i++) {
                if (i) json << ",";
                json << "{\"vault_id\":\"" << records[i].vault_id
                     << "\",\"name\":\"" << records[i].name
                     << "\",\"created_at\":\"" << records[i].created_at << "\"}";
            }
            json << "]}";
            res.status = 200;
            res.set_content(json.str(), "application/json");
        } catch (const std::exception& e) {
            res.status = 500;
            res.set_content(std::string("{\"message\":\"") + e.what() + "\"}", "application/json");
        }
    });

    svr.Options("/api/vault/list", [](const httplib::Request&, httplib::Response& res) {
        add_cors(res);
        res.status = 204;
    });
}