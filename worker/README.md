# MLK.STUDIO — заявки

Worker: https://mlk-studio-requests.mlkdesignweb.workers.dev

Формы: https://mlkdesign.github.io/ (ветка main) и https://mlkdesign.github.io/milka-cv/ (ветка milka-cv). В обеих: `index.html` → `.request-form`, обработчик в `app.js`.

Поле `source` принимает только `mlk-studio` или `milka-cv`. Worker добавляет фиксированные название и URL источника в Telegram и Formspree. Для старой открытой вкладки без этого поля сохраняется источник основного сайта. Это метка источника, а не доказательство происхождения запроса; Turnstile проверяет общий hostname.

Цепочка: форма → Worker `/submit` → Turnstile Siteverify → Formspree `meaajpvl` → уведомление Telegram при наличии секретов.

## Текущее состояние

- Worker и production-виджет Turnstile созданы в Cloudflare, ключ Turnstile сохранён как зашифрованный `TURNSTILE_SECRET`.
- Разрешён только origin `https://mlkdesign.github.io`, hostname `mlkdesign.github.io`, action `project_request`.
- Лимит: 5 проверяемых заявок за 60 секунд с IP (локальный лимитер Cloudflare, не глобальная точная квота).
- Formspree сохранён в HTML action и как серверный адрес доставки. В обычном JS-потоке заявка всегда проходит Worker; автоматического обхода Turnstile при ошибке нет. Публичный адрес Formspree сам по себе остаётся доступен напрямую: его собственная антиспам-защита настраивается в Formspree.
- Telegram включён владельцем после замены токена. Секреты хранятся в Cloudflare и не включены в файлы проекта.

## Что владельцу нужно добавить

Открыть Cloudflare → Workers & Pages → `mlk-studio-requests` → Settings → Runtime variables and secrets → Production → Add variable.

1. В Telegram открыть официальный `@BotFather`, выполнить `/revoke` для бота, затем получить новый токен. Не отправлять новый токен в чат или GitHub.
2. Добавить `TELEGRAM_BOT_TOKEN` со значением нового токена, включить **Secret**, сохранить и развернуть.
3. Написать боту `/start` в личном чате. Получить свой числовой `chat.id` из `getUpdates` с новым токеном в собственном локальном инструменте; для группы нужен ID нужной группы. Не использовать username вместо ID.
4. Добавить `TELEGRAM_CHAT_ID` как **Secret**, сохранить и развернуть. Неверный ID может направить заявку другому получателю: проверять на синтетической заявке.
5. Открыть `/health`: `turnstileConfigured` и `telegramConfigured` должны быть `true`. Это подтверждает наличие конфигурации, а не действительность Telegram-токена.
6. Отправить тестовую заявку с сайта и проверить и Formspree/почту, и личный Telegram. Удалить тестовую заявку из обоих мест.

Ключи не добавлять в `index.html`, `app.js`, конфиг Wrangler, коммиты или README. В HTML присутствует только публичный sitekey.

## Замена Turnstile-секрета

В Cloudflare → Turnstile → `MLK.STUDIO project requests` перевыпустить Secret key, затем обновить **Secret** `TURNSTILE_SECRET` у Worker и развернуть. Если меняется только secret, публичный sitekey в HTML менять не нужно. Секрет виден в истории настройки этой сессии, поэтому после передачи настройки владельцу его также рекомендуется перевыпустить.

## Доставка и ограничения

Успех формы означает, что Formspree подтвердил приём. Telegram отправляется после этого в `waitUntil`, без форматирования HTML/Markdown. Ошибка Telegram записывается как `telegram_delivery_failed` с ID заявки, без имени, email, текста и токена; заявка остаётся в Formspree. Автоматического повторения Telegram и долговечной очереди нет. После сетевого таймаута Formspree мог уже принять заявку: повторная отправка может создать дубль.

Проверки: JSON, лимит тела 16 KiB, honeypot, длины полей, email, управляющие символы, IP rate limit, обязательный одноразовый Turnstile-токен с проверкой action и hostname. CORS — ограничение браузерных запросов, а не самостоятельная аутентификация.

## Проверка и дальнейшее развёртывание

```sh
node --test worker/worker.test.mjs
node worker/live-smoke.mjs
npx wrangler deploy --config worker/wrangler.jsonc
```

Для последней команды нужна авторизованная сессия Cloudflare владельца. Деплой через GitHub автоматически обновляет сайт, но не Worker. Изменения Worker публикуются отдельно. Конфиг сохраняет тот же rate-limit namespace `1001`.

21 локальный тест покрывают отказоустойчивость и доставку через заглушки сервисов. Live smoke проверяет доступность, CORS, отбрасывание чужого origin, невалидных полей, honeypot и поддельного токена; заявок он не отправляет. Полный тест Telegram возможен только после добавления нового токена и CHAT_ID.

Документация: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ и https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
