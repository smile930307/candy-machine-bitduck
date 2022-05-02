/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";

export default function AnNFT({ nft }: any) {
  useEffect(() => {
    console.log(nft);
  }, []);

  return (
    <div className="col-lg-12 col-sm-12 col-xs-12">
      <div className="row mynft__collention">
        <div className="col-lg-6 col-sm-12 col-xs-12">
          <img
            className="mynft__image"
            src={nft.image}
            alt={nft.description || nft.name}
          />
        </div>
        <div className="col-lg-6 col-sm-12 col-xs-12">
          <div>
            <p>Name: {nft.name}</p>
          </div>
          <div>
            <p>Attributes</p>
            <hr />
            {(nft.attributes as any).map((item: any, i: number) => {
              return (
                <p key={i}>
                  {" "}
                  {item.value} | {item.trait_type}{" "}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
