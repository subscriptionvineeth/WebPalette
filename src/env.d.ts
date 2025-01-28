/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATFONTIS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 