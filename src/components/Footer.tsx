import React from "react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient1">
      <div className="container text-center">
        <div className="row">
          <div className="col-lg-12 col-sm-12 col-xs-12 mb-5">
            <br />
            <br />
            <h2 className="animated-gradient-text2">Project Aika</h2>
            <br />
            <h3 className="animated-gradient-text2">
              © All right reserved {year}.
            </h3>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
