# Julkaisupäivitys 1.1.3 – 8.11.2026

- Maxin ja Mayan 942 comboäänitteen pitkät hiljaiset välit lyhennetty. Esimerkin Jab/Cross tauko 0,568 s → 0,138 s. Muut puheäänitteet ja Coach Roundsin äänenkorkeuden säilyttävä toistonopeus säilyvät.
- Coach Roundsin mobiilivalinnat ja alatunniste korjattu. Alimman lajin ja intensiteetin voi vierittää kokonaan painikkeiden yläpuolelle. Personoinnissa näkyvät Maxin ja Mayan kuvat ja esikatselut toimivat.
- 87 testiä läpi. Kaikki 942 muokattua MP3-tiedostoa dekoodattiin onnistuneesti. Android bundleRelease, lintRelease ja testReleaseUnitTest onnistuivat. Fyysistä puhelinta ei testattu.
- Molemmat verkkosivut julkaistu ja tarkistettu: https://fightwise.pages.dev/ ja https://latemake.github.io/StrikeFlow/. Kymmenen lähdetiedoston tarkistus kattoi koodin, tyylit, manifestit ja molempien coachien muokatut ääninäytteet. Service worker v99.
- Lähdecommit 3169afad1fe3c56a5a40198562f75686d0280aec. Cloudflare-tuotantoversio https://84fa934a.fightwise.pages.dev. GitHub Pages -julkaisutyö 42505019103 onnistui.
- Android 1.1.3 (16) allekirjoitettu ja lähde-/ääninäytteet tarkistettu paketista. AAB SHA-256 D02C6716C8CF6868E62B0698E405318F83D142101B1EDB2BEEFEB31349F0E58F.
- Android-päivitys lähetetty suljetun Alpha-testin tarkistukseen; Play Console vahvisti "Muutoksia tarkistetaan". Googlen esitarkastus ja hyväksyntä ovat kesken. Saatavuutta Play Kaupasta ei ole vielä vahvistettu. Aiempi 1.1.2 on jo testaajien saatavilla.
# Julkaisupäivitys 1.1.2 – 8.11.2026

- Uudistettu päävalikko, yksinkertaistetut neonvihreät FW- ja FightWise-logot sekä samanväriset Sparring-, Training- ja Coach Rounds -kuvat. Korttien kellertävä sävytys poistettu.
- Kamerasaarekkeen ja järjestelmäpalkkien suoja-alueet huomioidaan Androidin sekä selaimen ilmoittamilla arvoilla. Korjaukset koskevat valikkoa, ajastinta, Coach Roundsia, käyttöönottoa ja asetuksia. Aiempi jatkuvan coach-äänitoiston korjaus sisältyy.
- 85 automaattista testiä läpi. Selaimessa testattu sparrin 3/3 erän valmistuminen, tauotus ja jatkaminen, Trainingin käynnistys ja ohitus, Coach Roundsin peräkkäiset ohjeet, ääniasetukset ja paluu tietosuojasivulta. Fyysistä Android-laitetta ei testattu.
- Android 1.1.2 (15): bundleRelease, lintRelease ja testReleaseUnitTest onnistuivat. Allekirjoitus tarkistettu. AAB SHA-256: A70FF3039870C1BE24C7102D3FFB7AF317E1DA2A3455997CC75835434AD64ADD.
- Molemmat verkkosivut julkaistu: https://fightwise.pages.dev/ ja https://latemake.github.io/StrikeFlow/. Kummankin HTML, service worker v96, CSS ja viisi uusittua kuvatiedostoa vastaavat julkaisulähdettä ja Android-pakettia.
- Lähdecommit: 8d3515931418c845a315926e5e33ac72379a9f25. Cloudflare: https://4da791c5.fightwise.pages.dev. GitHub Pages -julkaisu 42501107563 onnistui.
- Android 1.1.2 (15) lähetetty suljetun Alpha-testin tarkistukseen. Console vahvisti tilan "Muutoksia tarkistetaan". Googlen esitarkastus ja hyväksyntä ovat kesken; saatavuutta Play Kaupasta ei ole vielä vahvistettu. Aiempi 1.1.1 oli jo hyväksytty ja testaajien saatavilla.
# Coach-äänikorjaus 1.1.1 – 8.11.2026

