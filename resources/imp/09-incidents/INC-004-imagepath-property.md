# INC-004 — Błędna Nazwa Właściwości `imagePath` zamiast `image`

| Pole | Wartość |
|------|---------|
| **ID** | INC-004 |
| **Severity** | 🔵 LOW |
| **Status** | ✅ FIXED |
| **Odkryto** | 2026-03-29 |
| **Naprawiono** | 2026-03-29 |
| **Komponent** | `salon-samochodowy-backend/server.js` |
| **Linia** | 267 |

## Opis

W odpowiedzi endpointu upload używano `car.imagePath` zamiast `car.image`. Model `Car` definiuje pole `image` (models.js:131), nie `imagePath`. Powodowało to zwracanie `imagePath: undefined` w odpowiedzi JSON.

## Naprawa

```javascript
// PRZED:
res.status(200).json({ message: 'Zdjęcie dodane pomyślnie', imagePath: car.imagePath });

// PO:
res.status(200).json({ message: 'Zdjęcie dodane pomyślnie', imagePath: car.image });
```

**Status: ✅ Naprawione w sesji 2026-03-29**
