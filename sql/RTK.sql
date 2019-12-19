-- Script to create table & function (create geom) for store GNSS RTK data
-- GNSS RTK receiver to postgresql/postgis + make geom

-- FUNCTION: rtk.llh_geom()

-- DROP FUNCTION rtk.llh_geom();

CREATE FUNCTION rtk.llh_geom()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
	BEGIN

UPDATE rtk.llh SET geom=st_setsrid(st_makepoint(llh.longitude, llh.latitude), 4326)
WHERE rtk.llh.id=NEW.llh.id;
RETURN NEW;
	END;
$BODY$;

ALTER FUNCTION rtk.llh_geom()
    OWNER TO postgres;


CREATE TABLE rtk.llh
(
    id serial,
    jour date,
    heure time without time zone,
    latitude numeric,
    longitude numeric,
    height numeric,
    rtk_fix_float_sbas_dgps_single_ppp integer,
    satellites integer,
    sdn numeric,
    sde numeric,
    sdu numeric,
    sdne numeric,
    sdeu numeric,
    sdun numeric,
    age numeric,
    ratio numeric,
    geom geometry(Point,4326),
    CONSTRAINT pk_llh PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE rtk.llh
    OWNER to postgres;

-- Index: index_geom

-- DROP INDEX rtk.index_geom;

CREATE INDEX index_geom
    ON rtk.llh USING gist
    (geom)
    TABLESPACE pg_default;

-- Trigger: update_llh_geom

-- DROP TRIGGER update_llh_geom ON rtk.llh;

CREATE TRIGGER update_llh_geom
    AFTER INSERT
    ON rtk.llh
    FOR EACH ROW
    EXECUTE PROCEDURE rtk.llh_geom();
