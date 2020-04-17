<script>
  let DATA = []
  let load = false
  let lang = 'en'
  let res
  let DAY = 0
  let AI

  Papa.parse(
    'https://data.humdata.org/hxlproxy/api/data-preview.csv?url=https%3A%2F%2Fraw.githubusercontent.com%2FCSSEGISandData%2FCOVID-19%2Fmaster%2Fcsse_covid_19_data%2Fcsse_covid_19_time_series%2Ftime_series_covid19_recovered_global.csv&filename=time_series_covid19_recovered_global.csv',
    {
      download: true,
      complete: result => {
        for (var i = 0; i < result.data.length - 1; i++) {
          DATA.push(result.data[i])
        }
        DATA = DATA.splice(1, DATA.length)
        cleanup()
      },
    },
  )

  function cleanup() {
    const cases = []

    for (var i = 2; i < DATA[0].length; i++) {
      const amount = []
      for (var o = 0; o < DATA.length; o++) {
        try {
          //console.log(amount + parseInt(DATA[o][i]))
          amount.push(parseInt(DATA[o][i]))
        } catch {
          console.log(DATA[o][i])
        }
      }
      cases.push(amount.reduce((a, b) => a + b, 0))
    }

    DATA = cases
    train()
  }

  function train() {
    const x = []
    for (var i = 0; i < DATA.length; i++) {
      x.push(i + 1)
    }

    AI = new window.PR(x, DATA, 1)
    DAY = DATA.length + 1
    load = true
  }

  function predict(day = 0) {
    return Math.round(AI.predict(day))
  }

  function diff(day) {
    const prediction = predict(day)
    const today = DATA[DATA.length - 1]
    const difference = Math.abs(prediction - today)
    return difference
  }

  function trans(textData = {}, lang = 'en') {
    if (lang == 'en') {
      return textData.en
    } else if (lang == 'fa') {
      return textData.af
    } else if (lang == 'tr') {
      return textData.tr
    } else if (lang == 'dt') {
      return textData.dt
    }
  }
</script>

<style>
  table {
    margin: 0 auto;
  }
  .style {
    border: 1px solid #6aaac9;
  }

  td {
    padding: 10px;
    font-weight: bold;
  }

  input,
  select,
  option {
    font-family: inherit;
    font-size: inherit;
    padding: 0.4em;
    margin: 0 0 0.5em 0;
    box-sizing: border-box;
    border: 1px solid #6aaac9;
    background: #1a2835;
    color: #6aaac9;
    font-weight: bold;
    border-radius: 2px;
  }
</style>

<table>
  <tr style="text-align: center;">
    <td colspan="2">
      <h1>
        {trans({ en: 'OSWALD PREDICTOR', af: 'OSWALD تخمین کننده', tr: 'OSWALD BELİRLEYİCİSİ', dt: 'OSWALD PREDICTOR' }, lang)}
      </h1>
    </td>
  </tr>
  <tr class="style">
    <td class="style">
      {trans({ en: 'Day:', af: 'روز', tr: 'Gün:', dt: 'Dag:' }, lang)}
    </td>
    <td class="style">
      <input type="number" placeholder="Day" bind:value={DAY} />
    </td>
  </tr>

  {#if load === true}
    <tr class="style">
      <td class="style">
        {trans({ en: 'Predicted Recoveries:', af: 'تخمین صحت یافته', tr: 'İyileşen hasta saysı:', dt: 'Hersteld (voorspelt):' }, lang)}
      </td>
      <td class="style">{predict(DAY)}</td>
    </tr>
    <tr class="style">
      <td class="style">
        {trans({ en: 'Today:', af: 'امروز', tr: 'Bugün:', dt: 'Vandaag:' }, lang)}
      </td>
      <td class="style">{DATA[DATA.length - 1]}</td>
    </tr>
    <tr class="style">
      <td class="style">
        {trans({ en: 'Difference:', af: 'فرق', tr: 'Fark:', dt: 'Verschil:' }, lang)}
      </td>
      <td class="style">{diff(DAY)}</td>
    </tr>
  {:else}
    <br />
    <tr>loading...</tr>
  {/if}
  <tr>
    <td>
      <select bind:value={lang} style="height: 50px;">
        <option value="en">English</option>
        <option value="tr">Türkçe</option>
        <option value="fa">فارسی</option>
        <option value="dt">Dutch</option>
      </select>
    </td>
    <td />
  </tr>
  <tr style="text-align: center;">
    <td colspan="2">
      <h3>
        {trans({ en: 'For more information, click', af: 'برای معلومات بیشتر ', tr: 'Daha fazla bilgi için', dt: 'Voor meer informatie, klik ' }, lang)}
        <a href="https://github.com/ElhamAryanpur/oswald">
          {trans({ en: 'here', af: 'اینجا کلیک کنید', tr: 'buraya Tıkla', dt: 'hier' }, lang)}
        </a>
      </h3>
    </td>
  </tr>
</table>
