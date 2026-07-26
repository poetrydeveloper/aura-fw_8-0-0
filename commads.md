docker compose down

# 2. Очищаем скомпилированную старую папку dist на хосте (она проброшена в волюм)
rm -rf ../services/core/dist

# 3. Поднимаем контур с полной очисткой кэша сборки образов
docker compose up -d --build --force-recreate

docker compose down
docker compose up -d --build --force-recreate




# 1. Жестко останавливаем и уничтожаем контейнеры стека aura-7
docker compose -f .aura/docker/docker-compose.yml down

# 2. УЛЬТИМАТИВНЫЙ ФИКС: Стираем виртуальный диск базы данных из памяти Docker Desktop
docker volume rm aura-7_aura7_mg_data 2>/dev/null || docker volume prune -f

# 3. Поднимаем контур с чистого листа на абсолютно новой, пустой базе данных
docker compose -f .aura/docker/docker-compose.yml up -d --build --force-recreate

docker compose down -v


