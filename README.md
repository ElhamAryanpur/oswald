# OSWALD COVID-19 Prediction

![Background](https://github.com/ElhamAryanpur/oswald/blob/master/public/background.png)

![Build](https://github.com/ElhamAryanpur/oswald/workflows/CI/badge.svg)

This project will use COVID-19 data and A.I. to make prediction about cases on future days.

Click [here](https://elhamaryanpur.github.io/oswald/) to access the site.

> `NOTE`: do `NOT` take predictions given by this project for granted. The accuracy of predictions is `NEVER` 100%. Use these data only to get a general idea.

## About

`OSWALD` name was choosen by dear [Altheatear](https://www.reddit.com/user/Altheatear/). All credits goes to her.

The `Data` is taken from [here](https://data.humdata.org/dataset/novel-coronavirus-2019-ncov-cases). Then `parsed` with [Papa Parse](https://www.papaparse.com/), and `feeded` to [ML.js](https://github.com/mljs/ml) for `training`.

Then the `inputs` are linked with `prediction` for `live` results.

Currently, only `recovery` cases (for positivity reasons 😉) are supported. Will add `Death` and `Active` predictions later on.

## Manual

To `reproduce` this project locally:

```bash
git clone https://github.com/ElhamAryanpur/oswald

cd oswald

npm install
npm run build ml
npm run build
npm start
```

All the code that made up the website is located at [src/App.svelte]

## License

This project is [MIT](https://opensource.org/licenses/MIT) licensed. See [LICENCE](https://github.com/ElhamAryanpur/oswald/blob/master/LICENSE) file for more information.

## Shoutout

Shoutout to amazing [Altheatear](https://www.reddit.com/user/Altheatear/) for the name, [Papa Parse](https://www.papaparse.com/) for easy `CSV` parsing, [ML.js](https://github.com/mljs/ml) for `powerful machine learning` in the `browser`, And [Svelte](https://svelte.dev/) for allowing `reactive` [SPA webapp](https://en.wikipedia.org/wiki/Single-page_application) without extra `BS`! And not to forget [Johns Hopkins School of Public Health](https://data.humdata.org/organization/e5d3aa82-538e-4dae-94c9-010cc8ecbbc8) for their `contribution` on making data `public` and `daily updated`.

## Translation Contributors

* Turkish: [Tamana Aryanpur](https://www.instagram.com/taman.aryanpur)
* Dutch: [Delano Gracia](https://www.instagram.com/delanogarcia_)
* Albanian: [Altheatear](https://www.reddit.com/user/Altheatear/)
