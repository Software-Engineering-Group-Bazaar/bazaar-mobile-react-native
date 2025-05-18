# (auth)

## register

| Modul     | ID  | Opis                                      | Očekivani rezultat                          |
|-----------|-----|-------------------------------------------|---------------------------------------------|
| register  | 1   | Pokušaj registracije sa svim validnim podacima | Uspješna registracija, prikaz poruke: "Uspješna registracija", redirect |
| register  | 2   | Registracija bez unosa e-maila            | Prikaz poruke: "Molimo popunite sva polja"  |
| register  | 3   | Registracija bez unosa imena              | Prikaz poruke: "Molimo popunite sva polja"  |
| register  | 4   | Registracija bez unosa prezimena          | Prikaz poruke: "Molimo popunite sva polja"  |
| register  | 5   | Registracija bez lozinke                  | Prikaz poruke: "Molimo popunite sva polja"  |
| register  | 6   | Registracija sa postojećim e-mailom       | Prikaz poruke: "Neuspješno kreiranje računa" |
| register  | 7   | Neuspjeh servera ili mrežna greška        | Prikaz poruke: "Došlo je do greške. Pokušajte ponovo." |
| register  | 8   | Uspješan login putem Facebook-a           | Prikaz poruke: "Uspješno ste prijavljeni!", token spašen, redirect na Home |
| register  | 9   | Korisnik otkazuje login                   | Konzola: "Login cancelled", nema radnje     |
| register  | 10  | Greška tokom dohvaćanja AccessToken-a     | Konzola: "Došlo je do greške"              |
| register  | 11  | Server vraća grešku (401, 500...)         | Prikaz poruke: "Neuspješna prijava"        |
| register  | 12  | Uspješan login putem Google naloga        | Prikaz poruke: "Uspješno ste prijavljeni!", token spašen, redirect na Home |
| register  | 13  | Korisnik otkazuje login                   | Konzola: "cancelled", nema promjena        |
| register  | 14  | Google Play Services nije dostupan        | Konzola: "Play services not available"     |
| register  | 15  | SignIn već u toku                         | Prikaz poruke: "Sign-Up in progress"       |
| register  | 16  | Server vraća grešku tokom Google login-a  | Prikaz poruke: "Neuspješna registracija"   |
| register  | 17  | Promjena jezika sa engleskog na bosanski i obrnuto | Prikaz sadržaja na odabranom jeziku |


## login

| Modul   | ID  | Opis                                      | Očekivani rezultat                          |
|---------|-----|-------------------------------------------|---------------------------------------------|
| login   | 18  | Pokušaj login-a bez unosa emaila i lozinke | Prikaz poruke: "Molimo popunite sva polja" |
| login   | 19  | Login sa neodobrenim nalogom              | Prikaz poruke: "Vaš račun još uvijek nije odobren" |
| login   | 20  | Login sa pogrešnom lozinkom               | Prikaz poruke: "Pogrešan email ili lozinka" |
| login   | 21  | Server greška tokom login-a               | Prikaz poruke: "Došlo je do greške. Pokušajte ponovo." |
| login   | 22  | Google login: korisnik otkazuje login     | Konzola: "Google Sign-in cancelled"        |
| login   | 23  | Google login: Play Services nisu dostupni | Konzola: "Play services not available"     |
| login   | 24  | Google login: login već u toku            | Konzola: "Sign-in in progress"             |
| login   | 25  | Google login: backend vraća grešku        | Prikaz poruke: "Neuspješna prijava"       |
| login   | 26  | Facebook login: backend vraća grešku      | Prikaz poruke: "Neuspješna prijava"        |


## logout

| Modul   | ID  | Opis                                      | Očekivani rezultat                          |
|---------|-----|-------------------------------------------|---------------------------------------------|
| logout  | 27  | Logout sa važećim tokenom                 | Prikaz poruke: "Uspješno ste odjavljeni", token obrisan, redirect na login |
| logout  | 28  | Logout bez pronađenog tokena u SecureStore | Prikaz poruke: "Uspješno ste odjavljeni", redirect na login |
| logout  | 29  | Logout kada backend vrati grešku          | Prikaz poruke: "Greška pri odjavi"         |
| logout  | 30  | Logout: greška prilikom komunikacije sa serverom | Prikaz poruke: "Došlo je do greške. Pokušajte ponovo." |


## forgot_password

