import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  const date= new Date().getFullYear()
  return (
    <CFooter>
      <div>
        <a href="https://inno-software.com" target="_blank" rel="noopener noreferrer">
          INNO
        </a>
        <span className="ms-1">&copy; {date} - Sistema Libros</span>
      </div>
      {/* <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
          CoreUI React Admin &amp; Dashboard Template
        </a>
      </div> */}
    </CFooter>
  )
}

export default React.memo(AppFooter)
