<script>
  let RECOVER_AI, DEATH_AI, CONFIRM_AI;
  let load = false
  let lang = 'en'
  let DAY = 0

  function init(url="", callback){
    var data = []
    Papa.parse(url,
      {
        download: true,
        complete: result => {
          for (var i = 0; i < result.data.length - 1; i++) {
            data.push(result.data[i])
          }
          data = data.splice(1, data.length)
          data = cleanup(data)
          train(data, callback)
        },
      },
    )
  }

  function cleanup(data) {
    const cases = []

    for (var i = 2; i < data[0].length; i++) {
      const amount = []
      for (var o = 0; o < data.length; o++) {
        try {
          amount.push(parseInt(data[o][i]))
        } catch {
          console.log(data[o][i])
        }
      }
      cases.push(amount.reduce((a, b) => a + b, 0))
    }

    return cases
  }

  function train(data, callback) {
    const x = []
    for (var i = 0; i < data.length; i++) {
      x.push(i + 1)
    }

    var ai = new window.PR(x, data, 1)
    DAY = data.length + 1
    callback(ai)
  }

  function predict(ai, day = 0) {
    return Math.round(ai.predict(day))
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
    } else if (lang == 'ab') {
      return textData.ab
    }
  }

  init(
    'https://data.humdata.org/hxlproxy/api/data-preview.csv?url=https%3A%2F%2Fraw.githubusercontent.com%2FCSSEGISandData%2FCOVID-19%2Fmaster%2Fcsse_covid_19_data%2Fcsse_covid_19_time_series%2Ftime_series_covid19_recovered_global.csv&filename=time_series_covid19_recovered_global.csv',
  (ai)=>{
    RECOVER_AI = ai;
    init(
      'https://data.humdata.org/hxlproxy/api/data-preview.csv?url=https%3A%2F%2Fraw.githubusercontent.com%2FCSSEGISandData%2FCOVID-19%2Fmaster%2Fcsse_covid_19_data%2Fcsse_covid_19_time_series%2Ftime_series_covid19_deaths_global.csv&filename=time_series_covid19_deaths_global.csv',
      (dai)=>{
        DEATH_AI = dai;
        init(
          'https://data.humdata.org/hxlproxy/api/data-preview.csv?url=https%3A%2F%2Fraw.githubusercontent.com%2FCSSEGISandData%2FCOVID-19%2Fmaster%2Fcsse_covid_19_data%2Fcsse_covid_19_time_series%2Ftime_series_covid19_confirmed_global.csv&filename=time_series_covid19_confirmed_global.csv',
          (cai)=>{
            CONFIRM_AI = cai;
            load = true
          }
        )
      }
    )
  });
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
        {trans({ en: 'OSWALD PREDICTOR', ab: "PARASHIKUESI OSWALD", af: 'OSWALD تخمین کننده', tr: 'OSWALD BELİRLEYİCİSİ', dt: 'OSWALD PREDICTOR' }, lang)}
      </h1>
    </td>
  </tr>
  <tr class="style">
    <td class="style">
      {trans({ en: 'Day:', ab: "Dita:", af: 'روز', tr: 'Gün:', dt: 'Dag:' }, lang)}
    </td>
    <td class="style">
      <input type="number" placeholder="Day" bind:value={DAY} />
    </td>
  </tr>

  {#if load === true}
    <tr class="style">
      <td class="style">
        {trans({ en: 'Predicted Cases:', ab: ":", af: 'تخمین مریزان', tr: ':', dt: 'Voorspelde gevallen:' }, lang)}
      </td>
      <td class="style">{predict(CONFIRM_AI, DAY)}</td>
    </tr>
    <tr class="style">
      <td class="style">
        {trans({ en: 'Predicted Recoveries:', ab: "Rikuperimet e parashikuara:", af: 'تخمین صحت یافته', tr: 'İyileşen hasta saysı:', dt: 'Hersteld (voorspelt):' }, lang)}
      </td>
      <td class="style">{predict(RECOVER_AI, DAY)}</td>
    </tr>
    <tr class="style">
      <td class="style">
        {trans({ en: 'Predicted Deaths:', ab: ":", af: 'تخمین مرگ ها', tr: ':', dt: 'Doden (voorspelt):' }, lang)}
      </td>
      <td class="style">{predict(DEATH_AI, DAY)}</td>
    </tr>
  {:else}
    <br />
    <tr>loading...</tr>
  {/if}
  <tr>
    <td>
      <select bind:value={lang} style="height: 50px;">
        <option value="dt">Dutch</option>
        <option value="en">English</option>
        <option value="ab">Shqip/Albanian</option>
        <option value="tr">Türkçe</option>
        <option value="fa">فارسی</option>
      </select>
    </td>
    <td />
  </tr>
  <tr style="text-align: center;">
    <td colspan="2">
      <h3>
        {trans({ en: 'For more information, click', ab: "Për më shumë informacion, kliko", af: 'برای معلومات بیشتر ', tr: 'Daha fazla bilgi için', dt: 'Voor meer informatie, klik ' }, lang)}
        <a href="https://github.com/ElhamAryanpur/oswald">
          {trans({ en: 'here', ab: "këtu", af: 'اینجا کلیک کنید', tr: 'buraya Tıkla', dt: 'hier' }, lang)}
        </a>
      </h3>
    </td>
  </tr>
</table>
