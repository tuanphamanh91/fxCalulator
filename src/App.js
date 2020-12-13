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
import {
  isMobile
} from "react-device-detect";
class App extends Component {

  state = {
    multiMode: true,
    rate: 0,
    currency1: "EUR",
    currency2: "USD",
    risk: 5,
    pip: 0,
    entryPrice1: 0,
    entryPrice2: 0,
    stopLossPrice: 0,
    takeProfitPrice: 0,
    rr: 0,
    lot: 0,
    fee: 0,
    moneyWillLost: 0,
    showResult: false
  }


  calculatePip() {
    var { entryPrice1, entryPrice2, stopLossPrice, takeProfitPrice, multiMode } = this.state;
    const entry = multiMode ? (entryPrice1 + entryPrice2) / 2 : entryPrice1;
    var stoplossPip = this.pipBetweenTwoPrice(entry, stopLossPrice);
    if (takeProfitPrice > 0) {
      var takeProfitPip = this.pipBetweenTwoPrice(takeProfitPrice, entry);
      var rr = takeProfitPip / stoplossPip;
      rr = parseFloat(rr.toFixed(1));
      this.setState({ rr })
    }
    this.setState({ 'pip': stoplossPip })
  }

  pipBetweenTwoPrice(price1, price2) {
    var pip = price1 - price2;
    if (this.state.currency1 === 'JPY' || this.state.currency2 === 'JPY') {
      pip = (pip * 100).toFixed(1);
    } else if (this.state.currency1 !== 'XAU') {
      pip = (pip * 10000).toFixed(1);
    }
    pip = parseFloat(pip);
    if (pip < 0) {
      pip = 0 - pip;
    }
    return pip;
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
          this.setState({ entryPrice1: rate, entryPrice2: rate, stopLossPrice: rate, takeProfitPrice: rate, rate, pip: 0, lot: 0 })
        })
    }
  }

  calculateLot() {
    const { risk, pip, currency1, currency2 } = this.state;
    if (pip === 0 || risk === 0) return;

    if (currency2 !== 'USD') {
      getRateCurrency(this.state.currency2, 'USD')
        .then((rate) => {
          let lot = (risk) / (pip * rate * 10);
          lot = parseFloat(lot.toFixed(2));
          let fee = lot * 7;
          let moneyWillLost = (pip * lot * rate * 10).toFixed(2);

          if (currency2 === 'JPY') {
            lot = (lot / 100).toFixed(2);
            lot = parseFloat(lot);
            fee = lot * 7;
            moneyWillLost = (pip * lot * rate * 10 * 100).toFixed(2);
          }

          this.setState({ lot, fee, moneyWillLost, showResult: true })

        })
    } else if (currency1 === 'XAU') {
      let lot = risk / (pip * 100);
      lot = parseFloat(lot.toFixed(2));
      let moneyWillLost = lot * pip * 100;
      let fee = lot * 7;
      moneyWillLost = (moneyWillLost).toFixed(2);
      this.setState({ lot, fee, moneyWillLost, showResult: true })
    } else {
      let lot = risk / (pip * 10);
      lot = parseFloat(lot.toFixed(2));
      let moneyWillLost = lot * pip * 10;
      let fee = lot * 7;
      moneyWillLost = (moneyWillLost).toFixed(2);
      this.setState({ lot, fee, moneyWillLost, showResult: true })
    }
  }

  handleChange = name => event => {
    this.setState({ [name]: parseFloat(event.target.value) }, () => this.calculatePip());
  };

  _renderResult() {
    if (!this.state.showResult) return;
    const isLong = this.state.entryPrice1 >= this.state.stopLossPrice;
    return (
      <div style={{
        backgroundColor: isLong ? "#cbe8c7" : '#f5cad2',
        margin: '30px 0px',
        borderTop: "1px solid #000000",
        fontSize: 25,
      }}>
        <Grid container spacing={24}>
          <Grid item xs={6} sm={6}>
            <div style={{ fontSize: 30, textAlign: 'center' }}> {this.state.lot} lot</div>
          </Grid>
          <Grid item xs={6} sm={6}>
            <div style={{ fontSize: 30, textAlign: 'center' }}>{(parseFloat(this.state.fee) + parseFloat(this.state.moneyWillLost)).toFixed(2)}$</div>
          </Grid>
          <Grid item xs={4} sm={4}>
            <div style={{ fontSize: 16, textAlign: 'center' }}>Lost: {this.state.moneyWillLost}$</div>
          </Grid>
          <Grid item xs={4} sm={4}>
            <div style={{ fontSize: 16, textAlign: 'center' }}>Fee: {this.state.fee.toFixed(2)}$</div>
          </Grid>
          <Grid item xs={4} sm={4}>
          <div style={{ fontSize: 16, textAlign: 'center' }}>Reward/risk: {this.state.rr}</div>
            {/* <div style={{ fontSize: 16, textAlign: 'center' }}>MinRR: {((parseFloat(this.state.fee) + parseFloat(this.state.moneyWillLost)) / this.state.moneyWillLost).toFixed(2)}</div> */}
          </Grid>


          {/* {
            (this.state.rr > 0) ?
              <Grid item xs={12} sm={12}>
                <div>Reward/risk: {this.state.rr}</div>
              </Grid>
              : <div></div>
          } */}
        </Grid>
      </div>
    )
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
    const isLong = this.state.entryPrice1 >= this.state.stopLossPrice;
    if (isLong) {
      text = `LONG: ${this.state.pip} pips.`
    } else {
      text = `SHORT: ${this.state.pip} pips.`
    }
    return (
      <div style={{ fontSize: 16, marginTop: 10, color: isLong ? 'green' : 'red' }}>{text}</div>
    )
  }



  render() {
    const { multiMode } = this.state
    return (
      <div style={styles.container} >
        <button style={styles.titleBtn} onClick={() => this.setState({ multiMode: !this.state.multiMode })}>

          <div style={styles.title}>
            {this.state.multiMode ? 'Multiple Forex Calculator' : 'Forex Calculator'}
          </div>
        </button>

        <div style={styles.headerContainer}>
          <div style={styles.info}>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>{`${this.state.currency1}${this.state.currency2}`}</div>
            {this._renderPipValue()}
          </div>
          <button style={styles.buttonRefresh}><img style={styles.imgRefresh} src={ReloadImage} alt="reload" onClick={() => this.getRate()} /></button>

        </div>

        {this._renderResult()}

        <Grid container spacing={24}>

          <Grid item xs={6} sm={6}>
            {this._renderCurrency1Selection()}
          </Grid>
          <Grid item xs={6} sm={6}>
            {this._renderCurrency2Selection()}
          </Grid>
          <Grid item xs={6} sm={6}>
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
          <Grid item xs={6} sm={6}>
          </Grid>
          <Grid item xs={6} sm={6}>
            <TextField
              id="entryPrice1"
              name="entryPrice1"
              label={multiMode ? "Entry1:" : "Entry:"}
              value={this.state.entryPrice1}
              onChange={this.handleChange('entryPrice1')}
              type="number"
              fullWidth
              autoComplete="fname"
            />
          </Grid>
          <Grid item xs={6} sm={6}>
            <TextField
              id="stoploss"
              name="stoploss"
              label="Stoploss:"
              type="number"
              value={this.state.stopLossPrice}
              onChange={this.handleChange('stopLossPrice')}
              fullWidth
              autoComplete="lname"
            />
          </Grid>
          {multiMode ?
            <Grid item xs={6} sm={6}>
              <TextField
                id="entryPrice2"
                name="entryPrice2"
                label="Entry2:"
                value={this.state.entryPrice2}
                onChange={this.handleChange('entryPrice2')}
                type="number"
                fullWidth
                autoComplete="fname"
              />
            </Grid>
            : <Grid item xs={6} sm={6} /> 
          }
          
            <Grid item xs={6} sm={6}>
            <TextField
              id="takeProfit"
              name="takeProfit"
              label="Take Profit:"
              value={this.state.takeProfitPrice}
              onChange={this.handleChange('takeProfitPrice')}
              type="number"
              fullWidth
              autoComplete="fname"
            />
          </Grid>
         
          <Grid item xs={6} sm={6}>
            <Button variant="outlined" color="inherit" onClick={this.calculateLot.bind(this)}>
              Calculate
          </Button>
          </Grid>
        </Grid>


      </div>
    );
  }
}

const styles = {
  container: {
    margin: '20px',
    padding: !isMobile ? '100px 300px' : 0
  },

  titleBtn: {
    backgroundColor: 'transparent',
    backgroundRepeat: 'no-repeat',
    border: 'none',
    cursor: 'pointer',
    // overflow: 'hidden',
    outline: 'none',
    alignItems: 'center',
    width: '100%'
  },

  title: {
    fontSize: 30,
    textAlign: 'center',
    width: '100%',
    margin: '20px',
  },
  button: {
    textAlign: 'center',
    marginTop: '30px',
    fontSize: 25,
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    marginBottom: 50,
  },
  info: {
    flex: 4,
  },
  buttonRefresh: {
    backgroundColor: 'transparent',
    backgroundRepeat: 'no-repeat',
    border: 'none',
    cursor: 'pointer',
    // overflow: 'hidden',
    outline: 'none',
    alignItems: 'center',
    width: '16px',
    height: '16px',
    flex: 1
  },
  imgRefresh: {
    backgroundSize: 'contain',
    objectFit: 'contain',
    width: 'inherit'
  },
  resultContainer: {

  }
}

export default App;
