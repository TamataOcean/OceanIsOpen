
--tbl for save sensors data + GPS
CREATE TABLE public.sensors
(
        id serial,
        teensy_user character varying,                  --Id du teensy
        teensy_phSensor double precision,               --PH
        teensy_temperatureSensor double precision,      --Température
        teensy_doSensor double precision,               --Oxygene dissoud
        teensy_ecSensor double precision,               --Conductivite electrique
        teensy_tdsSensor double precision,              --Taux de particule
        teensy_orpSensor double precision,              --Oxygenation
        GNSS_DATETIME timestamp without time zone,      --Date GPS
        GNSS_MODELE character varying COLLATE pg_catalog."default", --Modele GNSS ( Standard, Drotek... )
        nmea_latitude double precision,                 --latitude GPS
        nmea_longitude double precision,                --Longitude GPS
        nmea_speed double precision,                    --Vitesse
        nmea_accuracy double precision,                 --//TODO rajouter accuracy dans TamataPostres.js quand il sera dipo dans la trame NMEA
        geom geometry(Point,4326),                      --Geométrie fabrique avec les long lat
            CONSTRAINT sensors_pkey PRIMARY KEY (id)
);
CREATE INDEX sensors_index
    ON public.sensors USING gist
    (geom gist_geometry_ops)
    TABLESPACE pg_default;

--make Geom with lon_lat
CREATE OR REPLACE FUNCTION public.func_add_geom()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    IMMUTABLE NOT LEAKPROOF
AS $BODY$
BEGIN
  NEW.geom = st_setsrid(st_makepoint(NEW.nmea_longitude,NEW.nmea_latitude), 4326) AS geom;
  RETURN NEW;
END;
$BODY$;

CREATE  TRIGGER add_geom
    BEFORE INSERT OR UPDATE 
    ON public.sensors
    FOR EACH ROW
    EXECUTE PROCEDURE public.func_add_geom();

--View make nav line
CREATE OR REPLACE VIEW nav_line AS
SELECT row_number() OVER () AS id_unique,
st_makeline(sensors.geom ORDER BY GNSS_DATETIME) AS newgeom
FROM sensors
GROUP BY sensors.GNSS_DATETIME;
