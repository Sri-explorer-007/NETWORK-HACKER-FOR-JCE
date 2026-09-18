from typing import Optional
from pydantic import BaseModel
from app.core.config import settings


class LLMConfig(BaseModel):
    api_key: str = settings.LLM_API_KEY
    model: str = settings.LLM_MODEL
    base_url: Optional[str] = settings.LLM_BASE_URL
    temperature: float = settings.LLM_TEMPERATURE
    timeout: float = settings.LLM_TIMEOUT

    @property
    def is_configured(self) -> bool:
        """Returns True if an API key is present."""
        return bool(self.api_key and self.api_key.strip())


llm_config = LLMConfig()