| Modul           | ID  | Opis                                      | Očekivani rezultat                          |
|-----------------|-----|-------------------------------------------|---------------------------------------------|
| for_pass | 31  | Pokušaj resetovanja bez unosa emaila      | Prikaz poruke: "Unesite email"              |
| for_pass | 32  | Reset sa validnim emailom                 | Prikaz poruke: "Poslat ćemo Vam email sa kodom za reset", redirect na new_password |
| for_pass | 33  | Reset sa nepostojećim emailom             | Prikaz poruke: "Resetovanje lozinke nije uspjelo" |
| for_pass | 34  | Reset uz gubitak interneta                | Prikaz poruke: "Došlo je do greške. Pokušajte ponovo." |

## new_password

| Modul        | ID  | Opis                                      | Očekivani rezultat                          |
|--------------|-----|-------------------------------------------|---------------------------------------------|
| new_pass | 35  | Pokušaj bez unosa emaila                  | Prikaz poruke: "Unesite email"              |
| new_pass | 36  | Pokušaj bez unosa koda                    | Prikaz poruke: "Unesite kod"                |
| new_pass | 37  | Pokušaj bez unosa lozinke i potvrde       | Prikaz poruke: "Unesite novu lozinku"       |
| new_pass | 38  | Lozinke se ne poklapaju                   | Prikaz poruke: "Lozinke se ne podudaraju"   |
| new_pass | 39  | Validan unos emaila, koda i lozinki       | Prikaz poruke: "Lozinka je uspješno resetovana", redirect na login |
| new_pass | 40  | Backend vraća grešku                      | Prikaz poruke: "Resetovanje lozinke nije uspjelo" |
| new_pass | 41  | Gubitak interneta prilikom slanja         | Prikaz poruke: "Došlo je do greške. Pokušajte ponovo." |


## confirm_reset

| Modul       | ID  | Opis                                      | Očekivani rezultat                          |
|-------------|-----|-------------------------------------------|---------------------------------------------|
| conf_pass   | 42  | Pokušaj potvrde bez unosa koda            | Prikaz poruke: "Unesite verifikacijski kod" |
| conf_pass   | 43  | Unos validnog koda                        | Redirect na /new_password sa validnim tokenom |
| conf_pass   | 44  | Unos nevažećeg verifikacijskog koda       | Prikaz poruke: "Neispravan verifikacijski kod" |
| conf_pass   | 45  | Pokušaj potvrde bez internetske konekcije | Prikaz poruke: "Došlo je do greške. Pokušajte ponovo." |



# (tabs)

## profil

| Modul   | ID  | Opis                                      | Očekivani rezultat                          |
|---------|-----|-------------------------------------------|---------------------------------------------|
| profil  | 46  | Klik na dugme "Moje narudžbe"             | Otvara se ekran orders                      |
| profil  | 47  | Klik na "Odjava" sa validnim tokenom      | Prikaz poruke: "Uspješno ste odjavljeni", redirect na /login |
| profil  | 48  | Klik na "Odjava" sa greškom u SecureStore | Prikaz poruke: "Greška pri odjavi", greška u konzoli |
| profil  | 49  | Provjera prijevoda stringova              | Prikazuju se: "Profil", "Upravljajte svojim profilom", "Odjava", "Moje narudžbe" |
| profil  | 50  | Pritisak back dugmeta nakon odjave        | Ne vraća na profil ekran (blokiran back navigation) |

## home

| Modul   | ID  | Opis                                      | Očekivani rezultat                          |
|---------|-----|-------------------------------------------|---------------------------------------------|
| home    | 51  | Otvaranje Home ekrana                     | Prikaz poruke: "Dobrodošli", "Ovo je Bazaar buyer aplikacija" |
| home    | 52  | Provjera prikaza prevedenog teksta        | Prikazuju se svi stringovi na odabranom jeziku (home, stores, profile, search) |

## cart

### index

| Modul      | ID  | Opis                                      | Očekivani rezultat                          |
|------------|-----|-------------------------------------------|---------------------------------------------|
| cart | 53  | Prikaz prazne korpe                       | Prikaz poruke: "Tvoja korpa je prazna."     |
| cart | 54  | Prikaz artikala u korpi                   | Svaki artikal prikazan sa nazivom i količinom |
| cart | 55  | Klik na artikal u korpi                   | Otvara se ekran s detaljima artikla         |
| cart | 56  | Korištenje maloprodajne cijene            | Cijena = retailPrice × qty                  |
| cart | 57  | Korištenje veleprodajne cijene            | Cijena = wholesalePrice × qty               |
| cart | 58  | Detekcija smanjene količine na stanju     | Prikaz poruke: "Količina za proizvod {{productName}} se promijenila" |
| cart | 59  | Slanje narudžbe sa ispravnim podacima     | Prikaz poruke: "Narudžba uspješna", korpa se prazni |
| cart | 60  | Pokušaj slanja narudžbe sa API greškom    | Prikaz poruke: "Narudžba neuspješna"        |
| cart | 61  | Ukupna cijena prikazana ispravno          | Suma svih artikala sa odgovarajućim cenama  |
| cart | 62  | Dugme "submit_order" samo za nepraznu korpu | Dugme vidljivo samo kada korpa nije prazna |
| cart | 63  | Korištenje auth_tokena iz SecureStore     | API pozivi imaju validan token u headeru    |

