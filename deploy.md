# Deploy

## web

`npx create-next-app@latest`

√ What is your project named? ... web

√ Would you like to use TypeScript? ... No / `Yes`

√ Would you like to use ESLint? ... No / `Yes`

√ Would you like to use Tailwind CSS? ... No / `Yes`

√ Would you like your code inside a `src/` directory? ... No / `Yes`

√ Would you like to use App Router? (recommended) ... No / `Yes`

√ Would you like to use Turbopack for `next dev`? ... `No` / Yes

√ Would you like to customize the import alias (`@/*` by default)? ... `No` / Yes

`pnpm add pocketbase clsx tailwind-merge`

`cd web`

`pnpm dev`

## Pocketbase

```
cd pocketbase
go mod tidy

go build ./examples/base
./base serve


`admin@example.com:admin@example.com`

http://127.0.0.1:8090
├─ REST API:  http://127.0.0.1:8090/api/
└─ Dashboard: http://127.0.0.1:8090/_/

```



## Self hosting

```
git clone https://github.com/shadowchess-org/PB-Next.git
cd /var/www/dev/PB-Next
git clone https://github.com/pocketbase/pocketbase.git
cd /var/www/dev/PB-Next/pocketbase/examples/base
go mod tidy
go build 

 ./base superuser create admin@example.com password
./base serve --http="0.0.0.0:8010"
http://123.123.123.123:8010/


```
CREATE UNIQUE INDEX `idx_pY8dThQBF1` ON `users` (`name`)
```


// Caddyfile

pb-next-data.shadowchess.org {
	encode zstd gzip
	reverse_proxy localhost:8010
}

// systemctl reload caddy
// systemctl status caddy

// admin@example.com

```



/etc/systemd/system/pb-next-data.service

```
[Unit]
Description=pb-next-data Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/dev/PB-Next/pocketbase/examples/base
ExecStart=/var/www/dev/PB-Next/pocketbase/examples/base/base serve --http="0.0.0.0:8010"
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```
sudo systemctl daemon-reload
sudo systemctl enable pb-next-data
sudo systemctl start pb-next-data
sudo systemctl restart pb-next-data
sudo systemctl status pb-next-data
```


sudo apt-get remove nodejs
sudo apt-get remove npm
npm list -g --depth=0


```
curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
sudo -E bash nodesource_setup.sh
sudo apt-get install -y nodejs npm
apt-get install nodejs -y


```
which pnpm
/usr/bin/pnpm

/etc/systemd/system/pb-next.service

```
[Unit]
Description=pb-next Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/dev/PB-Next/web
Environment=NODE_ENV=production
Environment=PORT=8011
Environment=HOSTNAME=0.0.0.0

ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```
sudo systemctl daemon-reload
sudo systemctl enable pb-next
sudo systemctl start pb-next
sudo systemctl restart pb-next
sudo systemctl status pb-next
```