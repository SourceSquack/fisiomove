from slowapi import Limiter
from slowapi.util import get_remote_address

# Central limiter instance used by the application. Import this from
# other modules to avoid circular imports with app.main.
# For production, set storage_uri to a Redis URL via environment or config.
limiter = Limiter(key_func=get_remote_address)
