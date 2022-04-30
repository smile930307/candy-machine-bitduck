import {
  DropdownButton,
  Dropdown,
  Button,
  Navbar,
  Container,
  Nav,
} from "react-bootstrap";
import { BsTwitter, BsDiscord } from "react-icons/bs";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import image from "../assets/images/logo.png";
import { useState } from "react";

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
            href="#home"
            className="site-logo navbar-brand"
            title="back to index"
          >
            <img
              loading="lazy"
              width="300"
              height="120"
              src={image}
              alt="brand logo"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="navbar-nav">
              <DropdownButton
                className="nav-link"
                id="navbarDropdownMenuNFT"
                title="NFT"
              >
                <Dropdown.Item href="#mint">Mint</Dropdown.Item>
                <Dropdown.Item href="#faq">FAQ</Dropdown.Item>
                <Dropdown.Item href="#roadmap">Roadmap</Dropdown.Item>
              </DropdownButton>
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
              <Nav.Item className="nav-link">
                <Button
                  role="button"
                  aria-expanded="false"
                >
                  My NFT
                </Button>
              </Nav.Item>
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
