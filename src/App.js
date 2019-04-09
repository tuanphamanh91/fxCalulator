import React, { Component } from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { getRateCurrency } from './api';
import ReloadImage from './images/refresh-arrow.png';

class App extends Component {

  state = {
    rate: 0,
    currency1: "EUR",
    currency2: "USD",
    risk: 5,
    pip: 0,
    entryPrice: 0,
    stopLossPrice: 0,
    lot: 0,
    moneyWillLost: 0,
    showResult: false
  }

  render() {
    return (
      <div style={styles.container} >
        <div style={styles.title}> Forex Calculator </div>
        <Grid container spacing={24}>
          <Grid item xs={5} sm={5}>
            {this._renderCurrency1Selection()}
          </Grid>
          <Grid item xs={5} sm={5}>
            {this._renderCurrency2Selection()}
          </Grid>
          <Grid item xs={2} sm={2}>
            <button style={styles.buttonRefresh}><img src={ReloadImage} alt="reload" onClick={() => this.getRate()} /></button>
          </Grid>
          <Grid item xs={10} sm={10}>
            <TextField
              id="amount-risk"
              name="amountRisk"
              label="Amount To Risk ($):"
              type="number"
              value={this.state.risk}
              onChange={this.handleChange('risk')}
              fullWidth
              autoComplete="fname"
              style={{ textAlign: 'center' }}
            />
          </Grid>
          <Grid item xs={5} sm={5}>
            <TextField
              id="entryPrice"
              name="entryPrice"
              label="Entry Price:"
              value={this.state.entryPrice}
              onChange={this.handleChange('entryPrice')}
              type="number"
              fullWidth
              autoComplete="fname"
            />
          </Grid>
          <Grid item xs={5} sm={5}>
            <TextField
              id="stoploss"
              name="stoploss"
              label="Stoploss Price:"
              type="number"
              value={this.state.stopLossPrice}
              onChange={this.handleChange('stopLossPrice')}
              fullWidth
              autoComplete="lname"
            />
          </Grid>
          <Grid item xs={2} sm={2}>
            <Button variant="outlined" color="inherit" onClick={this.calculateLot.bind(this)}>
              Calculate
          </Button>
          </Grid>
          <Grid item xs={12} sm={12}>

          </Grid>
          <Grid item xs={5} sm={5}>
            <div style={{ fontSize: 20 }}>{`Pair: ${this.state.currency1}${this.state.currency2}`}</div>
          </Grid>
          <Grid item xs={5} sm={5}>
            {this._renderPipValue()}
          </Grid>

        </Grid>


        {this._renderResult()}
      </div>
    );
  }

  _renderCurrency1Selection() {
    return (
      <FormControl style={{ width: '100%' }}>
        <InputLabel htmlFor="age-native-simple">Currency:</InputLabel>
        <Select
          native
          onChange={this.handleChangeSelection("currency1")}
          value={this.state.currency1}
        >
          <option value={'USD'}>USD</option>
          <option value={'EUR'}>EUR</option>
          <option value={'JPY'}>JPY</option>
          <option value={'GBP'}>GBP</option>
          <option value={'AUD'}>AUD</option>
          <option value={'CHF'}>CHF</option>
          <option value={'NZD'}>NZD</option>
          <option value={'CAD'}>CAD</option>
          <option value={'AUD'}>AUD</option>
          <option value={'XAU'}>XAU</option>
        </Select>
      </FormControl>
    )
  }

  _renderCurrency2Selection() {
    return (
      <FormControl style={{ width: '100%' }}>
        <InputLabel htmlFor="age-native-simple">Currency:</InputLabel>
        <Select
          native
          onChange={this.handleChangeSelection("currency2")}
          value={this.state.currency2}
        >
          <option value={'USD'}>USD</option>
          <option value={'EUR'}>EUR</option>
          <option value={'JPY'}>JPY</option>
          <option value={'GBP'}>GBP</option>
          <option value={'AUD'}>AUD</option>
          <option value={'CHF'}>CHF</option>
          <option value={'NZD'}>NZD</option>
          <option value={'CAD'}>CAD</option>
          <option value={'AUD'}>AUD</option>
        </Select>
      </FormControl>
    )
  }

