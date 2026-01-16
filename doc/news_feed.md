Чтобы создать systemd-службу для вашего Go-приложения `/var/www/HN-PB-Next/news_feed`, выполните следующие шаги:

---

### 1. Создайте файл службы

Создайте файл службы, например:  
```bash
sudo nano /etc/systemd/system/news_feed.service
```

Вставьте в него следующее содержимое (подстройте пользователя и группу при необходимости):

```ini
[Unit]
Description=News Feed Service (Go)
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/HN-PB-Next/news_feed
ExecStart=/var/www/HN-PB-Next/news_feed/news_feed
Restart=on-failure
RestartSec=5
Environment=PORT=8080  # Укажите нужный порт, если используется
StandardOutput=journal
StandardError=journal
SyslogIdentifier=news_feed

[Install]
WantedBy=multi-user.target
```

> **Примечание**:  
> - Убедитесь, что исполняемый файл `news_feed` действительно находится по пути `/var/www/HN-PB-Next/news_feed/news_feed`.  
> - Если вы используете другого пользователя (например, `nikson`), замените `User` и `Group` на нужные значения.  
> - Если ваше приложение требует переменных окружения (например, `DATABASE_URL`), добавьте их через директиву `Environment=` или загрузите из файла с помощью `EnvironmentFile=`.

---

### 2. Перезагрузите systemd и запустите службу

```bash
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable news_feed.service
sudo systemctl start news_feed.service
```

---

### 3. Проверьте статус

```bash
sudo systemctl status news_feed.service
```

Если всё работает корректно, вы увидите `active (running)`.

---

### 4. (Опционально) Логирование

Логи можно просматривать командой:
```bash
journalctl -u news_feed.service -f
```

---

Если у вас есть дополнительные требования — например, зависимость от Pocketbase или использование Caddy как reverse proxy — дайте знать, и я помогу интегрировать всё вместе.