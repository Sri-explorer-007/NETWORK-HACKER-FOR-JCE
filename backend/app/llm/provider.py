from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import httpx
import json

from app.llm.config import LLMConfig, llm_config


class LLMProvider(ABC):
    """Abstract base class for LLM completion providers."""

    @abstractmethod
    def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Generates a text/JSON completion from the LLM provider."""
        pass


class OpenAILikeProvider(LLMProvider):
    """Provider implementation for OpenAI-compatible REST endpoints (OpenAI, Groq, Ollama, vLLM, Gemini, etc.)."""

    def __init__(self, config: Optional[LLMConfig] = None):
        self.config = config or llm_config
        self.base_url = (self.config.base_url or "https://api.openai.com/v1").rstrip("/")
        self.api_key = self.config.api_key
        self.model = self.config.model
        self.temperature = self.config.temperature
        self.timeout = self.config.timeout

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        if not self.api_key:
            raise ValueError("LLM API key is not configured. Provider cannot make external API calls.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": self.temperature,
            "response_format": {"type": "json_object"},
        }

        url = f"{self.base_url}/chat/completions"

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"LLM API HTTP Error ({e.response.status_code}): {e.response.text}") from e
        except Exception as e:
            raise RuntimeError(f"LLM Provider Connection Error: {str(e)}") from e


class MockLLMProvider(LLMProvider):
    """Mock LLM provider for unit testing without network dependencies."""

    def __init__(self, mock_response_json: Optional[Dict[str, Any]] = None):
        self.mock_response_json = mock_response_json or {}

    def set_mock_response(self, response_data: Dict[str, Any]):
        self.mock_response_json = response_data

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        return json.dumps(self.mock_response_json)
