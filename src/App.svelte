<script>
  let DATA = []
  let load = false
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

  input {
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
      <h1>OSWALD PREDICTOR</h1>
    </td>
  </tr>
  <tr class="style">
    <td class="style">Days:</td>
    <td class="style">
      <input type="number" placeholder="Day" bind:value={DAY} />
    </td>
  </tr>

  {#if load === true}
    <tr class="style">
      <td class="style">Predicted Recoveries:</td>
      <td class="style">{predict(DAY)}</td>
    </tr>
    <tr class="style">
      <td class="style">Today:</td>
      <td class="style">{DATA[DATA.length - 1]}</td>
    </tr>
    <tr class="style">
      <td class="style">Difference:</td>
      <td class="style">{diff(DAY)}</td>
    </tr>
  {:else}
    <br />
    <tr>loading...</tr>
  {/if}
</table>
