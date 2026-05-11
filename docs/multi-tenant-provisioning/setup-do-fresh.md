# Fresh DigitalOcean install — step-by-step

End-to-end guide สำหรับ install ระบบใหม่ทั้งหมดบน DigitalOcean ตั้งแต่
ศูนย์ — อ่านเรียงลำดับ, ใช้เวลารวมประมาณ **2-3 ชั่วโมง** (รอ snapshot
build นาน ~15-20 นาที)

## ภาพรวม

```
┌──────────────────────────────────────────────────────────────────┐
│  DigitalOcean account                                             │
│                                                                   │
│  ┌──────────────┐  ┌─────────────────────┐  ┌──────────────────┐│
│  │ Control      │  │ Managed Postgres    │  │ Container        ││
│  │ Plane        │◄─┤ db-s-1vcpu-2gb     │  │ Registry         ││
│  │ Droplet      │  │ marketplace-db      │  │ shop-app:latest  ││
│  │ s-2vcpu-4gb  │  └─────────────────────┘  └──────────────────┘│
│  └──────┬───────┘            ▲                        ▲          │
│         │                    │ VPC                    │ docker   │
│         │                    │                        │ pull     │
│         │       ┌────────────┴────────────────────────┘          │
│         │       │                                                 │
│         ▼       ▼                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Shop Droplets (1 per approved store)                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │   │
│  │  │ shop-a     │  │ shop-b     │  │ shop-c ... │          │   │
│  │  └────────────┘  └────────────┘  └────────────┘          │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
        ▲                                  ▲
        │                                  │
   admin/customers                    Cloudflare DNS
   via custom domain                  (grey-cloud, DNS only)
```

---

## Phase 0 — Prerequisites

### บัญชี + เครื่องมือ

- [ ] DigitalOcean account ที่ verified แล้ว (ผูกบัตรเครดิต/อนุมัติแล้ว)
- [ ] Cloudflare account ที่จดโดเมนหลัก (e.g. `basketplace.co`) ไว้แล้ว
- [ ] โดเมนหลักย้าย nameserver มาที่ Cloudflare แล้ว (Active)
- [ ] บน laptop ตัวเอง:
  - `doctl` (DigitalOcean CLI) — `brew install doctl`
  - `git`, `node`, `npm`, `docker`
  - SSH key — `~/.ssh/id_ed25519.pub` พร้อม upload ขึ้น DO

```bash
# ติดตั้ง + auth doctl
brew install doctl
doctl auth init   # paste DO API token (สร้างที่ขั้นถัดไป)
```

---

## Phase 1 — DigitalOcean infrastructure

### 1.1 สร้าง API Token

1. ไปที่ https://cloud.digitalocean.com/account/api/tokens
2. **Generate New Token**:
   - Name: `marketplace-control-plane`
   - Expiration: 1 year (หรือไม่หมดอายุก็ได้ — แต่ rotate ทุกปี)
   - Scope: **Custom Scope**
     - Droplet: `read` + `write` + `delete`
     - Snapshot: `read` + `write` + `delete`
     - Image: `read`
     - SSH Key: `read`
     - Tag: `read` + `write`
     - VPC: `read` + `write`
     - Database: `read` + `write`
     - Container Registry: `read` + `write`
3. **เก็บ token ทันที** — แสดงครั้งเดียว
4. `doctl auth init` → paste token

### 1.2 Upload SSH key

```bash
doctl compute ssh-key import marketplace-admin \
  --public-key-file ~/.ssh/id_ed25519.pub

# จด fingerprint ที่ได้ — จะใส่ใน DO_SSH_KEY_IDS
doctl compute ssh-key list
```

### 1.3 สร้าง VPC

VPC ทำให้ control plane, managed DB, และ shop droplets สื่อสารกันผ่าน
private network (ไม่เสีย bandwidth, ปลอดภัยกว่า public IP)

