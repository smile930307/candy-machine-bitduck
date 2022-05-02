import { BsTwitter, BsDiscord } from "react-icons/bs";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient1">
      <div className="container text-center">
        <div className="row">
          <div className="col-lg-12 col-sm-12 col-xs-12 mb-5">
            <br />
            <div>
                <a rel="noopener noreferrer" target="_blank" href="https://twitter.com/bitduckz"><BsTwitter style={{padding:"1px",margin:" 0px 100px 5px 0px",color:'blue', width:'60px', height:'60px'}}/></a>
                <a rel="noopener noreferrer" target="_blank" href="https://twitter.com/bitduckz"><BsDiscord style={{padding:"1px",margin:" 0px 5px 5px 100px",color:'purple', width:'60px', height:'60px'}}/></a>
            </div>
            <br />
            <h2 className="animated-gradient-text2">Project Bit Duckz</h2>
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