### productId

| Modul     | ID  | Opis                                      | Očekivani rezultat                          |
|-----------|-----|-------------------------------------------|---------------------------------------------|
| prodId    | 64  | Prikaz detalja proizvoda pri validnom productId | Detalji proizvoda su ispravno prikazani (naziv, cijena, slike itd.) |
| prodId    | 65  | Prikaz pogreške ako ne postoji proizvod sa datim productId | Prikaz poruke: "Greška prilikom dohvaćanja podataka" |
| prodId    | 66  | Promjena slike proizvoda klikom na strelice lijevo/desno | Slika se mijenja u skladu s kliknutim smjerom |
| prodId    | 67  | Unos validne količine ručno u polje       | Ažurira se stanje i prikazuje se sugestija cijene |
| prodId    | 68  | Unos nevalidne količine (negativan broj, slovo) | Ignoriše se unos, prikaz poruke: "Unesite ispravnu količinu" |
| prodId    | 69  | Povećanje količine klikom na + dugme      | Povećava se količina, prikazuje nova cijena |
| prodId    | 70  | Smanjenje količine klikom na - dugme      | Smanjuje se količina (minimum 1)            |
| prodId    | 71  | Prikaz različite cijene u zavisnosti od wholesaleThreshold | Koristi retailPrice/wholesalePrice prema količini |
| prodId    | 72  | Dodavanje proizvoda u korpu i prikaz sugestije | Prikaz poruke: "Dodaj još {{count}} komada za {{price}} KM" |
| prodId    | 73  | Prikaz pravilne lokalizovane poruke       | Prikaz prevedenih poruka add_suggestion/remove_suggestion |
| prodId    | 74  | Ažuriranje quantityInput nakon promjene   | Vrijednost polja se automatski ažurira      |
| prodId    | 75  | Promjena naslova navigacije               | Navigacijski naslov = ime proizvoda         |

## chat

### index

| Modul | ID  | Opis                                      | Očekivani rezultat                          |
|-------|-----|-------------------------------------------|---------------------------------------------|
| chat  | 76  | Učitavanje razgovora u dummy modu         | Prikazuju se dummy razgovori (Ana, Pero, Iva) sortirani po lastMessageSentAt |
| chat  | 77  | Učitavanje razgovora iz API-ja (live mod) | Prikazuju se stvarni razgovori sa servera, sortirani po datumu |
| chat  | 78  | Token ne postoji u SecureStore            | Prikazuje se greška u konzoli, token ostaje "JWT_TOKEN", moguće greške u API pozivima |
| chat  | 79  | Token postoji, ali API za profil vraća grešku | Ispisuje se greška u console.error, koristi se MOCK_CURRENT_USER_ID kao fallback |
| chat  | 80  | Učitavanje praznog odgovora sa API-ja     | Prikazuje se prazan ekran, bez stavki u listi |
| chat  | 81  | Učitavanje kad API vraća nevalidne podatke | Fallback logika koristi vrijednosti iz glavnog objekta ili prikazuje placeholder tekst |
| chat  | 82  | Klik na razgovor otvara Chat ekran        | Navigacija se vrši na (tabs)/chat/{id} sa parametrima (sellerUsername, otherUserAvatar, buyerUserId, ...) |
| chat  | 83  | Refresh povlači nove podatke              | Poziva se loadConversations(true), lista se osvježava |
| chat  | 84  | Prikaz korisnika bez avatara              | Prikazuje se default avatar (ili prazan ako nije definisan) |
| chat  | 85  | Formatiranje datuma za poruke             | Prikazuje se korektno formatiran relativni datum za svaku poruku |
| chat  | 86  | API vraća status 204 (No Content)         | setConversations([]) se poziva, prikazuje se prazna lista |
| chat  | 87  | API vraća grešku (npr. 500)               | Prikazuje se Alert u dummy modu / greška se loguje u konzoli |
| chat  | 88  | Onemogući više klikova dok traje učitavanje | Navigacija se ne dešava dok se loading ne završi |
| chat  | 89  | Element bez conversationTitle             | Prikazuje se samo sellerUsername i poruka, bez naslova |
| chat  | 90  | Redoslijed prikaza je tačan               | Lista prikazuje Ana (5m), Pero (3h), Iva (2d) – tim redoslijedom |
| chat  | 91  | lastMessageSentAt je null                 | Takvi razgovori se prikazuju na dnu liste |
| chat  | 92  | Prikaz greške ako fetchConversationDetailsAPI ne uspije | Ispisuje se console.warn, koristi se osnovni konverzacijski podatak |