```bash
doctl vpcs create \
  --name marketplace-vpc \
  --region sgp1 \
  --ip-range 10.110.0.0/20

doctl vpcs list   # จด VPC UUID
```

### 1.4 สร้าง Managed Postgres

```bash
# ที่ DO Dashboard → Databases → Create Database Cluster
# - Engine: PostgreSQL 16
# - Plan: Basic, $15/mo (db-s-1vcpu-2gb)
# - Region: Singapore (sgp1) — same as VPC
# - VPC: marketplace-vpc ที่เพิ่งสร้าง
# - DB name: marketplace
# - Initial user: marketplace_admin

# หรือ doctl:
doctl databases create marketplace-db \
  --engine pg \
  --version 16 \
  --region sgp1 \
  --size db-s-1vcpu-2gb \
  --num-nodes 1 \
  --private-network-uuid <VPC_UUID>
```

รอ ~5 นาทีให้ DB พร้อม จากนั้น:

1. **Trusted Sources** → เพิ่ม VPC ที่ใช้ (เพื่อ allow control plane + shop droplets)
2. **Connection Details** → copy:
   - `Connection string` (private) — สำหรับ `DATABASE_URL` ของ control plane
   - แยก host/port/user/pass สำหรับ `.env`

```
postgresql://marketplace_admin:xxx@private-marketplace-db-do-user-xxx.b.db.ondigitalocean.com:25060/marketplace?sslmode=require
```

### 1.5 สร้าง Container Registry

```bash
# สร้าง registry ที่ DO Dashboard → Container Registry
# Plan: Basic $5/mo (5 GB)
# Name: marketplace (จะได้ registry.digitalocean.com/marketplace)

# หรือ:
doctl registry create marketplace --subscription-tier basic
doctl registry login   # auth docker กับ registry
```

### 1.6 สร้าง Control Plane Droplet

```bash
# เก็บ SSH key fingerprint ไว้
SSH_FP=$(doctl compute ssh-key list --format Name,FingerPrint --no-header | grep marketplace-admin | awk '{print $2}')

doctl compute droplet create marketplace-control \
  --region sgp1 \
  --size s-2vcpu-4gb \
  --image ubuntu-24-04-x64 \
  --vpc-uuid <VPC_UUID> \
  --ssh-keys $SSH_FP \
  --tag-names control-plane \
  --enable-monitoring \
  --enable-ipv6 \
  --wait

# จด public IP
doctl compute droplet list --format Name,PublicIPv4
```

---

## Phase 2 — Cloudflare

### 2.1 สร้าง API Token

1. https://dash.cloudflare.com/profile/api-tokens → **Create Token**
2. Template: **Edit zone DNS** → Custom
3. Permissions เพิ่ม:
   - `Zone — DNS — Edit`
   - `Zone — Email Routing — Edit` (ใช้ feature platform-email อยู่แล้ว)
4. Zone Resources: **Include → Specific zone → basketplace.co**
5. Create → เก็บ token ไว้

### 2.2 หา Zone ID

ที่หน้า overview ของ zone → ดูคอลัมน์ขวา → copy Zone ID

### 2.3 ตั้ง DNS records ของ control plane

ที่ Cloudflare → DNS → Records:

| Type | Name        | Content              | Proxy   |
|------|-------------|----------------------|---------|
| A    | `@`         | `<control plane IP>` | DNS only (grey) |
| A    | `www`       | `<control plane IP>` | DNS only (grey) |
| A    | `admin`     | `<control plane IP>` | DNS only (grey) |

> **สำคัญ**: ใช้ grey cloud (DNS only) ทุก record — ห้าม proxy ผ่าน CF
> เพราะจะทำให้ outbound IP ของ control plane มองเห็นจาก PG ผิด

ส่วน shop subdomains (e.g. `petlove.basketplace.co`) — provisioner เป็นคน
สร้างให้อัตโนมัติเมื่อ approve ร้าน ไม่ต้องทำตอนนี้

