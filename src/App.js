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
    pip: 5,
    entryPrice: 0,
    stopLossPrice: 0,
    lot: 0,
    amountWillLost: 0
  }

  componentDidMount() {
    this.getRate();
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
            <button style={styles.buttonRefresh}><img src={ReloadImage} alt="my image" onClick={() => this.getRate()} /></button>

          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              id="amount-risk"
              name="amountRisk"
              label="Amount To Risk ($)"
              type="number"
              value={this.state.risk}
              onChange={this.handleChange('risk')}
              fullWidth
              autoComplete="fname"
              style={{ textAlign: 'center' }}
            />
          </Grid>
          <Grid item xs={6} sm={6}>
            <TextField
              id="entryPrice"
              name="entryPrice"
              label="Entry Price"
              value={this.state.entryPrice}
              onChange={this.handleChange('entryPrice')}
              type="number"
              fullWidth
              autoComplete="fname"
            />
          </Grid>
          <Grid item xs={6} sm={6}>
            <TextField
              id="stoploss"
              name="stoploss"
              label="Stop Loss Price"
              type="number"
              value={this.state.stopLossPrice}
              onChange={this.handleChange('stopLossPrice')}
              fullWidth
              autoComplete="lname"
            />
          </Grid>
          <Grid item xs={12} sm={12}>

          </Grid>
          <Grid item xs={6} sm={6}>
            <div style={{ fontSize: 20 }}>{`Pair: ${this.state.currency1}${this.state.currency2}`}</div>
          </Grid>
          <Grid item xs={6} sm={6}>
            {this._renderPipValue()}
          </Grid>
        </Grid>

        <div style={styles.button}>
          <Button variant="outlined" color="inherit" onClick={this.calculateAction.bind(this)}>
            Calculate
          </Button>
        </div>
        {this._renderResult()}
      </div>
    );
  }

  _renderCurrency1Selection() {
    return (
      <FormControl style={{ width: '100%' }}>
        <InputLabel htmlFor="age-native-simple">Currency</InputLabel>
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
        <InputLabel htmlFor="age-native-simple">Currency</InputLabel>
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
    // this.setState({pip})
    return (
      <div style={{ fontSize: 20, color: (this.state.entryPrice >= this.state.stopLossPrice) ? 'green' : 'red' }}> Pip: {this.state.pip}</div>
    )
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value }, () => this.calculatePip());
  };

  calculatePip() {
    var pip = this.state.entryPrice - this.state.stopLossPrice;
    if (this.state.currency1 === 'JPY' || this.state.currency2 === 'JPY') {
      pip = (pip * 100).toFixed(1);
    } else {
      pip = (pip * 10000).toFixed(1);
    }
    if (pip < 0) {
      pip = 0 - pip;
    }
    this.setState({ pip: 5 })
  }

  handleChangeSelection = name => event => {
    if (name === "currency2") {
      this.setState({ [name]: event.target.value }, () => this.getRate());
    } else {
      this.setState({ [name]: event.target.value });
    }

  };

  getRate() {
    const { currency1, currency2 } = this.state;
    if (currency1 !== currency2) {
      getRateCurrency(currency1, currency2)
        .then((rate) => {
          if (this.state.currency1 === 'JPY' || this.state.currency2 === 'JPY') {
            rate = rate.toFixed(2)
          } else {
            rate = rate.toFixed(4)
          }
          this.setState({ entryPrice: rate, stopLossPrice: rate, rate, pip: 5, lot: 0 })
        })
    }
  }

  _renderResult() {
    const lot = this.state.lot.toFixed(2)

    return (
      <div style={styles.resultContainer}>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={12}>
            <div>Lot: {lot}</div>
          </Grid>
          <Grid item xs={12} sm={12}>
            <div></div>
          </Grid>
        </Grid>
      </div>
    )
  }

  calculateAction() {
    const { risk, pip, currency2 } = this.state;
    if (currency2 !== 'USD') {
      getRateCurrency(this.state.currency2, 'USD')
        .then((rate) => {
          var lot = (pip) / (risk * rate * 10);
          this.setState({lot})
        })
    } else {
      var lot = risk / (pip * 10);
      this.setState({lot})
    }

  }
}

const styles = {
  container: {
    width: '90%',
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
      width: '60%',
      paddingLeft: '20%',
      paddingTop: '30px',
      fontSize: 25,
      color: 'green'
  }
}

export default App;
