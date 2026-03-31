FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    build-essential cmake \
    libssl-dev libpqxx-dev libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN cmake -B build -DCMAKE_BUILD_TYPE=Release && \
    cmake --build build --target shard_server

EXPOSE 8080
CMD ["./build/shard_server"]