cmake_minimum_required(VERSION 3.16)
project(shard_server)
set(CMAKE_CXX_STANDARD 17)

find_package(OpenSSL REQUIRED)
find_library(PQXX_LIB pqxx REQUIRED)
find_library(PQ_LIB pq REQUIRED)

include_directories(src)

file(GLOB_RECURSE SOURCES
    src/main.cpp
    src/api/routes.cpp
    src/crypto/gf256.cpp
    src/crypto/shamir.cpp
    src/crypto/aes_gcm.cpp
    src/storage/db.cpp
    src/network/node_client.cpp
)

add_executable(shard_server ${SOURCES})

target_include_directories(shard_server PRIVATE src ${OPENSSL_INCLUDE_DIR})

target_link_libraries(shard_server
    OpenSSL::SSL
    OpenSSL::Crypto
    ${PQXX_LIB}
    ${PQ_LIB}
)