### conversationId

| Modul | ID  | Opis | Očekivani rezultat |
|-------|-----|------|--------------------|
| convId | 93 | Otvaranje chata s validnim ID-om | Prikazuju se sortirane poruke (najnovije prvo), korisnički podaci i status SignalR veze |
| convId | 94 | Otvaranje bez conversationId | Prikazuje se upozorenje i isključuje loader, SignalR status "Disabled" |
| convId | 95 | Uspješno dobavljanje poruka | Poruke se prikazuju sortirano, označavaju se kao pročitane, gasi se spinner |
| convId | 96 | Neuspješno dobavljanje poruka | Prikazuje se greška, gasi se spinner, poruke ostaju iste |
| convId | 97 | Učitavanje starijih poruka | Prikazuje se indikator, dodaju nove poruke na početak, ažurira se paginacija |
| convId | 98 | Neispravni podaci poruke | Vraća se fallback poruka, logira se greška bez rušenja aplikacije |
| convId | 99 | SignalR veza uspostavljena | Prikaz statusa "Connected", nove poruke se automatski prikazuju |
| convId | 100 | SignalR bez tokena | Status "Disabled", poruke se učitavaju samo iz API-ja |
| convId | 101 | Ponovno uspostavljanje veze | SignalR pokušava ponovnu konekciju, ažurira status |
| convId | 102 | Slanje nove poruke | Poruka se odmah prikazuje, šalje na server, prikazuje grešku ako ne uspije |
| convId | 103 | Isključivanje dummy podataka | Koristi se live API, provjerava se token, učitavaju pravi podaci |
| convId | 104 | Statusi učitavanja | Prikazuje odgovarajuće loadere tokom dobavljanja poruka |
| convId | 105 | Kraj paginacije | Prekida se dalje učitavanje kada nema više poruka |

## search

### index

| Modul | ID  | Opis | Očekivani rezultat |
|-------|-----|------|--------------------|
| search | 106 | Pokretanje ekrana s dummy podacima | Prikazuje se lista kategorija i regija bez greške |
| search | 107 | Učitavanje podataka sa servera | Prikazuje loading indikator dok traje fetch |
| search | 108 | Greška pri fetch-u kategorija ili regija | Prikazuje se error poruka |
| search | 109 | Upisivanje teksta u search polje | Vrijednost searchQuery se ažurira |
| search | 110 | Otvaranje filter moda | Modal se prikazuje |
| search | 111 | Zatvaranje filter moda | Modal se skriva |
| search | 112 | Odabir regije iz dropdowna | selectedRegion se postavlja, učitavaju se općine |
| search | 113 | Promjena odabrane regije resetuje općine | selectedMunicipalities je prazna lista |
| search | 114 | Odabir/opoziv općine u filteru | selectedMunicipalities se ispravno ažurira |
| search | 115 | Odabir kategorije u dropdownu | selectedCategory se postavlja |
| search | 116 | Resetovanje filtera | Svi filteri se poništavaju, dropdowni se zatvaraju |
| search | 117 | Pritiskom na proizvod poziva se detaljni ekran | Navigacija se aktivira na /search/details/{product.id} |
| search | 118 | Automatsko učitavanje proizvoda nakon promjene filtera ili pretrage | Poziva se API sa ispravnim query parametrima |
| search | 119 | Prikaz loading indikatora prilikom učitavanja podataka | Indicator se prikazuje dok loading true |
| search | 120 | Prikaz error poruke ako fetch ne uspije | Prikazuje se poruka o grešci |
| search | 121 | Ako nema proizvoda nakon filtera | Lista proizvoda je prazna, UI se ažurira bez greške |

### productId