---

## Phase 3 — Deploy control plane

### 3.1 SSH เข้า control plane droplet

```bash
ssh root@<control-plane-ip>
```

### 3.2 ติดตั้ง Docker + dependencies

```bash
# ภายใน droplet:
apt-get update
apt-get install -y ca-certificates curl gnupg jq

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# ติดตั้ง Caddy สำหรับ reverse proxy + auto TLS ของ control plane เอง
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy
```

### 3.3 Clone repo + build image

```bash
# ที่ droplet
mkdir -p /opt/marketplace
cd /opt/marketplace
git clone https://github.com/<your-org>/marketplace.git .
git checkout feat/multi-tenant-provisioning   # หรือ main หลัง merge

# Login docker + build control plane image
doctl registry login   # หรือ docker login registry.digitalocean.com
docker build -t registry.digitalocean.com/marketplace/control-plane:latest .
docker push   registry.digitalocean.com/marketplace/control-plane:latest

# Build shop image แยก (ใช้ Dockerfile.shop)
docker build -f infra/shop-droplet/Dockerfile.shop \
  -t registry.digitalocean.com/marketplace/shop-app:latest .
docker push registry.digitalocean.com/marketplace/shop-app:latest
```

### 3.4 ตั้ง env

```bash
mkdir -p /etc/marketplace
nano /etc/marketplace/control.env
```

ใส่ค่าตามนี้ (อ้าง `.env.example` ของ repo):

```env
# Domain
MAIN_DOMAIN=basketplace.co

# DB
DATABASE_URL=postgresql://marketplace_admin:xxx@private-marketplace-db-...ondigitalocean.com:25060/marketplace?sslmode=require
SHOP_DATABASE_URL=${DATABASE_URL}

# NextAuth
NEXTAUTH_URL=https://basketplace.co
NEXTAUTH_SECRET=<openssl rand -base64 32>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Public base
NEXT_PUBLIC_BASE_URL=https://basketplace.co
CONTROL_PLANE_BASE_URL=https://basketplace.co

# DO
DIGITALOCEAN_TOKEN=<token จาก phase 1.1>
DO_REGION=sgp1
DO_SIZE=s-1vcpu-1gb
DO_SHOP_SNAPSHOT_ID=          # เว้นว่างก่อน — ทำใน Phase 4
DO_FALLBACK_IMAGE=ubuntu-24-04-x64
DO_SSH_KEY_IDS=<fingerprint จาก phase 1.2>

# Cloudflare
CLOUDFLARE_API_TOKEN=<token จาก phase 2.1>
CLOUDFLARE_ZONE_ID=<zone id จาก phase 2.2>

# Shared secrets
INTERNAL_API_SECRET=<openssl rand -hex 32>
CRON_SECRET=<openssl rand -hex 32>

# Shop image
SHOP_IMAGE=registry.digitalocean.com/marketplace/shop-app:latest

# Notifier
NOTIFIER_DRIVER=discord       # หรือ "line" หรือ "console"
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
LINE_NOTIFY_TOKEN=

# Payment providers (ใส่ตาม merchant ของคุณ)
ANYPAY_MODE=live
ANYPAY_API_BASE=https://api.anypay.example.com
ANYPAY_MERCHANT_ID=...
ANYPAY_API_KEY=...
ANYPAY_SECRET=...

QUICKPAY_API_BASE=https://api.quickpay.co.th
QUICKPAY_MERCHANT_ID=...
QUICKPAY_API_KEY=...
QUICKPAY_SECRET=...
QUICKPAY_EXTRA_WHITELIST_IPS=

# DO Spaces (ถ้าใช้ logo/banner upload)
SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
SPACES_REGION=sgp1
SPACES_BUCKET=marketplace-uploads
SPACES_KEY=...
SPACES_SECRET=...
```

