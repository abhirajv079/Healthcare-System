## Healthcare-System (NestJS Backend)

Simple NestJS backend for a healthcare application.  
Currently it exposes a basic `GET /hello` endpoint for learning and verification.

---

### How this project was created

In an empty folder:

```bash
cd E:\Desktop\Healthcare-System
npx @nestjs/cli new .
```

When prompted, choose `npm` as the package manager.

---

### How to run the project

From the project root:

```bash
npm install
npm run start:dev
```

The server will start on `http://localhost:3000`.

---

### Hello World API

- **Route**: `GET /hello`  
- **Response**:

```json
{ "message": "Hello World" }
```

The implementation lives in the `hello` module (`src/hello`).

