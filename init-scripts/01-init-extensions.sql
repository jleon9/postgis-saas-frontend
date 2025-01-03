-- Install PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Initialize AGE
CREATE EXTENSION age;
LOAD 'age';
SET search_path = ag_catalog, "$user", public;

-- Create graph
SELECT create_graph('geosocial_graph');

-- Create spatial functions
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 float,
  lon1 float,
  lat2 float,
  lon2 float
)
RETURNS float AS $$
BEGIN
  RETURN ST_Distance(
    ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
    ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
  );
END;
$$ LANGUAGE plpgsql;