- Korjattu puhelimen vaatima Continue-painallus peräkkäisten coach-ohjeiden välillä. Kaikki ohjeet käyttävät samaa aloituspainalluksella avattua soitinta. Myöhästyvät toistopyynnöt eivät enää keskeytä uudempaa ohjetta; tilapäinen latausvirhe yritetään kerran uudelleen.
- 85 automaattista testiä läpi, mukaan lukien mobiiliselaimen soitinkohtaisen toistorajoituksen regressiotesti ja useiden ajastettujen ohjeiden ketju. Selaimessa ohjeet etenivät automaattisesti seuraavaan erään. Fyysistä Android-puhelinta ei testattu.
- Android bundleRelease, lintRelease ja testReleaseUnitTest onnistuivat. Allekirjoitettu AAB 1.1.1 (14), SHA-256 F4EEE73E4EC7044BE1FBDAB240E18170BFAAC24A710E79D3E1A7565517359652. Paketin HTML ja service worker vastaavat lähdettä.
- Molemmat verkkosivut julkaistu ja niiden HTML sekä service worker v90 tarkistettu: https://fightwise.pages.dev/ ja https://latemake.github.io/StrikeFlow/. Cloudflare-julkaisu https://c22559b5.fightwise.pages.dev. Lähdecommit 18a50cf15bbc1205a0e7ddd6f9a8d5e6a35e3457. GitHub Pages -julkaisutyö 42496741966 onnistui.
- Android 1.1.1 (14) lähetetty suljetun Alpha-testin tarkistukseen. Play Console vahvisti "Muutoksia tarkistetaan"; esitarkastus ja Googlen hyväksyntä odottavat. Päivityksen saatavuutta puhelimella ei vielä vahvistettu.
# Julkaisupaketti 1.1.0 – 8.11.2026

- Androidin versiokoodi 13. Allekirjoitettu AAB ja sen lähdetiedostot tarkistettu. SHA-256: C98D60DD83766D5DE06370E75FFB7FF2EC206471C5974B77D1258ABB3E029BDA.
- Coach Rounds: laji → coach → intensiteetti; Maxin ja Mayan kuvat sekä yksinkertaiset SVG-liekkisymbolit intensiteeteille. Puhe on 20 % nopeampaa luonnollisella äänenkorkeudella.
- Nyrkkeilyssä 161, potkunyrkkeilyssä 320 ja Muay Thaissa 471 yhdistelmää. Lajikohtainen satunnaisvalikoima säilyy eri harjoitusten välillä. Mukana 26 kannustusta tai muistutusta sekä 16 liikkumisohjetta.
- 79 automaattista testiä läpi. bundleRelease, lintRelease ja testReleaseUnitTest onnistuivat. Selaimessa tarkistettu tavallinen Training, Coach Rounds, tauotus, jatkaminen ja ohitus sekä sparrin kahden erän valmistuminen.
- Tauon ohituksen jälkeinen vanhan ohjeen väliaikainen näkyminen korjattu. Päävalikko ja kolmen vaiheen valinnat tarkistettu eri näyttökoissa.
- Molemmat verkkoversiot julkaistu ja tarkistettu: https://fightwise.pages.dev/ ja https://latemake.github.io/StrikeFlow/. Cloudflare-tuotantoversio: https://fff5b8b3.fightwise.pages.dev. Julkaisun lähdecommit: 470a5b78614931bbcbad616b5eae56c01d2451c7. GitHub Pages -julkaisutyö 42486691375 onnistui.
- Android 1.1.0 (13) lähetetty suljetun Alpha-testin tarkistukseen. Console vahvisti tilan "Muutoksia tarkistetaan". Esitarkastus ja Googlen hyväksyntä ovat vielä kesken, joten uuden paketin saatavuutta ei ole vahvistettu. Tuotantolupa odottaa testijakson valmistumista.
- Julkisten sivujen HTML, JavaScript, CSS, SVG-liekkisymbolit, coach-kuvat ja uusien kannustusäänien näytteet vastaavat paikallista julkaisulähdettä. Service worker on v89. Fyysistä Android-laitetta ei testattu tällä julkaisupaketilla.

