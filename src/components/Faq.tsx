import img from "../assets/images/composicion2.png"


import gif1 from "../assets/images/gif1.gif"
import gif2 from "../assets/images/gif2.gif"
import gif3 from "../assets/images/gif3.gif"

const Faq = () => {

  return (
    <div className="row">
      <div className="container">
        <div className="col-md-12 col-sm-12 col-xs-12 mb-4 medium-padding50">
          <h1 className="animated-gradient-text2">Bit Ducks Collection</h1>
        </div>

        <div className="row align-center">
          <div className="col-lg-6 col-sm-12 col-xs-12 text-center mb-20">
            {/* <div className="glow-on-hover-img"> */}
              <img
                loading="lazy"
                width="350"
                height="350"
                src={img}
                alt="dev"
              />
            {/* </div> */}
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12 mb-5">
            <h3>
              <b>Lorem ipsum dolor sit amet</b>
            </h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ac
              tortor pellentesque, commodo risus quis, semper lacus. Vivamus
              finibus at metus vel fringilla. Aliquam ut mauris felis.
              Suspendisse potenti.
            </p>
          </div>
        </div>
        <div className="row align-center">
          <div className="col-lg-6 col-sm-12 col-xs-12 text-center mobile-only mb-20">
            <div className="glow-on-hover-img">
                <img
                  className="border-r24"
                  loading="lazy"
                  width="350"
                  height="350"
                  src={gif1}
                  alt="dev"
                />
            </div>
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12 mb-5">
            <h3>
              <b>Lorem ipsum dolor sit amet</b>
            </h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ac
              tortor pellentesque, commodo risus quis, semper lacus. Vivamus
              finibus at metus vel fringilla. Aliquam ut mauris felis.
              Suspendisse potenti.
            </p>
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12 text-center pc-only">
            <div className="glow-on-hover-img">
              <img
                  className="border-r24"
                  loading="lazy"
                  width="350"
                  height="350"
                  src={gif1}
                  alt="dev"
                />
            </div>
          </div>
        </div>
        <div className="row align-center">
          <div className="col-lg-6 col-sm-12 col-xs-12 text-center mb-20">
            <div className="glow-on-hover-img">
              <img
                  className="border-r24"
                  loading="lazy"
                  width="350"
                  height="350"
                  src={gif2}
                  alt="dev"
                />
            </div>
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12 mb-5">
            <h3>
              <b>Lorem ipsum dolor sit amet</b>
            </h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ac
              tortor pellentesque, commodo risus quis, semper lacus. Vivamus
              finibus at metus vel fringilla. Aliquam ut mauris felis.
              Suspendisse potenti.
            </p>
          </div>
        </div>
        <div className="row align-center">
          <div className="col-lg-6 col-sm-12 col-xs-12 text-center mobile-only mb-20">
            <div className="glow-on-hover-img">
              <img
                  className="border-r24"
                  loading="lazy"
                  width="350"
                  height="350"
                  src={gif2}
                  alt="dev"
                />
            </div>
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12 mb-5">
            <h3>
              <b>Lorem ipsum dolor sit amet</b>
            </h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ac
              tortor pellentesque, commodo risus quis, semper lacus. Vivamus
              finibus at metus vel fringilla. Aliquam ut mauris felis.
              Suspendisse potenti.
            </p>
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12 text-center pc-only">
            <div className="glow-on-hover-img">
              <img
                className="border-r24"
                loading="lazy"
                width="350"
                height="350"
                src={gif2}
                alt="dev"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