| Modul | ID  | Opis | Očekivani rezultat |
|-------|-----|------|--------------------|
| proId | 122 | Učitavanje ekrana sa validnim productId | Prikazuju se podaci proizvoda i slike, nestaje loading spinner |
| proId | 123 | Učitavanje ekrana sa nepostojećim productId | Prikazuje se poruka "Product not found" i dugme "Go Back" |
| proId | 124 | Navigacija kroz slike pomoću strelica | Strelica left onemogućena na prvoj slici, right na posljednjoj |
| proId | 125 | Povećavanje/smanjivanje količine | Količina se mijenja, minimalna vrijednost je 1 |
| proId | 126 | Direktno unošenje količine | Količina se ažurira, ne može biti manje od 1 |
| proId | 127 | Klik na "Add to Cart" sa dostupnom količinom | Proizvod se dodaje u korpu, prikazuje se uspješan alert |
| proId | 128 | Klik na "Add to Cart" sa prevelikom količinom | Prikazuje se alert o nedovoljnoj količini |
| proId | 129 | Dodavanje proizvoda iz druge prodavnice | Prikazuje se alert o nemogućnosti miješanja prodavnica |
| proId | 130 | Klik na dugme za chat | Otvara se chat ekran sa odgovarajućim parametrima |
| proId | 131 | Učitavanje sa USE_DUMMY_DATA = true | Prikazuje se dummy proizvod iz lokalnog niza |
| proId | 132 | Prikaz cijena (retail/wholesale) | Prikazuje se odgovarajuća cijena sa dodatnim informacijama |
| proId | 133 | Proizvod nije aktivan | Prikazuje se poruka o nedostupnosti, onemogućeno dodavanje u korpu |
| proId | 134 | Nevalidan unos količine | Količina se resetuje na 1 |
| proId | 135 | Fokusiranje na input količine | Polje se prazni ako je prethodno bilo 1 |
| proId | 136 | Prikaz težine i zapremine | Prikazuju se točne vrijednosti i jedinice |
| proId | 137 | Greška prilikom učitavanja | Prikazuje se error u konzoli i poruka o nepronalaženju proizvoda |
| proId | 138 | Navigacija "Go Back" nakon greške | Korisnik se uspješno vraća na prethodnu stranicu |

## stores

### index

| Modul | ID  | Opis | Očekivani rezultat |
|-------|-----|------|--------------------|
| stores | 139 | Učitavanje dummy podataka za stores | State se popunjava filtriranim dummy podacima, loading postaje false |
| stores | 140 | Učitavanje dummy podataka za oglase | State se popunjava filtriranim i mapiranim dummy oglasima |
| stores | 141 | Fetch stores sa validnim tokenom | State se ažurira API odgovorom, loading postaje false |
| stores | 142 | Fetch stores bez tokena | Postavlja se error stanje, loading postaje false |
| stores | 143 | Fetch stores vraća HTTP grešku | Postavlja se error stanje sa statusom, loading postaje false |
| stores | 144 | Fetch oglasa sa validnim tokenom | Popunjava se samo sa oglasima koji imaju valjane podatke |
| stores | 145 | Fetch oglasa bez tokena | Oglasi se učitavaju ako server dozvoljava, inače ostaju prazni |
| stores | 146 | Fetch oglasa vraća HTTP grešku | Oglasi se prazne, adsLoading postaje false, greška se loguje |
| stores | 147 | Filtriranje neuspješnih oglasa | Oglasi sa isCompletedSuccessfully=false se ne prikazuju |
| stores | 148 | Filtriranje oglasa bez productId | Oglasi bez productId se ne prikazuju |
| stores | 149 | Kombiniranje podataka oglasa i stores | Prvo se prikazuju oglasi tipa 'ad', zatim stores tipa 'store' |
| stores | 150 | Klik na store | Navigira na /stores/{store.id} |
| stores | 151 | Klik na oglas sa productId | Pokreće odgovarajuću navigaciju ili prikazuje upozorenje |
| stores | 152 | Upravljanje loading stanjima | Prikazuje loader dok traju fetch operacije |
| stores | 153 | Promjena searchQuery | Pokreće debounced fetch nakon 500ms |

### storeId

### index

| Modul | ID  | Opis | Očekivani rezultat |
|-------|-----|------|--------------------|
| stoId | 154 | Pristup bez storeId u URL-u | Prikazuje grešku "Invalid Store ID", ne učitava proizvode |
| stoId | 155 | Pristup sa nevalidnim storeId | Prikazuje grešku "Invalid Store ID", ne učitava proizvode |
| stoId | 156 | Pristup sa validnim storeId u dummy modu | Prikazuje listu proizvoda filtriranih po storeId |
| stoId | 157 | Prikaz proizvoda sa svim poljima | Proizvodi se prikazuju sa cijenama, težinom i slikama |
| stoId | 158 | Klik na proizvod u listi | Preusmjerava na detaljnu stranicu proizvoda |
| stoId | 159 | Prikaz kada nema proizvoda | Prikazuje poruku "Nema proizvoda u ovoj prodavnici" |
| stoId | 160 | Uspješan API odgovor u live modu | Prikazuju se proizvodi dobiveni iz API-ja |
| stoId | 161 | Greška u API odgovoru | Prikazuje odgovarajuću poruku o grešci |
| stoId | 162 | Proizvod sa isActive=false | Proizvod se ne prikazuje (ili se prikazuje posebno označen) |
| stoId | 163 | Proizvod sa opcionalnim poljima | Komponenta ispravno prikazuje proizvod bez grešaka |

