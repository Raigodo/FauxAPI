**FauxAPI**
A lightweight local backand emulator that allows you to store json data or files under custom url paths, simulating multi-user backend environment.
It is meant to be used in local development only, while building frontend without backend ready yet.

**Features**

- Store JSON data or files in a structured path-based system
- Custom namespaces (url paths) for resources, e.g., /my/custom/path
- Supports multiple users - user namespaces are isolated from each other
- Recursive nested namespace and resource deletion

**Usage**
**Endpoints**

POST /api/auth/register - create new user
POST /api/auth/login - get access token and refresh token for speciffic user
POST /api/auth/refresh - get new access token and refresh token using latest refresh token
DELETE /api/auth/logout - delete refrsh token, so no more access tokens can be issued (current access token is still valid)

GET /api/users - list all users
GET /api/users/{id} - get speciffic user
DELETE /api/users/{id} - delete user

GET /api/resources/{*namespace}/{id} - get any owned resource in namespace under key
PUT /api/resources/{*namespace}/{id} - store json or file in speciffic namespace under key
DELETE api/resources/{\*namespace}/{id} - delete resource in speciffic namespace under key

GET /api/namespaces - get root level (not nested) namespaces for current user
GET /api/namespaces/{*namespace} - get speciffic namespace
DELETE /api/namespaces/{*namespace} - delete speciffic namespace and all of its nested contents

**Important aspects:**

- you can not create namespaces directly, they are created automatically
- if namespace no longer contains resources, it will be deleted
- non GEt method endpoints returns 204 No Content
- it is possible to store resource without speciffying namespace

**Response examples**
**User**

**Getting Started**
**Prerequisites**

- Docker / Docker Desktop
- Node and npm

**Steps**

1. clone repository:
   git clone https://github.com/Raigodo/FauxAPI.git
2. clone .env.example and rename it to .env
3. start FauxAPi container:  
   docker compose up -d
