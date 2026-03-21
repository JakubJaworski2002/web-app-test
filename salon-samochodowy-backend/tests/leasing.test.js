/**
 * Leasing Calculator Unit Tests
 * Test scope: "Zakup samochodu/obliczanie leasingu"
 * 
 * TC 01 - TC 03: Parametry leasingu (wpłata, okres, wiek auta)
 * TC 04 - TC 05: Walidacja identyfikatorów klienta (NIP, PESEL)
 * TC 06 - TC 09: Kalkulacja rat i specjalne opcje
 */

import {
  validateLeasingParameters,
  normalizeDownPayment,
  calculateMonthlyRate,
  validateNIP,
  validatePESEL,
  validateClientIdentifier,
  convertCurrency,
  checkCarLeasingEligibility,
} from '../leasing.utils.js';

describe('Leasing Calculator - TC 01: Parametry leasingu', () => {
  /**
   * TC 01_NJ: Wpłata własna: 10%, Okres: 36 miesięcy
   * Wymagane: Rata obliczona poprawnie (R1, R3)
   */
  test('TC 01 - should calculate monthly rate correctly with 10% down payment and 36 month period', () => {
    const carPrice = 100000; // 100k PLN
    const downPayment = 10;
    const period = 36;

    const result = calculateMonthlyRate(carPrice, downPayment, period);

    expect(result.monthlyRate).toBeGreaterThan(0);
    expect(result.monthlyRate).toBeLessThan(carPrice); // Rata nie może być wyższa niż cena samochodu
    expect(result.downPaymentAmount).toBe(10000); // 10% z 100k
    expect(result.financingAmount).toBe(90000); // Pozostało do sfinansowania
    expect(result.leasePeriodMonths).toBe(36);
    expect(result.currency).toBe('PLN');
    expect(result.totalCost).toBeCloseTo(result.monthlyRate * 36, 1);
  });

  /**
   * TC 02_NJ: Wpłata własna: 60% (powyżej limitu)
   * Wymagane: Autokorekta do 50% lub błąd (R1)
   */
  test('TC 02 - should normalize down payment to maximum 50% when input exceeds limit', () => {
    const carPrice = 100000;
    const exceedingDownPayment = 60;
    const period = 36;

    const result = calculateMonthlyRate(carPrice, exceedingDownPayment, period);

    // Powinna być znormalizowana do 50%
    expect(result.downPaymentAmount).toBe(carPrice * 0.5);
    expect(result.financingAmount).toBe(carPrice * 0.5);
  });

  /**
   * TC 03_NJ: Okres leasingu: 5 miesięcy (poniżej limitu)
   * Wymagane: Błąd - minimalny okres 12 miesięcy (R1)
   */
  test('TC 03 - should reject lease period below 12 months', () => {
    const carPrice = 100000;
    const downPayment = 10;
    const shortPeriod = 5;

    const validation = validateLeasingParameters(downPayment, shortPeriod, 2020);

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Okres leasingu musi być między 12 a 84 miesięcy');
  });
});

describe('Leasing Calculator - TC 04-05: Identyfikacja Klienta', () => {
  /**
   * TC 04_NJ: NIP: "12345" (za krótki)
   * Wymagane: Komunikat o błędzie (R2)
   */
  test('TC 04 - should reject NIP shorter than 10 digits', () => {
    const invalidNIP = '12345';

    const result = validateClientIdentifier(invalidNIP, 'company');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('NIP musi mieć 10 cyfr');
  });

  /**
   * TC 05_NJ: PESEL: "90010112345"
   * Wymagane: Walidacja pozytywna (11 cyfr) (R2)
   */
  test('TC 05 - should validate PESEL with correct 11 digits', () => {
    const validPESEL = '90010112345';

    const result = validateClientIdentifier(validPESEL, 'individual');

    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });
});

describe('Leasing Calculator - TC 06: Wiek samochodu', () => {
  /**
   * TC 06_NJ: Auto rocznik: 2010 (14 lat w 2024)
   * Wymagane: Brak opcji leasing (auto za stare) (R1)
   */
  test('TC 06 - should reject car older than 10 years for leasing', () => {
    const oldCarYear = 2010;
    const carStatus = 'Available';

    const eligibility = checkCarLeasingEligibility(oldCarYear, carStatus);

    expect(eligibility.isEligible).toBe(false);
    expect(eligibility.errors).toContain('Samochód jest za stary (wymagane < 10 lat)');
    expect(eligibility.carAge).toBeGreaterThanOrEqual(10);
  });
});

describe('Leasing Calculator - TC 07: Ubezpieczenie GAP', () => {
  /**
   * TC 07_NJ: Zaznaczenie "Ubezpieczenie GAP"
   * Wymagane: Rata powiększona o koszt GAP (R3)
   */
  test('TC 07 - should add GAP insurance cost to monthly rate', () => {
    const carPrice = 100000;
    const downPayment = 10;
    const period = 36;

    const resultWithoutGAP = calculateMonthlyRate(carPrice, downPayment, period, false);
    const resultWithGAP = calculateMonthlyRate(carPrice, downPayment, period, true);

    expect(resultWithGAP.includesGAPInsurance).toBe(true);
    expect(resultWithGAP.gapInsuranceCost).toBeGreaterThan(0);
    expect(resultWithGAP.monthlyRate).toBeGreaterThan(resultWithoutGAP.monthlyRate);
    // Przybliżona sprawdzenie że dodatkowy koszt to ~1% raty
    const expectedGAPCost = Math.round(resultWithoutGAP.monthlyRate * 0.01 * 100) / 100;
    expect(resultWithGAP.gapInsuranceCost).toBeCloseTo(expectedGAPCost, 1);
  });
});

