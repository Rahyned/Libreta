# Notas de desarrollo

## Comandos

- Frontend: `npm run dev`, `npm run build`, `npm test` (Vitest), `npm run typecheck`
- Backend/Tauri (desde `src-tauri/`): compilar y testear con cargo. Ojo: `cargo` no está en el PATH del shell; usar la ruta completa `/c/Users/Lau/.cargo/bin/cargo.exe`.
- Toolchain Rust: `x86_64-pc-windows-gnu`. Compilar con `chrono`/`fern` y otras crates de `windows-sys` exige `dlltool.exe`, que vive en `/c/msys64/mingw64/bin/` y no está en PATH. Anteponerlo:

  ```bash
  export PATH="/c/msys64/mingw64/bin:$PATH"
  /c/Users/Lau/.cargo/bin/cargo.exe check|test
  ```

  Sin esto, `cargo` falla con `error calling dlltool 'dlltool.exe': program not found`.