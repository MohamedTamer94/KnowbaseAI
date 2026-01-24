from typing import List, Dict, Generator
from groq import Groq, GroqError
from app.config import settings

# Initialize the client
client = Groq(api_key=settings.GROQ_API_KEY)

def chat_completion_stream(
    messages: List[Dict[str, str]],
    temperature: float = 0.2
) -> Generator[str, None, None]:
    """
    Streaming chat completion.
    Yields partial tokens as they arrive.
    """
    try:
        stream = client.chat.completions.create(
            model=settings.GROQ_LLM_MODEL,
            messages=messages,
            temperature=temperature,
            stream=True,
        )

        for event in stream:
            if not event.choices:
                continue

            delta = event.choices[0].delta
            if delta and delta.content:
                yield delta.content

    except GroqError as e:
        yield f"\n[Groq API error] {str(e)}"
    except Exception as e:
        yield f"\n[Unexpected error] {str(e)}"

def rewrite_query_if_needed(query: str, history: list):
    if not history:
        return query

    messages = [
        {
            "role": "system",
            "content": (
                "You rewrite follow-up questions into standalone questions.\n"
                "If the question is already standalone, return it unchanged."
            )
        }
    ]

    for msg in history:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })

    messages.append({
        "role": "user",
        "content": query
    })

    rewritten = client.chat.completions.create(
        model=settings.GROQ_LLM_MODEL,
        messages=messages,
        temperature=0
    )

    return rewritten.choices[0].message.content.strip()
