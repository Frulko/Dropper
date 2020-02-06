import React from 'react'

const DeepDebugNode = ({children, ...props}) => {
  // console.log('d-render', props['data-node']);
  return (
    <div {...props}>{children}</div>
  )
} 

export default DeepDebugNode;