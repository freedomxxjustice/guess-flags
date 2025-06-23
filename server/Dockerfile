FROM python:3.12-slim

WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy project files
COPY pyproject.toml poetry.lock* /app/
RUN poetry config virtualenvs.create false \
 && poetry install --no-interaction --no-ansi

COPY . /app
RUN poetry run aerich init -t config_reader.TORTOISE_ORM --location ./db/migrations || true
RUN poetry run aerich init-db || true
CMD ["poetry", "run", "python", "__main__.py"]