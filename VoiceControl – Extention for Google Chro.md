VoiceControl – Extention for Google Chrome/
  dist/                 # собранное расширение (не коммитится, генерируется при сборке)
  src/                  # исходный код
    background/         # Background service-Worker
    content-script/     # Content-script и реализованные фичи
    domain/             # модули CommandEngine, Matcher, normalizeSpeech
    lib/
      shared/           # директория, элементы которой доступны во всем приложении
        components/     # общие React компоненты
        assets/         # иконтки, картинки
        hooks/          # общие React-хуки
        types/          # глобальные типы
        utils/          # глобальные функции, хелперы
      styles/           # глобальные стили
      untyped-packages/ # дополнительная типизация типов @types/chrome, файлы определений d.ts
    pages/              # страницы расширения
  .gitignore            # игнорируемые файлы
  .prettierrc           # конфигурация Prettier
  eslint.config.js      # конфигурация ESLint
  manifest.config.ts    # кофнигурация Manifest V3 в CRXJS
  pnpm-lock.yaml        # зафиксированные версии зависимостей pnpm
  pnpm-workspace.yaml   # конфигурация рабочих пакетов pnpm
  README.md             # описание проекта
  package.json          # зависимости и скрипты
  tsconfig.json         # конфигурация TypeScript
  vite.config.ts        # конфигурация Vite + CRXJS

