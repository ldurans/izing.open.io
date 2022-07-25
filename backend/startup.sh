#!/bin/bash

docker run -d --name rabbitmq \
 -p 5672:5672 \
 -p 15672:15672 \
 --restart=always \
 --hostname rabbitmq \
 -v /home/durans/database/rabbitmq/data:/var/lib/rabbitmq \
 rabbitmq:3-management-alpine


docker run -d --name redis-izing \
 -p 6378:6379 \
 --restart=always \
 --hostname redis-izing \
 -v /home/durans/database/redis-izing/data:/var/lib/rabbitmq \
 redis:latest


