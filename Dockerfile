# Use Apache AGE with PostgreSQL 16 as base image
FROM apache/age:release_PG16_1.5.0

# Install PostGIS
RUN apt-get update \
    && apt-get install -y \
        postgresql-16-postgis-3 \
        postgresql-16-postgis-3-scripts \
    && rm -rf /var/lib/apt/lists/*