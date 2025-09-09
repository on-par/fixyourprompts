FROM ollama/ollama

RUN apt-get update && apt-get install -y netcat-traditional

COPY ollama-entrypoint.sh /scripts/ollama-entrypoint.sh
RUN chmod +x /scripts/ollama-entrypoint.sh

ENTRYPOINT ["/scripts/ollama-entrypoint.sh"]
