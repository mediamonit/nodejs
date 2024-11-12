# init.sh

# Kolory dla lepszej czytelności
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Inicjalizacja projektu Media Monitor...${NC}"

# Sprawdzenie czy Docker jest zainstalowany
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker nie jest zainstalowany. Proszę zainstalować Docker i spróbować ponownie.${NC}"
    exit 1
fi

# Sprawdzenie czy Docker Compose jest zainstalowany
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose nie jest zainstalowany. Proszę zainstalować Docker Compose i spróbować ponownie.${NC}"
    exit 1
fi

# Tworzenie struktury katalogów
echo -e "${YELLOW}Tworzenie struktury katalogów...${NC}"
mkdir -p backend/src/services backend/src/utils frontend/src nginx thumbnails

# Kopiowanie plików konfiguracyjnych
echo -e "${YELLOW}Kopiowanie plików konfiguracyjnych...${NC}"

# Tworzenie .env z przykładowych wartości
if [ ! -f .env ]; then
    echo -e "${YELLOW}Tworzenie pliku .env...${NC}"
    cp .env.example .env
fi

# Nadawanie uprawnień do wykonywania
chmod +x init.sh

# Budowanie i uruchamianie kontenerów
echo -e "${YELLOW}Budowanie i uruchamianie kontenerów Docker...${NC}"
docker-compose build
docker-compose up -d

# Sprawdzenie czy kontenery działają
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Projekt został pomyślnie zainicjowany!${NC}"
    echo -e "${GREEN}Frontend dostępny pod adresem: http://localhost:8080${NC}"
    echo -e "${GREEN}Backend dostępny pod adresem: http://localhost:3000${NC}"
else
    echo -e "${RED}Wystąpił błąd podczas uruchamiania kontenerów.${NC}"
    exit 1
fi

# Informacja o logach
echo -e "${YELLOW}Aby zobaczyć logi, użyj polecenia: docker-compose logs -f${NC}"
