# Parashikuesi për COVID-19 OSWALD

![Background](https://github.com/ElhamAryanpur/oswald/blob/master/public/background.png)

![Build](https://github.com/ElhamAryanpur/oswald/workflows/CI/badge.svg)

Ky projekt do të përdorë informacion për COVID-19 duke formuar një A.I (`Inteligjencë Artificiale`) për të bërë parashikimet për ditët në të ardhmen.

Kliko [këtu](https://elhamaryanpur.github.io/oswald/) për access-in e site-it.

> `SHËNIM`: Mos i merrni parashikimet e bëra nga ky projekt si të sakta. Këto parashikime ASNJËHERË do të jenë 100% të sakta. Përdor këtë informacion që të kesh vetëm një ide për të ardhmen.

## PËR PROJEKTIN

`OSWALD` si emër është zgjedhur nga mikja [Altheatear](https://www.reddit.com/user/Altheatear/). Gjithë të drejtat për këtë emër janë të sajat.

`Informacioni` është marrë prej [këtu](https://data.humdata.org/dataset/novel-coronavirus-2019-ncov-cases). Më pas, analizuar ng [Papa Parse](https://www.papaparse.com/), dhe ushqyer [ML.js](https://github.com/mljs/ml) për `trajnim`..

Pastaj, `inputi` është lidhur me parashikimin për rezultate `LIVE`.

## MANUALI

Për të përdorur këtë `projekt` lokalisht:

```bash
git clone https://github.com/ElhamAryanpur/oswald

cd oswald

npm install
npm run build ml
npm run build
npm start
```

Gjithë kodet që bëjnë site-in janë tek [src/App.svelte]

## License

Ky projekt është liçensuar nga [MIT](https://opensource.org/licenses/MIT). Shiko [LICENCE](https://github.com/ElhamAryanpur/oswald/blob/master/LICENSE) për më shumë informacion.

## FALEMINDERIT

Faleminderit [Altheatear](https://www.reddit.com/user/Altheatear/) për emrin, [Papa Parse](https://www.papaparse.com/) për analizim të thjeshtë `CSV`, [ML.js](https://github.com/mljs/ml) për funksionin e fuqishëm të mësimit të makinerisë në `browser`, dhe [Svelte](https://svelte.dev/) për lejimin e [SPA webapp](https://en.wikipedia.org/wiki/Single-page_application) reaktive pa budallalliqe ekstra! Dhe të mos harroj [Johns Hopkins School of Public Health](https://data.humdata.org/organization/e5d3aa82-538e-4dae-94c9-010cc8ecbbc8) për kontributin e tyre në bërjen e `informacionit` publik dhe të përditësimit të tij.

## KONTRIBUESIT E PËRKTHIMIT

* Türkçe: [Tamana Aryanpur](https://www.instagram.com/taman.aryanpur)
* Dutch: [Delano Gracia](https://www.instagram.com/delanogarcia_)
* Shqip/Albanian: [Altheatear](https://www.reddit.com/user/Altheatear/)
