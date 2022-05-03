import React from "react";
import AnNFT from "./AnNFT";
import useWalletNfts from "../hooks/useWalletNFTs";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';


const MyNFT = () => {

    const [isLoading, nfts] = useWalletNfts();
    return (
        <div id="myNft" className="container text-center">
            <div className="row">
                <div className="col-lg-12 col-sm-12 col-xs-12 mb-5">
                    <div className="row">
                        {isLoading ? (
                            <>
                                <Box sx={{ display: 'flex' }} className="justify-content-center">
                                    <CircularProgress color="success" className="nft__loading" />
                                </Box>
                                <p>Extracting data from the solana network may take a few seconds, please wait.</p>
                            </>
                        )
                            :
                        
                            (nfts as any[]).length > 0 ? (
                                <>
                                    {(nfts as any).map((nft: any, i: number) => {
                                        return <AnNFT key={i} nft={nft} />;
                                    })}
                                </>
                            ) : (
                                <p>You dont have any NFT to show yet.</p>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyNFT;

