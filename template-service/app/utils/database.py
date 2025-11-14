#normalize aiven url
def normalize_url(url: str):
    # Convert postgres:// → postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    # Remove ?sslmode=require (asyncpg doesn't support it)
    if "sslmode" in url:
        url = url.split("?")[0]

    return url