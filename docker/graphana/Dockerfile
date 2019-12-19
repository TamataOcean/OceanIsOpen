#docker run --rm --privileged multiarch/qemu-user-static:register --reset

FROM resin/raspberrypi3-debian:buster
MAINTAINER Julien Ancelin<julien.ancelin@inra.fr>

RUN [ "cross-build-start" ]

RUN  export DEBIAN_FRONTEND=noninteractive
ENV  DEBIAN_FRONTEND noninteractive
RUN dpkg-divert --local --rename --add /sbin/initctl

#install 
RUN apt-get update \
  && apt-get install -y software-properties-common wget \
  && add-apt-repository "deb https://packages.grafana.com/oss/deb stable main" \
  && wget -q -O - https://packages.grafana.com/gpg.key | apt-key add - \
  && apt-get update \
  && apt-get install -y grafana apt-transport-https

RUN systemctl enable grafana-server.service 
CMD service grafana-server start

RUN [ "cross-build-end" ]