# Tietoturvapäivitys 1.0.9 – 7.11.2026

- Capacitor päivitetty 8.6.0:aan. Treenin otsikoiden HTML-käsittely korjattu, Androidin tiedostonjakopolku rajattu ja salaamaton liikenne estetty.
- 55 testiä läpi. bundleRelease, lintRelease ja testReleaseUnitTest onnistuivat. Fyysistä Android-laitetta ei testattu.
- Selaimessa tarkistettu sparrauksen asetukset, käynnistys/pysäytys, ohjatun treenin valinta ja vaiheenvaihto, ääniasetukset, käyttöönotto ja paluu tietosuojasivulta. Äänien kuuluvaa laatua ei vahvistettu kuuntelemalla.
- GitHub commit 999a5cce79c81a4662dc6156ea5b57a01c7d4d8d. GitHub Pages -julkaisu onnistui. Molempien julkisten sivujen HTML vastaa lähdettä ja service worker on v81.
- Play Consoleen lähetetty suljetun Alpha-testin versio 1.0.9, versiokoodi 11. Console vahvisti yhden muutoksen lähetyksen tarkistukseen. Googlen esitarkistus/tarkistus on kesken; päivitystä ei vielä vahvistettu ladattavaksi.
- AAB SHA-256: E187C82BEC09C05D387B4F385199862EA92725C7B1F11057CFD6796BFF4F09A2. AAB:n HTML vastaa lähdettä, eikä paketissa ole .env- tai allekirjoitusavaintiedostoja.

# Kehityspäivitys 31.10.2026 – paikallinen testiversio

- Treenin valintapolku: kesto, treeni ja esikatselu. Lajit (kaikki / nyrkkeily / K1 / Muay Thai) valitaan treenilistan suodatinvalikosta lajittelun rinnalla. Sparritimerissä ei ole lajivalintaa, ja sen tehtävät käyttävät yhteistä vaikeustason mukaista valikoimaa.
- Lisätty 20 lajikohtaista nyrkkeily- ja K1-ohjelmaa (kaksi ohjelmarunkoa viidellä kestolla kummallekin lajille). Aiemmat Premium-lukitukset säilyvät.
- Treenikorttien ja esikatselujen osio-, erä- ja taukotiedot lasketaan todellisesta aikajanasta.
- Ohjattujen treenien osioäänet: yksi gongi alussa, yksi 15 sekuntia ennen loppua, kaksi osion päättyessä. Erikseen valittava 30 sekunnin piippaus on oletuksena pois päältä.
- Puheopastuskokeilu on oletuksena pois päältä. Se on saatavilla uusissa 30 minuutin nyrkkeily- ja K1-ohjelmissa sekä Terävät perusteet (Sharp basics) -treenissä. Puhe käyttää valitun kielen asennettua offline-ääntä; Androidilla on oma TextToSpeech-toteutus. Puhe perutaan tauotuksessa, vaiheen ohituksessa, nollauksessa ja kielenvaihdossa.
- Täydennetty suomen ja saksan tekniikkasanastoa ja ohjeita sekä korjattu alkuperäisen tekstin säilyminen kielenvaihdossa. Myös CSS:n Premium-tekstit kääntyvät.
- Sparritimerin äänien uudelleenkäynnistys korjattu: poistuminen ja nollaus pysäyttävät vanhat mediaäänet ja mitätöivät niiden keskeneräiset toistokutsut. Aloitus ja jatkaminen valmistavat äänet käyttäjän painalluksessa. Valmiin harjoituksen nollaus säilyttää avatun AudioContextin. Puhemoottorin pysäytys kutsutaan vain, jos puhetta todella on käynnissä.
- 45 JavaScript-testiä läpi, mukaan lukien sparrin aloitus–poistuminen–uusi aloitus sekä kesken jääneiden ääni- ja avauskutsujen käsittely. Androidin debug-paketti, lintDebug ja testDebugUnitTest onnistuvat. Selaimessa tarkistettu puhelimen 390 × 844 näkymä, lajisuodattimet, esikatselu, treenin käynnistys ja suomenkielinen puheäänen kokeilu.
- Fyysisen Android-laitteen puhetoisto ja taustalle siirtyminen on vielä testattava. Tätä kehityspäivitystä ei ole julkaistu Google Playhin.

