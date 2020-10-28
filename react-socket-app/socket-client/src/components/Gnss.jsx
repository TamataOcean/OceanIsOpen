import React, { useEffect, useMemo } from "react";
import { Button } from "@material-ui/core";
import io from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setGnssData } from "../features/sensorsSlice";

const Gnss = () => {
  const dispatch = useDispatch();
  const socket = useMemo(() => io(), []);

  const datetime = useSelector((state) => state.gnss.gps.datetime);
  const lat = useSelector((state) => state.gnss.geo.latitude);
  const lon = useSelector((state) => state.gnss.geo.longitude);
  const speedKmh = useSelector((state) => state.gnss.speed.kmh);
  const speedKnots = useSelector((state) => state.gnss.speed.knots);
  const speedMph = useSelector((state) => state.gnss.speed.mph);

  // Handles socket io events
  useEffect(() => {
    let interval;
    socket.on("connect", () => {
      console.log("connecté à socket.io");
      interval = setInterval(() => socket.emit("refreshGnss"), 5000);
    });
    socket.on("gnssData", (data) => dispatch(setGnssData(data)));

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [socket, dispatch]);

  const handleClick = () => {
    console.log("Refresh GNSS emitted");
    socket.emit("refreshGnss");
  };

  return (
    <>
      <h1>GNSS</h1>
      <p>Modèle: ...</p>
      <p>
        Latitude: {lat ? lat : "..."} ; Longitude: {lon ? lon : "..."}
      </p>
      <p>
        Speed: {speedKnots} kph / {speedKmh} Kmph / {speedMph} mph
      </p>
      <p>DateTime: {new Date(datetime).toLocaleString()}</p>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleClick}
      >
        Refresh
      </Button>
    </>
  );
};

export default Gnss;
