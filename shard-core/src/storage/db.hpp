#pragma once

#include <string>
#include <vector>
#include <cstdint>
#include <optional>
#include <pqxx/pqxx>

struct VaultRecord {
    std::string vault_id;
    std::string name;
    std::string created_at;
    std::vector<uint8_t> ciphertext;
    std::vector<uint8_t> iv;
    std::vector<uint8_t> tag;
};

class Database {
private:
    std::string conn_string;

public:
    Database(const std::string& connection_string);
    void init_schema();
    void save_vault(const VaultRecord& record);
    std::optional<VaultRecord> retrieve_vault(const std::string& vault_id);
    std::vector<VaultRecord> list_vaults();
};