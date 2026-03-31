#include <iostream>
#include <cstdlib>
#include "api/routes.hpp"
#include "storage/db.hpp"

int main() {
    std::cout << "=================================================\n";
    std::cout << "S.H.A.R.D. API Server Starting...\n";
    std::cout << "=================================================\n";
    try {
        const char* db_uri_env = std::getenv("DB_URI");
        std::string db_uri = db_uri_env
            ? db_uri_env
            : "postgresql://shardadmin:shardsecret@localhost:5432/shard_vault";

        Database db(db_uri);
        db.init_schema();

        httplib::Server svr;
        register_routes(svr, db);

        std::cout << "[SERVER] Listening on http://0.0.0.0:8080\n";
        svr.listen("0.0.0.0", 8080);
    } catch (const std::exception& e) {
        std::cerr << "FATAL: " << e.what() << "\n";
        return 1;
    }
    return 0;
}