import {
  DropdownButton,
  Dropdown,
  Button,
  Navbar,
  Container,
  Nav,
} from "react-bootstrap";
import { BsTwitter, BsDiscord } from "react-icons/bs";
import logo from "../assets/images/logo.png";
import { useState } from "react";
import { Link } from "react-router-dom"

import '@solana/wallet-adapter-react-ui/styles.css';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Header = () => {

  const [colorChange, setColorchange] = useState(false);
  const changeNavbarColor = () => {
    if (window.scrollY >= 80) {
      setColorchange(true);
    } else {
      setColorchange(false);
    }
  };
  window.addEventListener("scroll", changeNavbarColor);

  return (
    <header className={colorChange ? "header colorChange" : "header"}>
      <Navbar id="navbar" expand="lg">
        <Container>
          <Navbar.Brand
            href="/"
            className="site-logo navbar-brand"
            title="back to index"
          >
            <img
              loading="lazy"
              width="100%"
              height="100%"
              src={logo}
              alt="brand logo"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="navbar-nav">
              {/* <DropdownButton
                className="nav-link"
                id="navbarDropdownMenuNFT"
                title="NFT"
              >
                <Dropdown.Item href="#mint">Mint</Dropdown.Item>
                <Dropdown.Item href="#faq">FAQ</Dropdown.Item>
              </DropdownButton> */}
              <Nav.Item className="nav-link">
                <Link to="/">
                  <Button
                    role="button"
                    aria-expanded="false">
                    Home
                  </Button>
                </Link>
              </Nav.Item>              
              <DropdownButton
                id="navbarDropdownSocialMedia"
                title="Social Media"
                className="nav-link"
              >
                <Dropdown.Item
                  href="https://twitter.com/SQUID7777NFT"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <BsTwitter style={{padding:"1px",margin:" 0px 5px 5px 0px"}}/>
                  Twitter
                </Dropdown.Item>
                <Dropdown.Item
                  href="https://discord.gg/rUS3SxeY2z"
                  rel="noopener noreferrer" 
                  target="_blank"
                >
                  <BsDiscord style={{padding:"1px",margin:" 0px 5px 5px 0px"}}/>
                  Discord
                </Dropdown.Item>
              </DropdownButton>
                
              {/* <Nav.Item className="nav-link">
                <Link to="/nfts">
                  <Button
                    role="button"
                    aria-expanded="false">
                    My NFT
                  </Button>
                </Link>
              </Nav.Item> */}
              <Nav.Item className="nav-link">
                <WalletMultiButton />
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
