# INC-003 — Brak Middleware `authenticateSession` na Endpointcie Upload

| Pole | Wartość |
|------|---------|
| **ID** | INC-003 |
| **Severity** | 🟠 HIGH |
| **Status** | ✅ FIXED |
| **Odkryto** | 2026-03-29 (audyt kodu) |
| **Naprawiono** | 2026-03-29 |
| **Komponent** | `salon-samochodowy-backend/server.js` |
| **Linia** | 256 |

## Opis

Endpoint `POST /cars/:id/upload` służący do wgrywania zdjęć samochodów nie posiadał middleware `authenticateSession`. Dowolny niezalogowany użytkownik mógł wgrywać pliki na serwer.

## Naprawa

```javascript
// PRZED:
app.post('/cars/:id/upload', upload.single('image'), async (req, res) => {

// PO (naprawione):
app.post('/cars/:id/upload', authenticateSession, upload.single('image'), async (req, res) => {
```

**Status: ✅ Naprawione w sesji 2026-03-29**
