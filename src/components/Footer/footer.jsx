import React from 'react';
import './footer.css';

const Footer = () => {
    const customText = (
        <>
            Illustration designed by{' '}
            <a
                href="https://www.freepik.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
            >
                Freepik
            </a>
        </>
    );

    return (
        <footer className="footer">
            <div className="footer-rectangle">
                <p className="footer-text">{customText}</p>
            </div>
        </footer>
    );
};

export default Footer;