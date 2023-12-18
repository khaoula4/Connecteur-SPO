#!/bin/bash

# Wait for Keycloak to be healthy
echo "Waiting for Keycloak to be healthy..."
until $(curl --output /dev/null --silent --head --fail http://keycloak:8080/auth); do
    printf '.'
    sleep 5
done

echo "Keycloak is up and running."

# Start the main application
exec "$@"

# REMARK!!! Need to change CRLF to LF for this file