describe('Leasing Calculator - TC 08: Zmiana walut', () => {
  /**
   * TC 08_NJ: Zmiana waluty na EUR
   * Wymagane: Wszystkie kwoty przeliczone po kursie (R3)
   */
  test('TC 08 - should convert monthly rate to different currency', () => {
    const carPrice = 100000;
    const downPayment = 10;
    const period = 36;
    
    const resultPLN = calculateMonthlyRate(carPrice, downPayment, period, false, 'PLN');
    
    const exchangeRates = {
      PLN_EUR: 0.24, // 1 PLN = 0.24 EUR (przykładowy kurs)
      PLN_USD: 0.25,
    };

    const rateInEUR = convertCurrency(
      resultPLN.monthlyRate,
      'PLN',
      'EUR',
      exchangeRates
    );

    expect(rateInEUR).toBeCloseTo(resultPLN.monthlyRate * 0.24, 1);
    expect(rateInEUR).toBeLessThan(resultPLN.monthlyRate);
  });
});

describe('Leasing Calculator - TC 09: Validacja API', () => {
  /**
   * TC 09_NJ: POST /lease/calc z ceną ujemną
   * Wymagane: HTTP 400 Bad Request (R3)
   */
  test('TC 09 - should throw error for negative price', () => {
    const negativePricecar = -500;
    const downPayment = 10;
    const period = 36;

    expect(() => {
      calculateMonthlyRate(negativePricecar, downPayment, period);
    }).toThrow('Cena samochodu nie może być ujemna');
  });
});

describe('Leasing Calculator - TC 19: Wpłata bez wkładu własnego', () => {
  /**
   * TC 19_NJ: Wpłata własna: 0%
   * Wymagane: Poprawna rata (leasing bez wpłaty) (R1)
   */
  test('TC 19 - should calculate rate with 0% down payment (full financing)', () => {
    const carPrice = 100000;
    const noDownPayment = 0;
    const period = 36;

    const result = calculateMonthlyRate(carPrice, noDownPayment, period);

    expect(result.downPaymentAmount).toBe(0);
    expect(result.financingAmount).toBe(carPrice);
    expect(result.monthlyRate).toBeGreaterThan(0);
    expect(result.monthlyRate).toBeLessThan(carPrice);
    // Bez wpłaty, rata powinna być wyższa niż z wpłatą
    const resultWith10Percent = calculateMonthlyRate(carPrice, 10, period);
    expect(result.monthlyRate).toBeGreaterThan(resultWith10Percent.monthlyRate);
  });
});

describe('Leasing Calculator - Integration tests', () => {
  /**
   * Test: Pełny przepływ walidacji leasingu
   */
  test('should validate complete leasing workflow', () => {
    // 1. Sprawdzenie eligibility samochodu
    const carYear = 2021;
    const carStatus = 'Available';
    const eligibility = checkCarLeasingEligibility(carYear, carStatus);
    expect(eligibility.isEligible).toBe(true);

    // 2. Walidacja parametrów
    const downPayment = 15;
    const leasePeriod = 48;
    const params = validateLeasingParameters(downPayment, leasePeriod, carYear);
    expect(params.isValid).toBe(true);

    // 3. Walidacja identyfikacji klienta
    const clientNIP = '1234567890';
    const clientValidation = validateClientIdentifier(clientNIP, 'company');
    expect(clientValidation.isValid).toBe(true);

    // 4. Kalkulacja raty
    const carPrice = 150000;
    const leasingOffer = calculateMonthlyRate(carPrice, downPayment, leasePeriod, true);
    expect(leasingOffer.monthlyRate).toBeGreaterThan(0);
    expect(leasingOffer.includesGAPInsurance).toBe(true);
  });

  /**
   * Test: Normalizacja wpłaty własnej
   */
  test('should normalize down payment values correctly', () => {
    expect(normalizeDownPayment(35)).toBe(35);
    expect(normalizeDownPayment(50)).toBe(50);
    expect(normalizeDownPayment(75)).toBe(50); // Normalizacja do max
    expect(normalizeDownPayment(-10)).toBe(0); // Min na zero
    expect(normalizeDownPayment(0)).toBe(0);
  });

  /**
   * Test: Edge case - maksymalny okres leasingu
   */
  test('should handle maximum leasing period (84 months)', () => {
    const carPrice = 80000;
    const downPayment = 20;
    const maxPeriod = 84;

    const result = calculateMonthlyRate(carPrice, downPayment, maxPeriod);

    expect(result.leasePeriodMonths).toBe(84);
    expect(result.monthlyRate).toBeGreaterThan(0);
    // Przy dłuższym okresie, rata powinna być niższa
    const shortPeriod = calculateMonthlyRate(carPrice, downPayment, 36);
    expect(result.monthlyRate).toBeLessThan(shortPeriod.monthlyRate);
  });
});