# Päivitys 16.10.2026 – versio 1.0.3 (5)

- Treenin esikatselun aloituspainike on aina näkyvässä alareunassa; ohjelma vierii omalla alueellaan.
- Ajastimesta poistettu Next up, Current drill ja Focus -otsikot sekä päällekkäinen aikateksti ja harjoitteen toistuva otsikko.
- 22 testiä, Android bundleRelease/lintRelease/testReleaseUnitTest onnistuvat.
- Selaimessa tarkistettu 390 × 844 puhelinnäkymä ja 1365 × 832 tietokonenäkymä, käynnistys, harjoitevaihto ja tauotus. Fyysisellä Android-laitteella tätä päivitystä ei testattu.
- AAB:n HTML vastaa lähdettä. SHA-256: B700352A84778576CF841A9D4C226CF21985C5C3B2F476ADA7A0466754DD42A4.
- Versio 1.0.3 lähetetty suljetun Alpha-testin tarkistukseen. Console vahvisti tilan Muutoksia tarkistetaan. Testaajat saavat päivityksen Googlen hyväksynnän jälkeen.

# FightWise – julkaisuvalmistelut 7.10.2026

## Tehty

- Alpha-versio 1.0.1 hyväksyttiin suljettuun testiin. Uusi 1.0.2 ja puhetta koskevilta maininnoilta korjattu kauppakuvaus on lähetetty Googlen tarkistukseen; Console näyttää tilan **Muutoksia tarkistetaan**. Tuotantojulkaisua ei ole tehty.
- Uusi Android-versio 1.0.2, versionumero 4, paketti `com.fightwise.app`.
- Allekirjoitettu AAB rakennettu ja ladattu Play Consolen suljettuun Alpha-testiin. Vanha version 2 paketti poistettu tästä testijulkaisusta; se säilyy Googlen artefaktikirjastossa.
- Ääniefektien käynnistyskilpailu korjattu.
- Puhekuulutukset poistettu käyttäjän pyynnöstä kokonaan: selain- ja Android-puhetoisto, puheasetukset, kombokuulutukset sekä kauppakuvauksen puhemaininnat. Eräkellot, painikeäänet ja värinä säilyvät.
- Treenien ajastin ja kestomerkinnät vastaavat osien todellista yhteiskestoa. Sekunteina merkityt intervallit ja ryhmiteltyjen erien tauot käsitellään oikein.
- Androidin käynnistysruutu käyttää FightWisen kuvaketta.
- Kauppakuvaus ja 12 kuvakaappausta päivitetty. Kolmen laiteryhmän treenikuvat päivitetty myös kestokorjauksen jälkeen.
- Mainostunnusilmoitus täytetty: sovellus ei käytä mainostunnusta.
- Suljettuun testiin valittu 178 maata/aluetta käyttäjän vahvistuksella.
- Tietosuojadokumentin sisältö ja jakaminen tarkistettu: linkin kautta katseltavissa ilman kirjautumista, yleisön rooli Katsoja. Sovelluksen mukana tuleva tietosuojasivu päivitetty.