`chmod 600 /etc/marketplace/control.env` ป้องกัน world-readable

### 3.5 Run migrations

```bash
# ที่ control plane droplet:
cd /opt/marketplace

# ใช้ image ที่ build ไว้ run prisma migrate
docker run --rm \
  --env-file /etc/marketplace/control.env \
  registry.digitalocean.com/marketplace/control-plane:latest \
  npx prisma migrate deploy
```

หรือถ้าอยาก apply schema ด้วย SQL ตรงๆ (ไม่ใช้ Prisma migration):

```bash
psql "$DATABASE_URL" -f /opt/marketplace/docs/multi-tenant-provisioning/migration.sql
```

### 3.6 Start control plane container

```bash
cat > /etc/systemd/system/marketplace-control.service <<'EOF'
[Unit]
Description=Marketplace control plane
After=docker.service
Requires=docker.service

[Service]
Restart=always
RestartSec=5
ExecStartPre=-/usr/bin/docker stop marketplace-control
ExecStartPre=-/usr/bin/docker rm marketplace-control
ExecStartPre=/usr/bin/docker pull registry.digitalocean.com/marketplace/control-plane:latest
ExecStart=/usr/bin/docker run --rm --name marketplace-control \
  --env-file /etc/marketplace/control.env \
  -p 127.0.0.1:3000:3000 \
  registry.digitalocean.com/marketplace/control-plane:latest
ExecStop=/usr/bin/docker stop marketplace-control

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now marketplace-control
systemctl status marketplace-control
```

### 3.7 Configure Caddy เป็น front

```bash
cat > /etc/caddy/Caddyfile <<EOF
basketplace.co, www.basketplace.co, admin.basketplace.co {
        encode zstd gzip
        reverse_proxy 127.0.0.1:3000
}
EOF

systemctl reload caddy
```

ตอนนี้ `https://basketplace.co` ควร serve หน้าแรกของ marketplace ได้ (Let's
Encrypt cert ออกอัตโนมัติภายใน 30 วินาที)

### 3.8 สร้าง admin user คนแรก

```bash
# SSH login ผ่าน Google OAuth ที่ https://basketplace.co/signin ก่อน
# แล้วยกระดับ user เป็น ADMIN:

docker exec -it marketplace-control sh -c \
  "echo \"UPDATE \\\"User\\\" SET role='ADMIN' WHERE email='you@example.com';\" | npx prisma db execute --stdin"
```

หรือยิง SQL ตรงๆ:

```bash
psql "$DATABASE_URL" -c "UPDATE \"User\" SET role='ADMIN' WHERE email='you@example.com';"
```

Re-login → ควรเข้า `/admin` ได้

---

## Phase 4 — Build shop droplet snapshot

ขั้นนี้ทำครั้งเดียวตอน setup และทำซ้ำเมื่อ release shop image ใหม่ (รายเดือน)

### 4.1 รัน build-snapshot script

```bash
# ที่ control plane droplet (หรือ laptop ของคุณ — เหมือนกัน):
cd /opt/marketplace

export DIGITALOCEAN_TOKEN=<DO token>
export SHOP_IMAGE=registry.digitalocean.com/marketplace/shop-app:latest
export DO_REGION=sgp1
export DO_SSH_KEY_ID=<your-ssh-key-fingerprint>  # optional, ไว้ debug

bash infra/shop-droplet/build-snapshot.sh
```

Script จะ:
1. สร้าง builder droplet ชั่วคราว (~$0.01)
2. รอ cloud-init ติด Docker + pull shop image (~4 นาที)
3. Power off droplet
4. Snapshot (~10 นาที)
5. Destroy builder droplet

ตอนจบจะพิมพ์ snapshot ID เช่น:

```
✅ Snapshot built: shop-droplet-20260511-160000
   Snapshot ID:  192837465

Set this in your control-plane env:
  DO_SHOP_SNAPSHOT_ID=192837465
```