  _renderPipValue() {
    var text = "";
    if (this.state.entryPrice >= this.state.stopLossPrice) {
      text = `LONG: ${this.state.pip} pips.`
    } else {
      text = `SHORT: ${this.state.pip} pips.`
    }
    return (
      <div style={{ fontSize: 20 }}>{text}</div>
    )
  }

  handleChange = name => event => {
    this.setState({ [name]: parseFloat(event.target.value) }, () => this.calculatePip());
  };

  calculatePip() {
    var pip = this.state.entryPrice - this.state.stopLossPrice;
    if (this.state.currency1 === 'JPY' || this.state.currency2 === 'JPY') {
      pip = (pip * 100).toFixed(1);
    } else if (this.state.currency1 !== 'XAU') {
      pip = (pip * 10000).toFixed(1);
    }
    pip = parseFloat(pip);
    if (pip < 0) {
      pip = 0 - pip;
    }
    this.setState({ pip })
  }

  handleChangeSelection = name => event => {
    if (name === "currency2") {
      this.setState({ [name]: event.target.value, showResult: false }, () => this.getRate());
    } else {
      this.setState({ [name]: event.target.value, showResult: false });
    }

  };

  getRate() {
    const { currency1, currency2 } = this.state;
    if (currency1 !== currency2) {
      getRateCurrency(currency1, currency2)
        .then((rate) => {
          if (this.state.currency1 === 'JPY' || this.state.currency2 === 'JPY' || this.state.currency1 === 'XAU') {
            rate = rate.toFixed(2)
          } else {
            rate = rate.toFixed(4)
          }
          rate = parseFloat(rate);
          this.setState({ entryPrice: rate, stopLossPrice: rate, rate, pip: 0, lot: 0 })
        })
    }
  }

  _renderResult() {
    if (!this.state.showResult) return
    return (
      <div style={styles.resultContainer}>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={12}>
            <div style={{ fontSize: 30 }}>RESULT:</div>
          </Grid>
          <Grid item xs={12} sm={12}>
            <div>Lot: {this.state.lot}</div>
          </Grid>
          <Grid item xs={12} sm={12}>
            <div>Money will lost: {this.state.moneyWillLost}$</div>
          </Grid>
        </Grid>
      </div>
    )
  }

  calculateLot() {
    const { risk, pip, currency1, currency2 } = this.state;
    if (pip === 0 || risk === 0) return;

    if (currency2 !== 'USD') {
      getRateCurrency(this.state.currency2, 'USD')
        .then((rate) => {
          var lot = (risk) / (pip * rate * 10);
          lot = parseFloat(lot.toFixed(2));
          var moneyWillLost = pip * lot * rate * 10;
          moneyWillLost = moneyWillLost.toFixed(2);
          if (currency2 === 'JPY') {
            lot = (lot / 100).toFixed(2);
            lot = parseFloat(lot);
          }
          this.setState({ lot, moneyWillLost, showResult: true })

        })
    } else if (currency1 === 'XAU') {
      var lot = risk / (pip * 100);
      lot = parseFloat(lot.toFixed(2));
      var moneyWillLost = lot * pip * 100;
      moneyWillLost = moneyWillLost.toFixed(2);
      this.setState({ lot, moneyWillLost, showResult: true })
    } else {
      var lot = risk / (pip * 10);
      lot = parseFloat(lot.toFixed(2));
      var moneyWillLost = lot * pip * 10;
      moneyWillLost = moneyWillLost.toFixed(2);
      this.setState({ lot, moneyWillLost, showResult: true })
    }
  }
}

const styles = {
  container: {
    width: '70%',
    paddingLeft: '5%'
  },

  title: {
    fontSize: 30,
    textAlign: 'center',
    width: '100%',
    margin: '20px 0px',
  },
  button: {
    textAlign: 'center',
    marginTop: '30px',
    fontSize: 25,
  },
  buttonRefresh: {
    backgroundColor: 'transparent',
    backgroundRepeat: 'no-repeat',
    border: 'none',
    cursor: 'pointer',
    overflow: 'hidden',
    outline: 'none',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingTop: 10
  },
  resultContainer: {
    backgroundColor: "#cbe8c7",
    marginTop: '30px',
    width: '83%',
    borderTop: "1px solid #000000",
    fontSize: 25,
  }
}

export default App;
