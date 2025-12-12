# Deploy Postgres-ready

## 1. Preparar la base en cPanel

1. En cPanel crea una base PostgreSQL (o MySQL si lo cambias).  
2. Crea usuario y asigna a la base, copia host/puerto/usuario/password.  
3. Define `DATABASE_URL` así:

   ```
   postgresql://USER:PASSWORD@HOST:5432/DB_NAME
   ```

4. Exporta también `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `RESEND_SENDER`, etc. (ver checklist abajo).

## 2. Preparar `.env`

Ejecuta he siguiente script en el servidor (reemplaza valores):

```
cat <<EOF > .env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
NEXTAUTH_URL=https://tudominio.com
NEXTAUTH_SECRET=tu-super-secreto
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_SUCCESS_URL=https://tudominio.com/booking/confirmed
NEXT_PUBLIC_STRIPE_CANCEL_URL=https://tudominio.com/tours
STRIPE_CURRENCY=usd
RESEND_API_KEY=key_xxx
RESEND_SENDER=notifications@proactivitis.com
NEXT_PUBLIC_APP_URL=https://tudominio.com
EOF
```

## 3. Primer deploy

1. Subir código (git push o zip).  
2. `npm install`.  
3. `npx prisma generate`.  
4. `npx prisma migrate deploy`.  
5. `npx prisma db seed` (solo la primera vez, si quieres datos demo).  
6. `npm run build`.  
7. `npm run start`.

## 4. Actualizaciones

1. `git pull origin main`.  
2. `npm install`.  
3. `npx prisma generate`.  
4. `npx prisma migrate deploy`.  
5. `npm run build`.  
6. Reinicia la app (`npm run start` o botón restart).

## 5. Carpetas/archivos persistentes

- `storage/uploads` y `public/uploads`: contienen imágenes subidas; no las borres ni reescribas.  
- `.env`: archivo de configuración (no lo subas al repo).  
- `dev.db`: ya no se usa, el nuevo deploy es un clean start desde Postgres.  

> `node_modules` se puede borrar y reinstalar normalmente (npm install) durante cada deploy.

## 6. Checklist de variables obligatorias

- `DATABASE_URL` ✅  
- `NEXTAUTH_URL` ✅  
- `NEXTAUTH_SECRET` ✅  
- `STRIPE_SECRET_KEY` ✅  
- `NEXT_PUBLIC_STRIPE_SUCCESS_URL`  
- `NEXT_PUBLIC_STRIPE_CANCEL_URL`  
- `STRIPE_CURRENCY`  
- `RESEND_API_KEY` ✅ (si envías correos automáticos)  
- `RESEND_SENDER`  
- `NEXT_PUBLIC_APP_URL`

> Si falta alguna señalada con ✅ la app no arranca o ciertas rutas críticas fallan.

## 7. Comandos exactos para servidor (Node.js App en cPanel *Node 20.x*)

```
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed   # solo en el primer deploy
npm run build
npm run start
```

> Asegúrate de configurar la aplicación Node.js en cPanel con **Node 20.x** (Next 16 requiere Node 20). Si solo tienes Node 18, crea un ticket con soporte o usa un contenedor dedicado.

## 8. Nota sobre Postgres local

Para validar localmente usa Docker:

```
docker run --name proactivitis-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=proactivitis -p 5432:5432 -d postgres:15
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/proactivitis
npx prisma migrate dev --name init_postgres
npx prisma db seed
```

> Esta rama es un clean start: si ya hubo datos en SQLite, considéralos perdidos y planea un export/import si los necesitas. No borramos migraciones viejas para no perder historia; simplemente se reinicia el historial en Postgres.

Cuando obtengas la `DATABASE_URL` oficial en cPanel solo reemplázala y vuelve a correr `npx prisma migrate deploy`.
