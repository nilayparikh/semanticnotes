/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITEST?: boolean | string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*?worker" {
  const WorkerFactory: {
    new (): Worker;
  };

  export default WorkerFactory;
}

declare module "wa-sqlite/src/examples/IDBMinimalVFS.js" {
  export class IDBMinimalVFS {
    name: string;

    constructor(name?: string);
  }
}
