# Remaro: manual backup and isolated restore

Status: PREPARED, NOT EXECUTED. Production project/branch and backup policy still require confirmation.
Do not run these commands until the production target is confirmed. Never restore into production.
The local checkout is in OneDrive: backups/ is ignored by Git, but Git ignore does not prevent OneDrive syncing.
For real dumps use an approved, access-restricted location outside OneDrive, or explicitly approve its storage policy.

## Confirm the Neon target and policy

1. Open https://console.neon.tech and select the intended organization and Remaro project.
2. Record Project name/ID under Project settings / General.
3. Open Branches, select the intended production branch, and record its name/ID.
4. Open its Computes tab: check the endpoint belongs to this branch and is the primary read-write compute.
5. Open Connect / Connection Details. Select the branch, database neondb, and intended role.
6. Compare the full endpoint identifier locally with DATABASE_URL and the deployment's Production environment.
   Never paste credentials into an issue/chat. Masked local host: ep-***-pooler.c-4.us-east-2.aws.neon.tech.
   Provider: Neon; region: AWS us-east-2; database: neondb.
   Disable connection pooling to obtain the direct hostname. Direct connectivity was tested read-only.
7. A branch name such as production/main/default is not sufficient evidence: the actual production deployment
   must use that branch's endpoint. Confirm the business designation with the project owner.
8. In organization Billing / Plans, record the actual plan.
9. In project Settings, inspect the configured restore/history window. In Backup & Restore select the
   intended branch and inspect the earliest available recovery time and permitted restore operations.
   Record configured retention, currently available history, snapshot schedule/retention (if any),
   and who can restore. Do not trigger an in-place restore.
10. Agree the required RPO/RTO and retention. A provider feature or plan maximum is not a configured policy.

Sources:
- https://neon.com/docs/manage/projects
- https://neon.com/docs/manage/endpoints/
- https://neon.com/docs/changelog/2025-10-17
- https://neon.com/docs/manage/backup-pg-dump
- https://www.postgresql.org/docs/current/app-pgdump.html
- https://www.postgresql.org/docs/current/app-pgrestore.html

## Manual backup, after target confirmation

Installed tools: pg_dump 18.2, pg_restore 18.2. Observed server: PostgreSQL 18.6 (same major).
Use the direct hostname from Neon Console. Password is requested interactively by -W; do not place it
in command arguments, files, shell history or documentation.

Run in a fresh PowerShell window. These are templates; replace the non-secret placeholders locally.
Use a new output filename each time; do not overwrite an existing archive.

~~~powershell
$env:PGSSLMODE = 'verify-full'
$env:PGSSLROOTCERT = 'system'
$stageBackupFile = 'C:\APPROVED_PRIVATE_BACKUP_DIRECTORY\remaro-YYYYMMDD-HHMMSS.dump'
if (Test-Path -LiteralPath $stageBackupFile) { throw 'Archive already exists; select a new filename.' }

pg_dump -h 'DIRECT_HOST_FROM_CONFIRMED_PRODUCTION_BRANCH' -p 5432 -U 'DATABASE_ROLE' -d 'neondb' -W -Fc --file=$stageBackupFile
if ($LASTEXITCODE -ne 0) { throw 'Backup failed. Do not treat a partial file as a valid backup.' }

pg_restore --list $stageBackupFile | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Archive cannot be read.' }
Get-FileHash -Algorithm SHA256 -LiteralPath $stageBackupFile
~~~

If system trust is unavailable in libpq, supply an approved CA bundle via PGSSLROOTCERT;
do not disable certificate verification. Archive listing/hash verifies readability/integrity,
not successful restoration. Store dump and hash in approved protected storage and apply retention.
Capture source counts in a consistent read-only snapshot; on a busy database align that snapshot
with pg_dump using PostgreSQL exported snapshots, or arrange an approved write-free interval.
The earlier audit counts below are reference values, not an exact future-backup acceptance baseline.

## Isolated restore, manually provisioned target only

1. Manually create a separate test project/branch and a NEW EMPTY database, e.g. remaro_restore_test.
   An ordinary Neon branch cloned from production already contains tables; do not restore on top.
   Do not reset or clean it automatically.
2. Obtain its DIRECT hostname and role from Console. Confirm project/branch is isolated and distinct
   from production, even if both databases have similar names. Use a role scoped to the test target.
