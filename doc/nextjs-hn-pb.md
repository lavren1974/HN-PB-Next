1. **systemd-юнит** для запуска вашего Next.js-приложения через `pnpm start`  
2. **Caddyfile**, чтобы проксировать запросы с домена (или IP) на ваше приложение

---

### 1. Systemd-сервис для Next.js (через pnpm)

Создайте файл сервиса:

```bash
sudo nano /etc/systemd/system/nextjs-hn-pb.service
```

Вставьте следующее содержимое (подставьте свой домен или IP, если нужно):

```ini
[Unit]
Description=Next.js Hacker News + PocketBase Web App
After=network.target

[Service]
Type=exec
User=nikson
WorkingDirectory=/var/www/HN-PB-Next/web
Environment=NODE_ENV=production
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=nextjs-hn-pb

[Install]
WantedBy=multi-user.target
```

> ⚠️ Убедитесь, что:
> - Пользователь `nikson` существует и имеет права на папку `/var/www/HN-PB-Next/web`
> - `pnpm` установлен глобально и доступен по пути `/usr/bin/pnpm`  
>   (проверьте командой `which pnpm`; если путь другой — подставьте его)

Затем перезагрузите systemd и запустите сервис:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now nextjs-hn-pb.service
```

Проверьте статус:

```bash
systemctl status nextjs-hn-pb.service
```

Убедитесь, что приложение слушает порт (по умолчанию Next.js в production использует `3000`, но лучше явно указать в `.env` или скрипте `start`):

```bash
# Например, в package.json у вас должно быть:
# "scripts": { "start": "next start -p 3001" }
```

Если вы не указали порт явно, Next.js запустится на `3000`. Для надёжности рекомендую задать фиксированный порт, например `3001`.

---

### 2. Конфигурация Caddy

Теперь настроим Caddy как reverse proxy.

Отредактируйте Caddyfile:

```bash
sudo nano /etc/caddy/Caddyfile
```

Добавьте (замените `your-domain.com` на ваш реальный домен или IP):

```caddy
your-domain.com {
    reverse_proxy localhost:3001
}
```

Если вы используете IP-адрес или хотите принимать трафик по любому хосту:

```caddy
:80 {
    reverse_proxy localhost:3001
}
```

Но лучше использовать домен — тогда Caddy автоматически получит HTTPS от Let’s Encrypt.

Проверьте конфигурацию:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

Перезапустите Caddy:

```bash
sudo systemctl reload caddy
```

Или, если reload не работает:

```bash
sudo systemctl restart caddy
```

---

### Дополнительно: Убедитесь, что порт Next.js указан явно

В файле `package.json` вашего Next.js-проекта (`/var/www/HN-PB-Next/web/package.json`) убедитесь, что команда `start` выглядит так:

```json
"scripts": {
  "start": "next start -p 3001"
}
```

Или задайте через переменную окружения:

```ini
# В systemd-сервисе добавьте:
Environment=PORT=3001
```

(и тогда можно оставить `"start": "next start"`)

---

Готово! Теперь ваш Next.js-сайт будет:

- Автоматически запускаться при старте системы
- Доступен через Caddy с HTTPS (если используется домен)
- Перезапускаться при падении

Если у вас есть домен — просто укажите его в Caddyfile, и всё заработает с автоматическим TLS.