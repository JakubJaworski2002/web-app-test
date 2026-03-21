R1 - Email:
    - Musi zawierać znak @
    - Musi zawierać część domenową
    - Musi być unikalny przy rejestarcji (inaczej oznacza to, że użytkownik już istnieje)

R2 - Hasło:
    - Minimum 8 znaków
    - Minimum 1 wielka litera
    - Minimum 1 cyfra
    - Minimum 1 znak specjalny

R3 - Tworzenie klienta przez administratora:
    - Użytkownik musi mieć rolę administratora
    - Wymagane pola klienta muszą być uzupełnione
    - Email klienta musi być unikalny

| Test Case | Input                           | War. WE                                  | War. WY                            | Rezultat | REQ    | 
|-----------|---------------------------------|------------------------------------------|------------------------------------|----------|--------|
| TC 1      | "test@wp.pl"                    |                                          |                                    | +        | R1     |     
| TC 2      | "testwp.pl"                     |                                          |                                    | -        | R1     |     
| TC 3      | "test@"                         |                                          |                                    | -        | R1     |     
| TC 4      | "@wp.pl"                        |                                          |                                    | -        | R1     |     
| TC 5      | " "                             |                                          |                                    | -        | R1     |     
| TC 6      | "test @wp.pl"                   |                                          |                                    | -        | R1     |     
| TC 7      | "test@@wp.pl"                   |                                          |                                    | -        | R1     |     
| TC 8      | "test@sub.wp.pl"                |                                          |                                    | +        | R1     |     
| TC 9      | "test@wp.pl" (duplikat)         | email "test@wp.pl" istnieje już w bazie  |                                    | -        | R1     |     
| TC 10     | "TEST@WP.PL"                    |                                          |                                    | +        | R1     |     
| TC 11     | "Passw0rd!"                     |                                          |                                    | +        | R2     |     
| TC 12     | "Pass1!"                        |                                          |                                    | -        | R2     |     
| TC 13     | "Passw0r!"                      |                                          |                                    | +        | R2     |     
| TC 14     | "passw0rd!"                     |                                          |                                    | -        | R2     |     
| TC 15     | "Password!"                     |                                          |                                    | -        | R2     |     
| TC 16     | "Passw0rd"                      |                                          |                                    | -        | R2     |     
| TC 17     | ""                              |                                          |                                    | -        | R2     |     
| TC 18     | "12345678"                      |                                          |                                    | -        | R2     |     
| TC 19     | "        " (8 spacji)           |                                          |                                    | -        | R2     |     
| TC 20     | "A1!aaaaa"                      |                                          |                                    | +        | R2     |     
| TC 21     | dane klienta — wszystkie pola   | user.role = ADMIN                        | klient zapisany w bazie            | +        | R3     |     
| TC 22     | dane klienta — wszystkie pola   | user.role = USER                         |                                    | -        | R3     |     
| TC 23     | dane klienta — email duplikat   | user.role = ADMIN, email klienta w bazie |                                    | -        | R3     |     
| TC 24     | dane klienta — brak emaila      | user.role = ADMIN                        |                                    | -        | R3     |     
| TC 25     | dane klienta — niekompletne     | user.role = ADMIN                        |                                    | -        | R3     |     
| TC 26     | dane klienta — wszystkie pola   | brak sesji (niezalogowany)               |                                    | -        | R3     |     
| TC 27     | dane klienta — tylko wymagane   | user.role = ADMIN                        | klient zapisany w bazie            | +        | R3     |     
| TC 28     | dane klienta — wszystkie pola   | user.role = ADMIN                        | dane klienta zgodne z wprowadzonymi| +        | R3     |     
| TC 29     | dane klienta — wszystkie pola   | user.role = MODERATOR                    |                                    | -        | R3     |     
| TC 30     | email klienta = email admina    | user.role = ADMIN, email admina w bazie  |                                    | -        | R3     |     
