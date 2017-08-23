import React, { Component } from 'react';
import * as deviceWebSocket from '../api/deviceWebSockets'
import { getModel as getDeviceModel } from '../api/device'
import CircularProgress from 'material-ui/CircularProgress'
import Slider from 'material-ui/Slider'
import Chip from 'material-ui/Chip';
import FaBattery0 from 'react-icons/lib/fa/battery-0'
import LineGraph from '../components/molecules/LineGraph'


function sorter(data,dataKeys){
  let sortedValues = {}
  if(data != null) {
    dataKeys.forEach(key => {
      sortedValues[key] = {}
      sortedValues[key].values = []
        for(let i = 0; i < data.length; i++){
          let time = data[i]['_ts']

          sortedValues[key].values.push({ts: time,value: data[i][key]})
        }
      let allX = sortedValues[key].values.map(val => (val.ts))
      let allY = sortedValues[key].values.map(val => (val.value))
      let minX = Math.min.apply(null, allX)
      let maxX = Math.max.apply(null, allX)
      let minY = Math.min.apply(null, allY)
      let maxY = Math.max.apply(null, allY)

      sortedValues[key]['rangeX'] = {min: minX,max: maxX}
      sortedValues[key]['rangeY'] = {min: minY,max: maxY}

    })
  }
  return sortedValues
}

export default class DevicePage extends Component {

  // Determines which graphs get rendered
  allGraphs = []

  constructor(props){
    super(props);
    this.state = {
       data: {},
       hoursBackShown:3,
       hoursBack: 3,
       loaderShown: false,
       graphsShown: [{
          key: 'humidity',
          displayTitle: 'Humidity',
          unit: '%'
        },{
          key: 'pressure',
          displayTitle: 'Pressure',
          unit: ' hPa'
        },{
          key: 'temperature',
          displayTitle: 'Temperature',
          unit: '°C'
        }],
    };
    this.defaultChange = null;
  }

  componentDidMount(){
    deviceWebSocket.getDevicesData(this.props.deviceId, this.updateData, this.state.hoursBack,this.handleUpdateData)
    getDeviceModel(this.props.deviceId)
    .then( res => {
      this.allGraphs = res.map(modelData => {
        return {
          key: modelData.reference,
          displayTitle: modelData.title,
          unit: modelData.unit
        }
      })
    })
    .catch(error => {
      this.props.handleError(error)
    })
  }

determineGraphsWithClass = (allGraphs) => {
  this.state.graphsShown.forEach(graphShown => {
    allGraphs.forEach(graph => {
      if(graphShown.key === graph.key) {
        graph.display = true
        // Optimasation issue, loop will keep running even when matched
      }
    })
  })
  return allGraphs
}

  updateData = (newData)=>{
    this.setState({
      data: newData,
      loaderShown:false
    })
  }

  handleUpdateData = (newData)=>{

    this.setState({
      data: this.state.data.concat(newData)
    })
  }

  handleSliderStop = (value)=>{
    deviceWebSocket.getDevicesData(this.props.deviceId, this.updateData, value,this.handleUpdateData)

    this.setState({
      hoursBack: value,
      loaderShown: true,
      hoursBackShown: value
    })
  }

  handleSlider = (value)=>{
    this.setState({
      hoursBackShown: value
    })
  }

  getBatteryPercentage = (latestBattery) =>{
    // Getting the percentage of how far between two points.
    let lower = 2.31
    let upper = 2.794
    let value = latestBattery
    let percentage = (value - lower) / (upper - lower)
    return percentage * 100
  }

  handleGraphDelete = (graphKey) => {
    this.setState({
      graphsShown: this.state.graphsShown.filter(graphShown =>{
        return graphShown.key !== graphKey
      })
    })
    this.allGraphs = this.allGraphs.map(graph => {
      graph.display = false
      return graph
    })
  }

  handleGraphAdd = (graphKey) => {
    let elementToAdd = this.allGraphs.find(graph => graph.key === graphKey)
    this.setState({
      graphsShown: this.state.graphsShown.concat(elementToAdd)
    })
    this.allGraphs = this.allGraphs.map(graph => {
      graph.display = false
      return graph
    })
  }

  handleGraphAdd = (graphKey) => {
    let elementToAdd = this.allGraphs.find(graph => graph.key === graphKey)
    this.setState({
      graphsShown: this.state.graphsShown.concat(elementToAdd)
    })
    this.allGraphs = this.allGraphs.map(graph => {
      graph.display = false
      return graph
    })
  }