3. Check target emptiness in its SQL Editor: application tables and _prisma_migrations must not exist.
4. Verify the archive hash. Restore only after independently confirming this target.

~~~powershell
$env:PGSSLMODE = 'verify-full'
$env:PGSSLROOTCERT = 'system'
pg_restore -h 'ISOLATED_TEST_DIRECT_HOST' -p 5432 -U 'TEST_DATABASE_ROLE' -d 'remaro_restore_test' -W --no-owner --no-acl --exit-on-error --single-transaction $stageBackupFile
if ($LASTEXITCODE -ne 0) { throw 'Isolated restore failed.' }
~~~

No --clean, --create, or production target is used. No automated database creation is included.

## Restore validation

In the restored database's SQL Editor, execute read-only:

~~~sql
BEGIN READ ONLY;
SELECT
 (SELECT count(*) FROM "Category") AS categories,
 (SELECT count(*) FROM "Product") AS products,
 (SELECT count(*) FROM "User") AS users,
 (SELECT count(*) FROM "Order") AS orders,
 (SELECT count(*) FROM "ProductImage") AS images,
 (SELECT count(*) FROM "ProductSpecification") AS specifications;
SELECT migration_name, checksum, finished_at IS NOT NULL AS finished,
       rolled_back_at IS NOT NULL AS rolled_back
FROM "_prisma_migrations" ORDER BY migration_name;
ROLLBACK;
~~~

Audit reference counts: Category 377, Product 27, User 5, Order 3, ProductImage 1,
ProductSpecification 53; 8 applied migrations. Compare against the actual backup snapshot baseline.

In a NEW PowerShell session in the project directory, temporarily set DATABASE_URL to the isolated
restore URL via a hidden prompt. This process environment overrides dotenv's production .env.
Do not edit .env. Do not print native diagnostics containing connection strings to shared logs.

~~~powershell
$stagePreviousUrl = $env:DATABASE_URL
$stageRestoreSecret = Read-Host 'Paste ONLY the verified isolated restore database URL (hidden)' -AsSecureString
try {
    $env:DATABASE_URL = [System.Net.NetworkCredential]::new('', $stageRestoreSecret).Password
    $stageRestoreUri = [uri]$env:DATABASE_URL
    if ($stageRestoreUri.AbsolutePath -ne '/remaro_restore_test') { throw 'Unexpected test database name.' }
    if ($stageRestoreUri.Host -like '*-pooler.*') { throw 'Use the test direct endpoint.' }
    # The database-name check is an additional guard, not proof of branch isolation.
    npx prisma validate
    if ($LASTEXITCODE -ne 0) { throw 'Prisma validation failed.' }
    npx prisma migrate status
    if ($LASTEXITCODE -ne 0) { throw 'Restored migration history failed validation.' }
    npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
    if ($LASTEXITCODE -ne 0) { throw 'Restored schema differs or comparison failed.' }
} finally {
    $env:DATABASE_URL = $stagePreviousUrl
    $stageRestoreSecret.Dispose()
    Remove-Variable stagePreviousUrl,stageRestoreUri -ErrorAction SilentlyContinue
}
~~~

Compare all 8 migration checksums with the release's migration.sql files; verify unique constraints,
foreign keys, enums and counts. Run application smoke checks against the isolated target with
production side effects disabled. Record elapsed restore time, result, archive hash and baseline.
Do not execute migrations, seed or category sync --apply as part of restore validation.

## Category decisions still required

Runtime hierarchy matches development seed for all 13 conflicts; canonical flattens those leaves
under building-materials. Keep the existing DB hierarchy pending catalog-owner approval.
Moving them would change breadcrumbs/navigation and remove products from the intermediate parent pages.

Extras insulation and sheet-materials are active parents (4 children each): recommend ADD TO CANONICAL.
wall-materials, roofing and rolled-metal are empty legacy seed categories: NEEDS MANUAL REVIEW.
remaro-admin-test is a test category with 1 DB product (0 public products after filtering), no children,
and no mapped image: NEEDS MANUAL REVIEW. It is exposed by category queries and sitemap; no category
visibility filter exists. Do not delete or move it automatically.

Names: preserve current DB names pending editorial approval. floor-mixes canonical name "Наливные полы"
is narrower than current "Смеси для пола"; do not treat this as a spelling-only rename.
