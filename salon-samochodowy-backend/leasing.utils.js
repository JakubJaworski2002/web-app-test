/**
 * Leasing Calculator Utilities
 * Funkcje pomocnicze do obliczania rat leasingowych
 */

/**
 * Validuje parametry leasingu
 * @param {number} downPaymentPercent - Wpłata własna (0-50%)
 * @param {number} leasePeriodMonths - Okres leasingu (12-84 miesięcy)
 * @param {number} carYear - Rok produkcji samochodu
 * @returns {Object} Rezultat walidacji
 */
export const validateLeasingParameters = (downPaymentPercent, leasePeriodMonths, carYear) => {
  const errors = [];
  const currentYear = new Date().getFullYear();

  if (downPaymentPercent < 0 || downPaymentPercent > 50) {
    errors.push('Wpłata własna musi być między 0% a 50%');
  }

  if (leasePeriodMonths < 12 || leasePeriodMonths > 84) {
    errors.push('Okres leasingu musi być między 12 a 84 miesięcy');
  }

  if (currentYear - carYear >= 10) {
    errors.push('Samochód musi mieć mniej niż 10 lat');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Normalizuje wpłatę własną - jeśli przekracza 50%, zmienia na 50%
 * @param {number} downPaymentPercent - Wpłata własna
 * @returns {number} Znormalizowana wpłata
 */
export const normalizeDownPayment = (downPaymentPercent) => {
  if (downPaymentPercent > 50) {
    return 50;
  }
  if (downPaymentPercent < 0) {
    return 0;
  }
  return downPaymentPercent;
};

/**
 * Oblicza roczną stopę procentową w zależności od warunków leasingu
 * @param {number} leasePeriodMonths - Okres leasingu
 * @returns {number} Roczna stopa %
 */
export const calculateAnnualRate = (leasePeriodMonths) => {
  // Raty sezonowe: krótsze okresy = wyższe stawki
  if (leasePeriodMonths <= 24) {
    return 0.065; // 6.5%
  } else if (leasePeriodMonths <= 48) {
    return 0.055; // 5.5%
  } else {
    return 0.045; // 4.5%
  }
};

/**
 * Oblicza miesięczną ratę leasingu
 * @param {number} carPrice - Cena samochodu
 * @param {number} downPaymentPercent - Wpłata własna (0-50%)
 * @param {number} leasePeriodMonths - Okres leasingu (12-84)
 * @param {boolean} includeGAPInsurance - Czy doliczyć ubezpieczenie GAP
 * @param {string} currency - Waluta (default: PLN)
 * @returns {Object} Rezultat kalkulacji
 */
export const calculateMonthlyRate = (
  carPrice,
  downPaymentPercent,
  leasePeriodMonths,
  includeGAPInsurance = false,
  currency = 'PLN'
) => {
  // Validacja ceny
  if (carPrice < 0) {
    throw new Error('Cena samochodu nie może być ujemna');
  }

  // Normalizacja wpłaty
  const normalizedDownPayment = normalizeDownPayment(downPaymentPercent);

  // Obliczenie kwoty do sfinansowania
  const downPaymentAmount = (carPrice * normalizedDownPayment) / 100;
  const financingAmount = carPrice - downPaymentAmount;

  // Stopa procentowa
  const annualRate = calculateAnnualRate(leasePeriodMonths);
  const monthlyRate = annualRate / 12;

  // Obliczenie raty - formula: P * [r(1+r)^n] / [(1+r)^n - 1]
  const numerator = financingAmount * monthlyRate * Math.pow(1 + monthlyRate, leasePeriodMonths);
  const denominator = Math.pow(1 + monthlyRate, leasePeriodMonths) - 1;
  let monthlyPayment = numerator / denominator;

  // Koszt ubezpieczenia GAP (1% raty podstawowej rocznie)
  let gapInsuranceCost = 0;
  if (includeGAPInsurance) {
    gapInsuranceCost = (monthlyPayment * 0.01);
    monthlyPayment += gapInsuranceCost;
  }

  // Zaokrąglenie
  monthlyPayment = Math.round(monthlyPayment * 100) / 100;

  return {
    monthlyRate: monthlyPayment,
    totalCost: monthlyPayment * leasePeriodMonths,
    downPaymentAmount: Math.round(downPaymentAmount * 100) / 100,
    financingAmount: Math.round(financingAmount * 100) / 100,
    gapInsuranceCost: Math.round(gapInsuranceCost * 100) / 100,
    includesGAPInsurance: includeGAPInsurance,
    currency,
    leasePeriodMonths,
    annualRate: (annualRate * 100).toFixed(2),
  };
};

/**
 * Validuje NIP (dla firm)
 * @param {string} nip - NIP do walidacji
 * @returns {boolean} Czy NIP jest poprawny
 */
export const validateNIP = (nip) => {
  const cleanNIP = nip.replace(/\D/g, '');
  return cleanNIP.length === 10 && /^\d{10}$/.test(cleanNIP);
};

/**
 * Validuje PESEL (dla osób prywatnych)
 * @param {string} pesel - PESEL do walidacji
 * @returns {boolean} Czy PESEL jest poprawny
 */
export const validatePESEL = (pesel) => {
  const cleanPESEL = pesel.replace(/\D/g, '');
  return cleanPESEL.length === 11 && /^\d{11}$/.test(cleanPESEL);
};

/**
 * Validuje identyfikator klienta (NIP dla firm, PESEL dla osób)
 * @param {string} identifier - NIP/PESEL
 * @param {string} clientType - Typ klienta: 'company' lub 'individual'
 * @returns {Object} Rezultat walidacji
 */
export const validateClientIdentifier = (identifier, clientType) => {
  if (clientType === 'company') {
    const isValid = validateNIP(identifier);
    return {
      isValid,
      error: !isValid ? 'NIP musi mieć 10 cyfr' : null,
    };
  } else if (clientType === 'individual') {
    const isValid = validatePESEL(identifier);
    return {
      isValid,
      error: !isValid ? 'PESEL musi mieć 11 cyfr' : null,
    };
  }

  return {
    isValid: false,
    error: 'Nieznany typ klienta',
  };
};

/**
 * Przelicza ratę na inną walutę
 * @param {number} amount - Kwota do przeliczenia
 * @param {string} fromCurrency - Waluta źródłowa
 * @param {string} toCurrency - Waluta docelowa
 * @param {Object} exchangeRates - Kursy wymiany
 * @returns {number} Przeliczona kwota
 */
export const convertCurrency = (amount, fromCurrency, toCurrency, exchangeRates) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rate = exchangeRates[`${fromCurrency}_${toCurrency}`];
  if (!rate) {
    throw new Error(`Brak kursu wymiany dla ${fromCurrency} -> ${toCurrency}`);
  }

  return Math.round(amount * rate * 100) / 100;
};

/**
 * Sprawdza czy samochód kwalifikuje się do leasingu
 * @param {number} carYear - Rok produkcji samochodu
 * @param {string} carStatus - Status samochodu (Available, Sold, Reserved)
 * @returns {Object} Rezultat weryfikacji
 */
export const checkCarLeasingEligibility = (carYear, carStatus) => {
  const currentYear = new Date().getFullYear();
  const carAge = currentYear - carYear;
  
  const errors = [];

  if (carAge >= 10) {
    errors.push('Samochód jest za stary (wymagane < 10 lat)');
  }

  if (carStatus !== 'Available') {
    errors.push(`Samochód nie jest dostępny do leasingu (status: ${carStatus})`);
  }

  return {
    isEligible: errors.length === 0,
    errors,
    carAge,
  };
};

export default {
  validateLeasingParameters,
  normalizeDownPayment,
  calculateAnnualRate,
  calculateMonthlyRate,
  validateNIP,
  validatePESEL,
  validateClientIdentifier,
  convertCurrency,
  checkCarLeasingEligibility,
};
