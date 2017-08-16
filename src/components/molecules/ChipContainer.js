import React from 'react'
import Chip from '../atoms/Chip'


export default function CustomTable(props) {
  return (<div className='chip-container'>
    {props.sortedGraphs.map(graph =>(
      <div key={graph.key}>
      {graph.display ? (
        <Chip
        className='display-true'
        onRequestDelete={() => props.handleGraphDelete(graph.key)}
        style={{backgroundColor: 'red'}}>
          {graph.displayTitle}
        </Chip>
      ) : (
        <Chip
        className='display-false'
        onTouchTap={() => props.handleGraphAdd(graph.key)}>
          {graph.displayTitle}
        </Chip>
      )}
      </div>
    ))}
  </div>)
}
