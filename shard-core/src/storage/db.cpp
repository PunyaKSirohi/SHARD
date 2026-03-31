#include "db.hpp"
#include <iostream>
#include <stdexcept>
#include <sstream>
#include <iomanip>

Database::Database(const std::string& connection_string) : conn_string(connection_string) {}

void Database::init_schema() {
    try {
        pqxx::connection C(conn_string);
        pqxx::work W(C);
        W.exec(
            "CREATE TABLE IF NOT EXISTS vaults ("
            "vault_id VARCHAR(36) PRIMARY KEY, "
            "name VARCHAR(128) DEFAULT '' NOT NULL, "
            "ciphertext BYTEA NOT NULL, "
            "iv BYTEA NOT NULL, "
            "tag BYTEA NOT NULL, "
            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
            ");"
            "ALTER TABLE vaults ADD COLUMN IF NOT EXISTS name VARCHAR(128) DEFAULT '' NOT NULL;"
        );
        W.commit();
        std::cout << "[DB] Schema initialized successfully.\n";
    } catch (const std::exception& e) {
        std::cerr << "[DB Error] init_schema: " << e.what() << "\n";
        throw;
    }
}

static std::string to_bytea_literal(const std::vector<uint8_t>& data) {
    std::ostringstream oss;
    oss << "\\x";
    for (auto b : data)
        oss << std::hex << std::setw(2) << std::setfill('0') << (int)b;
    return oss.str();
}

static std::vector<uint8_t> from_binarystring(const pqxx::binarystring& bs) {
    return std::vector<uint8_t>(
        reinterpret_cast<const uint8_t*>(bs.data()),
        reinterpret_cast<const uint8_t*>(bs.data()) + bs.size()
    );
}

void Database::save_vault(const VaultRecord& record) {
    try {
        pqxx::connection C(conn_string);
        pqxx::work W(C);
        W.exec_params(
            "INSERT INTO vaults (vault_id, name, ciphertext, iv, tag) VALUES ($1, $2, $3, $4, $5)"
            " ON CONFLICT (vault_id) DO UPDATE SET name=EXCLUDED.name,"
            " ciphertext=EXCLUDED.ciphertext, iv=EXCLUDED.iv, tag=EXCLUDED.tag",
            record.vault_id,
            record.name,
            to_bytea_literal(record.ciphertext),
            to_bytea_literal(record.iv),
            to_bytea_literal(record.tag)
        );
        W.commit();
        std::cout << "[DB] Vault '" << record.vault_id << "' saved.\n";
    } catch (const std::exception& e) {
        std::cerr << "[DB Error] save_vault: " << e.what() << "\n";
        throw;
    }
}

std::optional<VaultRecord> Database::retrieve_vault(const std::string& vault_id) {
    try {
        pqxx::connection C(conn_string);
        pqxx::work W(C);
        pqxx::result R = W.exec_params(
            "SELECT name, ciphertext, iv, tag FROM vaults WHERE vault_id = $1",
            vault_id
        );
        W.commit();
        if (R.empty()) return std::nullopt;

        VaultRecord record;
        record.vault_id   = vault_id;
        record.name       = R[0]["name"].as<std::string>();
        record.ciphertext = from_binarystring(pqxx::binarystring(R[0]["ciphertext"]));
        record.iv         = from_binarystring(pqxx::binarystring(R[0]["iv"]));
        record.tag        = from_binarystring(pqxx::binarystring(R[0]["tag"]));

        return record;
    } catch (const std::exception& e) {
        std::cerr << "[DB Error] retrieve_vault: " << e.what() << "\n";
        throw;
    }
}

std::vector<VaultRecord> Database::list_vaults() {
    try {
        pqxx::connection C(conn_string);
        pqxx::work W(C);
        pqxx::result R = W.exec("SELECT vault_id, name, created_at FROM vaults ORDER BY created_at DESC");
        W.commit();
        std::vector<VaultRecord> records;
        for (auto row : R) {
            VaultRecord r;
            r.vault_id   = row["vault_id"].as<std::string>();
            r.name       = row["name"].as<std::string>();
            r.created_at = row["created_at"].as<std::string>();
            records.push_back(r);
        }
        return records;
    } catch (const std::exception& e) {
        std::cerr << "[DB Error] list_vaults: " << e.what() << "\n";
        throw;
    }
}