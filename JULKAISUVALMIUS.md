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
