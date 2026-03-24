# Makefile for Rick Stack Backend

BUILD_DIR=bin
BINARY_NAME=rick-server

build:
	go build -o $(BUILD_DIR)/$(BINARY_NAME) main.go

run:
	go run main.go

test:
	go test ./...

clean:
	rm -rf $(BUILD_DIR)
	rm -f game.db game.db-shm game.db-wal

all: build
