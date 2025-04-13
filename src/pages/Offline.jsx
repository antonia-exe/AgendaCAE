import React from 'react';
import Header from "../components/Header/header";
import InfoOff from '../components/InfoOff/infoOff';
import Footer from "../components/Footer/footer";

const OffPage = () => {
  return (
    <div>
        <Header/>
        <InfoOff/>
        <Footer customText="Illustration designed by Freepik"/>
    </div>
  );
};

export default OffPage;