PACKAGE_MANAGER = pnpm

# Install dependencies
install:
	$(PACKAGE_MANAGER) install

# Run the development server (Next.js)
dev:
	$(PACKAGE_MANAGER) dev


# Run Prisma generate (to generate Prisma client)
prisma:
	$(PACKAGE_MANAGER) prisma generate

# Run Prisma db push to update db as per prisma schema
prisma-push:
	npx prisma db push

# To see db on web
prisma-table:
	npx prisma studio

# Target to copy .env.prod to .env (for production)
copy-env-prod:
	@if [ ! -f .env.prod ]; then \
		echo ".env.prod does not exist!"; \
		exit 1; \
	fi
	cp .env.prod .env
	@echo "Copied .env.prod to .env"

# Target to copy .env.dev to .env (for development)
copy-env-local:
	@if [ ! -f .env.local ]; then \
		echo ".env.local does not exist!"; \
		exit 1; \
	fi
	cp .env.local .env
	@echo "Copied .env.local to .env"

# Docker compose up
docker-run:
	@command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Exiting."; exit 1; }
	@echo "Starting Docker containers with 'docker compose up'..."
	docker compose up

# Clean the build directory (e.g., delete `.next` folder)
clean:
	@echo "Cleaning the build directory..."
	@if [ -d ".next" ]; then \
		rm -rf .next; \
		echo "Deleted .next directory"; \
	else \
		echo ".next directory does not exist."; \
	fi

# Run all the steps: install, lint, and build
all: install lint build

# Default target to run when `make` is used without any argument
default: install dev
