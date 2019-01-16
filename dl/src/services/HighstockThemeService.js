/**
 * Exchange page highstocks defaults
 */
class HighstockThemeService {
  /**
     * Get hightstock theme
     *
     * @returns {Object}
     */
  static getTheme() {
    return {
      global: {
        useUTC: false
      },
      chart: {
        backgroundColor: 'transparent',
        style: {
          fontFamily: '\'Roboto\', sans-serif'
        }
      },
      xAxis: {
        gridLineColor: 'rgba(51, 183, 239, 0.1)',
        gridLineWidth: 50,
        labels: {
          style: {
            color: '#8e92b1',
            fontSize: '14px',
            fontWeight: '500'
          },
          //y: 50
        },
        lineColor: '#265085',
        lineWidth: 0,
        minorGridLineColor: '#505053'
      },
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#eaeaea',
        style: {
          color: '#010101'
        }
      },
      plotOptions: {
        series: {
          dataLabels: {
            color: '#B0B0B3'
          },
          marker: {
            lineColor: '#333'
          },
          borderRadius: 5
        },
        boxplot: {
          fillColor: '#505053'
        },
        candlestick: {
          lineColor: 'white'
        },
        errorbar: {
          color: 'white'
        }
      },
      drilldown: {
        activeAxisLabelStyle: {
          color: '#F0F0F3'
        },
        activeDataLabelStyle: {
          color: '#F0F0F3'
        }
      },
      navigation: {
        buttonOptions: {
          enabled: false
        }
      },
      // scroll charts
      rangeSelector: {
        buttonTheme: {
          fill: '#313659',
          stroke: '#757cad',
          'stroke-width': '2',
          style: {
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500'
          },
          states: {
            hover: {
              fill: '#707073',
              stroke: '#000000',
              style: {
                color: 'white'
              }
            },
            select: {
              fill: '#000003',
              stroke: '#000000',
              style: {
                color: 'white'
              }
            }
          }
        },
        inputBoxBorderColor: '#505053',
        inputStyle: {
          backgroundColor: '#333',
          color: 'silver'
        },
        labelStyle: {
          color: 'silver'
        }
      },
      navigator: {
        handles: {
          backgroundColor: '#666',
          borderColor: '#AAA'
        },
        outlineColor: 'pink',
        maskFill: 'rgba(255,255,255,0.1)',
        series: {
          color: '#7798BF',
          lineColor: '#A6C7ED'
        },
        xAxis: {
          gridLineColor: 'yellow'
        }
      },
      scrollbar: {
        barBackgroundColor: '#808083',
        barBorderColor: '#808083',
        buttonArrowColor: '#CCC',
        buttonBackgroundColor: '#606063',
        buttonBorderColor: '#606063',
        rifleColor: '#FFF',
        trackBackgroundColor: '#404043',
        trackBorderColor: '#404043'
      }
      // special colors for some of the
      //legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
      //background2: '#505053',
      //dataLabelsColor: '#B0B0B3',
      //textColor: '#C0C0C0',
      //contrastTextColor: '#F0F0F3',
      //maskColor: 'rgba(255,255,255,0.3)'
    };
  }
}

export default HighstockThemeService;