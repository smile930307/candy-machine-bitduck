import React from "react";
import AnNFT from "./AnNFT";

const MyNFT = () => {

//    const [nfts] = useWalletNfts();

    const nfts: any[] = [];

    return (
        <div id="myNft" className="container text-center">
        <div className="row">
            <div className="col-lg-12 col-sm-12 col-xs-12 mb-5">
            <h2>My NFTs</h2>
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