### 4.2 อัปเดต env + restart

```bash
nano /etc/marketplace/control.env
# แก้ DO_SHOP_SNAPSHOT_ID=192837465

systemctl restart marketplace-control
```

ตอนนี้การ provision shop ใหม่จะใช้ snapshot นี้ — เร็วจาก 5 นาที เหลือ ~60 วินาที

---

## Phase 5 — Cron scheduler

ต้องมี cron 2 ตัวยิง endpoint ของ control plane:

### Option A — Cron บน control plane droplet (ง่ายสุด)

```bash
crontab -e
```

เพิ่ม:

```
# Drain provisioning queue every minute
*  * * * * curl -fsS -m 55 -H "Authorization: Bearer $CRON_SECRET" https://basketplace.co/api/cron/provisioner-tick > /dev/null 2>&1

# Health check every 5 minutes
*/5 * * * * curl -fsS -m 55 -H "Authorization: Bearer $CRON_SECRET" https://basketplace.co/api/cron/provisioner-health > /dev/null 2>&1
```

แต่ `$CRON_SECRET` ต้อง substitute manually — ทำเป็น wrapper script:

```bash
cat > /usr/local/bin/cron-tick.sh <<'EOF'
#!/bin/sh
set -a
. /etc/marketplace/control.env
set +a
curl -fsS -m 55 -H "Authorization: Bearer $CRON_SECRET" \
  https://basketplace.co/api/cron/provisioner-tick > /dev/null 2>&1
EOF
chmod +x /usr/local/bin/cron-tick.sh

cat > /usr/local/bin/cron-health.sh <<'EOF'
#!/bin/sh
set -a
. /etc/marketplace/control.env
set +a
curl -fsS -m 55 -H "Authorization: Bearer $CRON_SECRET" \
  https://basketplace.co/api/cron/provisioner-health > /dev/null 2>&1
EOF
chmod +x /usr/local/bin/cron-health.sh
```

แล้วใน crontab:

```
*  * * * * /usr/local/bin/cron-tick.sh
*/5 * * * * /usr/local/bin/cron-health.sh
```

### Option B — GitHub Actions

ดู `docs/multi-tenant-provisioning/first-time-setup.md` section 6

---

## Phase 6 — Smoke test

### 6.1 สร้างร้านทดสอบ

1. เปิด `https://basketplace.co/admin/stores/new`
2. กรอกข้อมูล:
   - Name: `Test Shop`
   - Slug: `test-shop`
   - Owner email: (อะไรก็ได้ — สร้าง user ใหม่ได้)
3. กด **สร้างร้านใหม่**

### 6.2 Approve

1. เปิด `/admin/stores/<id>`
2. กด **Approve**

### 6.3 ตามดู provisioning

1. เปิด `/admin/provisioning` — ควรเห็น deployment ใหม่ status `PENDING` หรือ `CREATING_DROPLET`
2. รอ ~60-90 วินาที — refresh ดู status ขยับไป `CONFIGURING_DNS` → `DEPLOYING_APP` → `READY_FOR_WHITELIST`
3. คลิกเข้าไป `/admin/provisioning/<deploymentId>` ดู:
   - Public IP ที่ assign ให้
   - Provisioning jobs (ทุก stage ควรเป็น `SUCCEEDED`)
   - DNS record IDs

### 6.4 เปิดร้านจริง

`https://test-shop.basketplace.co` — ควรขึ้นหน้าร้านพร้อม HTTPS ที่ออกโดย
Let's Encrypt อัตโนมัติผ่าน Caddy on-demand TLS

### 6.5 ทดสอบ payment whitelist flow

ที่ `/admin/provisioning/<deploymentId>`:

1. ดูส่วน **Payment Provider Whitelist** — แสดง public IP + instructions
2. ลอง **Confirm whitelist** (ใส่ note "smoke test") — status เปลี่ยนเป็น `CONFIRMED`, deployment → `ACTIVE`
3. ทดลอง **Destroy droplet** (พิมพ์ slug ยืนยัน) — droplet ถูกลบ + DNS records cleanup

