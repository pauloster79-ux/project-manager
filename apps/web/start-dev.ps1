# PowerShell script to start the development server with proper environment variables
$env:DATABASE_URL="postgresql://postgres.whyzabaxiqaqffezmrzh:2%21nXxiC%21%3F68Jn7T@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"
$env:POSTGRES_URL="postgresql://postgres.whyzabaxiqaqffezmrzh:2%21nXxiC%21%3F68Jn7T@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"
$env:POSTGRES_URL_NON_POOLING="postgresql://postgres.whyzabaxiqaqffezmrzh:2%21nXxiC%21%3F68Jn7T@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"
$env:LLM_PROVIDER="mock"
$env:LLM_TIMEOUT_MS="8000"
$env:RETRIEVAL_K="10"
$env:RETRIEVAL_DOC_CHUNKS="3"

Write-Host "Environment variables set. Starting development server..."
npm run dev

