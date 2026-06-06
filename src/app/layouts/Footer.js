import React from 'react';
import { Container } from 'react-bootstrap';
 
const Footer = () => {
  return (
    <footer className="app-footer py-2">
      <Container fluid>
        <div className="text-center">
          <p className="mb-0">
            Copyright © {new Date().getFullYear()} Bank of Baroda.
            All rights reserved | Powered by Sagarsoft
          </p>
        </div>
      </Container>
    </footer>
  );
};
 
export default Footer;