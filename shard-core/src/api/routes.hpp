#pragma once
#undef _WIN32_WINNT
#define _WIN32_WINNT 0x0A00
#include "../external/httplib.h"
#include "storage/db.hpp"
#include "crypto/aes_gcm.hpp"
#include "crypto/shamir.hpp"

void register_routes(httplib::Server& svr, Database& db);