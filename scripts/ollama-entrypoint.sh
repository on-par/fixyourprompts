#!/bin/sh

ollama serve &

# Wait for the server to be ready
while ! nc -z localhost 11434; do
  sleep 0.1
done

ollama pull llama2

# Keep the container running
wait
