import React from 'react'

const Loader = () => {
  return (
    <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 9999
        }}
        >
        <div className="text-center text-white">
            <div className="spinner-border text-light mb-3" role="status" />
            <div style={{ fontSize: "16px", fontWeight: 500 }}>
            Please wait...
            </div>
        </div>
    </div>
  )
}

export default Loader