### productId

| Modul | ID  | Opis | Očekivani rezultat |
|-------|-----|------|--------------------|
| proId | 164 | Otvaranje sa validnim productId | Prikazuju se svi detalji proizvoda (ime, slike, cijena, količina) |
| proId | 165 | Otvaranje sa nepostojećim productId | Prikazuje se poruka o grešci ili prazan ekran |
| proId | 166 | Promjena slike pomoću dugmadi | Slika se mijenja bez prelaska granica niza |
| proId | 167 | Unos validne količine | Količina se ažurira prema unesenoj vrijednosti |
| proId | 168 | Povećanje količine | Količina se povećava za 1 |
| proId | 169 | Smanjenje količine | Količina se smanjuje za 1 (minimalno 1) |
| proId | 170 | Dodavanje u korpu sa dovoljnom količinom | Proizvod se dodaje, prikazuje se uspješan alert |
| proId | 171 | Dodavanje u korpu sa nedovoljnom količinom | Prikazuje se alert o nedostatku, proizvod se ne dodaje |
| proId | 172 | Dodavanje iz druge prodavnice | Prikazuje se alert o nemogućnosti miješanja prodavnica |
| proId | 173 | Pokretanje chata sa validnim proizvodom | Kreira/nalazi konverzaciju i navigira na chat |
| proId | 174 | Pokretanje chata bez proizvoda | Ne izaziva grešku, ne reagira |
| proId | 175 | Učitavanje dummy podataka | Prikazuju se podaci iz DUMMY_PRODUCTS |
| proId | 176 | Učitavanje podataka sa API-ja | Prikazuju se podaci dobiveni sa servera |
| proId | 177 | Prikaz neaktivnog proizvoda | Dugme za dodavanje u korpu je onemogućeno |
| proId | 178 | Promjena naslova ekrana | Naslov postaje ime proizvoda |



# screens

## ads

| Modul | ID  | Opis | Očekivani rezultat |
|-------|-----|------|--------------------|
| ads | 179 | Učitavanje detalja proizvoda sa ispravnim ID | Prikazuju se svi detalji proizvoda, spinner nestaje |
| ads | 180 | Navigacija sa parametrima oglasa | adContext se pravilno parsira i postavlja |
| ads | 181 | Navigacija bez parametara oglasa | adContext ostaje null, bez grešaka |
| ads | 182 | Chat bez autentifikacije | Prikazuje se alert o potrebi prijave |
| ads | 183 | Chat sa validnim tokenom | Poziva se API i navigira na chat ekran |
| ads | 184 | Chat sa neuspjelim API pozivom | Prikazuje se alert sa greškom |
| ads | 185 | Chat sa neispravnim API odgovorom | Prikazuje se alert o neispravnom odgovoru |
| ads | 186 | Povećanje količine | Količina se poveća za 1 |
| ads | 187 | Smanjenje količine | Količina se smanjuje (min 1) |
| ads | 188 | Dodavanje u korpu bez adContext | Proizvod se dodaje, bez API poziva |
| ads | 189 | Dodavanje sa validnim adContext | Proizvod se dodaje, evidentira se konverzija |
| ads | 190 | Dodavanje sa adContext bez tokena | Proizvod se dodaje, bez API poziva |
| ads | 191 | Navigacija kroz slike | Slike se izmjenjuju pravilno |
| ads | 192 | Unos neispravne količine | Vraća se na default vrijednost (1) |

## store

