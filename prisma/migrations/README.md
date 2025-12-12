Cuando migres a Postgres por primera vez:

1. Define `DATABASE_URL` con la cadena real.
2. Ejecuta `npx prisma migrate dev --name init_postgres`.
3. Confirma que `prisma/migrations/2025xxxx_init_postgres/migration.sql` existe y súbelo al repo.
4. En producción usa `npx prisma migrate deploy` antes de `npm run start`.

Esta carpeta actualmente solo actúa como placeholder; crea tu migración real contra la base de datos PostgreSQL antes de desplegar.
