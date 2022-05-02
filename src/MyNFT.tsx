import AnNFT from "./AnNFT";

const MyNFT = ({ nfts }: any) => {
  return (
    <div id="myNft" className="container text-center">
      <div className="row">
        <div className="col-lg-12 col-sm-12 col-xs-12 mb-5">
          <h2></h2>
          <div className="row">
            {(nfts as any).map((nft: any, i: number) => {
              return <AnNFT key={i} nft={nft} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyNFT;