---

## Troubleshooting

### "Deployment stuck ที่ CREATING_DROPLET"

```bash
# ตรวจ queue
psql "$DATABASE_URL" -c "SELECT id, type, status, attempt, \"errorMessage\" FROM \"ProvisioningJob\" ORDER BY \"createdAt\" DESC LIMIT 10;"
```

ดู `errorMessage` — มักเป็น:
- `HTTP 401`: token ผิด → re-check `DIGITALOCEAN_TOKEN`
- `HTTP 422 ... image not found`: snapshot id ผิด → check `DO_SHOP_SNAPSHOT_ID`

### "Caddy ไม่ออก cert"

```bash
# SSH เข้า shop droplet
ssh root@<shop-public-ip>
docker logs -f $(docker ps -q --filter name=caddy)
```

มักเป็น:
- DNS ยังไม่ propagate → รออีก 2-3 นาที
- Port 80 ปิด → check firewall: `ufw status` ที่ shop droplet
- `caddy-ask` endpoint ตอบ 404 → check ที่ control plane ว่า deployment row ถูก verify

### "Cron ไม่ทำงาน"

```bash
# ดู cron log
grep CRON /var/log/syslog | tail -20

# ทดสอบ manual
curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
  https://basketplace.co/api/cron/provisioner-tick
# ควรได้ {"ok":true,"processed":N}
```

ถ้าได้ 401 — `CRON_SECRET` ใน `.env` กับใน cron script ไม่ตรงกัน

### "Shop droplet booted แต่ /health ไม่ตอบ"

```bash
ssh root@<shop-ip>
docker compose -f /opt/marketplace-shop/docker-compose.yml ps
docker compose -f /opt/marketplace-shop/docker-compose.yml logs shop --tail=200
journalctl -u cloud-final --no-pager | tail -50
```

มักเป็น:
- DB connection fail → `SHOP_DATABASE_URL` ผิด หรือ trusted source ไม่ครอบ VPC
- Image pull fail → registry creds ไม่ได้ login

---

## Cost summary

| Item                                    | Monthly  |
|-----------------------------------------|----------|
| Control plane droplet `s-2vcpu-4gb`     | $24      |
| Managed Postgres `db-s-1vcpu-2gb`       | $15      |
| Container Registry Basic                | $5       |
| DO Spaces (uploads)                     | $5       |
| **Subtotal (ก่อนมีร้าน)**               | **$49**  |
| + Shop droplet `s-1vcpu-1gb` ต่อร้าน    | $6       |

อ่านต่อ: [cost.md](./cost.md) สำหรับ scale projection

---

## Checklist

- [ ] DO account, API token, SSH key uploaded
- [ ] VPC, Managed Postgres, Container Registry สร้างแล้ว
- [ ] Cloudflare zone Active + API token ครอบ DNS + Email Routing
- [ ] Control plane droplet + Docker + Caddy ติดตั้งแล้ว
- [ ] Repo cloned + 2 images build (`control-plane`, `shop-app`)
- [ ] `/etc/marketplace/control.env` ครบทุกค่า (chmod 600)
- [ ] Migrations applied, `User.role='ADMIN'` ของ owner ตั้งแล้ว
- [ ] Caddy serve `basketplace.co` ผ่าน HTTPS ได้
- [ ] `build-snapshot.sh` รันแล้ว, snapshot id อยู่ใน env
- [ ] Cron tick + health รันทุก 1/5 นาทีแล้ว
- [ ] Smoke test ผ่าน — สร้าง→approve→ดู provisioning→เปิดร้าน→destroy ได้ end-to-end

ถ้าผ่านทุกข้อ — ระบบพร้อมรับร้านจริงแล้ว 🚀
