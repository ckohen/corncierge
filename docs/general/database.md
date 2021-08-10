## About

The database is a critical piece of infrastructure needed for bots that run on this module. This module uses an SQL database, namely MySQL or MariaDB, which can be used interchangeably. The database will store some user data, so make sure access to it is well protected and follow any local guidelines for user generated content.

## Getting Ready

First, you will need to install [MySQL](https://www.mysql.com/) or [MariaDB](https://mariadb.org/) on whatever server you will be using. This can also be offloaded to another server as caching is being used to ensure quick access.

After installing the database, you will need to configure it with the required tables as well as any additional tables for the built in commands you will be using. These are listed below. All tables use the utf8 charset with a utf8_bin collation.

## Required Tables

#### Settings

The settings table contains critical information for runtime, it uses a key value pair

| Column Name | Datatype     |
| ----------- | ------------ |
| name        | VARCHAR(255) |
| value       | VARCHAR(255) |