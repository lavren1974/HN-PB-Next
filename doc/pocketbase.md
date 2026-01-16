Отлично! Вот пошаговая инструкция для создания **systemd-службы** для PocketBase и настройки **Caddy**, чтобы проксировать запросы с домена (например, `pb.chess960v2.com`) на локальный порт `8091`.

---

### 1. Создание systemd-службы для PocketBase

Создайте файл службы:

```bash
sudo nano /etc/systemd/system/pocketbase.service
```

Вставьте следующее содержимое (подставьте свой путь к проекту и пользователя):

```ini
[Unit]
Description=PocketBase Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/HN-PB-Next/pocketbase
ExecStart=/var/www/HN-PB-Next/pocketbase/base serve --http="0.0.0.0:8091"
Restart=always
RestartSec=5
Environment=POCKETBASE_DATA_DIR=/var/www/HN-PB-Next/pocketbase/pb_data

[Install]
WantedBy=multi-user.target
```

> ⚠️ Убедитесь, что:
> - Пользователь (`www-data` или другой) имеет права на запись в `/var/www/HN-PB-Next/pocketbase/pb_data`.
> - Бинарник называется `base` — если у вас другое имя, замените его.

Затем активируйте службу:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now pocketbase-8091.service
```

Проверьте статус:

```bash
sudo systemctl status pocketbase-8091.service
```

---

### 2. Конфигурация Caddy

Если вы используете глобальный Caddy (через `/etc/caddy/Caddyfile`), добавьте блок для вашего поддомена:

```caddy
pb.example.com {
    reverse_proxy localhost:8091
}
```

Если вы хотите использовать основной домен (`chess960v2.com`) — просто замените имя хоста:

```caddy
example.com {
    reverse_proxy localhost:8091
}
```

Или, если вы хотите обрабатывать несколько путей на одном домене (например, `/api` → PocketBase):

```caddy
example.com {
    handle /api/* {
        reverse_proxy localhost:8091
    }

    # остальные пути могут обслуживаться Next.js или статикой
    handle {
        root * /var/www/your-nextjs-out
        file_server
    }
}
```

После редактирования перезагрузите Caddy:

```bash
sudo systemctl reload caddy
```

Убедитесь, что DNS запись (`pb.chess960v2.com` или `chess960v2.com`) указывает на ваш сервер.

---

### Дополнительно: права и безопасность

- Рекомендуется запускать PocketBase от непривилегированного пользователя (не `root`).
- Если вы используете брандмауэр (например, `ufw`), убедитесь, что порт `8091` не открыт извне — он должен быть доступен только локально для Caddy.

---

Если у вас уже есть TLS через Caddy (что почти всегда так), то всё будет работать по HTTPS автоматически.

Нужна помощь с миграцией данных, бэкапами или интеграцией с Next.js — дайте знать!