| Modul | ID  | Opis | Očekivani rezultat |
|-------|-----|------|--------------------|
| store | 193 | Učitavanje u dummy modu | Prikazuju se podaci iz DUMMY_STORE i DUMMY_REVIEWS |
| store | 194 | Učitavanje u live modu | Prikazuju se podaci sa API-ja sa proječnom ocjenom |
| store | 195 | Review sa odgovorom | Prikazuje i komentar i odgovor sa datumima |
| store | 196 | Review bez odgovora | Prikazuje samo komentar bez sekcije za odgovor |
| store | 197 | Prikaz prosječne ocene | Prikazuje se u obliku zvjezdica prema ratingu |
| store | 198 | Klik na chat dugme | Šalje se POST zahtjev i vrši navigacija na chat |
| store | 199 | Loading indikator | Prikazuje se dok se podaci učitavaju |
| store | 200 | Povratak na prethodnu stranicu | Klik na strelicu vraća korisnika nazad |
| store | 201 | Decimalni rating | Prikazuju se poluzvjezdice gdje je potrebno |
| store | 202 | Formatiranje datuma | Datumi se prikazuju u formatu "dd.MM. HH:mm" |
| store | 203 | Neuspješno učitavanje | Prikazuje grešku, gasi se loading indikator |

## orders

### details

| Modul | ID  | Opis | Očekivani rezultat |
|-------|-----|------|--------------------|
| details | 204 | Prikaz detalja narudžbe sa validnim orderId | Treba prikazati sve detalje narudžbe (ID, datum, trgovinu, status, stavke, ukupnu cijenu) |
| details | 205 | Prikaz detalja narudžbe sa nepostojećim orderId | Treba prikazati poruku "Narudžba nije pronađena" |
| details | 206 | Prikaz narudžbe sa DUMMY podacima | Treba prikazati testne podatke iz DUMMY_ORDERS i DUMMY_PRODUCTS |
| details | 207 | Prikaz narudžbe sa API podacima | Treba prikazati podatke dobivene sa API-ja (ako USE_DUMMY_DATA=false) |
| details | 208 | Prikaz statusa narudžbe | Svaki status treba imati odgovarajuću boju (Requested, Confirmed, Ready, Sent, Delivered, Rejected, Canceled) |
| details | 209 | Klik na proizvod u listi | Treba navigirati na ekran sa detaljima proizvoda sa proslijeđenim quantity parametrom |
| details | 210 | Klik na chat dugme | Treba pokrenuti proces kreiranja/prikaza konverzacije za tu narudžbu |
| details | 211 | Greška pri dohvatu podataka o narudžbi | Treba prikazati poruku o grešci |
| details | 212 | Greška pri dohvatu imena trgovine | Treba prikazati poruku "Greška pri dohvaćanju informacija o trgovini" |
| details | 213 | Prikaz loading indikatora | Treba prikazati ActivityIndicator dok se podaci učitavaju |
| details | 214 | Prikaz ukupne cijene | Treba prikazati ispravno formatiranu ukupnu cijenu (npr. "6.20 KM") |
| details | 215 | Prikaz prazne liste proizvoda | Ako narudžba nema stavki, ne treba prikazivati listu proizvoda |
| details | 216 | Prikaz nepotpunih podataka o proizvodu | Ako neki proizvod nije pronađen, treba preskočiti prikaz te stavke |
| details | 217 | Neuspješno kreiranje chata | Ako API vrati grešku pri kreiranju chata, treba prikazati odgovarajuću poruku |
| details | 218 | Prikaz vremena narudžbe | Datum i vrijeme trebaju biti formatirani prema lokalnim postavkama |
| details | 219 | Prikaz internacionaliziranog teksta | Svi tekstovi trebaju biti prikazani na odabranom jeziku (korištenje i18next) |
| details | 220 | Responsive dizajn | Sadržaj treba biti čitljiv i na malim i na velikim ekranima (ScrollView) |
| details | 221 | Prikaz ikone za chat | Dugme za chat treba imati FontAwesome ikonu "comments" |
| details | 222 | Autentifikacija API poziva | Svi API pozivi trebaju imati validan auth token |
| details | 223 | Prikaz neaktivnih proizvoda | Ako proizvod ima isActive=false, treba ga prikazati u listi ali možda sa posebnim stilom |

### index

