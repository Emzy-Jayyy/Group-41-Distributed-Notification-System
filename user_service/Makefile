# 🚀 Docker shortcuts for User Service

dev:
	docker compose up --build

prod:
	docker compose -f docker-compose.prod.yml up -d --build

stop:
	docker compose down
	docker compose -f docker-compose.prod.yml down

logs:
	docker compose -f docker-compose.prod.yml logs -f user-service

rebuild:
	docker compose -f docker-compose.prod.yml up -d --build --force-recreate

