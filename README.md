# COS API

## Features

- **NestJS**: A progressive Node.js framework for building efficient, scalable, and maintainable server-side applications.
- **Prisma**: Next-generation ORM for TypeScript and Node.js.
- **MySQL**: A widely used relational database.
- **JWT**: JSON Web Tokens for secure transmission of information between parties.
- **Swagger**: API documentation & testing tool.
- **Compodoc**: The missing documentation tool for your NestJS application.


## Prerequisites

- Node.js v16.x or newer
- Docker and Docker Compose

## Getting Started

Clone the repository:
```bash
$ git clone https://github.com/DH-Coder-Dev/COS.API.git
$ cd COS.API
```

Start the MySQL Database with Docker:

```bash
$ docker-compose up -d
```

Install the dependencies:

```bash
$ npm install
```

To sync Prisma with MySql, run:

```bash
$ npm run prisma:migrate
```

## Database Configuration

You will need to set up a Mysql and configure the DATABASE_URL environment variable with your MySql connection string.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
