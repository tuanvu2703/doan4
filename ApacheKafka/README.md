# Kafka Project with SSL/SASL and Kafka UI

## Overview
This project sets up a Kafka cluster with Zookeeper and Kafka UI using Docker Compose. It includes SSL and SASL (SCRAM-SHA-256) for security, and is configured to be publicly accessible via IP 116.109.206.144.

## Prerequisites
- Docker and Docker Compose installed.
- Java Development Kit (JDK) for `keytool`.
- OpenSSL for generating SSL certificates.

## Setup
1. Generate SSL certificates: