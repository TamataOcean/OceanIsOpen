--tbl for save sensors data + GPS
CREATE TABLE public.sensors
(
	id serial,
	teensy_user character varying, 
	teensy_phSensor double precision,
	teensy_temperatureSensor double precision,
	teensy_doSensor double precision,
	teensy_ecSensor double precision,
	teensy_tdsSensor double precision,
	teensy_orpSensor double precision,
	nmea_date date,
	nmea_time time without time zone,
	nmea_latitude double precision,
	nmea_longitude double precision,
	nmea_speed double precision,	
--	precision_nmea double precision, -- si besoin et si rajouté dans TamataPostres.js
--	mqttUser character varying, -- si plusieurs teensy
	geom geometry(Point,4326),
	    CONSTRAINT sensors_pkey PRIMARY KEY (id)
);
CREATE INDEX sensors_index
    ON public.sensors USING gist
    (geom gist_geometry_ops)
    TABLESPACE pg_default;

--make Geom with lon_lat
CREATE FUNCTION public.func_add_geom()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    IMMUTABLE NOT LEAKPROOF
AS $BODY$
BEGIN
  NEW.geom=st_setsrid(st_makepoint(longitude::double precision,latitude::double precision), 4326) AS geom;
  RETURN NEW;
END;
$BODY$;

CREATE TRIGGER add_geom
    AFTER INSERT OR UPDATE 
    ON public.sensors
    FOR EACH ROW
    EXECUTE PROCEDURE public.func_add_geom();

--View make nav line
CREATE OR REPLACE VIEW nav_line AS
SELECT row_number() OVER () AS id_unique,
st_makeline(sensors.geom ORDER BY ((sensors.nmea_date || ' '::text) || sensors.nmea_time)) AS newgeom
FROM sensors
GROUP BY sensors.nmea_date;

	
	