| Modul | ID  | Opis | Očekivani rezultat |
|-------|-----|------|--------------------|
| orders | 224 | Prikaz liste narudžbi sa validnim podacima | Treba prikazati sve narudžbe u listi sa osnovnim informacijama (ID, cijena, status, prodavnica) |
| orders | 225 | Prikaz prazne liste narudžbi | Treba prikazati poruku "Nema narudžbi za prikaz" |
| orders | 226 | Prikaz narudžbi sa DUMMY podacima | Treba prikazati testne podatke iz DUMMY_ORDERS |
| orders | 227 | Prikaz narudžbi sa API podacima | Treba prikazati podatke dobivene sa API-ja (ako USE_DUMMY_DATA=false) |
| orders | 228 | Prikaz statusa narudžbe | Svaki status treba imati odgovarajuću boju (Requested, Confirmed, Ready, Sent, Delivered, Rejected, Canceled) |
| orders | 229 | Klik na dugme "Detalji" | Treba navigirati na ekran sa detaljima odabrane narudžbe |
| orders | 230 | Klik na dugme "Recenzija" | Treba navigirati na ekran za recenziju sa proslijeđenim orderId i storeId |
| orders | 231 | Greška pri dohvatu podataka o narudžbama | Treba prikazati praznu listu ili poruku o grešci |
| orders | 232 | Prikaz loading indikatora | Treba prikazati ActivityIndicator dok se podaci učitavaju |
| orders | 233 | Formatiranje cijene | Cijena treba biti prikazana s 2 decimale (npr. "6.20 KM") |
| orders | 234 | Sortiranje narudžbi | Narudžbe trebaju biti prikazane obrnutim redoslijedom (najnovije prvo) |
| orders | 235 | Prikaz imena prodavnice | Ako je storeId poznat, treba prikazati ime prodavnice umjesto ID-a |
| orders | 236 | Internacionalizacija teksta | Svi tekstovi trebaju biti prikazani na odabranom jeziku (korištenje i18next) |
| orders | 237 | Responsive dizajn | Lista treba biti čitljiva i na malim i na velikim ekranima |
| orders | 238 | Autentifikacija API poziva | Svi API pozivi trebaju imati validan auth token |
| orders | 239 | Simulacija kašnjenja učitavanja | Kod DUMMY podataka treba prikazati loading indikator barem 1 sekundu |
| orders | 240 | Prikaz nepoznatog statusa | Ako status nije u statusColors mapi, treba koristiti defaultnu crnu boju |
| orders | 241 | Prikaz dugmadi za svaku narudžbu | Svaka narudžba treba imati "Detalji" i "Recenzija" dugmad |
| orders | 242 | Greška pri dohvatu podataka o prodavnicama | Treba prikazati storeId umjesto imena prodavnice |
| orders | 243 | Stilizacija kartica narudžbi | Svaka narudžba treba biti jasno odvojena u svojoj kartici |

### review

| Modul | ID  | Opis | Očekivani rezultat |
|-------|-----|------|--------------------|
| Review | 244 | Prikaz forme za recenziju | Treba prikazati 5 zvjezdica, polje za komentar i submit dugme |
| Review | 245 | Odabir ocjene | Klik na zvjezdicu treba postaviti odabranu ocjenu (1-5) |
| Review | 246 | Slanje recenzije bez ocjene | Treba prikazati grešku "Molimo odaberite ocjenu" |
| Review | 247 | Slanje recenzije sa prekratkim komentarom | Treba prikazati grešku za minimalnu dužinu komentara |
| Review | 248 | Slanje recenzije sa predugačkim komentarom | Treba prikazati grešku za maksimalnu dužinu komentara |
| Review | 249 | Uspešno slanje recenzije (DUMMY) | Kod DUMMY podataka treba simulirati uspešno slanje i vratiti se nazad |
| Review | 250 | Uspešno slanje recenzije (API) | Kod pravog API-ja treba poslati podatke i vratiti se na prethodni ekran |
| Review | 251 | Pokušaj ponovnog slanja recenzije | Ako recenzija već postoji, treba prikazati Alert poruku |
| Review | 252 | Greška pri slanju recenzije | Treba prikazati odgovarajuću grešku |
| Review | 253 | Mrežna greška | Treba prikazati poruku "Problem s mrežom" |
| Review | 254 | Internacionalizacija teksta | Svi tekstovi trebaju biti prikazani na odabranom jeziku |
| Review | 255 | Prikaz odabranih zvjezdica | Odabrane zvjezdice trebaju biti popunjene (★), neodabrane prazne (☆) |
| Review | 256 | Validacija komentara | Komentar mora biti između 4 i 1000 karaktera |
| Review | 257 | Stilizacija input polja | Polje za komentar treba imati multiline podršku i vertikalno poravnanje |
| Review | 258 | Prikaz grešaka | Greške trebaju biti vidljive ispod odgovarajućih polja |
| Review | 259 | Navigacija nakon uspešnog slanja | Nakon uspešnog slanja treba se vratiti na prethodni ekran |
| Review | 260 | Autentifikacija API poziva | API poziv treba imati validan auth token |
| Review | 261 | Konzolni log podataka | Podaci za recenziju trebaju biti logovani u konzoli prije slanja |
| Review | 262 | Responsive dizajn | Forma treba biti čitljiva na svim veličinama ekrana |
| Review | 263 | Proslijeđeni parametri | orderId i storeId trebaju biti proslijeđeni iz prethodnog ekrana |