  render() {
    const sortedGraphs = this.determineGraphsWithClass(this.allGraphs)
    const sortedData = sorter(this.state.data,this.state.graphsShown.map(graph => graph.key))
    return (

      <div style={{textAlign: 'center'}}>



        { !!this.state.data.length ? (

          <div style={{textAlign: 'center',marginLeft: 'auto',marginRight: 'auto'}}>
            
            {this.getBatteryPercentage(this.state.data[0].battery) >= 80 ? (
              <div style={ { display: 'block', float: 'right' } }> 
                <p style={ 
                    { 
                      position: 'absolute', color: 'darkgreen', 
                      zIndex: 1, marginLeft: '14px', marginTop: '22px' 
                    } 
                } > 100% </p>
                <FaBattery0 
                    style={ {  color: 'darkgreen', marginRight: '14px' } } 
                    size={60} 
                  />
              </div>
            ) : this.getBatteryPercentage(this.state.data[0].battery) >= 60 ? (
              <div style={ { display: 'block', float: 'right' } }> 
                <p style={ 
                    { 
                      position: 'absolute', color: 'darkgreen', 
                      zIndex: 1, marginLeft: '14px', marginTop: '22px' 
                    } 
                } > 80% </p>
                <FaBattery0 
                    style={ {  color: 'darkgreen', marginRight: '14px' } } 
                    size={60} 
                  />
              </div>
            ) : this.getBatteryPercentage(this.state.data[0].battery) >= 40 ? (
              <div style={ { display: 'block', float: 'right' } }> 
                <p style={ 
                    { 
                      position: 'absolute', color: 'green', 
                      zIndex: 1, marginLeft: '14px', marginTop: '22px' 
                    } 
                } > 60% </p>
                <FaBattery0 
                    style={ {  color: 'green', marginRight: '14px' } } 
                    size={60} 
                  />
              </div>
            ) : this.getBatteryPercentage(this.state.data[0].battery) >= 20 ? (
              <div style={ { display: 'block', float: 'right' } }> 
                <p style={ 
                    { 
                      position: 'absolute', color: 'orange', 
                      zIndex: 1, marginLeft: '14px', marginTop: '22px' 
                    } 
                } > 40% </p>
                <FaBattery0 
                    style={ {  color: 'orange', marginRight: '14px' } } 
                    size={60} 
                  />
              </div>
            ) : this.getBatteryPercentage(this.state.data[0].battery) >= 10 ? (
              <div style={ { display: 'block', float: 'right' } }> 
                <p style={ 
                    { 
                      position: 'absolute', color: 'red', 
                      zIndex: 1, marginLeft: '14px', marginTop: '22px' 
                    } 
                } > 20% </p>
                <FaBattery0 
                    style={ {  color: 'red', marginRight: '14px' } } 
                    size={60} 
                  />
              </div>
            ) : this.getBatteryPercentage(this.state.data[0].battery) >= 0 ? (
              <div style={ { display: 'block', float: 'right' } }> 
                <p style={ 
                    { 
                      position: 'absolute', color: 'darkred', 
                      zIndex: 1, marginLeft: '14px', marginTop: '22px' 
                    } 
                } > 10% </p>
                <FaBattery0 
                    style={ {  color: 'darkred', marginRight: '14px' } } 
                    size={60} 
                  />
              </div>
            ) : 'Inavlid battery data'}



            <div style={{width: '100%',display: 'block'}}>
              {!this.state.loaderShown ? (
                <div style={{height: '90px',width: '80%',display: 'flex',flexDirection: 'row',alignItems: 'center',marginLeft: 'auto',marginRight: 'auto'}}>
                <h5 style={{height: '45px',width: '14%',display: 'inline-block'}}>{`Data range: ${this.state.hoursBackShown} hours`}</h5>
                <Slider style={{width: '85%',display: 'inline-block'}}
                min={1}
                max={24}
                step={1}
                value={this.state.hoursBack}
                onChange={(event,value) => {
                  this.defaultChange = value
                  this.handleSlider(value)
                }}
                onDragStop={() => {  this.defaultChange > 0 && this.handleSliderStop(this.defaultChange)}}
              />
              </div>
              ): (
                <CircularProgress />
              )}
            </div>
             {sortedGraphs.length > 0 ? (
                <div className='chip-container'>
                  {sortedGraphs.map(graph =>{
                    return <MuiThemeProvider
                    key={graph.key}>
                    {graph.display ? (
                      <Chip
                      className='display-true'
                      onRequestDelete={() => this.handleGraphDelete(graph.key)}
                      style={{backgroundColor: 'red'}}>
                        {graph.displayTitle}
                      </Chip>
                    ) : (
                      <Chip
                      className='display-false'
                      onTouchTap={() => this.handleGraphAdd(graph.key)}>
                        {graph.displayTitle}
                      </Chip>
                    )}
                    </MuiThemeProvider>
                  })}
                </div>
             ) : (
               <CircularProgress />
             )}

          {this.state.graphsShown.map(graphPreference => (

            <div  style={{height: '500px',
            width: '500px', display: 'inline-block'}} key={`${graphPreference.key}Graph`}>
              <h1>{graphPreference.displayTitle}</h1>
              <h2> Min: {(sortedData[graphPreference.key].rangeY.min).toFixed(2)} /
                   Max: {(sortedData[graphPreference.key].rangeY.max).toFixed(2)}  </h2>
                 <LineGraph graphPreference={graphPreference} values={sortedData[graphPreference.key].values}/>
                </div>
            ))}</div>
        ) : <CircularProgress />}
      </div>
    )
  }
}
