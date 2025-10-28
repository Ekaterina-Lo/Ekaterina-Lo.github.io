
# Переменные
PROJECT_NAME = financial-literacy-game
VERSION = 1.2.0
DIST_DIR = dist
PORT = 8000

# Цвета для вывода
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
BLUE = \033[0;34m
NC = \033[0m # No Color

# Основные цели
.PHONY: all build dev clean deploy test lint help serve package

all: help

## Проверка проекта
check:
	@echo "$(YELLOW)🔍 Проверяем структуру проекта...$(NC)"
	
	@check_file() { \
		if [ -f "$$1" ]; then \
			echo "$(GREEN)✓ $$1$(NC)"; \
		else \
			echo "$(RED)✗ $$1 - отсутствует$(NC)"; \
			exit 1; \
		fi \
	}; \
	\
	check_file index.html; \
	check_file style.css; \
	check_file script.js; \
	check_file service-worker.js; \
	check_file manifest.json; \
	\
	echo "$(YELLOW)📁 Проверяем уровни...$(NC)"; \
	check_file levels/savings.json; \
	check_file levels/security.json; \
	check_file levels/goals.json; \
	\
	echo "$(GREEN)✅ Все файлы на месте!$(NC)"

## Сборка проекта для production
build: check
	@echo "$(YELLOW)🔨 Собираем проект в $(DIST_DIR)...$(NC)"
	@rm -rf $(DIST_DIR)
	@mkdir -p $(DIST_DIR)
	
	# Копируем основные файлы
	@cp index.html $(DIST_DIR)/
	@cp style.css $(DIST_DIR)/
	@cp script.js $(DIST_DIR)/
	@cp service-worker.js $(DIST_DIR)/
	@cp manifest.json $(DIST_DIR)/
	
	# Копируем уровни
	@mkdir -p $(DIST_DIR)/levels
	@cp levels/*.json $(DIST_DIR)/levels/
	
	# Копируем иконки если есть
	@if [ -f "icon-192.png" ]; then \
		cp icon-*.png $(DIST_DIR)/ 2>/dev/null || true; \
		echo "$(GREEN)✓ Иконки скопированы$(NC)"; \
	else \
		echo "$(YELLOW)⚠ Иконки не найдены, создаем базовые...$(NC)"; \
		$(MAKE) icons; \
		cp icon-*.png $(DIST_DIR)/ 2>/dev/null || true; \
	fi
	
	# Минификация CSS
	@if command -v uglifycss >/dev/null 2>&1; then \
		echo "$(YELLOW)📝 Минифицируем CSS...$(NC)"; \
		uglifycss $(DIST_DIR)/style.css > $(DIST_DIR)/style.min.css && \
		mv $(DIST_DIR)/style.min.css $(DIST_DIR)/style.css && \
		echo "$(GREEN)✓ CSS минифицирован$(NC)"; \
	else \
		echo "$(YELLOW)⚠ uglifycss не установлен, пропускаем минификацию CSS$(NC)"; \
	fi
	
	# Минификация JS
	@if command -v uglifyjs >/dev/null 2>&1; then \
		echo "$(YELLOW)📝 Минифицируем JS...$(NC)"; \
		uglifyjs $(DIST_DIR)/script.js --compress --mangle -o $(DIST_DIR)/script.min.js && \
		mv $(DIST_DIR)/script.min.js $(DIST_DIR)/script.js && \
		echo "$(GREEN)✓ JS минифицирован$(NC)"; \
	else \
		echo "$(YELLOW)⚠ uglifyjs не установлен, пропускаем минификацию JS$(NC)"; \
	fi
	
	@echo "$(GREEN)✅ Сборка завершена!$(NC)"
	@echo "$(YELLOW)📊 Размер папки $(DIST_DIR):$(NC)"
	@du -sh $(DIST_DIR)

## Запуск сервера разработки
dev: check
	@echo "$(YELLOW)🚀 Запускаем сервер разработки...$(NC)"
	@echo "$(GREEN)🌐 Откройте: http://localhost:$(PORT)$(NC)"
	@echo "$(YELLOW)⏹️  Для остановки: Ctrl+C$(NC)"
	@echo ""
	
	@if command -v python3 >/dev/null 2>&1; then \
		echo "$(BLUE)🐍 Используем Python 3$(NC)"; \
		python3 -m http.server $(PORT); \
	elif command -v python >/dev/null 2>&1; then \
		echo "$(BLUE)🐍 Используем Python$(NC)"; \
		python -m http.server $(PORT); \
	elif command -v php >/dev/null 2>&1; then \
		echo "$(BLUE)🐘 Используем PHP$(NC)"; \
		php -S localhost:$(PORT); \
	elif command -v node >/dev/null 2>&1; then \
		echo "$(BLUE)⬢ Используем Node.js$(NC)"; \
		npx http-server -p $(PORT) -c-1; \
	else \
		echo "$(RED)❌ Не найден HTTP-сервер$(NC)"; \
		echo "$(YELLOW)📦 Установите один из:$(NC)"; \
		echo "  - Python: python3 -m http.server $(PORT)"; \
		echo "  - PHP: php -S localhost:$(PORT)"; \
		echo "  - Node.js: npx http-server -p $(PORT)"; \
		exit 1; \
	fi

## Альтернативное имя для dev
serve: dev

## Очистка
clean:
	@echo "$(YELLOW)🧹 Очищаем...$(NC)"
	@rm -rf $(DIST_DIR)
	@echo "$(GREEN)✅ Очистка завершена$(NC)"

## Создание ZIP архива
package: build
	@echo "$(YELLOW)📦 Создаем архив...$(NC)"
	@zip -r $(PROJECT_NAME)-v$(VERSION).zip $(DIST_DIR)/* >/dev/null 2>&1 || \
	(echo "$(YELLOW)⚠ Используем альтернативный метод...$(NC)" && \
	 cd $(DIST_DIR) && zip -r ../$(PROJECT_NAME)-v$(VERSION).zip . && cd ..)
	@echo "$(GREEN)✅ Архив создан: $(PROJECT_NAME)-v$(VERSION).zip$(NC)"

## Деплой на GitHub Pages (требуется gh-pages)
deploy: build
	@echo "$(YELLOW)🚀 Деплой на GitHub Pages...$(NC)"
	
	@if command -v gh-pages >/dev/null 2>&1; then \
		gh-pages -d $(DIST_DIR); \
		echo "$(GREEN)✅ Деплой завершен!$(NC)"; \
	else \
		echo "$(RED)❌ gh-pages не установлен$(NC)"; \
		echo "$(YELLOW)📦 Установите: npm install -g gh-pages$(NC)"; \
		echo "$(YELLOW)📁 Или скопируйте содержимое $(DIST_DIR) в ветку gh-pages$(NC)"; \
	fi

## Проверка качества кода
lint: check
	@echo "$(YELLOW)🔍 Проверка качества кода...$(NC)"
	
	# Проверяем HTML
	@if command -v tidy >/dev/null 2>&1; then \
		echo "$(YELLOW)📄 Проверяем HTML...$(NC)"; \
		tidy -q -e index.html 2>/dev/null || echo "$(YELLOW)⚠ Есть предупреждения HTML$(NC)"; \
	else \
		echo "$(YELLOW)⚠ tidy не установлен, пропускаем проверку HTML$(NC)"; \
	fi
	
	# Проверяем JSON
	@echo "$(YELLOW)📋 Проверяем JSON...$(NC)";
	@for json_file in levels/*.json manifest.json; do \
		if python3 -c "import json; json.load(open('$$json_file'))" 2>/dev/null; then \
			echo "$(GREEN)✓ $$json_file - валидный$(NC)"; \
		else \
			echo "$(RED)✗ $$json_file - ошибка$(NC)"; \
		fi \
	done
	
	# Проверяем JavaScript
	@if command -v jshint >/dev/null 2>&1; then \
		echo "$(YELLOW)📜 Проверяем JS...$(NC)"; \
		jshint script.js service-worker.js || echo "$(YELLOW)⚠ Есть предупреждения JS$(NC)"; \
	else \
		echo "$(YELLOW)⚠ jshint не установлен, пропускаем проверку JS$(NC)"; \
	fi
	
	@echo "$(GREEN)✅ Проверка завершена$(NC)"

## Запуск тестов
test: check
	@echo "$(YELLOW)🧪 Запускаем тесты...$(NC)"
	
	# Проверяем базовую функциональность
	@if grep -q "Финансовая Грамотность" index.html; then \
		echo "$(GREEN)✓ Заголовок найден$(NC)"; \
	else \
		echo "$(RED)✗ Заголовок не найден$(NC)"; \
	fi
	
	@if grep -q "LEVELS" script.js; then \
		echo "$(GREEN)✓ Уровни загружены в JS$(NC)"; \
	else \
		echo "$(RED)✗ Уровни не найдены в JS$(NC)"; \
	fi
	
	@if grep -q "serviceWorker" script.js; then \
		echo "$(GREEN)✓ PWA функциональность есть$(NC)"; \
	else \
		echo "$(YELLOW)⚠ PWA функциональность не найдена$(NC)"; \
	fi
	
	# Проверяем вопросы в уровнях
	@for level in levels/*.json; do \
		questions=$$(python3 -c "import json; print(len(json.load(open('$$level'))['questions']))" 2>/dev/null || echo "0"); \
		if [ "$$questions" -gt 0 ]; then \
			echo "$(GREEN)✓ $$level: $$questions вопросов$(NC)"; \
		else \
			echo "$(RED)✗ $$level: нет вопросов$(NC)"; \
		fi \
	done
	
	@echo "$(GREEN)✅ Тесты завершены$(NC)"

## Создание иконок
icons:
	@echo "$(YELLOW)🎨 Создаем иконки для PWA...$(NC)"
	
	@if command -v convert >/dev/null 2>&1; then \
		echo "$(YELLOW)🖼️  Создаем PNG иконки...$(NC)"; \
		convert -size 192x192 xc:'#667eea' -font Arial -pointsize 80 -fill white -gravity center -annotate +0+0 "💰" icon-192.png 2>/dev/null && \
		convert -size 512x512 xc:'#667eea' -font Arial -pointsize 200 -fill white -gravity center -annotate +0+0 "💰" icon-512.png 2>/dev/null && \
		echo "$(GREEN)✓ PNG иконки созданы$(NC)"; \
	else \
		echo "$(YELLOW)📱 Создаем SVG иконки...$(NC)"; \
		cat > icon-192.svg << 'EOF' \
<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg"> \
  <rect width="192" height="192" fill="#667eea"/> \
  <text x="96" y="110" text-anchor="middle" fill="white" font-family="Arial" font-size="80">💰</text> \
</svg> \
EOF
		cat > icon-512.svg << 'EOF' \
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"> \
  <rect width="512" height="512" fill="#667eea"/> \
  <text x="256" y="290" text-anchor="middle" fill="white" font-family="Arial" font-size="200">💰</text> \
</svg> \
EOF
		echo "$(GREEN)✓ SVG иконки созданы$(NC)"; \
	fi

## Установка инструментов разработки
setup-tools:
	@echo "$(YELLOW)🛠️  Установка инструментов...$(NC)"
	
	@if command -v npm >/dev/null 2>&1; then \
		echo "$(YELLOW)📦 Устанавливаем Node.js инструменты...$(NC)"; \
		npm install -g uglify-js uglifycss jshint http-server gh-pages 2>/dev/null || \
		echo "$(YELLOW)⚠ Некоторые пакеты не установились$(NC)"; \
	else \
		echo "$(YELLOW)⚠ npm не найден$(NC)"; \
	fi
	
	@if command -v apt-get >/dev/null 2>&1; then \
		echo "$(YELLOW)📦 Устанавливаем системные пакеты...$(NC)"; \
		sudo apt-get install -y tidy python3 imagemagick 2>/dev/null || \
		echo "$(YELLOW)⚠ Некоторые пакеты не установились$(NC)"; \
	elif command -v yum >/dev/null 2>&1; then \
		echo "$(YELLOW)📦 Устанавливаем системные пакеты...$(NC)"; \
		sudo yum install -y tidy python3 imagemagick 2>/dev/null || \
		echo "$(YELLOW)⚠ Некоторые пакеты не установились$(NC)"; \
	elif command -v brew >/dev/null 2>&1; then \
		echo "$(YELLOW)📦 Устанавливаем через Homebrew...$(NC)"; \
		brew install tidy imagemagick 2>/dev/null || \
		echo "$(YELLOW)⚠ Некоторые пакеты не установились$(NC)"; \
	fi
	
	@echo "$(GREEN)✅ Установка завершена$(NC)"

## Информация о проекте
info:
	@echo "$(YELLOW)📊 Информация о проекте:$(NC)"
	@echo "Название: $(PROJECT_NAME)"
	@echo "Версия: $(VERSION)"
	@echo ""
	@echo "$(YELLOW)📁 Файлы:$(NC)"
	@find . -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.json" | grep -v node_modules | sort
	@echo ""
	@echo "$(YELLOW)📈 Статистика:$(NC)"
	@echo "HTML: $$(wc -l < index.html) строк"
	@echo "CSS: $$(wc -l < style.css) строк" 
	@echo "JS: $$(wc -l < script.js) строк"
	@for level in levels/*.json; do \
		questions=$$(python3 -c "import json; print(len(json.load(open('$$level'))['questions']))" 2>/dev/null || echo "0"); \
		echo "$$level: $$questions вопросов"; \
	done
	@echo ""
	@echo "$(YELLOW)🌐 Серверы:$(NC)"
	@if command -v python3 >/dev/null 2>&1; then echo "  ✓ Python3"; fi
	@if command -v php >/dev/null 2>&1; then echo "  ✓ PHP"; fi
	@if command -v node >/dev/null 2>&1; then echo "  ✓ Node.js"; fi

## Резервная копия
backup:
	@echo "$(YELLOW)💾 Создаем резервную копию...$(NC)"
	@tar -czf $(PROJECT_NAME)-backup-$$(date +%Y%m%d-%H%M%S).tar.gz \
		--exclude='node_modules' \
		--exclude='$(DIST_DIR)' \
		--exclude='*.tar.gz' \
		--exclude='*.zip' . 2>/dev/null || \
	(zip -r $(PROJECT_NAME)-backup-$$(date +%Y%m%d-%H%M%S).zip . -x "*.tar.gz" "$(DIST_DIR)/*" "node_modules/*" 2>/dev/null && \
	 echo "$(GREEN)✅ Резервная копия создана (ZIP)$(NC)")
	@echo "$(GREEN)✅ Резервная копия создана$(NC)"

## Показать справку
help:
	@echo "$(YELLOW)💰 Финансовая Грамотность - Игровой модуль$(NC)"
	@echo ""
	@echo "$(GREEN)🎯 Доступные команды:$(NC)"
	@echo "  $(YELLOW)make check$(NC)      - Проверить структуру проекта"
	@echo "  $(YELLOW)make dev$(NC)        - Запустить сервер разработки"
	@echo "  $(YELLOW)make serve$(NC)      - Алиас для dev"
	@echo "  $(YELLOW)make build$(NC)      - Собрать проект для production"
	@echo "  $(YELLOW)make clean$(NC)      - Очистить собранные файлы"
	@echo "  $(YELLOW)make package$(NC)    - Создать ZIP архив"
	@echo "  $(YELLOW)make deploy$(NC)     - Деплой на GitHub Pages"
	@echo "  $(YELLOW)make test$(NC)       - Запустить тесты"
	@echo "  $(YELLOW)make lint$(NC)       - Проверить качество кода"
	@echo "  $(YELLOW)make icons$(NC)      - Создать иконки"
	@echo "  $(YELLOW)make info$(NC)       - Показать информацию о проекте"
	@echo "  $(YELLOW)make backup$(NC)     - Создать резервную копию"
	@echo "  $(YELLOW)make help$(NC)       - Показать эту справку"
	@echo ""
	@echo "$(GREEN)🚀 Быстрый старт:$(NC)"
	@echo "  $(YELLOW)make dev$(NC)        # запустить сервер"
	@echo "  $(YELLOW)make build$(NC)      # собрать для публикации"
	@echo ""
	@echo "$(GREEN)📋 Версия: $(VERSION)$(NC)"