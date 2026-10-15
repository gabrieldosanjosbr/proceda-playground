WRITER_DIR := ../writer

WRITER_COMPOSE := docker compose \
	--project-directory $(WRITER_DIR) \
	-f $(WRITER_DIR)/docker-compose.yaml

PLAYGROUND_COMPOSE := docker compose \
	-f docker-compose.yaml

VOLUME := proceda-runtime

.PHONY: up down restart build logs writer-up writer-down writer-logs volume

volume:
	@docker volume inspect $(VOLUME) >/dev/null 2>&1 || \
		docker volume create $(VOLUME)

writer-up: volume
	$(WRITER_COMPOSE) up -d

writer-down:
	$(WRITER_COMPOSE) down

build:
	$(PLAYGROUND_COMPOSE) build

up: writer-up
	$(PLAYGROUND_COMPOSE) up -d --build

down:
	$(PLAYGROUND_COMPOSE) down
	$(WRITER_COMPOSE) down

restart:
	$(PLAYGROUND_COMPOSE) restart

restart-all: down up

logs:
	$(PLAYGROUND_COMPOSE) logs -f

writer-logs:
	$(WRITER_COMPOSE) logs -f
