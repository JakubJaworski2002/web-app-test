# Audyt UX — Salon Samochodowy

## Persony

| Persona | Rola | Cel | Pain Points |
|---------|------|-----|-------------|
| Admin/Dealer | Zarządza flotą | Dodawanie/edycja/usuwanie aut, zarządzanie klientami | Brak dashboardu, brak statystyk |
| Klient | Wynajem/zakup | Przeglądanie, wynajem, leasing | Brak historii transakcji, brak profilu |
| Anonimowy | Przeglądanie | Ogląda ofertę | Brak CTA do rejestracji |

## 15 Zidentyfikowanych Problemów UX

| ID | Problem | Severity | Ekran | Sprint naprawy |
|----|---------|----------|-------|----------------|
| UX-001 | Brak loading indicator podczas API | HIGH | car-list | Sprint 3 |
| UX-002 | Collapse bez animacji i feedbacku | MEDIUM | car-list | Sprint 3 |
| UX-003 | Błędy formularza loginowania nieczytelne | HIGH | login | Sprint 3 |
| UX-004 | Pusta lista — brak stanu empty state | MEDIUM | car-list | Sprint 3 |
| UX-005 | Usuwanie przez browser confirm() | MEDIUM | car-list | Sprint 3 |
| UX-006 | Brak sukces-feedbacku po akcjach | HIGH | wiele | Sprint 3 |
| UX-007 | Brak breadcrumb car-list → car-detail | LOW | car-detail | Sprint 3 |
| UX-008 | Pole wyszukiwania bez clear/reset | LOW | car-list | Sprint 3 |
| UX-009 | Brak placeholder zdjęcia | MEDIUM | car-list, car-detail | Sprint 3 |
| UX-010 | Brak paginacji (wszystkie auta naraz) | HIGH | car-list | Sprint 2 |
| UX-011 | Walidacja formularzy tylko po submit | MEDIUM | wszystkie formy | Sprint 3 |
| UX-012 | Brak keyboard navigation listy | MEDIUM | car-list | Sprint 4 |
| UX-013 | Modalne z-index na mobile | LOW | modalne | Sprint 3 |
| UX-014 | Brak przycisku "Powrót" na car-detail | MEDIUM | car-detail | Sprint 3 |
| UX-015 | Privacy policy orphaned (brak linku) | LOW | footer | Sprint 3 |

## Proponowane Naprawy (Najważniejsze)

### UX-001: Loading Indicator
```html
<!-- Dodaj do car-list.component.html -->
<div *ngIf="isLoading" class="d-flex justify-content-center py-5">
    <mat-spinner diameter="48"></mat-spinner>
</div>
<div *ngIf="!isLoading && filteredCars.length === 0" class="empty-state">
    <img src="assets/empty-cars.svg" alt="">
    <p>Brak samochodów spełniających kryteria</p>
</div>
```

### UX-006: Toast Notifications (zamiast alert)
```typescript
// Zastąp: alert('Samochód usunięty')
// Przez:
this.snackBar.open('✅ Samochód usunięty pomyślnie', 'OK', { duration: 3000 });
```

### UX-009: Placeholder zdjęcia
```html
<img [src]="car.image || 'assets/car-placeholder.svg'"
     [alt]="car.brand + ' ' + car.model"
     loading="lazy">
```
