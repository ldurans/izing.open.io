#!/bin/bash

docker run -d --name rabbitmq \
 -p 5672:5672 \
 -p 15672:15672 \
 --restart=always \
 --hostname rabbitmq \
 -v /home/durans/database/rabbitmq/data:/var/lib/rabbitmq \
 rabbitmq:3-management-alpine