## Tarkistukset

- `npm test`: 22 testiä läpi. Äänien toisto ja virhetilanteet, värinä sekä kaikkien 71 treenin aikajanat. Poistetun puheominaisuuden vanhat testit poistettu.
- Android: `bundleRelease`, `lintRelease` ja `testReleaseUnitTest` onnistuvat Java 21:llä. Lintissä ei estäviä virheitä; jäljellä kirjastoversioihin ja käyttämättömiin resursseihin liittyviä varoituksia.
- AAB:n allekirjoitus tarkistettu (`jar verified`). SHA-256: `5383213FF21D3D49E37B692DE39780445C2BA0AACAFBE884511DD2EBFB8F7DF8`.
- Console tunnisti paketin versioksi 4 (1.0.2), kohde-API 36.
- Käyttöliittymässä tarkistettu Sharp basics -treenin 22 minuutin esikatselu ja käynnistyminen 5 minuutin lämmittelyyn.
- Käyttäjä kertoi testanneensa sovellusta Androidilla ja toiminnan olevan kunnossa puhetoistoa lukuun ottamatta. Tämän jälkeen puhe poistettiin. Agentti ei ole ajanut uutta 1.0.2-versiota fyysisellä Android-laitteella.
- AAB:n sisältämä HTML vastaa lähdetiedostoa; paketissa ei ole puhetoiston viittauksia.
- Testaajalistalla on kaksi sähköpostiosoitetta. Tämä ei tarkoita kahta liittynyttä tai erillistä henkilöä; tuotantoa varten tarvitaan 12 oikeaa testaajaa.

## Ennen tuotantojulkaisua

1. Hanki vähintään 12 oikeaa Android-testaajaa ja heidän Google-tiliensä sähköpostiosoitteet tai Google-ryhmä.
2. Lisää heidät Alpha-testikanavalle ja jaa Consolen osallistumislinkki. Sähköpostilistalle lisääminen yksin ei aloita 14 päivän laskentaa: testaajien täytyy liittyä testiin.
3. Testaa sovellus Playsta asennettuna: useita erä- ja taukovaihtoja, ääniasetukset, englanti/suomi/saksa, tauotus, resetointi, ohjatut treenit ja suosikit. Tarkista myös laitteen lepotila sekä sovelluksesta poistuminen ja palaaminen.
4. Kerää palautetta ja korjaa löydökset. Vähintään 12 testaajan täytyy pysyä mukana yhtäjaksoisesti 14 päivää ennen tuotantoluvan hakemista.
5. Hae tuotantoonpääsylupaa ja vastaa testauksen kysymyksiin todellisen palautteen perusteella.
6. Googlen luvan jälkeen valmistele ja lähetä tuotantokanavan julkaisu.

Premium-ostot eivät ole käytössä. Niiden käynnistäminen myöhemmin vaatii oikean Google Play Billing -toteutuksen ja erillisen testauksen.

## Uuden paketin rakentaminen

Tarvitaan Java 21 sekä Android SDK. Tämän työskentelyn paikalliset työkalut ovat `.android-sdk`-hakemistossa, jota ei tallenneta Gitiin. Allekirjoitus käyttää olemassa olevaa `android/keystore.properties`-asetusta ja käyttäjän aiempaa avainta; salasanoja ei kirjata tähän.

```powershell
$env:JAVA_HOME=(Get-ChildItem '.android-sdk/jdk21' -Directory | Select-Object -First 1).FullName
npm test
npm run cap:sync
Set-Location android
./gradlew.bat bundleRelease lintRelease
```

Paketti: `android/app/build/outputs/bundle/release/app-release.aab`.
Kasvata `versionCode`-arvoa aina ennen seuraavan uuden paketin lataamista Google Playhin.
